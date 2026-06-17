import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { MAT } from '../three/materials';
import { buildObject } from './catalog';
import type { PlacedObject, RoomScene } from './types';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

interface Tracked {
	id: string;
	kind: string;
	group: THREE.Group;
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
	private clock = new THREE.Clock();
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

	private selectedId: string | null = null;
	private hoveredId: string | null = null;
	private margin = 0.35;
	private downPos = new THREE.Vector2();

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

		this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

		this.buildLights();
		this.buildShell();

		this.grid = new THREE.GridHelper(Math.max(room.w, room.d) + 2, Math.round(Math.max(room.w, room.d) + 2), 0x2a3a44, 0x1a262e);
		(this.grid.material as THREE.Material).transparent = true;
		(this.grid.material as THREE.Material).opacity = 0.5;
		this.grid.position.y = 0.012;
		this.grid.visible = false;
		this.scene.add(this.grid);

		this.scene.add(this.objectsGroup);

		// selection / hover outlines
		this.selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0x00aeef);
		(this.selectionBox.material as THREE.LineBasicMaterial).depthTest = false;
		this.selectionBox.visible = false;
		this.scene.add(this.selectionBox);
		this.hoverBox = new THREE.BoxHelper(new THREE.Object3D(), 0x7fd4ff);
		(this.hoverBox.material as THREE.LineBasicMaterial).transparent = true;
		(this.hoverBox.material as THREE.LineBasicMaterial).opacity = 0.6;
		this.hoverBox.visible = false;
		this.scene.add(this.hoverBox);

		// controls
		this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
		this.orbit.enableDamping = true;
		this.orbit.dampingFactor = 0.08;
		this.orbit.maxPolarAngle = Math.PI * 0.495;
		this.orbit.minDistance = 2;
		this.orbit.maxDistance = Math.max(room.w, room.d) * 2.4 + 12;
		this.orbit.target.set(0, 1, 0);

		this.gizmo = new TransformControls(this.camera, this.renderer.domElement);
		this.gizmo.setTranslationSnap(null);
		this.gizmo.setRotationSnap(THREE.MathUtils.degToRad(15));
		this.gizmo.showY = false; // floor-plane translation only by default
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
		this.scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x2a343c, 1.2));
		this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

		const sun = new THREE.DirectionalLight(warm ? 0xfff0d8 : 0xffffff, 1.5);
		sun.position.set(this.room.w * 0.4, 14, this.room.d * 0.5 + 6);
		sun.castShadow = true;
		sun.shadow.mapSize.set(2048, 2048);
		sun.shadow.camera.near = 1;
		sun.shadow.camera.far = 60;
		const s = Math.max(this.room.w, this.room.d) * 0.8 + 4;
		sun.shadow.camera.left = -s;
		sun.shadow.camera.right = s;
		sun.shadow.camera.top = s;
		sun.shadow.camera.bottom = -s;
		sun.shadow.bias = -0.0004;
		this.scene.add(sun);

		const accent = new THREE.PointLight(warm ? 0xffd9a8 : 0xbfe6ff, 0.9, 32, 2);
		accent.position.set(0, this.room.wallH - 0.3, 0);
		this.scene.add(accent);
		const fill = new THREE.PointLight(warm ? 0xffe8c8 : 0xd6f0ff, 0.55, 28, 2);
		fill.position.set(-this.room.w * 0.3, this.room.wallH - 0.5, this.room.d * 0.3);
		this.scene.add(fill);
		const fill2 = new THREE.PointLight(0xffffff, 0.4, 28, 2);
		fill2.position.set(this.room.w * 0.3, this.room.wallH - 0.5, -this.room.d * 0.2);
		this.scene.add(fill2);
	}

	private buildShell() {
		const { w, d, wallH, partition } = this.room;

		// soft infinite ground that catches shadow
		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(400, 400),
			new THREE.MeshStandardMaterial({ color: 0x0e161d, roughness: 1 })
		);
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -0.4;
		ground.receiveShadow = true;
		this.scene.add(ground);

		// plinth
		const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.4, d + 0.6), MAT.plinth);
		plinth.position.set(0, -0.2, 0);
		plinth.receiveShadow = true;
		this.scene.add(plinth);

		// finished floor (top surface at y = 0)
		const floorMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(this.room.floorColor), roughness: 0.82 });
		const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), floorMat);
		floor.position.set(0, -0.03, 0);
		floor.receiveShadow = true;
		this.scene.add(floor);

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
		const tr: Tracked = { id, kind: p.kind, group: built };
		this.tracked.set(id, tr);
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
	}

	private detach() {
		this.selectedId = null;
		this.gizmo.detach();
		this.selectionBox.visible = false;
	}

	clearSelection() {
		this.detach();
		this.onSelect(null);
	}

	setMode(mode: GizmoMode) {
		this.gizmo.setMode(mode);
		this.gizmo.showY = mode === 'scale' ? true : false;
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
		const lim = this.room.w / 2 - this.margin;
		return THREE.MathUtils.clamp(x, -lim, lim);
	}
	private clampZ(z: number) {
		const lim = this.room.d / 2 - this.margin;
		return THREE.MathUtils.clamp(z, -lim, lim);
	}
	private constrainSelected() {
		if (!this.selectedId) return;
		const tr = this.tracked.get(this.selectedId);
		if (!tr) return;
		tr.group.position.x = this.clampX(tr.group.position.x);
		tr.group.position.z = this.clampZ(tr.group.position.z);
		tr.group.position.y = 0;
		tr.group.scale.x = tr.group.scale.z = tr.group.scale.y = THREE.MathUtils.clamp(tr.group.scale.x, 0.4, 2.5);
		this.selectionBox.setFromObject(tr.group);
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
		if (this.gizmo.dragging) return;
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
		}
	};

	private onPointerDown = (e: PointerEvent) => {
		this.downPos.set(e.clientX, e.clientY);
	};

	private onPointerUp = (e: PointerEvent) => {
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
		this.clock.getDelta();
		this.orbit.update();
		if (this.selectionBox.visible && this.selectedId) {
			const tr = this.tracked.get(this.selectedId);
			if (tr) this.selectionBox.setFromObject(tr.group);
		}
		this.renderer.render(this.scene, this.camera);
	};

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
		this.canvas.removeEventListener('pointermove', this.onPointerMove);
		this.canvas.removeEventListener('pointerdown', this.onPointerDown);
		this.canvas.removeEventListener('pointerup', this.onPointerUp);
		this.gizmo.detach();
		this.gizmo.dispose();
		this.orbit.dispose();
		this.clearObjects();
		this.renderer.dispose();
		this.scene.traverse((o) => {
			const m = o as THREE.Mesh;
			if (m.geometry) m.geometry.dispose();
		});
	}
}
