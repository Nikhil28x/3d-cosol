import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { MAT } from '../three/materials';
import { buildObject, CATALOG } from './catalog';
import type { PlacedObject, RoomScene } from './types';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

interface Tracked {
	id: string;
	kind: string;
	group: THREE.Group;
	/** base footprint [w, d] in metres, used for wall-aware clamping */
	footprint: [number, number];
}

let idCounter = 0;
function newId(kind: string) {
	idCounter += 1;
	return `${kind}-${Date.now().toString(36)}-${idCounter}`;
}

/* ============================================================================
   RoomEditor — a self-contained Three.js scene for ONE room, with an editor:
   select / move / rotate / scale / add / duplicate / delete objects, plus a
   dollhouse camera. Faithful walls + floor are generated from the RoomScene.
   ========================================================================== */
export class RoomEditor {
	private canvas: HTMLCanvasElement;
	private scene = new THREE.Scene();
	private renderer: THREE.WebGLRenderer;
	private camera: THREE.PerspectiveCamera;
	private orbit: OrbitControls;
	private gizmo: TransformControls;
	private raycaster = new THREE.Raycaster();
	private pointer = new THREE.Vector2();
	private raf = 0;
	private disposed = false;

	private room: RoomScene;
	private objectsGroup = new THREE.Group();
	private tracked = new Map<string, Tracked>();
	private selectionBox: THREE.BoxHelper;
	private hoverBox: THREE.BoxHelper;
	private grid: THREE.GridHelper;
	/** per-instance materials this editor created (NOT the shared MAT.* library) —
	    disposed on teardown so repeated room→room navigation doesn't leak GPU memory */
	private owned: THREE.Material[] = [];

	private selectedId: string | null = null;
	private hoveredId: string | null = null;
	private wallGap = 0.12;
	private downPos = new THREE.Vector2();
	private pointerDown = false;
	private needsRender = true;
	/** request a single frame to be drawn (render-on-demand to avoid idle GPU churn) */
	private invalidate = () => {
		this.needsRender = true;
	};

	onSelect: (obj: PlacedObject | null) => void = () => {};
	onChange: (objects: PlacedObject[]) => void = () => {};
	onHover: (id: string | null) => void = () => {};

	constructor(canvas: HTMLCanvasElement, room: RoomScene) {
		this.canvas = canvas;
		this.room = room;

		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
		this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.18;
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;

		this.scene.background = new THREE.Color(0x0b1218);
		this.scene.fog = new THREE.Fog(0x0b1218, 40, 120);

		// near plane lifted well off 0.1 — a 0.1:400 ratio wrecks depth precision
		// near y=0 and is what makes coplanar floor surfaces z-fight ("break").
		this.camera = new THREE.PerspectiveCamera(50, 1, 0.3, 200);

		this.buildLights();
		this.buildShell();

		this.grid = new THREE.GridHelper(Math.max(room.w, room.d) + 2, Math.round(Math.max(room.w, room.d) + 2), 0x2a3a44, 0x1a262e);
		(this.grid.material as THREE.Material).transparent = true;
		(this.grid.material as THREE.Material).opacity = 0.5;
		this.grid.position.y = 0.012;
		this.grid.visible = false;
		this.scene.add(this.grid);
		this.owned.push(this.grid.material as THREE.Material);

		this.scene.add(this.objectsGroup);

		// selection / hover outlines
		this.selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0x00aeef);
		(this.selectionBox.material as THREE.LineBasicMaterial).depthTest = false;
		this.selectionBox.visible = false;
		this.scene.add(this.selectionBox);
		this.owned.push(this.selectionBox.material as THREE.Material);
		this.hoverBox = new THREE.BoxHelper(new THREE.Object3D(), 0x7fd4ff);
		(this.hoverBox.material as THREE.LineBasicMaterial).transparent = true;
		(this.hoverBox.material as THREE.LineBasicMaterial).opacity = 0.6;
		this.hoverBox.visible = false;
		this.scene.add(this.hoverBox);
		this.owned.push(this.hoverBox.material as THREE.Material);

		// controls
		this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbit.enableDamping = true;
		this.orbit.dampingFactor = 0.08;
		this.orbit.maxPolarAngle = Math.PI * 0.495;
		this.orbit.minDistance = 2;
		this.orbit.maxDistance = Math.max(room.w, room.d) * 2.4 + 12;
		this.orbit.target.set(0, 1, 0);
		this.orbit.addEventListener('change', this.invalidate);

