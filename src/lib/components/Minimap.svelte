<script lang="ts">
	import { ROOMS, ZONES, WORKFIELD, SHELL, STAIR } from '$lib/data/planData';
	import { sectionOf, type SectionId } from '$lib/data/sections';

	let {
		section = 'overview' as SectionId,
		selected = null as string | null,
		hovered = null as string | null,
		cam = { x: 24, z: 14, rot: 0 },
		onPick = (_id: string) => {}
	}: {
		section?: SectionId;
		selected?: string | null;
		hovered?: string | null;
		cam?: { x: number; z: number; rot: number };
		onPick?: (id: string) => void;
	} = $props();

	const W = SHELL.width;
	const D = SHELL.depth;
	const main = ROOMS.filter((r) => r.furniture !== 'empty' && r.floor === 'main');
	const mezz = ROOMS.filter((r) => r.floor === 'mezzanine');

	const inSection = (id: string) => {
		if (section === 'overview') return true;
		const r = ROOMS.find((x) => x.id === id);
		if (id === 'workfield') return section === 'workspace';
		return r ? sectionOf(r) === section : false;
	};

	const camAngle = $derived(90 - (cam.rot * 180) / Math.PI);
</script>

<svg viewBox={`-0.6 -0.6 ${W + 1.2} ${D + 1.2}`} class="map" role="img" aria-label="Floor plan minimap">
	<!-- floor base -->
	<rect x="0" y="0" width="17.4" height={D} fill="#1b262e" />
	<rect x="17.4" y="0" width={W - 17.4} height={D} fill="#241f1a" />
	<rect x="0" y="0" width={W} height={D} fill="none" stroke="rgba(255,255,255,.18)" stroke-width="0.12" />

	<!-- open workstation field -->
	{#if inSection('workfield')}
		<g
			class="room"
			class:dim={section !== 'overview' && !inSection('workfield')}
			onclick={() => onPick('workfield')}
			onkeydown={(e) => e.key === 'Enter' && onPick('workfield')}
			role="button"
			tabindex="0"
		>
			<rect
				x={WORKFIELD.x}
				y={WORKFIELD.z}
				width={WORKFIELD.w}
				height={WORKFIELD.d}
				fill={ZONES.work.color}
				fill-opacity={selected === 'workfield' ? 0.95 : 0.5}
				stroke={selected === 'workfield' || hovered === 'workfield' ? '#00aeef' : 'rgba(0,0,0,.25)'}
				stroke-width={selected === 'workfield' || hovered === 'workfield' ? 0.35 : 0.1}
			/>
		</g>
	{/if}

	<!-- main floor rooms -->
	{#each main as r (r.id)}
		<g
			class="room"
			class:dim={!inSection(r.id)}
			onclick={() => onPick(r.id)}
			onkeydown={(e) => e.key === 'Enter' && onPick(r.id)}
			role="button"
			tabindex="0"
		>
			<rect
				x={r.x}
				y={r.z}
				width={r.w}
				height={r.d}
				fill={ZONES[r.zone].color}
				fill-opacity={selected === r.id ? 0.95 : hovered === r.id ? 0.8 : 0.62}
				stroke={selected === r.id || hovered === r.id ? '#00aeef' : 'rgba(0,0,0,.3)'}
				stroke-width={selected === r.id || hovered === r.id ? 0.35 : 0.08}
			/>
		</g>
	{/each}

	<!-- staircase -->
	<rect x={STAIR.x} y={STAIR.z} width={STAIR.w} height={STAIR.d} fill="none" stroke="rgba(255,255,255,.4)" stroke-width="0.1" stroke-dasharray="0.4 0.3" />

	<!-- mezzanine (drawn as outline overlay) -->
	{#each mezz as r (r.id)}
		<rect
			x={r.x}
			y={r.z}
			width={r.w}
			height={r.d}
			fill={section === 'mezzanine' ? ZONES[r.zone].color : 'none'}
			fill-opacity={section === 'mezzanine' ? (selected === r.id ? 0.9 : 0.5) : 0}
			stroke={selected === r.id || hovered === r.id ? '#00aeef' : 'rgba(255,210,140,.55)'}
			stroke-width="0.12"
			stroke-dasharray="0.5 0.35"
			class="room"
			onclick={() => onPick(r.id)}
			onkeydown={(e) => e.key === 'Enter' && onPick(r.id)}
			role="button"
			tabindex="0"
		/>
	{/each}

	<!-- camera marker -->
	<g transform={`translate(${cam.x} ${cam.z}) rotate(${camAngle})`}>
		<polygon points="1.4,0 -0.9,1.0 -0.9,-1.0" fill="#00aeef" stroke="#fff" stroke-width="0.12" />
		<circle cx="0" cy="0" r="0.45" fill="#00aeef" stroke="#fff" stroke-width="0.12" />
	</g>

	<text x="8.7" y={D - 0.8} class="lbl">EXPERIENCE</text>
	<text x="32" y={D - 0.8} class="lbl">WORKSPACE</text>
</svg>

<style>
	.map {
		width: 100%;
		height: auto;
		display: block;
		border-radius: 8px;
	}
	.room {
		cursor: pointer;
		transition: opacity 0.2s;
	}
	.room.dim {
		opacity: 0.28;
		pointer-events: none;
	}
	.room:hover rect {
		fill-opacity: 0.85;
	}
	.lbl {
		font-size: 1px;
		fill: rgba(255, 255, 255, 0.35);
		font-weight: 700;
		letter-spacing: 0.06px;
		text-anchor: middle;
		font-family: Inter, sans-serif;
		pointer-events: none;
	}
	rect {
		transition:
			fill-opacity 0.18s,
			stroke 0.18s;
	}
</style>
