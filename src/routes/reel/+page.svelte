<script lang="ts">
	import { base } from '$app/paths';
	import { tourStops } from '$lib/data/walkthroughs';

	const stops = tourStops();

	// Two stacked video buffers (A/B double-buffering): one plays while the other
	// pre-loads the next clip, so advancing crossfades instantly with no black gap.
	let vA = $state<HTMLVideoElement>();
	let vB = $state<HTMLVideoElement>();
	let active = $state(0); // which buffer is visible/playing: 0 = A, 1 = B
	let idx = $state(0); // current chapter index
	let progress = $state(0); // 0..1 within the current clip
	let inited = false;

	const reduceMotion =
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let playing = $state(!reduceMotion);
	let muted = $state(true);

	const current = $derived(stops[idx]);

	function vid(b: number): HTMLVideoElement | undefined {
		return b === 0 ? vA : vB;
	}

	function loadInto(b: number, i: number, autoplay: boolean) {
		const v = vid(b);
		const s = stops[i];
		if (!v || !s) return;
		if (v.getAttribute('src') !== s.src) {
			v.src = s.src;
			v.load();
		}
		try {
			v.currentTime = 0;
		} catch {
			/* metadata not ready yet — harmless */
		}
		if (autoplay) v.play().then(() => (playing = true)).catch(() => {});
		else v.pause();
	}

	// One-time init once both buffer elements are mounted.
	$effect(() => {
		if (inited) return;
		if (!vA || !vB) return;
		inited = true;
		loadInto(0, 0, !reduceMotion);
		if (stops.length > 1) loadInto(1, 1 % stops.length, false);
	});

	// Keep both buffers' mute state in sync without reloading clips.
	$effect(() => {
		const m = muted;
		if (vA) vA.muted = m;
		if (vB) vB.muted = m;
	});

	function goTo(t: number) {
		if (!stops.length) return;
		t = ((t % stops.length) + stops.length) % stops.length;
		if (t === idx) {
			// same chapter → restart it (covers clicking the active segment & single-clip loop)
			const v = vid(active);
			if (v) {
				try {
					v.currentTime = 0;
				} catch {
					/* ignore */
				}
				progress = 0;
				v.play().then(() => (playing = true)).catch(() => {});
			}
			return;
		}
		const oldActive = active;
		const standby = oldActive === 0 ? 1 : 0;
		loadInto(standby, t, true); // next clip is usually already buffered → instant
		vid(oldActive)?.pause();
		active = standby;
		idx = t;
		progress = 0;
		// pre-buffer the following clip into the freed buffer
		if (stops.length > 1) loadInto(oldActive, (t + 1) % stops.length, false);
	}

	const next = () => goTo(idx + 1);
	const prev = () => goTo(idx - 1);
	const jump = (i: number) => goTo(i);

	function onEnded(b: number) {
		if (b !== active) return;
		next(); // continuous auto-advance, wraps to the first clip
	}
	function onTime(b: number) {
		if (b !== active) return;
		const v = vid(b);
		if (v && v.duration > 0) progress = v.currentTime / v.duration;
	}
	function sync(b: number) {
		if (b !== active) return;
		const v = vid(b);
		if (v) playing = !v.paused;
	}
	function toggle() {
		const v = vid(active);
		if (!v) return;
		if (v.paused) {
			v.play();
			playing = true;
		} else {
			v.pause();
			playing = false;
		}
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === ' ') {
			e.preventDefault();
			toggle();
		} else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'm' || e.key === 'M') muted = !muted;
	}
</script>

<svelte:head>
	<title>Walkthrough Reel · CoSol Experience Centre</title>
</svelte:head>

<svelte:window onkeydown={onKey} />

