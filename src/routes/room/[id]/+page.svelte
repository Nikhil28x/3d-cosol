<script lang="ts">
	import { base } from '$app/paths';
	import { RoomEditor, type GizmoMode } from '$lib/room/RoomEditor';
	import { sceneForRoom, docForRoom } from '$lib/room/layouts';
	import { CATALOG_LIST, CATEGORIES, catalogLabel } from '$lib/room/catalog';
	import type { PlacedObject } from '$lib/room/types';
	import { walkthroughSrc, walkthroughFor } from '$lib/data/walkthroughs';

	let { data }: { data: { id: string } } = $props();

	const def = $derived(sceneForRoom(data.id));
	const doc = $derived(docForRoom(data.id));
	const walkUrl = $derived(walkthroughSrc(data.id));
	const walkMeta = $derived(walkthroughFor(data.id));
	let showWalk = $state(false);

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let editor: RoomEditor | undefined;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	let selected: PlacedObject | null = $state(null);
	let placed: PlacedObject[] = $state([]);
	let mode: GizmoMode = $state('translate');
	let gridOn = $state(false);
	let scaleVal = $state(1);
	let leftTab: 'add' | 'about' = $state('about');
	let savedFlash = $state(false);
	let dirty = $state(false);

	const storageKey = (id: string) => `cosol-room:${id}`;

	const paletteGroups = CATEGORIES.map((cat) => ({
		cat,
		items: CATALOG_LIST.filter((i) => i.category === cat)
	})).filter((g) => g.items.length);

	function loadSaved(id: string): PlacedObject[] | null {
		try {
			const raw = localStorage.getItem(storageKey(id));
			if (!raw) return null;
			const arr = JSON.parse(raw);
			return Array.isArray(arr) ? (arr as PlacedObject[]) : null;
		} catch {
			return null;
		}
	}
	function scheduleSave(id: string, layout: PlacedObject[]) {
		dirty = true;
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			try {
				localStorage.setItem(storageKey(id), JSON.stringify(layout));
				savedFlash = true;
				dirty = false;
				setTimeout(() => (savedFlash = false), 1400);
			} catch {
				/* ignore quota */
			}
		}, 500);
	}

	// (Re)build the editor whenever the room id changes — handles room→room navigation.
	$effect(() => {
		const id = data.id;
		const scene = def;
		if (!canvas || !scene) return;
		const saved = loadSaved(id);
		const initial = saved && saved.length ? { ...scene, objects: saved } : scene;
		const ed = new RoomEditor(canvas, initial);
		ed.onSelect = (o) => {
			selected = o;
			if (o) scaleVal = o.scale ?? 1;
		};
		ed.onChange = (l) => {
			placed = l;
			scheduleSave(id, l);
		};
		ed.setMode('translate');
		editor = ed;
		selected = null;
		mode = 'translate';
		placed = ed.getLayout();
		ed.resize();
		const ro = new ResizeObserver(() => ed.resize());
		if (container) ro.observe(container);
		return () => {
			ro.disconnect();
			if (saveTimer) clearTimeout(saveTimer);
			ed.dispose();
		};
	});

	function add(kind: string) {
		leftTab = 'add';
		editor?.addObject(kind);
	}
	function selectObj(id: string) {
		editor?.selectById(id);
	}
	function del() {
		editor?.deleteSelected();
	}
	function dup() {
		editor?.duplicateSelected();
	}
	function setMode(m: GizmoMode) {
		mode = m;
		editor?.setMode(m);
	}
	function rotate(d: number) {
		editor?.rotateSelected(d);
	}
	function applyScale(v: number) {
		scaleVal = v;
		editor?.setScale(v);
	}
	function toggleGrid() {
		gridOn = !gridOn;
		editor?.toggleGrid(gridOn);
	}
	function frameView() {
		editor?.frameRoom();
	}
	function resetRoom() {
		if (!def) return;
		if (!confirm('Reset this room to the original layout? Your changes will be discarded.')) return;
		try {
			localStorage.removeItem(storageKey(data.id));
		} catch {
			/* ignore */
		}
		editor?.resetTo(def.objects);
		selected = null;
		dirty = false;
	}

	function onKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (selected) {
				e.preventDefault();
				del();
			}
		} else if (e.key === 'Escape') {
			if (showWalk) showWalk = false;
			else editor?.clearSelection();
		}
		else if (e.key === '1') setMode('translate');
		else if (e.key === '2') setMode('rotate');
		else if (e.key === '3') setMode('scale');
		else if ((e.key === 'r' || e.key === 'R') && selected) rotate(15);
		else if ((e.key === 'd' || e.key === 'D') && selected && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			dup();
		}
	}
