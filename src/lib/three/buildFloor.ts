import * as THREE from 'three';
import { MAT } from './materials';
import { buildFurniture, buildWorkstationField } from './furniture';
import { makeLabel } from './labels';
import { ROOMS, ZONES, SHELL, WORKFIELD, STAIR, FACTS, type Room } from '../data/planData';

export interface RoomMeta {
	id: string;
	name: string;
	cx: number;
	cz: number;
	w: number;
	d: number;
	y: number; // floor height of the room
	floor: 'main' | 'mezzanine';
	zone: string;
}

export interface BuildResult {
	root: THREE.Group;
	labelGroup: THREE.Group;
	rooms: RoomMeta[];
	pickables: THREE.Object3D[];
	bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
	center: THREE.Vector3;
}

const FLOOR_CX = SHELL.width / 2;
const FLOOR_CZ = SHELL.depth / 2;
const PARTITION_H = 2.62;

type Side = 'N' | 'S' | 'E' | 'W';

/* tint base floor toward the zone colour so zoning reads from above */
function zoneFloorMat(room: Room): THREE.MeshStandardMaterial {
	const base = new THREE.Color(room.x < 17.4 && room.zone === 'experience' ? 0xe6e9ec : 0xcdb79c);
	const zc = new THREE.Color(ZONES[room.zone].color);
	base.lerp(zc, 0.34);
	// polygonOffset pulls the patch toward the camera in the depth test so it always
	// wins over the base finished floor a few mm below — no z-fighting at grazing angles.
	return new THREE.MeshStandardMaterial({
		color: base,
		roughness: 0.9,
		polygonOffset: true,
		polygonOffsetFactor: -1,
		polygonOffsetUnits: -1
	});
}

function doorSideFor(room: Room): Side {
	const cx = room.x + room.w / 2;
	const cz = room.z + room.d / 2;
	const dx = FLOOR_CX - cx;
	const dz = FLOOR_CZ - cz;
	if (Math.abs(dx) > Math.abs(dz)) return dx > 0 ? 'E' : 'W';
	return dz > 0 ? 'S' : 'N';
}

/* a wall along one edge of a room rectangle, with an optional centred door gap */
function edgeWall(
	g: THREE.Group,
	room: Room,
	side: Side,
	mat: THREE.Material,
	h: number,
	yBase: number,
	door: boolean,
	t = 0.1
) {
	const { x, z, w, d } = room;
	const doorW = 1.15;
	const horizontal = side === 'N' || side === 'S';
	const len = horizontal ? w : d;
	const segLen = door ? (len - doorW) / 2 : len;

	const place = (cx: number, cz: number, L: number, vertical: boolean) => {
		if (L <= 0.02) return;
		const geo = vertical
			? new THREE.BoxGeometry(t, h, L)
			: new THREE.BoxGeometry(L, h, t);
		const m = new THREE.Mesh(geo, mat);
		m.position.set(cx, yBase + h / 2, cz);
		m.castShadow = true;
		m.receiveShadow = true;
		g.add(m);
	};

	if (side === 'N' || side === 'S') {
		const zz = side === 'N' ? z : z + d;
		if (door) {
			place(x + segLen / 2, zz, segLen, false);
			place(x + w - segLen / 2, zz, segLen, false);
			// header above door
			place(x + w / 2, zz, doorW, false); // thin lintel handled below
		} else {
			place(x + w / 2, zz, len, false);
		}
	} else {
		const xx = side === 'W' ? x : x + w;
		if (door) {
			place(xx, z + segLen / 2, segLen, true);
			place(xx, z + d - segLen / 2, segLen, true);
		} else {
			place(xx, z + d / 2, len, true);
		}
	}
}

/* lintel strip over a door gap (so glass rooms still read as enclosed) */
function lintel(g: THREE.Group, room: Room, side: Side, mat: THREE.Material, yBase: number) {
	const { x, z, w, d } = room;
	const doorW = 1.15;
	const top = yBase + PARTITION_H;
	const h = 0.32;
	const horizontal = side === 'N' || side === 'S';
	const geo = horizontal ? new THREE.BoxGeometry(doorW, h, 0.1) : new THREE.BoxGeometry(0.1, h, doorW);
	const m = new THREE.Mesh(geo, mat);
	if (side === 'N') m.position.set(x + w / 2, top - h / 2, z);
	else if (side === 'S') m.position.set(x + w / 2, top - h / 2, z + d);
	else if (side === 'W') m.position.set(x, top - h / 2, z + d / 2);
	else m.position.set(x + w, top - h / 2, z + d / 2);
	g.add(m);
}

