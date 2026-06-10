<script lang="ts">
	import { browser } from '$app/environment';
	import Scene from '$lib/components/Scene.svelte';
	import Minimap from '$lib/components/Minimap.svelte';
	import type { SceneManager, ViewMode } from '$lib/three/SceneManager';
	import { FACTS, TOUR_ORDER } from '$lib/data/planData';
	import { SECTIONS, roomsInSection, UI_ROOMS, ZONE_LIST, type SectionId } from '$lib/data/sections';

	let sm: SceneManager | undefined = $state();
	let activeSection: SectionId = $state('overview');
	let selectedId: string | null = $state(null);
	let hoveredId: string | null = $state(null);
	let mode: ViewMode = $state('orbit');
	let locked = $state(false);
	let labelsOn = $state(true);
	let showAbout = $state(false);
	let touring = $state(false);
	let cam = $state({ x: 24, z: 22, rot: 0 });
	let tourTimer: ReturnType<typeof setInterval> | undefined;

	const rooms = $derived(roomsInSection(activeSection));
	const groups = $derived.by(() => {
		const map = new Map<string, { name: string; color: string; items: typeof rooms }>();
		for (const r of rooms) {
			if (!map.has(r.zone)) map.set(r.zone, { name: r.zoneName, color: r.zoneColor, items: [] });
			map.get(r.zone)!.items.push(r);
		}
		return [...map.values()];
	});
	const selectedRoom = $derived(selectedId ? UI_ROOMS.find((r) => r.id === selectedId) : null);
	const sectionMeta = $derived(SECTIONS.find((s) => s.id === activeSection)!);

	function onReady(instance: SceneManager) {
		sm = instance;
		sm.toggleLabels(labelsOn);
	}

	function selectSection(id: SectionId) {
		stopTour();
		activeSection = id;
		selectedId = null;
		const s = SECTIONS.find((x) => x.id === id)!;
		if (s.focus) sm?.flyToRoom(s.focus);
		else sm?.focusOverview();
	}

	function pickRoom(id: string) {
		selectedId = id;
		sm?.flyToRoom(id);
	}

	function setMode(m: ViewMode) {
		stopTour();
		mode = m;
		sm?.setMode(m);
	}

	function toggleLabels() {
		labelsOn = !labelsOn;
		sm?.toggleLabels(labelsOn);
	}

	function resetView() {
		stopTour();
		activeSection = 'overview';
		selectedId = null;
		if (mode === 'walk') setMode('orbit');
		sm?.focusOverview();
	}

	function startTour() {
		if (mode === 'walk') setMode('orbit');
		touring = true;
		let i = 0;
		const step = () => {
			const id = TOUR_ORDER[i % TOUR_ORDER.length];
			selectedId = id;
			sm?.flyToRoom(id);
			i++;
		};
		step();
		tourTimer = setInterval(step, 4200);
	}
	function stopTour() {
		touring = false;
		if (tourTimer) clearInterval(tourTimer);
		tourTimer = undefined;
	}
	function toggleTour() {
		touring ? stopTour() : startTour();
	}
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (showAbout = false)} />

