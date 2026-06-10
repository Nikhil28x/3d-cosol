import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { buildFloor, type BuildResult, type RoomMeta } from './buildFloor';
import { SHELL } from '../data/planData';

export type ViewMode = 'orbit' | 'walk';

interface Tween {
	active: boolean;
	t: number;
	dur: number;
	fromPos: THREE.Vector3;
	toPos: THREE.Vector3;
	fromTarget: THREE.Vector3;
	toTarget: THREE.Vector3;
}

const EYE = 1.62;

export class SceneManager {
	private canvas: HTMLCanvasElement;
	private renderer: THREE.WebGLRenderer;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private orbit: OrbitControls;
	private walk: PointerLockControls;
	private clock = new THREE.Clock();
	private build: BuildResult;
	private raycaster = new THREE.Raycaster();
	private pointer = new THREE.Vector2();
	private tween: Tween;
	private mode: ViewMode = 'orbit';
	private keys: Record<string, boolean> = {};
	private hoveredId: string | null = null;
	private highlightBox: THREE.LineSegments;
	private raf = 0;
	private disposed = false;

	rooms: RoomMeta[];
	onHover: (id: string | null) => void = () => {};
	onSelect: (id: string) => void = () => {};
	onModeChange: (m: ViewMode) => void = () => {};
	onLockChange: (locked: boolean) => void = () => {};
	onCamera: (x: number, z: number, rot: number) => void = () => {};
	private camTick = 0;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.05;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x0c151c);
		this.scene.fog = new THREE.Fog(0x0c151c, 120, 360);

		this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);

		// lights
		this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x202a30, 1.05));
		const amb = new THREE.AmbientLight(0xffffff, 0.35);
		this.scene.add(amb);
		const sun = new THREE.DirectionalLight(0xfff2e0, 1.45);
		sun.position.set(28, 46, 8);
		sun.castShadow = true;
		sun.shadow.mapSize.set(2048, 2048);
		sun.shadow.camera.near = 1;
		sun.shadow.camera.far = 140;
		const s = 34;
		sun.shadow.camera.left = -s;
		sun.shadow.camera.right = s;
		sun.shadow.camera.top = s;
		sun.shadow.camera.bottom = -s;
		sun.shadow.bias = -0.0004;
		sun.target.position.set(SHELL.width / 2, 0, SHELL.depth / 2);
		this.scene.add(sun);
		this.scene.add(sun.target);
		// warm fill over the workspace, cool fill over experience
		const warm = new THREE.PointLight(0xffd9a8, 0.5, 40, 2);
		warm.position.set(34, 4, 8);
		this.scene.add(warm);
		const cool = new THREE.PointLight(0xbfe6ff, 0.4, 36, 2);
		cool.position.set(9, 4, 10);
		this.scene.add(cool);

		// floor
		this.build = buildFloor();
		this.scene.add(this.build.root);
		this.scene.add(this.build.labelGroup);
		this.rooms = this.build.rooms;

		// hover highlight box
		const geo = new THREE.BoxGeometry(1, 1, 1);
		const edges = new THREE.EdgesGeometry(geo);
		this.highlightBox = new THREE.LineSegments(
			edges,
			new THREE.LineBasicMaterial({ color: 0x00aeef, transparent: true, opacity: 0.9 })
		);
		this.highlightBox.visible = false;
		this.scene.add(this.highlightBox);

		// controls
		this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbit.enableDamping = true;
		this.orbit.dampingFactor = 0.08;
		this.orbit.maxPolarAngle = Math.PI * 0.495;
		this.orbit.minDistance = 4;
		this.orbit.maxDistance = 110;
		this.orbit.target.set(SHELL.width / 2, 1, SHELL.depth / 2);

		this.walk = new PointerLockControls(this.camera, this.renderer.domElement);
		this.walk.addEventListener('lock', () => this.onLockChange(true));
		this.walk.addEventListener('unlock', () => this.onLockChange(false));

		this.tween = {
			active: false,
			t: 0,
			dur: 1,
			fromPos: new THREE.Vector3(),
			toPos: new THREE.Vector3(),
			fromTarget: new THREE.Vector3(),
			toTarget: new THREE.Vector3()
		};

		this.focusOverview(true);
		this.bindEvents();
		this.resize();
		this.loop();
	}

	/* ----------------------------------------------------------- events --- */
	private bindEvents() {
		this.canvas.addEventListener('pointermove', this.handlePointerMove);
		this.canvas.addEventListener('click', this.handleClick);
		window.addEventListener('keydown', this.handleKey);
		window.addEventListener('keyup', this.handleKey);
	}

	private handleKey = (e: KeyboardEvent) => {
		this.keys[e.code] = e.type === 'keydown';
	};

	private handlePointerMove = (e: PointerEvent) => {
		if (this.mode !== 'orbit') return;
		const r = this.canvas.getBoundingClientRect();
		this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
		this.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
		this.updateHover();
	};

	private handleClick = () => {
		if (this.mode === 'walk') {
			if (!this.walk.isLocked) this.walk.lock();
			return;
		}
		if (this.hoveredId) this.onSelect(this.hoveredId);
	};

	private updateHover() {
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const hits = this.raycaster.intersectObjects(this.build.pickables, false);
		const id = hits.length ? (hits[0].object.userData.roomId as string) : null;
		if (id !== this.hoveredId) {
			this.hoveredId = id;
			this.onHover(id);
			const room = id ? this.rooms.find((r) => r.id === id) : null;
			if (room) {
				this.highlightBox.visible = true;
				this.highlightBox.position.set(room.cx, room.y + 1.35, room.cz);
				this.highlightBox.scale.set(room.w, 2.7, room.d);
			} else {
				this.highlightBox.visible = false;
			}
			this.canvas.style.cursor = id ? 'pointer' : 'default';
		}
	}

	/* ------------------------------------------------------------ modes --- */
	setMode(mode: ViewMode) {
		if (mode === this.mode) return;
		this.mode = mode;
		this.highlightBox.visible = false;
		this.hoveredId = null;
		this.onHover(null);
		if (mode === 'walk') {
			this.orbit.enabled = false;
			// drop the camera to eye height near the reception
			this.camera.position.set(24, EYE, 20);
			this.camera.lookAt(28, EYE, 6);
			this.canvas.style.cursor = 'default';
		} else {
			if (this.walk.isLocked) this.walk.unlock();
			this.orbit.enabled = true;
			this.focusOverview();
		}
		this.onModeChange(mode);
	}

	getMode() {
		return this.mode;
	}

	/* ------------------------------------------------------- camera moves -- */
	private startTween(toPos: THREE.Vector3, toTarget: THREE.Vector3, dur = 1.1) {
		this.tween.fromPos.copy(this.camera.position);
		this.tween.toPos.copy(toPos);
		this.tween.fromTarget.copy(this.orbit.target);
		this.tween.toTarget.copy(toTarget);
		this.tween.t = 0;
		this.tween.dur = dur;
		this.tween.active = true;
	}

	focusOverview(instant = false) {
		const cx = SHELL.width / 2;
		const cz = SHELL.depth / 2;
		const pos = new THREE.Vector3(cx - 2, 41, cz + 41);
		const tgt = new THREE.Vector3(cx, 0.5, cz - 1);
		if (instant) {
			this.camera.position.copy(pos);
			this.orbit.target.copy(tgt);
		} else if (this.mode === 'orbit') {
			this.startTween(pos, tgt, 1.2);
		}
	}

	flyToRoom(id: string) {
		const room = this.rooms.find((r) => r.id === id);
		if (!room) return;
		if (this.mode === 'walk') {
			// teleport just outside the room, at eye level, facing in
			const cx = SHELL.width / 2;
			const dirX = Math.sign(cx - room.cx) || 1;
			this.camera.position.set(room.cx - dirX * (room.w / 2 + 1.5), EYE, room.cz + room.d / 2 + 1.5);
			this.camera.lookAt(room.cx, EYE, room.cz);
			return;
		}
		const dist = Math.max(room.w, room.d) * 1.15 + 7.5;
		const pos = new THREE.Vector3(
			room.cx + dist * 0.55,
			room.y + dist * 0.62,
			room.cz + dist * 0.75
		);
		const tgt = new THREE.Vector3(room.cx, room.y + 1.1, room.cz);
		this.startTween(pos, tgt, 1.0);
	}

	toggleLabels(visible: boolean) {
		this.build.labelGroup.visible = visible;
	}

	/* -------------------------------------------------------------- loop --- */
	private loop = () => {
		if (this.disposed) return;
		this.raf = requestAnimationFrame(this.loop);
		const dt = Math.min(this.clock.getDelta(), 0.05);

		if (this.tween.active) {
			this.tween.t += dt / this.tween.dur;
			const k = Math.min(this.tween.t, 1);
			const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
			this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e);
			this.orbit.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, e);
			if (k >= 1) this.tween.active = false;
		}

		if (this.mode === 'walk' && this.walk.isLocked) {
			const speed = (this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? 7 : 3.4) * dt;
			if (this.keys['KeyW'] || this.keys['ArrowUp']) this.walk.moveForward(speed);
			if (this.keys['KeyS'] || this.keys['ArrowDown']) this.walk.moveForward(-speed);
			if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.walk.moveRight(-speed);
			if (this.keys['KeyD'] || this.keys['ArrowRight']) this.walk.moveRight(speed);
			// constrain to the floor plate, fixed eye height
			const b = this.build.bounds;
			this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, b.minX, b.maxX);
			this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, b.minZ, b.maxZ);
			this.camera.position.y = EYE;
		}

		if (this.mode === 'orbit') this.orbit.update();

		// publish camera position to the minimap (~12fps)
		this.camTick += dt;
		if (this.camTick > 0.08) {
			this.camTick = 0;
			const dir = new THREE.Vector3();
			this.camera.getWorldDirection(dir);
			this.onCamera(this.camera.position.x, this.camera.position.z, Math.atan2(dir.x, dir.z));
		}

		this.renderer.render(this.scene, this.camera);
	};

	/* ------------------------------------------------------------ resize -- */
	resize = () => {
		const w = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || window.innerWidth;
		const h = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || window.innerHeight;
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
	};

	dispose() {
		this.disposed = true;
		cancelAnimationFrame(this.raf);
		this.canvas.removeEventListener('pointermove', this.handlePointerMove);
		this.canvas.removeEventListener('click', this.handleClick);
		window.removeEventListener('keydown', this.handleKey);
		window.removeEventListener('keyup', this.handleKey);
		this.orbit.dispose();
		this.renderer.dispose();
		this.scene.traverse((o) => {
			const mesh = o as THREE.Mesh;
			if (mesh.geometry) mesh.geometry.dispose();
		});
	}
}