function addRoomWalls(g: THREE.Group, room: Room, yBase: number) {
	if (room.partition === 'open' || room.furniture === 'empty') return;
	const door = doorSideFor(room);
	const sides: Side[] = ['N', 'S', 'E', 'W'];
	const h = room.partition === 'half' ? 1.15 : PARTITION_H;
	const glassMat = MAT.glass;
	for (const side of sides) {
		const isDoor = side === door && room.partition !== 'half';
		if (room.partition === 'glass') {
			edgeWall(g, room, side, glassMat, h, yBase, isDoor, 0.06);
			// frame base + top rails
			edgeWall(g, room, side, MAT.glassFrame, 0.08, yBase, isDoor, 0.08);
			edgeWall(g, room, side, MAT.glassFrame, 0.08, yBase + h - 0.08, isDoor, 0.08);
			if (isDoor) lintel(g, room, side, MAT.glassFrame, yBase);
		} else if (room.partition === 'solid') {
			edgeWall(g, room, side, MAT.wallWhite, h, yBase, isDoor, 0.12);
			if (isDoor) lintel(g, room, side, MAT.wallWhite, yBase);
		} else if (room.partition === 'half') {
			edgeWall(g, room, side, MAT.woodLight, h, yBase, false, 0.1);
		}
	}
}

/* perimeter curtain wall / shell */
function buildShell(g: THREE.Group) {
	const { width: W, depth: D, wallH: H } = SHELL;
	const glass = MAT.glass;
	const frame = MAT.glassFrame;

	const wall = (
		cx: number,
		cz: number,
		len: number,
		vertical: boolean,
		mat: THREE.Material,
		h = H,
		t = 0.14,
		y = h / 2
	) => {
		const geo = vertical ? new THREE.BoxGeometry(t, h, len) : new THREE.BoxGeometry(len, h, t);
		const m = new THREE.Mesh(geo, mat);
		m.position.set(cx, y, cz);
		m.receiveShadow = true;
		m.castShadow = true;
		g.add(m);
		return m;
	};

	// South & East: floor-to-ceiling glazing (window walls, city views)
	wall(W / 2, D, W, false, glass, H, 0.06);
	wall(W, D / 2, D, true, glass, H, 0.06);
	// West: glazing too (Tech Assistance / Conference have window walls)
	wall(0, D / 2, D, true, glass, H, 0.06);
	// North: solid where it abuts the core, with reception opening — split segments
	wall(W * 0.18, 0, W * 0.36, false, MAT.wallWhite, H, 0.16); // west part solid
	wall(W * 0.84, 0, W * 0.32, false, MAT.wallWhite, H, 0.16); // east part solid (core)

	// mullions on the glazed faces
	const mull = MAT.glassFrame;
	for (let i = 1; i < W / 2.2; i++) {
		wall(i * 2.2, D, 0.08, false, mull, H, 0.1);
	}
	for (let i = 1; i < D / 2.2; i++) {
		wall(W, i * 2.2, 0.08, true, mull, H, 0.1);
		wall(0, i * 2.2, 0.08, true, mull, H, 0.1);
	}
	// base + head rails along glazing
	wall(W / 2, D, W, false, frame, 0.12, 0.12, 0.06);
	wall(W / 2, D, W, false, frame, 0.12, 0.12, H - 0.06);
	wall(W, D / 2, D, true, frame, 0.12, 0.12, 0.06);
	wall(0, D / 2, D, true, frame, 0.12, 0.12, 0.06);
}

/* simple straight stair from main floor up to the mezzanine */
function buildStair(g: THREE.Group) {
	const steps = 16;
	const rise = SHELL.mezzH / steps;
	const run = STAIR.d / steps;
	for (let i = 0; i < steps; i++) {
		const m = new THREE.Mesh(
			new THREE.BoxGeometry(STAIR.w, rise, run + 0.02),
			MAT.woodMid
		);
		m.position.set(STAIR.x + STAIR.w / 2, rise * (i + 0.5), STAIR.z + run * (i + 0.5));
		m.castShadow = true;
		m.receiveShadow = true;
		g.add(m);
	}
	// glass balustrade
	const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, STAIR.d), MAT.glass);
	rail.position.set(STAIR.x + STAIR.w, SHELL.mezzH / 2 + 0.5, STAIR.z + STAIR.d / 2);
	g.add(rail);
}

/* the mezzanine deck (pantry / café sits on this) */
function buildMezzDeck(g: THREE.Group) {
	const x0 = 29.4,
		z0 = 0,
		w = 18.1,
		d = 9.6;
	const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), MAT.slab);
	deck.position.set(x0 + w / 2, SHELL.mezzH - 0.15, z0 + d / 2);
	deck.receiveShadow = true;
	deck.castShadow = true;
	g.add(deck);
	// top finish (timber)
	const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), MAT.floorPantry);
	top.position.set(x0 + w / 2, SHELL.mezzH + 0.02, z0 + d / 2);
	top.receiveShadow = true;
	g.add(top);
	// balustrade along the open edges (south + west of the deck)
	const railMat = MAT.glass;
	const rs = new THREE.Mesh(new THREE.BoxGeometry(w, 1.05, 0.05), railMat);
	rs.position.set(x0 + w / 2, SHELL.mezzH + 0.55, z0 + d);
	g.add(rs);
	const rw = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.05, d), railMat);
	rw.position.set(x0, SHELL.mezzH + 0.55, z0 + d / 2);
	g.add(rw);
}

