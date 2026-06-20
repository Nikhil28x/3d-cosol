<script lang="ts">
	import { base } from '$app/paths';
	import { tourStops } from '$lib/data/walkthroughs';

	const stops = tourStops();

	let scroller: HTMLElement;
	let sceneEls = $state<HTMLElement[]>([]);
	let videoEls = $state<HTMLVideoElement[]>([]);
	let active = $state(-1); // -1 = hero
	let muted = $state(true);

	// Play the in-view video, pause the rest; track the active chapter.
	$effect(() => {
		if (!scroller) return;
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					const idx = Number((e.target as HTMLElement).dataset.idx);
					const v = videoEls[idx];
					if (e.isIntersecting && e.intersectionRatio >= 0.55) {
						active = idx;
						v?.play?.().catch(() => {});
					} else {
						v?.pause?.();
					}
				}
			},
			{ root: scroller, threshold: [0, 0.55, 0.9] }
		);
		for (const el of sceneEls) if (el) io.observe(el);
		return () => io.disconnect();
	});

	// Keep every video's mute state in sync with the toggle.
	$effect(() => {
		for (const v of videoEls) if (v) v.muted = muted;
	});

	function go(i: number) {
		sceneEls[i]?.scrollIntoView({ behavior: 'smooth' });
	}
	function enter() {
		sceneEls[0]?.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Walkthrough · CoSol Experience Centre</title>
</svelte:head>

<div class="tour" bind:this={scroller}>
	<!-- ============ HERO ============ -->
	<section class="scene hero">
		<div class="hero-bg">
			{#if stops[0]}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={stops[0].src} autoplay muted loop playsinline></video>
			{/if}
			<div class="hero-veil"></div>
		</div>
		<div class="hero-inner">
			<span class="kicker">Connectivity Solutions · Bangalore</span>
			<h1>The Experience Centre</h1>
			<p>A cinematic walkthrough of the entire floor — scroll to step inside.</p>
			<button class="enter" onclick={enter}>Enter ↓</button>
		</div>
		<div class="scroll-cue" aria-hidden="true">⌄</div>
	</section>

	<!-- ============ ROOM CHAPTERS ============ -->
	{#each stops as s, i (s.id)}
		<section class="scene room" data-idx={i} bind:this={sceneEls[i]}>
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				class="bg-video"
				src={s.src}
				muted
				loop
				playsinline
				preload="metadata"
				bind:this={videoEls[i]}
			></video>
			<div class="veil"></div>
			<div class="caption" class:show={active === i}>
				<span class="chip" style:--c={s.zoneColor}>{String(i + 1).padStart(2, '0')} · {s.zoneName}</span>
				<h2>{s.name}</h2>
				<p>{s.tagline}</p>
				<a class="link" href="{base}/room/{s.id}">Open this room ↗</a>
			</div>
		</section>
	{/each}

	<!-- ============ OUTRO ============ -->
	<section class="scene outro">
		<div class="outro-inner">
			<h2>That's the tour.</h2>
			<p>Jump into any space, or explore the full interactive floor plan.</p>
			<div class="outro-links">
				<a class="btn primary" href="{base}/explore">Interactive floor plan →</a>
				{#each stops as s (s.id)}
					<a class="btn" href="{base}/room/{s.id}">{s.name}</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============ FIXED CHROME ============ -->
	<a class="home" href="{base}/explore" aria-label="Interactive floor plan">▦ Floor plan</a>

	<button class="sound" onclick={() => (muted = !muted)} aria-label="Toggle sound">
		{muted ? '🔇' : '🔊'}
	</button>

	<nav class="dots" aria-label="Chapters">
		<button class:on={active === -1} onclick={() => scroller.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Intro"></button>
		{#each stops as s, i (s.id)}
			<button class:on={active === i} onclick={() => go(i)} aria-label={s.name} title={s.name}></button>
		{/each}
	</nav>
</div>

<style>
	.tour {
		position: fixed;
		inset: 0;
		overflow-y: auto;
		overflow-x: hidden;
		scroll-snap-type: y mandatory;
		scroll-behavior: smooth;
		background: #05090d;
		font-family: var(--font);
		color: var(--text);
	}
	.scene {
		position: relative;
		height: 100vh;
		width: 100%;
		scroll-snap-align: start;
		scroll-snap-stop: always;
		overflow: hidden;
		display: grid;
		place-items: center;
	}

	/* -------- shared video bg -------- */
	.bg-video,
	.hero-bg video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.veil {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to top, rgba(3, 7, 11, 0.85) 0%, rgba(3, 7, 11, 0.15) 45%, rgba(3, 7, 11, 0.45) 100%);
	}

	/* -------- hero -------- */
	.hero-bg {
		position: absolute;
		inset: 0;
	}
	.hero-veil {
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 40%, rgba(3, 7, 11, 0.35), rgba(3, 7, 11, 0.92));
	}
	.hero-inner {
		position: relative;
		text-align: center;
		padding: 24px;
		max-width: 760px;
	}
	.kicker {
		display: inline-block;
		font-size: 13px;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--cs-cyan);
		margin-bottom: 18px;
	}
	.hero-inner h1 {
		font-size: clamp(40px, 8vw, 92px);
		line-height: 0.98;
		margin: 0 0 18px;
		font-weight: 800;
		letter-spacing: -0.02em;
	}
	.hero-inner p {
		font-size: clamp(15px, 2vw, 20px);
		color: var(--text-dim);
		margin: 0 0 30px;
	}
	.enter {
		padding: 14px 30px;
		border-radius: 999px;
		font-size: 15px;
		font-weight: 700;
		color: #00141b;
		background: var(--cs-cyan);
		border: none;
		cursor: pointer;
		transition: 0.18s;
	}
	.enter:hover {
		filter: brightness(1.1);
		box-shadow: 0 10px 40px rgba(0, 174, 239, 0.45);
		transform: translateY(-2px);
	}
	.scroll-cue {
		position: absolute;
		bottom: 26px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 30px;
		color: var(--text-dim);
		animation: bob 1.6s ease-in-out infinite;
	}
	@keyframes bob {
		0%, 100% { transform: translate(-50%, 0); opacity: 0.5; }
		50% { transform: translate(-50%, 8px); opacity: 1; }
	}

	/* -------- room caption -------- */
	.caption {
		position: absolute;
		left: clamp(24px, 7vw, 110px);
		bottom: clamp(60px, 14vh, 150px);
		max-width: min(620px, 84vw);
		opacity: 0;
		transform: translateY(28px);
		transition: opacity 0.7s ease, transform 0.7s ease;
	}
	.caption.show {
		opacity: 1;
		transform: translateY(0);
	}
	.chip {
		display: inline-block;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 5px 12px;
		border-radius: 999px;
		color: #03121a;
		background: var(--c, var(--cs-cyan));
		margin-bottom: 14px;
	}
	.caption h2 {
		font-size: clamp(30px, 5.4vw, 60px);
		line-height: 1.02;
		margin: 0 0 12px;
		font-weight: 800;
		letter-spacing: -0.015em;
	}
	.caption p {
		font-size: clamp(14px, 2vw, 19px);
		line-height: 1.5;
		color: #d6e3ec;
		margin: 0 0 18px;
		text-shadow: 0 2px 18px rgba(0, 0, 0, 0.6);
	}
	.link {
		font-size: 14px;
		font-weight: 600;
		color: var(--cs-cyan);
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: 0.15s;
	}
	.link:hover {
		border-color: var(--cs-cyan);
	}

	/* -------- outro -------- */
	.outro {
		background: #070c11;
	}
	.outro-inner {
		text-align: center;
		padding: 28px;
		max-width: 880px;
	}
	.outro-inner h2 {
		font-size: clamp(30px, 6vw, 60px);
		margin: 0 0 12px;
		font-weight: 800;
	}
	.outro-inner p {
		color: var(--text-dim);
		font-size: 17px;
		margin: 0 0 28px;
	}
	.outro-links {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}
	.btn {
		padding: 11px 18px;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		color: var(--text);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		text-decoration: none;
		transition: 0.15s;
	}
	.btn:hover {
		border-color: var(--cs-cyan);
		color: var(--cs-cyan);
	}
	.btn.primary {
		background: var(--cs-cyan);
		color: #00141b;
		border-color: var(--cs-cyan);
	}
	.btn.primary:hover {
		filter: brightness(1.1);
		color: #00141b;
	}

	/* -------- fixed chrome -------- */
	.home {
		position: fixed;
		top: 18px;
		left: 18px;
		z-index: 30;
		padding: 9px 14px;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		background: rgba(8, 14, 19, 0.6);
		border: 1px solid var(--border-strong);
		backdrop-filter: blur(8px);
		text-decoration: none;
		transition: 0.15s;
	}
	.home:hover {
		color: var(--cs-cyan);
		border-color: var(--cs-cyan);
	}
	.sound {
		position: fixed;
		top: 18px;
		right: 18px;
		z-index: 30;
		width: 42px;
		height: 42px;
		border-radius: 50%;
		font-size: 17px;
		color: var(--text);
		background: rgba(8, 14, 19, 0.6);
		border: 1px solid var(--border-strong);
		backdrop-filter: blur(8px);
		cursor: pointer;
		transition: 0.15s;
	}
	.sound:hover {
		border-color: var(--cs-cyan);
	}
	.dots {
		position: fixed;
		right: 20px;
		top: 50%;
		transform: translateY(-50%);
		z-index: 30;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.dots button {
		width: 10px;
		height: 10px;
		padding: 0;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.5);
		background: transparent;
		cursor: pointer;
		transition: 0.18s;
	}
	.dots button.on {
		background: var(--cs-cyan);
		border-color: var(--cs-cyan);
		transform: scale(1.3);
		box-shadow: 0 0 12px rgba(0, 174, 239, 0.7);
	}

	@media (max-width: 640px) {
		.dots { display: none; }
		.caption { left: 22px; right: 22px; bottom: 90px; }
	}
</style>