</script>

<svelte:window onkeydown={onKey} />

<svelte:head>
	<title>{doc ? `${doc.name} · CoSol 3D Designer` : 'Room · CoSol'}</title>
</svelte:head>

<main class="editor">
	<div class="scene" bind:this={container}>
		<canvas bind:this={canvas}></canvas>
	</div>

	{#if !def || !doc}
		<div class="missing">
			<h1>Room not found</h1>
			<a href="{base}/explore">← Back to the floor plan</a>
		</div>
	{:else}
		<!-- ============ TOP BAR ============ -->
		<header>
			<a class="back" href="{base}/explore" aria-label="Back to floor plan">◀ Floor plan</a>
			<div class="title">
				<span class="zone" style:background={doc.zoneColor}>{doc.zoneName}</span>
				<h1>{doc.name}</h1>
				<p>{doc.tagline}</p>
			</div>
			<div class="top-right">
				{#if walkUrl}
					<button class="walk-btn" onclick={() => (showWalk = true)}>▶ Walkthrough</button>
				{/if}
				<span class="save" class:on={savedFlash} class:dirty>
					{savedFlash ? '✓ Saved' : dirty ? '• Saving…' : 'Auto-saved'}
				</span>
				<button class="ghost" onclick={resetRoom}>⤺ Reset room</button>
			</div>
		</header>

		<!-- ============ LEFT PANEL ============ -->
		<aside class="left">
			<div class="ltabs">
				<button class:active={leftTab === 'about'} onclick={() => (leftTab = 'about')}>Details</button>
				<button class:active={leftTab === 'add'} onclick={() => (leftTab = 'add')}>Add objects</button>
			</div>

			{#if leftTab === 'about'}
				<div class="panel-scroll">
					<div class="meta-row">
						{#if doc.dims}<span>📐 {doc.dims}</span>{/if}
						{#if doc.capacity}<span>👥 {doc.capacity}</span>{/if}
						{#if doc.area}<span>▦ {doc.area}</span>{/if}
					</div>
					<p class="summary">{doc.summary}</p>

					{#if doc.offers.length}
						<h4>What it offers</h4>
						<ul class="offers">
							{#each doc.offers as o (o)}<li>{o}</li>{/each}
						</ul>
					{/if}

					{#if doc.characteristics.length}
						<h4>Characteristics</h4>
						<ul class="chars">
							{#each doc.characteristics as c (c)}<li>{c}</li>{/each}
						</ul>
					{/if}

					{#if doc.devices.length}
						<h4>Devices &amp; tech</h4>
						<div class="chips">
							{#each doc.devices as dv (dv)}<span class="chip">{dv}</span>{/each}
						</div>
					{/if}

					{#if doc.materials.length}
						<h4>Materials</h4>
						<div class="chips">
							{#each doc.materials as m (m)}<span class="chip soft">{m}</span>{/each}
						</div>
					{/if}

					{#if doc.palette.length}
						<h4>Palette</h4>
						<div class="palette">
							{#each doc.palette as p (p.hex)}
								<div class="sw" title={p.name}>
									<span style:background={p.hex}></span>{p.name}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<div class="panel-scroll">
					<p class="hint-sm">Click an item to drop it into the room, then drag to position it.</p>
					{#each paletteGroups as g (g.cat)}
						<div class="cat">
							<div class="cat-head">{g.cat}</div>
							<div class="cat-grid">
								{#each g.items as it (it.kind)}
									<button class="add-btn" onclick={() => add(it.kind)} title={`Add ${it.label}`}>
										<span class="ab-ico">+</span>{it.label}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</aside>

		<!-- ============ RIGHT INSPECTOR ============ -->
		<aside class="right">
			{#if selected}
				<div class="insp">
					<div class="insp-head">
						<h3>{catalogLabel(selected.kind)}</h3>
						<button class="x" onclick={() => editor?.clearSelection()} aria-label="Deselect">✕</button>
					</div>

					<div class="seg modes">
						<button class:on={mode === 'translate'} onclick={() => setMode('translate')}>✥ Move</button>
						<button class:on={mode === 'rotate'} onclick={() => setMode('rotate')}>⟳ Rotate</button>
						<button class:on={mode === 'scale'} onclick={() => setMode('scale')}>⤢ Scale</button>
					</div>

					<div class="field">
						<label for="rot">Rotate</label>
						<div class="btn-row">
							<button onclick={() => rotate(-45)}>⟲ 45°</button>
							<button onclick={() => rotate(-15)}>−15°</button>
							<button onclick={() => rotate(15)}>+15°</button>
							<button onclick={() => rotate(45)}>45° ⟳</button>
						</div>
					</div>

					<div class="field">
						<label for="scl">Scale · {scaleVal.toFixed(2)}×</label>
						<input
							id="scl"
							type="range"
							min="0.5"
							max="2"
							step="0.05"
							value={scaleVal}
							oninput={(e) => applyScale(parseFloat((e.target as HTMLInputElement).value))}
						/>
					</div>

					<div class="field coords">
						<span>x {selected.x.toFixed(1)}</span>
						<span>z {selected.z.toFixed(1)}</span>
						<span>↻ {Math.round(((selected.rot * 180) / Math.PI) % 360)}°</span>
					</div>

					<div class="btn-row wide">
						<button onclick={dup}>⧉ Duplicate</button>
						<button class="danger" onclick={del}>🗑 Delete</button>
					</div>
					<p class="kb">Drag the gizmo to move · keys <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> modes · <kbd>R</kbd> rotate · <kbd>⌫</kbd> delete</p>
				</div>
			{:else}
				<div class="insp">
					<h3>Objects · {placed.length}</h3>
					<p class="hint-sm">Click an object in the room to edit it, or pick from the list.</p>
					<div class="obj-list">
						{#each placed as p (p.id)}
							<button class="obj-item" onclick={() => selectObj(p.id)}>
								<span class="oi-dot"></span>{catalogLabel(p.kind)}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</aside>

		<!-- ============ BOTTOM TOOLBAR ============ -->
		<div class="toolbar">
			<div class="seg">
				<button class:on={mode === 'translate'} onclick={() => setMode('translate')} title="Move (1)">✥</button>
				<button class:on={mode === 'rotate'} onclick={() => setMode('rotate')} title="Rotate (2)">⟳</button>
				<button class:on={mode === 'scale'} onclick={() => setMode('scale')} title="Scale (3)">⤢</button>
			</div>
			<button class="tb" class:on={gridOn} onclick={toggleGrid} title="Snap grid">▦ Grid</button>
			<button class="tb" onclick={frameView} title="Reset camera">⤢ Frame</button>
			<button class="tb" onclick={() => (leftTab = 'add')} title="Add objects">＋ Add</button>
		</div>

		<div class="hint-tip">Click an object to select · drag the gizmo to move · scroll to zoom · drag empty space to orbit</div>

		<!-- ============ CINEMATIC WALKTHROUGH OVERLAY ============ -->
		{#if showWalk && walkUrl}
			<div
				class="walk-overlay"
				role="presentation"
				onclick={() => (showWalk = false)}
			>
				<div class="walk-box" role="dialog" aria-label="Cinematic walkthrough" onclick={(e) => e.stopPropagation()}>
					<div class="walk-head">
						<span>🎬 Cinematic walkthrough · {doc.name}</span>
						<button class="x" onclick={() => (showWalk = false)} aria-label="Close walkthrough">✕</button>
					</div>
					<!-- svelte-ignore a11y_media_has_caption -->
					<video class="walk-video" src={walkUrl} controls autoplay loop playsinline></video>
					{#if walkMeta?.note}
						<p class="walk-cap">{walkMeta.note}</p>
					{/if}
				</div>
			</div>
		{/if}
	{/if}
</main>

<style>
	.editor {
		position: fixed;
		inset: 0;
		overflow: hidden;
		font-family: var(--font);
	}
	.scene {
		position: absolute;
		inset: 0;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	.missing {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		gap: 12px;
		text-align: center;
	}
	.missing a {
		color: var(--cs-cyan);
	}

	/* -------- top bar -------- */
	header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		background: linear-gradient(to bottom, rgba(8, 14, 19, 0.94), rgba(8, 14, 19, 0.4) 75%, transparent);
		z-index: 20;
		pointer-events: none;
	}
	header > * {
		pointer-events: auto;
	}
	.back {
		flex: none;
		padding: 9px 13px;
		border: 1px solid var(--border-strong);
		border-radius: 9px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		background: rgba(20, 30, 38, 0.7);
		backdrop-filter: blur(8px);
		text-decoration: none;
		transition: 0.15s;
	}
	.back:hover {
		border-color: var(--cs-cyan);
		color: var(--cs-cyan);
	}
	.title {
		flex: 1;
		min-width: 0;
	}
	.title h1 {
		font-size: 19px;
		line-height: 1.1;
		margin: 3px 0 2px;
	}
	.title p {
		margin: 0;
		font-size: 12px;
		color: var(--text-dim);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.zone {
		display: inline-block;
		font-size: 10px;
		font-weight: 700;
		color: #00141b;
		padding: 2px 8px;
		border-radius: 5px;
	}
	.top-right {
		flex: none;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.save {
		font-size: 11px;
		color: var(--text-dim);
		border: 1px solid var(--border);
		padding: 5px 9px;
		border-radius: 7px;
		min-width: 78px;
		text-align: center;
	}
	.save.on {
		color: #39d98a;
		border-color: rgba(57, 217, 138, 0.5);
	}
	.save.dirty {
		color: var(--cs-cyan);
	}
	.ghost {
		padding: 8px 12px;
		border: 1px solid var(--border-strong);
		border-radius: 9px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text);
		background: rgba(20, 30, 38, 0.6);
		backdrop-filter: blur(8px);
		transition: 0.15s;
	}
	.ghost:hover {
		border-color: var(--cs-cyan);
		color: var(--cs-cyan);
	}
	.walk-btn {
		padding: 8px 14px;
		border-radius: 9px;
		font-size: 12px;
		font-weight: 700;
		color: #00141b;
		background: var(--cs-cyan);
		border: 1px solid var(--cs-cyan);
		transition: 0.15s;
		box-shadow: 0 0 0 0 rgba(0, 174, 239, 0.5);
	}
	.walk-btn:hover {
		filter: brightness(1.1);
		box-shadow: 0 4px 18px rgba(0, 174, 239, 0.4);
	}

	/* -------- walkthrough overlay -------- */
	.walk-overlay {
		position: absolute;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 32px;
		background: rgba(4, 8, 11, 0.78);
		backdrop-filter: blur(10px);
	}
	.walk-box {
		width: min(1100px, 94vw);
		background: var(--bg-panel, rgba(14, 20, 26, 0.96));
		border: 1px solid var(--border-strong, rgba(255, 255, 255, 0.18));
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
	}
	.walk-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text);
		border-bottom: 1px solid var(--border);
	}
	.walk-video {
		display: block;
		width: 100%;
		max-height: 72vh;
		background: #000;
	}
	.walk-cap {
		margin: 0;
		padding: 10px 16px 14px;
		font-size: 11.5px;
		color: var(--text-dim);
	}

	/* -------- panels -------- */
	.left,
	.right {
		position: absolute;
		top: 78px;
		bottom: 74px;
		width: 280px;
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
	.left {
		left: 14px;
	}
	.right {
		right: 14px;
		width: 268px;
	}
	.panel-scroll {
		overflow-y: auto;
		padding: 14px 15px 18px;
	}

	.ltabs {
		display: flex;
		gap: 4px;
		padding: 10px 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.ltabs button {
		flex: 1;
		padding: 9px 8px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-dim);
		border-radius: 8px 8px 0 0;
		transition: 0.14s;
	}
	.ltabs button.active {
		color: var(--cs-cyan);
		background: rgba(0, 174, 239, 0.1);
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		font-size: 11.5px;
		color: var(--text-dim);
		margin-bottom: 11px;
	}
	.summary {
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--text);
		margin: 0 0 4px;
	}
	.panel-scroll h4 {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-dim);
		margin: 16px 0 7px;
	}
	.offers,
	.chars {
		margin: 0;
		padding-left: 16px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.offers li,
	.chars li {
		font-size: 12px;
		line-height: 1.45;
		color: var(--text);
	}
	.chars li {
		color: var(--text-dim);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		font-size: 11px;
		padding: 4px 8px;
		border-radius: 6px;
		background: rgba(0, 174, 239, 0.12);
		color: #aee6ff;
		border: 1px solid rgba(0, 174, 239, 0.25);
	}
	.chip.soft {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-dim);
		border-color: var(--border);
	}
	.palette {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 7px;
	}
	.sw {
		display: flex;
		align-items: center;
		gap: 7px;
		font-size: 11px;
		color: var(--text-dim);
	}
	.sw span {
		width: 18px;
		height: 18px;
		border-radius: 5px;
		flex: none;
		border: 1px solid rgba(255, 255, 255, 0.18);
	}

	.hint-sm {
		font-size: 11.5px;
		color: var(--text-dim);
		line-height: 1.45;
		margin: 0 0 12px;
	}
	.cat {
		margin-bottom: 14px;
	}
	.cat-head {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--cs-cyan);
		font-weight: 700;
		margin-bottom: 7px;
	}
	.cat-grid {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.add-btn {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 8px 10px;
		border-radius: 8px;
		font-size: 12.5px;
		color: var(--text);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border);
		transition: 0.13s;
		text-align: left;
	}
	.add-btn:hover {
		background: rgba(0, 174, 239, 0.12);
		border-color: rgba(0, 174, 239, 0.4);
	}
	.ab-ico {
		display: grid;
		place-items: center;
		width: 18px;
		height: 18px;
		border-radius: 5px;
		background: var(--cs-cyan);
		color: #00141b;
		font-weight: 800;
		flex: none;
	}

	/* -------- inspector -------- */
	.insp {
		padding: 15px 16px;
		overflow-y: auto;
	}
	.insp-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 13px;
	}
	.insp-head h3,
	.insp > h3 {
		font-size: 15px;
	}
	.x {
		width: 24px;
		height: 24px;
		border-radius: 6px;
		color: var(--text-dim);
		font-size: 12px;
	}
	.x:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text);
	}
	.modes {
		margin-bottom: 14px;
	}
	.seg {
		display: flex;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 9px;
		padding: 3px;
		gap: 2px;
	}
	.seg button {
		flex: 1;
		padding: 8px 6px;
		border-radius: 7px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-dim);
		transition: 0.13s;
	}
	.seg button.on {
		background: var(--cs-cyan);
		color: #00141b;
	}
	.field {
		margin-bottom: 14px;
	}
	.field label {
		display: block;
		font-size: 11px;
		color: var(--text-dim);
		margin-bottom: 6px;
	}
	.btn-row {
		display: flex;
		gap: 5px;
	}
	.btn-row.wide {
		margin-top: 4px;
	}
	.btn-row button {
		flex: 1;
		padding: 8px 4px;
		border-radius: 7px;
		font-size: 11.5px;
		font-weight: 600;
		color: var(--text);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		transition: 0.13s;
	}
	.btn-row button:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.btn-row button.danger:hover {
		background: rgba(220, 70, 70, 0.22);
		border-color: rgba(220, 70, 70, 0.5);
		color: #ffb4b4;
	}
	input[type='range'] {
		width: 100%;
		accent-color: var(--cs-cyan);
	}
	.coords {
		display: flex;
		gap: 12px;
		font-size: 11.5px;
		color: var(--text-dim);
		font-variant-numeric: tabular-nums;
	}
	.kb {
		font-size: 10.5px;
		color: var(--text-dim);
		line-height: 1.6;
		margin: 12px 0 0;
	}
	.obj-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-top: 10px;
	}
	.obj-item {
		display: flex;
		align-items: center;
		gap: 9px;
		padding: 7px 9px;
		border-radius: 7px;
		font-size: 12px;
		color: var(--text);
		text-align: left;
		transition: 0.12s;
	}
	.obj-item:hover {
		background: rgba(0, 174, 239, 0.12);
	}
	.oi-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--cs-cyan);
		flex: none;
	}

	/* -------- bottom toolbar -------- */
	.toolbar {
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
	.toolbar .seg button {
		min-width: 40px;
		font-size: 15px;
	}
	.tb {
		padding: 9px 13px;
		border-radius: 8px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-dim);
		transition: 0.14s;
	}
	.tb:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.tb.on {
		color: var(--cs-cyan);
		background: rgba(0, 174, 239, 0.12);
	}

	.hint-tip {
		position: absolute;
		bottom: 18px;
		right: 16px;
		font-size: 11px;
		color: var(--text-dim);
		background: var(--bg-panel);
		border: 1px solid var(--border);
		padding: 7px 12px;
		border-radius: 9px;
		backdrop-filter: blur(8px);
		z-index: 12;
		max-width: 280px;
	}

	@media (max-width: 980px) {
		.hint-tip {
			display: none;
		}
		.left,
		.right {
			width: 210px;
		}
	}
</style>