<main class="reel">
	{#if !stops.length}
		<div class="empty">
			<h1>No walkthroughs yet</h1>
			<a href="{base}/explore">← Back to floor plan</a>
		</div>
	{:else}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			class="stage"
			class:on={active === 0}
			bind:this={vA}
			muted
			playsinline
			preload="auto"
			onended={() => onEnded(0)}
			ontimeupdate={() => onTime(0)}
			onplay={() => sync(0)}
			onpause={() => sync(0)}
		></video>
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			class="stage"
			class:on={active === 1}
			bind:this={vB}
			muted
			playsinline
			preload="auto"
			onended={() => onEnded(1)}
			ontimeupdate={() => onTime(1)}
			onplay={() => sync(1)}
			onpause={() => sync(1)}
		></video>

		<div class="veil"></div>

		<!-- room name, in the corner (on a soft scrim for legibility) -->
		<div class="badge">
			<span class="num">{String(idx + 1).padStart(2, '0')} / {String(stops.length).padStart(2, '0')}</span>
			<span class="zone" style:--c={current.zoneColor}>{current.zoneName}</span>
			<h2>{current.name}</h2>
			{#if current.note}<p>{current.note}</p>{/if}
		</div>

		<!-- top chrome -->
		<a class="home" href="{base}/explore" aria-label="Back to floor plan">▦ Floor plan</a>
		<button class="sound" onclick={() => (muted = !muted)} aria-label={muted ? 'Unmute' : 'Mute'}>
			{muted ? '🔇' : '🔊'}
		</button>

		<!-- bottom controls -->
		<div class="controls">
			<button class="ctl" onclick={prev} aria-label="Previous room">⏮</button>
			<button class="ctl play" onclick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
				{playing ? '❚❚' : '►'}
			</button>
			<button class="ctl" onclick={next} aria-label="Next room">⏭</button>

			<div class="track" role="group" aria-label="Chapters">
				{#each stops as s, i (s.id)}
					<button
						class="seg"
						class:active={i === idx}
						onclick={() => jump(i)}
						aria-label={s.name}
						aria-current={i === idx}
						title={s.name}
					>
						<span class="bar">
							<span class="fill" style:width={i === idx ? `${progress * 100}%` : i < idx ? '100%' : '0%'}></span>
						</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	.reel {
		position: fixed;
		inset: 0;
		background: #04080b;
		overflow: hidden;
		font-family: var(--font);
		color: var(--text);
	}
	.stage {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: #04080b;
		opacity: 0;
		transition: opacity 0.6s ease;
	}
	.stage.on {
		opacity: 1;
		z-index: 1;
	}
	.veil {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		background: linear-gradient(to top, rgba(3, 7, 11, 0.82) 0%, rgba(3, 7, 11, 0) 38%),
			linear-gradient(to bottom, rgba(3, 7, 11, 0.5) 0%, rgba(3, 7, 11, 0) 26%);
	}

	/* -------- corner room badge -------- */
	.badge {
		position: absolute;
		left: clamp(20px, 5vw, 60px);
		bottom: clamp(86px, 13vh, 130px);
		max-width: min(560px, 82vw);
		z-index: 5;
		padding: 14px 20px;
		border-radius: 14px;
		background: linear-gradient(120deg, rgba(4, 8, 11, 0.66), rgba(4, 8, 11, 0.26));
		border: 1px solid rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(6px);
		text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
	}
	.badge .num {
		display: inline-block;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: var(--text-dim);
		margin-bottom: 10px;
	}
	.badge .zone {
		display: inline-block;
		margin-left: 10px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.03em;
		padding: 3px 10px;
		border-radius: 999px;
		color: #03121a;
		background: var(--c, var(--cs-cyan));
		vertical-align: middle;
	}
	.badge h2 {
		font-size: clamp(26px, 4.6vw, 52px);
		line-height: 1.04;
		margin: 0 0 8px;
		font-weight: 800;
		letter-spacing: -0.015em;
	}
	.badge p {
		font-size: clamp(13px, 1.6vw, 17px);
		line-height: 1.45;
		color: #e3edf4;
		margin: 0;
	}

	/* -------- chrome -------- */
	.home,
	.sound {
		position: fixed;
		top: 18px;
		z-index: 10;
		color: var(--text);
		background: rgba(8, 14, 19, 0.6);
		border: 1px solid var(--border-strong);
		backdrop-filter: blur(8px);
		transition: 0.15s;
	}
	.home {
		left: 18px;
		padding: 9px 14px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
	}
	.sound {
		right: 18px;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		font-size: 17px;
		cursor: pointer;
	}
	.home:hover,
	.sound:hover {
		border-color: var(--cs-cyan);
		color: var(--cs-cyan);
	}

	/* -------- bottom controls -------- */
	.controls {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 6;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px clamp(20px, 5vw, 60px) 22px;
	}
	.ctl {
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		font-size: 13px;
		color: var(--text);
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid var(--border);
		cursor: pointer;
		transition: 0.15s;
	}
	.ctl:hover {
		background: rgba(255, 255, 255, 0.16);
	}
	.ctl.play {
		width: 48px;
		height: 48px;
		font-size: 15px;
		color: #00141b;
		background: var(--cs-cyan);
		border-color: var(--cs-cyan);
	}
	.ctl.play:hover {
		filter: brightness(1.1);
	}
	.track {
		flex: 1;
		display: flex;
		gap: 6px;
		align-items: center;
		height: 40px;
	}
	/* full-height transparent hit area, thin visible bar inside (mobile-friendly tap target) */
	.seg {
		flex: 1;
		align-self: stretch;
		height: 40px;
		display: flex;
		align-items: center;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
	}
	.bar {
		width: 100%;
		height: 5px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.22);
		overflow: hidden;
		transition: height 0.15s;
	}
	.seg:hover .bar,
	.seg.active .bar {
		height: 8px;
	}
	.fill {
		display: block;
		height: 100%;
		background: var(--cs-cyan);
		border-radius: 999px;
	}

	/* visible keyboard focus */
	.ctl:focus-visible,
	.home:focus-visible,
	.sound:focus-visible,
	.seg:focus-visible {
		outline: 2px solid var(--cs-cyan);
		outline-offset: 3px;
	}

	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		gap: 12px;
		text-align: center;
	}
	.empty a {
		color: var(--cs-cyan);
	}

	@media (prefers-reduced-motion: reduce) {
		.stage {
			transition: none;
		}
	}

	@media (max-width: 640px) {
		.controls {
			gap: 8px;
			padding: 12px 16px 16px;
		}
		.badge {
			left: 18px;
			right: 18px;
			bottom: 78px;
		}
	}
</style>