		this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
		this.gizmo.setTranslationSnap(null);
		this.gizmo.setRotationSnap(THREE.MathUtils.degToRad(15));
		this.gizmo.showY = false; // floor-plane translation only by default
		this.gizmo.addEventListener('change', this.invalidate);
		this.gizmo.addEventListener('dragging-changed', (e) => {
			this.orbit.enabled = !e.value;
			if (!e.value) this.commitSelected();
		});
		this.gizmo.addEventListener('objectChange', () => this.constrainSelected());
		this.scene.add(this.gizmo.getHelper());

		this.loadObjects(room.objects);
		this.frameRoom(true);
		this.bind();
		this.resize();
		this.loop();
	}

	/* --------------------------------------------------------- scene build -- */
	private buildLights() {
		const warm = this.room.accent === 'warm';
		// Base fill from hemisphere + ambient (cheap, no per-fragment falloff). A
		// single shadow-casting sun and one accent point light keep the fragment
		// shading cost low — heavy multi-point-light setups are what make the
		// editor stutter while dragging on weaker GPUs.
		this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x2a343c, 1.35));
		this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));

		const sun = new THREE.DirectionalLight(warm ? 0xfff0d8 : 0xffffff, 1.5);
		sun.position.set(this.room.w * 0.4, 14, this.room.d * 0.5 + 6);
		sun.castShadow = true;
		sun.shadow.mapSize.set(1024, 1024);
		sun.shadow.camera.near = 1;
		sun.shadow.camera.far = 60;
		const s = Math.max(this.room.w, this.room.d) * 0.8 + 4;
		sun.shadow.camera.left = -s;
		sun.shadow.camera.right = s;
		sun.shadow.camera.top = s;
		sun.shadow.camera.bottom = -s;
		sun.shadow.bias = -0.0004;
		this.scene.add(sun);

		const accent = new THREE.PointLight(warm ? 0xffd9a8 : 0xbfe6ff, 1.0, 36, 2);
		accent.position.set(0, this.room.wallH - 0.3, 0);
		this.scene.add(accent);
	}

	private buildShell() {
		const { w, d, wallH, partition } = this.room;

		// soft infinite ground that catches shadow
		const groundMat = new THREE.MeshStandardMaterial({ color: 0x0e161d, roughness: 1 });
		const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.4;
		ground.receiveShadow = true;
		this.scene.add(ground);
		this.owned.push(groundMat);

		// plinth — top sits BELOW the finished floor top (was coplanar at y=0, which
		// z-fought across the whole floor). Plinth spans -0.45..-0.05; floor -0.06..0.
		const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), MAT.plinth);
		plinth.position.set(0, -0.25, 0);
		plinth.receiveShadow = true;
		this.scene.add(plinth);

		// finished floor (top surface at y = 0)
		const floorMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.room.floorColor), roughness: 0.82 });
		const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), floorMat);
		floor.position.set(0, -0.03, 0);
		floor.receiveShadow = true;
		this.scene.add(floor);
		this.owned.push(floorMat);

		// walls: N(-z), E(+x), W(-x) per partition; S(+z, camera side) always glazed
		const wallMat = partition === 'solid' ? MAT.wallWhite : MAT.glass;
		const t = 0.1;
		const mkWall = (cx: number, cz: number, len: number, vertical: boolean, mat: THREE.Material, h = wallH) => {
			const geo = vertical ? new THREE.BoxGeometry(t, h, len) : new THREE.BoxGeometry(len, h, t);
			const m = new THREE.Mesh(geo, mat);
			m.position.set(cx, h / 2, cz);
			m.castShadow = true;
			m.receiveShadow = true;
			this.scene.add(m);
			return m;
		};
		// North (back) — solid/glass with a door gap
		const doorW = 1.2;
		const seg = (w - doorW) / 2;
		mkWall(-w / 2 + seg / 2, -d / 2, seg, false, wallMat);
		mkWall(w / 2 - seg / 2, -d / 2, seg, false, wallMat);
		// East + West
		mkWall(w / 2, 0, d, true, wallMat);
		mkWall(-w / 2, 0, d, true, wallMat);
		// South — always glazed (viewing window) + low frame so the room reads enclosed
		mkWall(0, d / 2, w, false, MAT.glass);
		mkWall(0, d / 2, w, false, MAT.glassFrame, 0.12).position.setY(0.06);
		mkWall(0, d / 2, w, false, MAT.glassFrame, 0.12).position.setY(wallH - 0.06);

		// glass frames on glazed sides
		if (partition !== 'solid') {
			for (const [cx, cz, vert] of [
				[w / 2, 0, true],
				[-w / 2, 0, true]
			] as [number, number, boolean][]) {
				mkWall(cx, cz, vert ? d : w, vert, MAT.glassFrame, 0.1).position.setY(0.05);
				mkWall(cx, cz, vert ? d : w, vert, MAT.glassFrame, 0.1).position.setY(wallH - 0.05);
			}
		}

		// thin baseboard skirting on opaque walls
		if (partition === 'solid') {
			mkWall(0, -d / 2, w, false, MAT.alu, 0.12).position.setY(0.06);
		}
	}

	/* ------------------------------------------------------ object lifecycle */
	private makeTracked(p: PlacedObject): Tracked | null {
		const built = buildObject(p.kind);
		if (!built) return null;
		const id = p.id || newId(p.kind);
		built.position.set(p.x, 0, p.z);
		built.rotation.y = p.rot || 0;
		const sc = p.scale ?? 1;
		built.scale.setScalar(sc);
		built.userData.objId = id;
		built.userData.kind = p.kind;
		built.traverse((o) => {
			(o as THREE.Mesh).userData.objId = id;
		});
		this.objectsGroup.add(built);
		const footprint = (CATALOG[p.kind]?.footprint ?? [1, 1]) as [number, number];
		const tr: Tracked = { id, kind: p.kind, group: built, footprint };
		this.tracked.set(id, tr);
		// keep loaded/saved objects inside the (possibly different-sized) room
		this.clampToBounds(tr);
		this.invalidate();
		return tr;
	}

	private clearObjects() {
		for (const { group } of this.tracked.values()) {
			this.objectsGroup.remove(group);
			group.traverse((o) => {
				const m = o as THREE.Mesh;
				if (m.geometry) m.geometry.dispose();
			});
		}
		this.tracked.clear();
	}

	loadObjects(objects: PlacedObject[]) {
		this.detach();
		this.clearObjects();
		for (const p of objects) this.makeTracked(p);
	}

	/** Add a catalogue item; spawns in front of the camera within bounds and selects it. */
	addObject(kind: string): string | null {
		const spawn = this.spawnPoint();
		const tr = this.makeTracked({ id: newId(kind), kind, x: spawn.x, z: spawn.z, rot: 0, scale: 1 });
		if (!tr) return null;
		this.selectById(tr.id);
		this.emitChange();
		return tr.id;
	}

	duplicateSelected(): string | null {
		if (!this.selectedId) return null;
		const src = this.tracked.get(this.selectedId);
		if (!src) return null;
		const tr = this.makeTracked({
			id: newId(src.kind),
			kind: src.kind,
			x: this.clampX(src.group.position.x + 0.8),
			z: this.clampZ(src.group.position.z + 0.8),
			rot: src.group.rotation.y,
			scale: src.group.scale.x
		});
		if (!tr) return null;
		this.selectById(tr.id);
		this.emitChange();
		return tr.id;
	}

	deleteSelected() {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		this.detach();
		this.objectsGroup.remove(tr.group);
		tr.group.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.geometry) m.geometry.dispose();
		});
		this.tracked.delete(tr.id);
		this.selectedId = null;
		this.onSelect(null);
		this.emitChange();
		this.invalidate();
	}

	/* ----------------------------------------------------------- selection -- */
	selectById(id: string | null) {
		if (!id) {
			this.detach();
			return;
		}
		const tr = this.tracked.get(id);
		if (!tr) return;
		this.selectedId = id;
		this.gizmo.attach(tr.group);
		this.selectionBox.setFromObject(tr.group);
		this.selectionBox.visible = true;
		this.hoverBox.visible = false;
		this.onSelect(this.toPlaced(tr));
		this.invalidate();
	}

	private detach() {
		this.selectedId = null;
		this.gizmo.detach();
		this.selectionBox.visible = false;
		this.invalidate();
	}

	clearSelection() {
		this.detach();
		this.onSelect(null);
	}

	setMode(mode: GizmoMode) {
		this.gizmo.setMode(mode);
		this.gizmo.showY = mode === 'scale' ? true : false;
		this.invalidate();
	}

	/** set uniform scale on the selected object from the inspector slider */
	setScale(factor: number) {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		tr.group.scale.setScalar(factor);
		this.selectionBox.setFromObject(tr.group);
		this.commitSelected();
	}

	rotateSelected(deltaDeg: number) {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		tr.group.rotation.y += THREE.MathUtils.degToRad(deltaDeg);
		this.selectionBox.setFromObject(tr.group);
		this.commitSelected();
	}

	/* -------------------------------------------------------- constraints --- */
	private clampX(x: number) {
		const lim = Math.max(0, this.room.w / 2 - this.wallGap - 0.3);
		return THREE.MathUtils.clamp(x, -lim, lim);
	}
	private clampZ(z: number) {
		const lim = Math.max(0, this.room.d / 2 - this.wallGap - 0.3);
		return THREE.MathUtils.clamp(z, -lim, lim);
	}
	/** Clamp an object so its rotated, scaled footprint stays within the walls —
	    this is what stops furniture clipping through walls or sliding out of the
	    room when you drag, rotate or scale it. */
	private clampToBounds(tr: Tracked) {
		const sc = Math.abs(tr.group.scale.x) || 1;
		const rot = tr.group.rotation.y;
		const c = Math.abs(Math.cos(rot));
		const s = Math.abs(Math.sin(rot));
		const [fw, fd] = tr.footprint;
		// half-extents of the axis-aligned box bounding the rotated footprint
		const halfX = ((fw * c + fd * s) / 2) * sc;
		const halfZ = ((fw * s + fd * c) / 2) * sc;
		const limX = Math.max(0, this.room.w / 2 - this.wallGap - halfX);
		const limZ = Math.max(0, this.room.d / 2 - this.wallGap - halfZ);
		tr.group.position.x = THREE.MathUtils.clamp(tr.group.position.x, -limX, limX);
		tr.group.position.z = THREE.MathUtils.clamp(tr.group.position.z, -limZ, limZ);
		tr.group.position.y = 0;
	}
	private constrainSelected() {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		const sc = THREE.MathUtils.clamp(tr.group.scale.x, 0.4, 2.5);
		tr.group.scale.setScalar(sc);
		this.clampToBounds(tr);
		this.selectionBox.setFromObject(tr.group);
		this.invalidate();
	}
	private commitSelected() {
		this.constrainSelected();
		if (this.selectedId) {
			const tr = this.tracked.get(this.selectedId);
			if (tr) this.onSelect(this.toPlaced(tr));
		}
		this.emitChange();
	}

	private spawnPoint() {
		// project a point ~3.5m in front of the camera onto the floor, clamped
		const dir = new THREE.Vector3();
		this.camera.getWorldDirection(dir);
		const p = this.camera.position.clone().add(dir.multiplyScalar(Math.max(4, this.camera.position.length() * 0.4)));
		return { x: this.clampX(p.x), z: this.clampZ(p.z) };
	}

	private toPlaced(tr: Tracked): PlacedObject {
		return {
			id: tr.id,
			kind: tr.kind,
			x: +tr.group.position.x.toFixed(3),
			z: +tr.group.position.z.toFixed(3),
			rot: +tr.group.rotation.y.toFixed(4),
			scale: +tr.group.scale.x.toFixed(3)
		};
	}

	getLayout(): PlacedObject[] {
		return [...this.tracked.values()].map((tr) => this.toPlaced(tr));
	}

	private emitChange() {
		this.onChange(this.getLayout());
	}

	resetTo(objects: PlacedObject[]) {
		this.loadObjects(objects);
		this.onSelect(null);
		this.emitChange();
	}

	toggleGrid(on: boolean) {
		this.grid.visible = on;
		this.gizmo.setTranslationSnap(on ? 0.25 : null);
		this.invalidate();
	}

	/* ------------------------------------------------------------- camera --- */
	frameRoom(instant = false) {
		const r = Math.max(this.room.w, this.room.d);
		const pos = new THREE.Vector3(this.room.w * 0.35, r * 0.7 + 2, this.room.d / 2 + r * 0.85 + 3);
		this.orbit.target.set(0, 1, 0);
		if (instant) {
			this.camera.position.copy(pos);
		} else {
			this.camera.position.copy(pos);
		}
		this.camera.lookAt(0, 1, 0);
		this.invalidate();
	}

	focusSelected() {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		this.orbit.target.copy(tr.group.position).setY(0.6);
	}

	/* -------------------------------------------------------------- events -- */
	private bind() {
		this.canvas.addEventListener('pointermove', this.onPointerMove);
		this.canvas.addEventListener('pointerdown', this.onPointerDown);
		this.canvas.addEventListener('pointerup', this.onPointerUp);
	}

	private setPointer(e: PointerEvent) {
		const r = this.canvas.getBoundingClientRect();
		this.pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
		this.pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
	}

	private pickObjectId(): string | null {
		this.raycaster.setFromCamera(this.pointer, this.camera);
		const hits = this.raycaster.intersectObjects(this.objectsGroup.children, true);
		for (const h of hits) {
			let o: THREE.Object3D | null = h.object;
			while (o) {
				if (o.userData && o.userData.objId) return o.userData.objId as string;
				o = o.parent;
			}
		}
		return null;
	}

	private onPointerMove = (e: PointerEvent) => {
		// skip hover raycasts while dragging the gizmo or orbiting the camera —
		// raycasting every move during a drag is a needless per-frame cost
		if (this.gizmo.dragging || this.pointerDown) return;
		this.setPointer(e);
		const id = this.pickObjectId();
		if (id !== this.hoveredId) {
			this.hoveredId = id;
			this.onHover(id);
			if (id && id !== this.selectedId) {
				const tr = this.tracked.get(id);
				if (tr) {
					this.hoverBox.setFromObject(tr.group);
					this.hoverBox.visible = true;
				}
			} else {
				this.hoverBox.visible = false;
			}
			this.canvas.style.cursor = id ? 'pointer' : 'default';
			this.invalidate();
		}
	};

	private onPointerDown = (e: PointerEvent) => {
		this.pointerDown = true;
		this.downPos.set(e.clientX, e.clientY);
	};

	private onPointerUp = (e: PointerEvent) => {
		this.pointerDown = false;
		if (this.gizmo.dragging || this.gizmo.axis) return;
		// ignore drags (orbit) — only treat as a click if pointer barely moved
		if (this.downPos.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5) return;
		this.setPointer(e);
		const id = this.pickObjectId();
		if (id) this.selectById(id);
		else this.clearSelection();
	};

	/* --------------------------------------------------------------- loop --- */
	private loop = () => {
		if (this.disposed) return;
		this.raf = requestAnimationFrame(this.loop);
		// orbit.update() returns true while damping is still settling
		const moving = this.orbit.update();
		// Render only when something actually changed (input, damping, an active
		// gizmo drag, or an explicit invalidate). Idle frames are skipped, which
		// keeps the GPU cool and avoids the long-session slowdown/stutter.
		if (this.needsRender || moving || this.gizmo.dragging) {
			this.renderer.render(this.scene, this.camera);
			this.needsRender = false;
		}
	};

	resize = () => {
		const w = this.canvas.clientWidth || this.canvas.parentElement?.clientWidth || window.innerWidth;
		const h = this.canvas.clientHeight || this.canvas.parentElement?.clientHeight || window.innerHeight;
		this.renderer.setSize(w, h, false);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.invalidate();
	};

	dispose() {
		this.disposed = true;
		cancelAnimationFrame(this.raf);
		this.canvas.removeEventListener('pointermove', this.onPointerMove);
		this.canvas.removeEventListener('pointerdown', this.onPointerDown);
		this.canvas.removeEventListener('pointerup', this.onPointerUp);
		this.gizmo.detach();
		this.gizmo.dispose();
		this.orbit.dispose();
		this.clearObjects();
		this.scene.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.geometry) m.geometry.dispose();
		});
		// dispose only the per-instance materials we created (never the shared MAT.*)
		for (const mat of this.owned) mat.dispose();
		this.owned = [];
		this.renderer.dispose();
	}
}