/* clean open-space backdrop — a soft infinite ground that quietly catches the
   building's shadow, with no surrounding clutter */
function buildContext(g: THREE.Group) {
	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(600, 600),
		new THREE.MeshStandardMaterial({ color: 0x0e161d, roughness: 1 })
	);
	ground.rotation.x = -Math.PI / 2;
	ground.position.set(FLOOR_CX, -2.05, FLOOR_CZ);
	ground.receiveShadow = true;
	g.add(ground);
}

export function buildFloor(): BuildResult {
	const root = new THREE.Group();
	const labelGroup = new THREE.Group();
	const rooms: RoomMeta[] = [];
	const pickables: THREE.Object3D[] = [];

	buildContext(root);

	// base slab for the whole carpet
	const slab = new THREE.Mesh(
		new THREE.BoxGeometry(SHELL.width + 0.4, 0.2, SHELL.depth + 0.4),
		MAT.plinth
	);
	slab.position.set(FLOOR_CX, -0.1, FLOOR_CZ);
	slab.receiveShadow = true;
	root.add(slab);

	// base finished floor (two tones, split west/east)
	const expFloor = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.04, SHELL.depth), MAT.floorExp);
	expFloor.position.set(8.7, 0.0, FLOOR_CZ);
	expFloor.receiveShadow = true;
	root.add(expFloor);
	const workFloor = new THREE.Mesh(
		new THREE.BoxGeometry(SHELL.width - 17.4, 0.04, SHELL.depth),
		MAT.floorWork
	);
	workFloor.position.set(17.4 + (SHELL.width - 17.4) / 2, 0.0, FLOOR_CZ);
	workFloor.receiveShadow = true;
	root.add(workFloor);

	buildShell(root);
	buildMezzDeck(root);
	buildStair(root);

	// open workstation field
	const field = buildWorkstationField(WORKFIELD);
	field.position.set(WORKFIELD.x + WORKFIELD.w / 2, 0, WORKFIELD.z + WORKFIELD.d / 2);
	root.add(field);
	rooms.push({
		id: 'workfield',
		name: 'Open Workstations',
		cx: WORKFIELD.x + WORKFIELD.w / 2,
		cz: WORKFIELD.z + WORKFIELD.d / 2,
		w: WORKFIELD.w,
		d: WORKFIELD.d,
		y: 0,
		floor: 'main',
		zone: 'work'
	});

	// every room: floor patch, walls, furniture, label, pick plane
	for (const room of ROOMS) {
		if (room.furniture === 'empty') continue;
		const yBase = room.floor === 'mezzanine' ? SHELL.mezzH + 0.04 : 0.02;

		// floor patch (zoning colour)
		const patch = new THREE.Mesh(new THREE.BoxGeometry(room.w, 0.03, room.d), zoneFloorMat(room));
		patch.position.set(room.x + room.w / 2, yBase, room.z + room.d / 2);
		patch.receiveShadow = true;
		root.add(patch);

		// walls
		const wallY = room.floor === 'mezzanine' ? SHELL.mezzH + 0.06 : 0.0;
		addRoomWalls(root, room, wallY);

		// furniture
		const fg = buildFurniture(room.furniture, room.w, room.d);
		if (fg) {
			fg.position.set(room.x + room.w / 2, room.floor === 'mezzanine' ? SHELL.mezzH + 0.06 : 0, room.z + room.d / 2);
			root.add(fg);
		}

		// label
		const zoneColor = '#ffffff';
		const sub = room.tag ?? room.dims ?? undefined;
		const label = makeLabel(room.short ?? room.name, { sub, color: zoneColor });
		const labelY = (room.floor === 'mezzanine' ? SHELL.mezzH : 0) + PARTITION_H + 0.5;
		label.position.set(room.x + room.w / 2, labelY, room.z + room.d / 2);
		label.userData.roomId = room.id;
		labelGroup.add(label);

		// invisible pick plane
		const pick = new THREE.Mesh(
			new THREE.PlaneGeometry(room.w, room.d),
			new THREE.MeshBasicMaterial({ visible: false })
		);
		pick.rotation.x = -Math.PI / 2;
		pick.position.set(room.x + room.w / 2, yBase + 0.05, room.z + room.d / 2);
		pick.userData.roomId = room.id;
		root.add(pick);
		pickables.push(pick);

		rooms.push({
			id: room.id,
			name: room.name,
			cx: room.x + room.w / 2,
			cz: room.z + room.d / 2,
			w: room.w,
			d: room.d,
			y: room.floor === 'mezzanine' ? SHELL.mezzH : 0,
			floor: room.floor,
			zone: room.zone
		});
	}

	return {
		root,
		labelGroup,
		rooms,
		pickables,
		bounds: { minX: 0.4, maxX: SHELL.width - 0.4, minZ: 0.4, maxZ: SHELL.depth - 0.4 },
		center: new THREE.Vector3(FLOOR_CX, 0, FLOOR_CZ)
	};
}

export { FACTS };
