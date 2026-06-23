<script lang="ts">
	import type { DeviceIconId } from '$lib/data/devices';

	let { icon, accent = 'var(--cs-cyan)' }: { icon: DeviceIconId; accent?: string } = $props();
</script>

<!--
	Bespoke line/flat diagrams, one per device family. Accent colour is fed in via
	the --acc custom property and surfaced through `currentColor`; everything else
	uses the shared neutral palette so the whole catalog reads as one set.
-->
<div class="dvc-icon" style="--acc:{accent}">
	<svg viewBox="0 0 240 150" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
		{#if icon === 'dgx'}
			<!-- twin GPU racks, glowing slots, NVLink spine -->
			<rect x="58" y="26" width="56" height="98" rx="6" />
			<rect x="126" y="26" width="56" height="98" rx="6" />
			{#each [38, 52, 66, 80, 94, 108] as y, i}
				<rect class="slot" class:hot={i % 2 === 0} x="66" y={y} width="40" height="8" rx="2" />
				<rect class="slot" class:hot={i % 2 === 1} x="134" y={y} width="40" height="8" rx="2" />
			{/each}
			<line class="acc" x1="114" y1="48" x2="126" y2="48" />
			<line class="acc" x1="114" y1="74" x2="126" y2="74" />
			<line class="acc" x1="114" y1="100" x2="126" y2="100" />
			<circle class="dot" cx="64" cy="32" r="2.4" />
			<circle class="dot" cx="132" cy="32" r="2.4" />
		{:else if icon === 'omniverse'}
			<!-- triple curved monitors + USD cube -->
			<path d="M28 38 Q120 22 212 38 L212 92 Q120 80 28 92 Z" />
			<line x1="84" y1="30" x2="84" y2="86" />
			<line x1="156" y1="30" x2="156" y2="86" />
			<path class="acc" d="M120 46 l16 9 v18 l-16 9 -16-9 v-18 z" />
			<path class="thin" d="M120 46 v18 M120 64 l16 -9 M120 64 l-16 -9" />
			<line x1="120" y1="92" x2="120" y2="108" />
			<rect x="92" y="108" width="56" height="6" rx="3" />
		{:else if icon === 'greenlake'}
			<!-- stacked compute/storage chassis + cloud -->
			{#each [40, 70, 100] as y}
				<rect x="40" y={y} width="120" height="24" rx="4" />
				<circle class="acc" cx="54" cy={y + 12} r="3" />
				<line x1="66" y1={y + 12} x2="120" y2={y + 12} class="thin" />
				<rect class="slot" x="128" y={y + 8} width="24" height="8" rx="2" />
			{/each}
			<path class="acc" d="M172 64 a14 14 0 0 1 27 -4 a11 11 0 0 1 3 22 h-30 a11 11 0 0 1 0 -18 z" />
		{:else if icon === 'watsonx'}
			<!-- standing kiosk: chat bubble + face -->
			<rect x="78" y="22" width="84" height="92" rx="10" />
			<line x1="120" y1="114" x2="120" y2="128" />
			<rect x="96" y="128" width="48" height="6" rx="3" />
			<circle class="acc" cx="106" cy="52" r="6" />
			<path class="acc thin" d="M94 78 q12 -14 24 0" />
			<rect class="bubble" x="116" y="40" width="34" height="24" rx="6" />
			<line class="thin" x1="123" y1="48" x2="143" y2="48" />
			<line class="thin" x1="123" y1="56" x2="138" y2="56" />
		{:else if icon === 'network'}
			<!-- switch + wifi arcs -->
			<rect x="48" y="92" width="144" height="30" rx="5" />
			{#each [60, 76, 92, 108, 124, 140, 156, 172] as x}
				<rect class="port" x={x} y="100" width="10" height="14" rx="1.5" />
			{/each}
			<circle class="acc" cx="120" cy="70" r="4" />
			<path class="acc" d="M101 60 a26 26 0 0 1 38 0" fill="none" />
			<path class="acc" d="M90 48 a42 42 0 0 1 60 0" fill="none" />
			<path class="acc" d="M79 36 a58 58 0 0 1 82 0" fill="none" />
		{:else if icon === 'outposts'}
			<!-- single 42U rack + cloud + region pin -->
			<rect x="70" y="24" width="64" height="102" rx="6" />
			{#each [34, 48, 62, 76, 90, 104] as y, i}
				<rect class="slot" class:hot={i === 1 || i === 4} x="78" y={y} width="48" height="9" rx="2" />
			{/each}
			<path class="acc" d="M150 58 a13 13 0 0 1 25 -3 a10 10 0 0 1 3 20 h-27 a10 10 0 0 1 0 -17 z" />
			<path class="acc thin" d="M164 96 c0 10 -10 14 -10 22 a10 10 0 0 0 20 0 c0 -8 -10 -12 -10 -22 z" />
		{:else if icon === 'lookingglass'}
			<!-- holographic display, layered parallax planes -->
			<rect x="50" y="30" width="140" height="80" rx="6" />
			<line x1="120" y1="110" x2="120" y2="124" />
			<rect x="92" y="124" width="56" height="6" rx="3" />
			<path class="acc" d="M120 44 l30 16 -30 16 -30 -16 z" opacity="0.45" />
			<path class="acc" d="M120 54 l24 13 -24 13 -24 -13 z" opacity="0.7" />
			<path class="acc" d="M120 64 l16 9 -16 9 -16 -9 z" />
		{:else if icon === 'videowall'}
			<!-- 4x2 panel grid with dashboard glints -->
			<rect x="30" y="32" width="180" height="86" rx="4" />
			{#each [0, 1] as r}
				{#each [0, 1, 2, 3] as c}
					<rect class="panel" x={36 + c * 44} y={38 + r * 41} width="40" height="37" rx="2" />
				{/each}
			{/each}
			<polyline class="acc" points="44,66 56,58 68,62 80,52" fill="none" />
			<rect class="acc" x="128" y="48" width="6" height="18" />
			<rect class="acc" x="140" y="54" width="6" height="12" />
			<rect class="acc" x="152" y="44" width="6" height="22" />
		{:else if icon === 'arheadset'}
			<!-- AR visor -->
			<path d="M52 64 q68 -26 136 0 l4 30 q-72 18 -144 0 z" />
			<path class="acc thin" d="M70 70 q50 -16 100 0" fill="none" />
			<line x1="62" y1="62" x2="48" y2="50" />
			<line x1="178" y1="62" x2="192" y2="50" />
			<circle class="acc" cx="92" cy="82" r="9" />
			<circle class="acc" cx="148" cy="82" r="9" />
		{:else if icon === 'vrheadset'}
			<!-- VR goggles + strap -->
			<path d="M58 56 h124 a14 14 0 0 1 14 14 v18 a14 14 0 0 1 -14 14 h-16 q-26 6 -36 -8 q-10 14 -36 8 h-16 a14 14 0 0 1 -14 -14 v-18 a14 14 0 0 1 14 -14 z" />
			<path class="thin" d="M58 60 q-22 18 0 36" fill="none" />
			<path class="thin" d="M182 60 q22 18 0 36" fill="none" />
			<circle class="acc" cx="92" cy="79" r="8" />
			<circle class="acc" cx="148" cy="79" r="8" />
		{:else if icon === 'touchboard'}
			<!-- interactive whiteboard on stand + pen -->
			<rect x="44" y="26" width="152" height="86" rx="6" />
			<line x1="120" y1="112" x2="120" y2="128" />
			<line x1="92" y1="132" x2="148" y2="132" />
			<polyline class="acc" points="62,84 84,56 104,72 128,44" fill="none" />
			<circle class="acc" cx="150" cy="62" r="6" />
			<line class="pen" x1="170" y1="44" x2="186" y2="92" />
		{:else if icon === 'holomind'}
			<!-- perspective touch table with map + legs -->
			<path d="M52 64 L120 44 L188 64 L120 86 Z" />
			<path class="acc thin" d="M84 64 L120 54 L156 64 L120 76 Z" />
			<circle class="acc" cx="108" cy="62" r="3" />
			<circle class="acc" cx="134" cy="66" r="3" />
			<line x1="70" y1="74" x2="64" y2="118" />
			<line x1="170" y1="74" x2="176" y2="118" />
			<line x1="120" y1="86" x2="120" y2="120" />
		{:else if icon === 'webex'}
			<!-- wall board + camera bar + tracking arcs -->
			<rect x="50" y="34" width="140" height="84" rx="6" />
			<rect class="cam" x="98" y="28" width="44" height="10" rx="5" />
			<circle class="acc" cx="120" cy="33" r="2.6" />
			<circle class="acc" cx="120" cy="78" r="10" />
			<path class="acc thin" d="M120 78 m-22 0 a22 22 0 0 1 44 0" fill="none" />
			<path class="thin" d="M120 78 m-32 0 a32 32 0 0 1 64 0" fill="none" />
		{:else if icon === 'atmos'}
			<!-- room cube + spatial sound waves -->
			<path d="M120 40 l54 18 v40 l-54 18 -54 -18 v-40 z" />
			<path class="thin" d="M120 40 v76 M66 58 l54 18 54 -18" />
			<path class="acc" d="M150 64 a16 16 0 0 1 0 28" fill="none" />
			<path class="acc" d="M162 56 a30 30 0 0 1 0 44" fill="none" />
			<path class="acc" d="M90 64 a16 16 0 0 0 0 28" fill="none" />
			<path class="acc" d="M78 56 a30 30 0 0 0 0 44" fill="none" />
		{:else if icon === 'voiceai'}
			<!-- mic + waveform -->
			<rect x="108" y="36" width="24" height="46" rx="12" />
			<path d="M94 70 a26 26 0 0 0 52 0" fill="none" />
			<line x1="120" y1="96" x2="120" y2="110" />
			<line x1="104" y1="114" x2="136" y2="114" />
			{#each [{ x: 150, h: 14 }, { x: 160, h: 26 }, { x: 170, h: 40 }, { x: 180, h: 22 }, { x: 190, h: 12 }] as b}
				<line class="acc" x1={b.x} y1={75 - b.h / 2} x2={b.x} y2={75 + b.h / 2} />
			{/each}
			{#each [{ x: 90, h: 12 }, { x: 80, h: 24 }, { x: 70, h: 36 }, { x: 60, h: 20 }, { x: 50, h: 10 }] as b}
				<line class="acc" x1={b.x} y1={75 - b.h / 2} x2={b.x} y2={75 + b.h / 2} />
			{/each}
		{:else if icon === 'console'}
			<!-- triple-monitor NOC desk + RGB accent -->
			<rect x="40" y="34" width="50" height="40" rx="4" />
			<rect x="95" y="30" width="50" height="44" rx="4" />
			<rect x="150" y="34" width="50" height="40" rx="4" />
			<polyline class="acc" points="102,60 112,48 122,56 138,40" fill="none" />
			<line class="thin" x1="50" y1="48" x2="80" y2="48" />
			<line class="thin" x1="160" y1="48" x2="190" y2="48" />
			<line x1="120" y1="74" x2="120" y2="92" />
			<rect x="56" y="92" width="128" height="10" rx="3" />
			<rect class="acc" x="56" y="104" width="128" height="3" rx="1.5" />
		{:else if icon === 'totem'}
			<!-- transparent wayfinding totem + arrow -->
			<rect x="92" y="22" width="56" height="100" rx="8" />
			<rect class="glass" x="98" y="28" width="44" height="88" rx="5" />
			<line class="thin" x1="106" y1="34" x2="106" y2="110" />
			<line class="thin" x1="134" y1="34" x2="134" y2="110" />
			<path class="acc" d="M110 70 h22 M126 60 l12 10 -12 10" fill="none" />
			<circle class="acc" cx="120" cy="48" r="5" />
		{:else if icon === 'spot'}
			<!-- quadruped robot -->
			<rect x="80" y="58" width="80" height="26" rx="9" />
			<rect class="acc" x="150" y="50" width="26" height="16" rx="5" />
			<circle class="dot" cx="170" cy="58" r="2.6" />
			<path d="M92 84 l-10 20 l8 8" fill="none" />
			<path d="M110 84 l-6 22 l8 6" fill="none" />
			<path d="M138 84 l6 22 l-8 6" fill="none" />
			<path d="M152 84 l10 20 l-8 8" fill="none" />
			<line class="acc thin" x1="80" y1="70" x2="64" y2="62" />
		{:else if icon === 'cobot'}
			<!-- articulated robot arm + gripper -->
			<rect x="78" y="110" width="44" height="14" rx="4" />
			<line x1="100" y1="110" x2="100" y2="82" />
			<line x1="100" y1="82" x2="146" y2="58" />
			<line x1="146" y1="58" x2="138" y2="34" />
			<circle class="joint" cx="100" cy="82" r="6" />
			<circle class="joint" cx="146" cy="58" r="6" />
			<path class="acc" d="M132 30 l-8 -6 M144 30 l8 -6 M138 34 v-8" fill="none" />
			<circle class="acc" cx="138" cy="26" r="3" />
		{:else if icon === 'surveillance'}
			<!-- dome camera + cone + shield -->
			<path d="M70 40 h44 a0 0 0 0 1 0 0 a22 22 0 0 1 -44 0 z" />
			<rect x="68" y="36" width="48" height="6" rx="3" />
			<circle class="acc" cx="92" cy="48" r="6" />
			<path class="acc thin" d="M92 54 L66 104 M92 54 L118 104" fill="none" />
			<path class="acc thin" d="M66 104 q26 12 52 0" fill="none" />
			<path class="shield" d="M162 40 l24 8 v22 q0 22 -24 32 q-24 -10 -24 -32 v-22 z" />
			<path class="acc" d="M152 70 l8 9 16 -18" fill="none" />
		{:else if icon === 'power'}
			<!-- UPS battery stack + bolt + monitor line -->
			<rect x="52" y="34" width="60" height="92" rx="6" />
			{#each [44, 64, 84, 104] as y}
				<rect class="slot" x="60" y={y} width="44" height="12" rx="2" />
			{/each}
			<rect class="acc" x="60" y="44" width="44" height="12" rx="2" />
			<path class="acc bolt" d="M150 40 l-16 34 h14 l-8 32 26 -42 h-14 z" />
			<polyline class="thin" points="132,116 144,116 150,104 158,124 164,112 184,112" fill="none" />
		{/if}
	</svg>
</div>

<style>
	.dvc-icon {
		position: relative;
		width: 100%;
		aspect-ratio: 240 / 150;
		display: grid;
		place-items: center;
		color: var(--acc);
		background:
			radial-gradient(ellipse 60% 55% at 50% 46%, color-mix(in srgb, var(--acc) 24%, transparent), transparent 72%),
			linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
		border-bottom: 1px solid var(--border);
		overflow: hidden;
	}
	/* faint tech grid behind the diagram */
	.dvc-icon::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
		background-size: 20px 20px;
		mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, #000 35%, transparent 80%);
	}
	svg {
		position: relative;
		width: 78%;
		height: 78%;
		overflow: visible;
		filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
	}

	/* shared stroke/fill language */
	svg :where(rect, path, line, polyline, circle) {
		fill: none;
		stroke: #d2dfe9;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}
	/* panel fills */
	svg :where(rect:not(.slot):not(.port):not(.panel):not(.cam):not(.bubble):not(.glass):not(.acc)) {
		fill: rgba(13, 21, 28, 0.85);
	}

	.acc {
		stroke: currentColor;
	}
	path.acc:not([fill='none']),
	rect.acc {
		fill: color-mix(in srgb, currentColor 26%, transparent);
		stroke: currentColor;
	}
	.thin {
		stroke-width: 2;
	}
	.dot {
		fill: currentColor;
		stroke: none;
	}

	.slot {
		fill: rgba(255, 255, 255, 0.07);
		stroke: rgba(255, 255, 255, 0.18);
		stroke-width: 2;
	}
	.slot.hot {
		fill: color-mix(in srgb, currentColor 45%, transparent);
		stroke: currentColor;
	}
	.port,
	.panel {
		fill: rgba(255, 255, 255, 0.06);
		stroke: rgba(255, 255, 255, 0.22);
		stroke-width: 2;
	}
	.cam {
		fill: rgba(13, 21, 28, 0.95);
	}
	.bubble {
		fill: color-mix(in srgb, currentColor 14%, rgba(13, 21, 28, 0.9));
		stroke: currentColor;
		stroke-width: 2;
	}
	.glass {
		fill: color-mix(in srgb, currentColor 10%, transparent);
		stroke: color-mix(in srgb, currentColor 50%, transparent);
		stroke-width: 2;
	}
	.shield {
		fill: rgba(13, 21, 28, 0.7);
	}
	.joint {
		fill: rgba(13, 21, 28, 0.95);
	}
	.bolt {
		stroke-width: 2;
	}
</style>