<main>
	{#if browser}
		<Scene
			{onReady}
			onHover={(id) => (hoveredId = id)}
			onSelect={(id) => pickRoom(id)}
			onModeChange={(m) => (mode = m)}
			onLockChange={(b) => (locked = b)}
			onCamera={(x, z, rot) => (cam = { x, z, rot })}
		/>
	{/if}

	<!-- ============ HEADER ============ -->
	<header>
		<div class="brand">
			<div class="logo">CS</div>
			<div class="brand-txt">
				<strong>Connectivity Solutions</strong>
				<span>Experience Centre · Bangalore</span>
			</div>
		</div>

		<nav class="tabs">
			{#each SECTIONS as s (s.id)}
				<button class:active={activeSection === s.id} onclick={() => selectSection(s.id)}>
					{s.label}
				</button>
			{/each}
		</nav>

		<div class="head-right">
			<button class="ghost" onclick={() => (showAbout = true)}>About / Design</button>
			<span class="rev">Rev 03</span>
		</div>
	</header>

	<!-- ============ LEFT: ROOM DIRECTORY ============ -->
	<aside class="sidebar">
		<div class="sec-head">
			<h2>{sectionMeta.label}</h2>
			<p>{sectionMeta.blurb}</p>
		</div>
		<div class="room-list">
			{#each groups as g (g.name)}
				<div class="grp">
					<div class="grp-head"><span class="dot" style:background={g.color}></span>{g.name}</div>
					{#each g.items as r (r.id)}
						<button
							class="room-item"
							class:active={selectedId === r.id}
							onmouseenter={() => (hoveredId = r.id)}
							onmouseleave={() => (hoveredId = null)}
							onclick={() => pickRoom(r.id)}
						>
							<span class="ri-name">{r.short}</span>
							{#if r.tag}<span class="ri-tag">{r.tag}</span>{/if}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</aside>

	<!-- ============ BOTTOM-LEFT: MINIMAP ============ -->
	<div class="minimap-panel">
		<div class="mm-title">FLOOR PLAN</div>
		<Minimap section={activeSection} selected={selectedId} hovered={hoveredId} {cam} onPick={pickRoom} />
		<div class="mm-foot">{FACTS.totalCarpet}</div>
	</div>

	<!-- ============ BOTTOM CONTROLS ============ -->
	<div class="controls">
		<div class="seg">
			<button class:on={mode === 'orbit'} onclick={() => setMode('orbit')}>◍ Orbit</button>
			<button class:on={mode === 'walk'} onclick={() => setMode('walk')}>⤓ Walk</button>
		</div>
		<button class="ctrl" class:on={labelsOn} onclick={toggleLabels} title="Toggle room labels">🏷 Labels</button>
		<button class="ctrl" class:on={touring} onclick={toggleTour}>{touring ? '⏸ Touring…' : '▶ Guided Tour'}</button>
		<button class="ctrl" onclick={resetView}>⤺ Reset</button>
	</div>

	<!-- ============ RIGHT: ROOM INFO ============ -->
	{#if selectedRoom}
		<div class="roomcard">
			<button class="rc-close" onclick={() => (selectedId = null)} aria-label="Close">✕</button>
			<span class="rc-zone" style:background={selectedRoom.zoneColor}>{selectedRoom.zoneName}</span>
			<h3>{selectedRoom.name}</h3>
			<div class="rc-meta">
				{#if selectedRoom.dims}<span>📐 {selectedRoom.dims}</span>{/if}
				{#if selectedRoom.tag}<span>👥 {selectedRoom.tag}</span>{/if}
			</div>
			{#if selectedRoom.note}<p>{selectedRoom.note}</p>{/if}
		</div>
	{/if}

	<!-- ============ WALK HINT ============ -->
	{#if mode === 'walk' && !locked}
		<div class="walk-hint">
			<strong>Click to enter walk mode</strong>
			<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> move · <kbd>Shift</kbd> sprint · mouse to look · <kbd>Esc</kbd> to exit</span>
		</div>
	{/if}

	<!-- ============ ABOUT / DESIGN PANEL ============ -->
	{#if showAbout}
		<div
			class="overlay"
			onclick={() => (showAbout = false)}
			onkeydown={(e) => e.key === 'Enter' && (showAbout = false)}
			role="presentation"
		>
			<div
				class="about"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-label="About"
				tabindex="-1"
			>
				<button class="rc-close" onclick={() => (showAbout = false)} aria-label="Close">✕</button>
				<h2>{FACTS.project}</h2>
				<p class="sub">{FACTS.location} · {FACTS.revision}</p>

				<div class="stats">
					<div><b>{FACTS.totalCarpet}</b><span>Total carpet area</span></div>
					<div><b>{FACTS.experience}</b><span>Experience Centre</span></div>
					<div><b>{FACTS.workspace}</b><span>Workspace</span></div>
					<div><b>{FACTS.mezzanine}</b><span>Pantry mezzanine</span></div>
					<div><b>{FACTS.workstations}</b><span>Workstations</span></div>
					<div><b>{FACTS.meetingRooms}</b><span>Meeting rooms</span></div>
				</div>

				<h4>Design narrative</h4>
				<p class="narr">
					“The Experience Centre showcases the future of technology, while the workplace humanises
					it.” Visitors move through a layered journey — a high-tech, immersive arrival that gradually
					warms into a hospitality-driven workplace, balancing innovation, connectivity and belonging.
				</p>

				<h4>Zoning</h4>
				<div class="legend">
					{#each ZONE_LIST as z (z.id)}
						<div class="leg"><span class="dot" style:background={z.color}></span>{z.name}</div>
					{/each}
				</div>

				<div class="credit">
					Reconstructed in Three.js from the concept deck · Designed by <strong>Futureal</strong>
				</div>
			</div>
		</div>
	{/if}

	<div class="hint-tip">Click any room · drag to orbit · scroll to zoom</div>
</main>

<style>
	main {
		position: fixed;
		inset: 0;
		overflow: hidden;
		font-family: var(--font);
	}

	/* ---------------- header ---------------- */
	header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 18px;
		background: linear-gradient(to bottom, rgba(8, 14, 19, 0.92), rgba(8, 14, 19, 0.55) 70%, transparent);
		z-index: 20;
		pointer-events: none;
	}
	header > * {
		pointer-events: auto;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 11px;
	}
	.logo {
		width: 38px;
		height: 38px;
		border-radius: 9px;
		background: var(--cs-cyan);
		color: #00141b;
		font-weight: 800;
		display: grid;
		place-items: center;
		font-size: 16px;
		letter-spacing: -0.5px;
		box-shadow: 0 6px 18px -4px rgba(0, 174, 239, 0.6);
	}
	.brand-txt {
		display: flex;
		flex-direction: column;
		line-height: 1.18;
	}
	.brand-txt strong {
		font-size: 14px;
		font-weight: 700;
	}
	.brand-txt span {
		font-size: 11.5px;
		color: var(--text-dim);
	}

	.tabs {
		display: flex;
		gap: 3px;
		background: rgba(20, 30, 38, 0.7);
		padding: 5px;
		border-radius: 11px;
		border: 1px solid var(--border);
		backdrop-filter: blur(10px);
	}
	.tabs button {
		padding: 8px 15px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-dim);
		transition: all 0.16s;
		white-space: nowrap;
	}
	.tabs button:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.tabs button.active {
		background: var(--cs-cyan);
		color: #00141b;
	}

	.head-right {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.ghost {
		padding: 8px 14px;
		border: 1px solid var(--border-strong);
		border-radius: 9px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text);
		background: rgba(20, 30, 38, 0.6);
		backdrop-filter: blur(8px);
		transition: 0.16s;
	}
	.ghost:hover {
		border-color: var(--cs-cyan);
		color: var(--cs-cyan);
	}
	.rev {
		font-size: 11px;
		color: var(--text-dim);
		border: 1px solid var(--border);
		padding: 4px 8px;
		border-radius: 6px;
	}

	/* ---------------- sidebar ---------------- */
	.sidebar {
		position: absolute;
		top: 72px;
		left: 14px;
		width: 268px;
		max-height: calc(100vh - 280px);
		display: flex;
		flex-direction: column;
		background: var(--bg-panel);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		backdrop-filter: blur(16px);
		box-shadow: var(--shadow);
		z-index: 15;
		overflow: hidden;
	}
	.sec-head {
		padding: 14px 16px 12px;
		border-bottom: 1px solid var(--border);
	}
	.sec-head h2 {
		font-size: 16px;
	}
	.sec-head p {
		margin: 6px 0 0;
		font-size: 11.5px;
		line-height: 1.45;
		color: var(--text-dim);
	}
	.room-list {
		overflow-y: auto;
		padding: 8px;
	}
	.grp {
		margin-bottom: 6px;
	}
	.grp-head {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-dim);
		font-weight: 700;
		padding: 8px 8px 5px;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 3px;
		flex: none;
		display: inline-block;
	}
	.room-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 8px 10px;
		border-radius: 8px;
		font-size: 13px;
		color: var(--text);
		transition: 0.13s;
		text-align: left;
	}
	.room-item:hover {
		background: rgba(255, 255, 255, 0.06);
	}
	.room-item.active {
		background: rgba(0, 174, 239, 0.16);
		box-shadow: inset 0 0 0 1px rgba(0, 174, 239, 0.45);
	}
	.ri-name {
		font-weight: 500;
	}
	.ri-tag {
		font-size: 10.5px;
		color: var(--text-dim);
		background: rgba(255, 255, 255, 0.07);
		padding: 2px 6px;
		border-radius: 5px;
		white-space: nowrap;
	}

	/* ---------------- minimap ---------------- */
	.minimap-panel {
		position: absolute;
		left: 14px;
		bottom: 14px;
		width: 268px;
		background: var(--bg-panel);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 10px 11px 8px;
		backdrop-filter: blur(16px);
		box-shadow: var(--shadow);
		z-index: 15;
	}
	.mm-title,
	.mm-foot {
		font-size: 10px;
		letter-spacing: 0.08em;
		color: var(--text-dim);
		font-weight: 700;
	}
	.mm-title {
		margin-bottom: 7px;
	}
	.mm-foot {
		margin-top: 7px;
		text-align: right;
		color: var(--cs-cyan);
	}

	/* ---------------- controls ---------------- */
	.controls {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 8px;
		align-items: center;
		background: var(--bg-panel);
		border: 1px solid var(--border);
		border-radius: 13px;
		padding: 7px;
		backdrop-filter: blur(16px);
		box-shadow: var(--shadow);
		z-index: 16;
	}
	.seg {
		display: flex;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 9px;
		padding: 3px;
	}
	.seg button,
	.ctrl {
		padding: 8px 13px;
		border-radius: 8px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-dim);
		transition: 0.14s;
		white-space: nowrap;
	}
	.seg button.on {
		background: var(--cs-cyan);
		color: #00141b;
	}
	.ctrl:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.ctrl.on {
		color: var(--cs-cyan);
		background: rgba(0, 174, 239, 0.12);
	}

	/* ---------------- room card ---------------- */
	.roomcard {
		position: absolute;
		top: 72px;
		right: 14px;
		width: 300px;
		background: var(--bg-panel);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 18px;
		backdrop-filter: blur(16px);
		box-shadow: var(--shadow);
		z-index: 15;
		animation: slideIn 0.25s ease;
	}
	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(16px);
		}
	}
	.rc-close {
		position: absolute;
		top: 12px;
		right: 12px;
		width: 26px;
		height: 26px;
		border-radius: 7px;
		color: var(--text-dim);
		font-size: 12px;
	}
	.rc-close:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text);
	}
	.rc-zone {
		display: inline-block;
		font-size: 10.5px;
		font-weight: 700;
		color: #00141b;
		padding: 3px 9px;
		border-radius: 6px;
		margin-bottom: 10px;
	}
	.roomcard h3 {
		font-size: 18px;
		margin-bottom: 10px;
		max-width: 240px;
	}
	.rc-meta {
		display: flex;
		gap: 14px;
		font-size: 12px;
		color: var(--text-dim);
		margin-bottom: 11px;
	}
	.roomcard p {
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--text-dim);
		margin: 0;
	}

	/* ---------------- walk hint ---------------- */
	.walk-hint {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		background: rgba(8, 14, 19, 0.82);
		border: 1px solid var(--border-strong);
		border-radius: 14px;
		padding: 22px 30px;
		z-index: 14;
		backdrop-filter: blur(10px);
	}
	.walk-hint strong {
		display: block;
		font-size: 17px;
		margin-bottom: 9px;
	}
	.walk-hint span {
		font-size: 12.5px;
		color: var(--text-dim);
	}
	kbd {
		display: inline-block;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid var(--border-strong);
		border-radius: 5px;
		padding: 1px 6px;
		margin: 0 1px;
		font-size: 11px;
		font-family: var(--font);
	}

	/* ---------------- about overlay ---------------- */
	.overlay {
		position: absolute;
		inset: 0;
		background: rgba(4, 8, 11, 0.62);
		backdrop-filter: blur(4px);
		z-index: 40;
		display: grid;
		place-items: center;
		animation: fade 0.2s;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	.about {
		position: relative;
		width: min(560px, 92vw);
		max-height: 88vh;
		overflow-y: auto;
		background: var(--bg-panel-solid);
		border: 1px solid var(--border-strong);
		border-radius: 16px;
		padding: 28px 30px;
		box-shadow: var(--shadow);
	}
	.about h2 {
		font-size: 21px;
	}
	.about .sub {
		color: var(--text-dim);
		font-size: 13px;
		margin: 5px 0 20px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 22px;
	}
	.stats div {
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px;
	}
	.stats b {
		display: block;
		font-size: 15px;
		color: var(--cs-cyan);
	}
	.stats span {
		font-size: 11px;
		color: var(--text-dim);
	}
	.about h4 {
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-dim);
		margin-bottom: 9px;
	}
	.narr {
		font-size: 13.5px;
		line-height: 1.6;
		color: var(--text);
		margin: 0 0 22px;
	}
	.legend {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px 16px;
		margin-bottom: 22px;
	}
	.leg {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		color: var(--text-dim);
	}
	.credit {
		border-top: 1px solid var(--border);
		padding-top: 16px;
		font-size: 12px;
		color: var(--text-dim);
	}
	.credit strong {
		color: var(--text);
	}

	.hint-tip {
		position: absolute;
		bottom: 16px;
		right: 16px;
		font-size: 11px;
		color: var(--text-dim);
		background: var(--bg-panel);
		border: 1px solid var(--border);
		padding: 7px 12px;
		border-radius: 9px;
		backdrop-filter: blur(8px);
		z-index: 12;
	}

	@media (max-width: 880px) {
		.sidebar,
		.hint-tip {
			display: none;
		}
		.minimap-panel {
			width: 180px;
		}
		.tabs button {
			padding: 8px 10px;
			font-size: 12px;
		}
	}
</style>
