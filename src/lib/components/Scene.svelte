<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SceneManager, type ViewMode } from '$lib/three/SceneManager';

	let {
		onReady = (_sm: SceneManager) => {},
		onHover = (_id: string | null) => {},
		onSelect = (_id: string) => {},
		onModeChange = (_m: ViewMode) => {},
		onLockChange = (_b: boolean) => {},
		onCamera = (_x: number, _z: number, _r: number) => {}
	}: {
		onReady?: (sm: SceneManager) => void;
		onHover?: (id: string | null) => void;
		onSelect?: (id: string) => void;
		onModeChange?: (m: ViewMode) => void;
		onLockChange?: (b: boolean) => void;
		onCamera?: (x: number, z: number, r: number) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let sm: SceneManager | undefined;
	let ro: ResizeObserver | undefined;

	onMount(() => {
		sm = new SceneManager(canvas);
		sm.onHover = onHover;
		sm.onSelect = onSelect;
		sm.onModeChange = onModeChange;
		sm.onLockChange = onLockChange;
		sm.onCamera = onCamera;
		sm.resize();
		onReady(sm);
		ro = new ResizeObserver(() => sm?.resize());
		ro.observe(container);
	});

	onDestroy(() => {
		ro?.disconnect();
		sm?.dispose();
	});
</script>

<div class="scene" bind:this={container}>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.scene {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
	}
</style>
