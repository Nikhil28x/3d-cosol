import * as THREE from 'three';
import { MAT } from '../three/materials';

/* ============================================================================
   PLACEABLE OBJECT CATALOG
   ----------------------------------------------------------------------------
   Every entry builds a self-contained THREE.Group centred on the origin, floor
   at y = 0, sized in metres. These are the *atoms* the room designer adds and
   moves around — the same vocabulary the concept deck draws (chairs, demo
   consoles, Pro-Edge command desks, café tables, planters …).

   Builders deliberately stay low-poly but readable, and reuse the shared MAT
   palette so a room composed here matches the master 3D model.
   ========================================================================== */

const G = () => new THREE.Group();

function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
	const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	return m;
}
function cyl(rt: number, rb: number, h: number, mat: THREE.Material, x = 0, y = 0, z = 0, seg = 20) {
	const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	return m;
}

/* ----------------------------------------------------------- primitives --- */
function taskChair(mat: THREE.Material = MAT.fabricGrey) {
	const g = G();
	g.add(box(0.5, 0.08, 0.5, mat, 0, 0.45, 0));
	g.add(box(0.5, 0.52, 0.08, mat, 0, 0.7, -0.22));
	g.add(cyl(0.04, 0.04, 0.42, MAT.alu, 0, 0.22, 0));
	g.add(cyl(0.28, 0.28, 0.05, MAT.steelDark, 0, 0.03, 0, 5));
	return g;
}
function tubChair(mat: THREE.Material = MAT.leatherTan) {
	const g = G();
	g.add(box(0.6, 0.18, 0.58, mat, 0, 0.42, 0));
	g.add(box(0.6, 0.5, 0.12, mat, 0, 0.62, -0.24));
	g.add(box(0.12, 0.34, 0.5, mat, -0.25, 0.55, 0.03));
	g.add(box(0.12, 0.34, 0.5, mat, 0.25, 0.55, 0.03));
	for (const a of [0, 1, 2, 3]) {
		const ang = (Math.PI / 2) * a + Math.PI / 4;
		g.add(cyl(0.025, 0.02, 0.42, MAT.woodMid, Math.cos(ang) * 0.22, 0.21, Math.sin(ang) * 0.22, 6));
	}
	return g;
}
function execChair(mat: THREE.Material = MAT.leatherTan) {
	const g = G();
	g.add(box(0.56, 0.16, 0.56, mat, 0, 0.46, 0));
	g.add(box(0.56, 0.78, 0.12, mat, 0, 0.86, -0.24)); // tall back
	g.add(box(0.1, 0.28, 0.42, mat, -0.3, 0.62, 0.02));
	g.add(box(0.1, 0.28, 0.42, mat, 0.3, 0.62, 0.02));
	g.add(cyl(0.05, 0.05, 0.46, MAT.chrome, 0, 0.23, 0));
	g.add(cyl(0.32, 0.32, 0.05, MAT.steelDark, 0, 0.03, 0, 5));
	return g;
}
function barStool(mat: THREE.Material = MAT.leatherTan) {
	const g = G();
	g.add(cyl(0.2, 0.2, 0.08, mat, 0, 0.74, 0));
	g.add(cyl(0.04, 0.05, 0.7, MAT.steelDark, 0, 0.37, 0, 12));
	g.add(cyl(0.22, 0.22, 0.03, MAT.steelDark, 0, 0.02, 0, 16));
	g.add(box(0.34, 0.02, 0.04, MAT.steelDark, 0, 0.28, 0.16));
	return g;
}
function monitor(w = 0.55) {
	const g = G();
	g.add(box(w, w * 0.6, 0.03, MAT.screen, 0, w * 0.36 + 0.04, 0));
	g.add(cyl(0.03, 0.04, 0.16, MAT.steelDark, 0, 0.08, 0.02));
	g.add(box(0.22, 0.02, 0.16, MAT.steelDark, 0, 0.01, 0.02));
	return g;
}
function plant(scale = 1) {
	const g = G();
	g.add(cyl(0.22 * scale, 0.18 * scale, 0.4 * scale, MAT.planter, 0, 0.2 * scale, 0));
	for (let i = 0; i < 5; i++) {
		const s = (0.22 + ((i * 37) % 18) / 100) * scale; // deterministic jitter
		const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), MAT.foliage);
		const a = (i / 5) * Math.PI * 2;
		m.position.set(Math.cos(a) * 0.15 * scale, (0.5 + (i % 3) * 0.12) * scale, Math.sin(a) * 0.15 * scale);
		m.castShadow = true;
		g.add(m);
	}
	return g;
}
function planterBox(w = 1.6) {
	const g = G();
	g.add(box(w, 0.4, 0.4, MAT.planter, 0, 0.2, 0));
	for (let i = 0; i < Math.max(3, Math.round(w * 2.5)); i++) {
		const x = -w / 2 + 0.2 + (i * (w - 0.4)) / Math.max(1, Math.round(w * 2.5) - 1);
		const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), MAT.foliageLight);
		m.position.set(x, 0.55, 0);
		m.castShadow = true;
		g.add(m);
	}
	return g;
}
function sofa(w = 2.2, mat: THREE.Material = MAT.fabricGrey) {
	const g = G();
	g.add(box(w, 0.35, 0.9, mat, 0, 0.22, 0));
	g.add(box(w, 0.4, 0.2, mat, 0, 0.5, -0.35));
	g.add(box(0.18, 0.4, 0.9, mat, -w / 2 + 0.09, 0.42, 0));
	g.add(box(0.18, 0.4, 0.9, mat, w / 2 - 0.09, 0.42, 0));
	return g;
}
function coffeeTable() {
	const g = G();
	g.add(cyl(0.55, 0.55, 0.08, MAT.woodMid, 0, 0.36, 0, 28));
	g.add(cyl(0.1, 0.12, 0.34, MAT.steelDark, 0, 0.17, 0, 16));
	return g;
}
function rug(w = 2.6, d = 2.0, mat: THREE.Material = MAT.rug) {
	const g = G();
	g.add(box(w, 0.02, d, mat, 0, 0.011, 0));
	return g;
}

/* tables (table-tops only; pair with chairs) */
function roundTable(r = 0.9, mat: THREE.Material = MAT.woodMid) {
	const g = G();
	g.add(cyl(r, r * 0.95, 0.05, mat, 0, 0.73, 0, 32));
	g.add(cyl(0.1, 0.14, 0.7, MAT.steelDark, 0, 0.36, 0, 16));
	g.add(cyl(r * 0.5, r * 0.5, 0.04, MAT.steelDark, 0, 0.02, 0, 24));
	return g;
}
function glassDiscTable(r = 0.95) {
	const g = G();
	g.add(cyl(r, r * 0.98, 0.04, MAT.glass, 0, 0.74, 0, 32));
	g.add(cyl(0.12, 0.16, 0.72, MAT.chrome, 0, 0.37, 0, 18));
	return g;
}
function confTable(w = 3.4, d = 1.3) {
	const g = G();
	g.add(box(w, 0.06, d, MAT.woodMid, 0, 0.74, 0)); // boat-shaped feel via bevel-ish layering
	g.add(box(w * 0.92, 0.04, d * 1.12, MAT.woodDark, 0, 0.7, 0));
	g.add(box(w * 0.6, 0.66, d * 0.45, MAT.steelDark, 0, 0.37, 0));
	return g;
}
function highTable() {
	const g = G();
	g.add(box(1.4, 0.05, 0.7, MAT.woodLight, 0, 1.05, 0));
	g.add(box(0.1, 1.0, 0.5, MAT.steelDark, 0, 0.52, 0));
	g.add(box(0.6, 0.03, 0.5, MAT.steelDark, 0, 0.03, 0));
	return g;
}

/* ----------------------------------------------- branded experience tech --- */
function brandCounter() {
	// PD-T circular brand video counter
	const g = G();
	g.add(cyl(0.95, 1.05, 0.5, MAT.whitePlastic, 0, 0.25, 0, 36));
	g.add(cyl(0.8, 0.8, 0.06, MAT.brand, 0, 0.53, 0, 36));
	g.add(box(0.45, 0.32, 0.03, MAT.screenBrand, -0.35, 0.72, 0.14));
	g.add(box(0.45, 0.32, 0.03, MAT.screenBrand, 0.38, 0.72, -0.08));
	return g;
}
function receptionDesk() {
	// curved welcome desk (arc of segments)
	const g = G();
	const R = 1.9;
	const segs = 9;
	for (let i = 0; i < segs; i++) {
		const a = -Math.PI * 0.42 + (Math.PI * 0.84 * i) / (segs - 1);
		const seg = box((R * Math.PI * 0.84) / segs + 0.06, 1.05, 0.7, MAT.woodWarm, Math.cos(a) * R, 0.525, Math.sin(a) * R);
		seg.rotation.y = -a + Math.PI / 2;
		g.add(seg);
	}
	// counter top trim
	for (let i = 0; i < segs; i++) {
		const a = -Math.PI * 0.42 + (Math.PI * 0.84 * i) / (segs - 1);
		const seg = box((R * Math.PI * 0.84) / segs + 0.06, 0.06, 0.78, MAT.offWhite, Math.cos(a) * R, 1.08, Math.sin(a) * R);
		seg.rotation.y = -a + Math.PI / 2;
		g.add(seg);
	}
	return g;
}
function videoWall(w = 4.2, h = 2.0) {
	const g = G();
	g.add(box(w + 0.2, h + 0.2, 0.12, MAT.steelDark, 0, h / 2 + 0.6, 0));
	g.add(box(w, h, 0.06, MAT.screenBrand, 0, h / 2 + 0.6, 0.07));
	return g;
}
function tvUnit(w = 1.6, h = 0.95) {
	const g = G();
	g.add(box(w + 0.1, h + 0.1, 0.08, MAT.steelDark, 0, h / 2 + 1.0, 0));
	g.add(box(w, h, 0.04, MAT.screen, 0, h / 2 + 1.0, 0.05));
	return g;
}
function demoConsole() {
	// Pro-Touch circular demo console
	const g = G();
	g.add(cyl(0.45, 0.5, 0.95, MAT.whitePlastic, 0, 0.475, 0, 28));
	g.add(cyl(0.4, 0.4, 0.04, MAT.screenBrand, 0, 0.97, 0, 28));
	return g;
}
function iStandee() {
	// transparent interactive standee
	const g = G();
	const panel = box(0.75, 1.35, 0.05, MAT.glass, 0, 1.4, 0);
	panel.rotation.x = -0.1;
	g.add(panel);
	g.add(box(0.78, 0.06, 0.4, MAT.steelDark, 0, 0.03, 0));
	g.add(cyl(0.04, 0.04, 0.7, MAT.chrome, 0, 0.35, -0.05));
	return g;
}
function protouchX() {
	// Pro-Touch X interactive table
	const g = G();
	g.add(box(2.4, 0.12, 1.1, MAT.consoleTop, 0, 0.78, 0));
	g.add(box(2.2, 0.5, 0.9, MAT.steelDark, 0, 0.4, 0));
	g.add(box(2.2, 0.02, 0.9, MAT.screenBrand, 0, 0.85, 0));
	return g;
}
function proEdgeConsole() {
	// Pro-Edge command console: desk + body + 3 monitors
	const g = G();
	g.add(box(2.6, 0.12, 0.9, MAT.consoleTop, 0, 0.78, 0));
	g.add(box(2.6, 0.5, 0.6, MAT.consoleBody, 0, 0.4, -0.1));
	for (let i = -1; i <= 1; i++) {
		g.add(monitor(0.55).translateX(i * 0.78).translateY(0.82).translateZ(-0.15));
	}
	return g;
}
function missionConsole() {
	// ProTouch Mission-Control console
	const g = G();
	g.add(box(0.95, 0.5, 0.72, MAT.consoleBody, 0, 0.45, 0));
	g.add(box(0.06, 0.7, 0.42, MAT.ledGreen, -0.44, 0.35, 0));
	g.add(box(0.85, 0.02, 0.5, MAT.screen, 0, 0.72, 0));
	g.add(monitor(0.6).translateY(0.74).translateZ(-0.1));
	return g;
}
function serverRack() {
	const g = G();
	g.add(box(0.6, 2.0, 0.9, MAT.steelDark, 0, 1.0, 0));
	g.add(box(0.5, 1.8, 0.02, MAT.screen, 0, 1.0, 0.46));
	g.add(box(0.08, 0.1, 0.02, MAT.ledGreen, 0.2, 1.7, 0.47));
	return g;
}
function podcastTable() {
	const g = G();
	g.add(cyl(0.7, 0.65, 0.04, MAT.woodMid, 0, 0.72, 0, 28));
	g.add(box(0.1, 0.7, 0.1, MAT.steelDark, 0, 0.36, 0));
	for (const a of [0.6, 2.0, 3.5, 5.0])
		g.add(cyl(0.02, 0.02, 0.35, MAT.dark, Math.cos(a) * 0.4, 0.9, Math.sin(a) * 0.4, 6));
	return g;
}
function whiteboard() {
	const g = G();
	g.add(box(2.0, 1.1, 0.05, MAT.whitePlastic, 0, 1.5, 0));
	g.add(box(2.06, 0.06, 0.07, MAT.alu, 0, 0.93, 0.01));
	return g;
}

/* ------------------------------------------------------ storage / utility --- */
function credenza() {
	const g = G();
	g.add(box(1.8, 0.8, 0.5, MAT.woodLight, 0, 0.4, 0));
	g.add(box(1.84, 0.04, 0.54, MAT.offWhite, 0, 0.82, 0));
	for (let i = -1; i <= 1; i++) g.add(box(0.08, 0.02, 0.02, MAT.alu, i * 0.5, 0.4, 0.26));
	return g;
}
function lockers() {
	const g = G();
	g.add(box(1.8, 1.0, 0.45, MAT.offWhite, 0, 0.5, 0));
	for (let i = -2; i <= 2; i++) g.add(box(0.02, 0.96, 0.46, MAT.steelDark, i * 0.36, 0.5, 0.01));
	return g;
}
function shelfUnit() {
	const g = G();
	g.add(box(1.6, 2.0, 0.45, MAT.offWhite, 0, 1.0, 0));
	for (let i = 0; i < 4; i++) g.add(box(1.5, 0.04, 0.42, MAT.woodLight, 0, 0.4 + i * 0.5, 0.02));
	return g;
}
function equipmentRack(mat: THREE.Material = MAT.steelDark) {
	const g = G();
	g.add(box(1.2, 1.8, 0.8, mat, -0.7, 0.9, 0));
	g.add(box(1.2, 1.8, 0.8, mat, 0.7, 0.9, 0));
	g.add(box(0.1, 0.3, 0.1, MAT.ledGreen, -0.7, 1.6, 0.41));
	return g;
}
function printer() {
	const g = G();
	g.add(box(0.8, 1.1, 0.6, MAT.offWhite, 0, 0.55, 0));
	g.add(box(0.7, 0.05, 0.5, MAT.screen, 0, 1.12, 0));
	return g;
}

/* ------------------------------------------------------- pods & wellness --- */
function phoneBooth(seats: 1 | 2) {
	const g = G();
	const w = seats === 1 ? 1.1 : 1.4;
	const dd = seats === 1 ? 1.2 : 2.0;
	g.add(box(0.06, 2.1, dd, MAT.fabricNavy, -w / 2, 1.05, 0));
	g.add(box(0.06, 2.1, dd, MAT.fabricNavy, w / 2, 1.05, 0));
	g.add(box(w, 2.1, 0.06, MAT.fabricNavy, 0, 1.05, -dd / 2));
	g.add(box(w, 2.1, 0.05, MAT.glass, 0, 1.05, dd / 2));
	g.add(box(w, 0.08, dd, MAT.steelDark, 0, 2.1, 0));
	if (seats === 1) {
		g.add(cyl(0.22, 0.22, 0.6, MAT.leatherTan, 0, 0.3, 0.1, 18));
		g.add(box(w * 0.7, 0.04, 0.35, MAT.woodLight, 0, 0.78, -dd / 2 + 0.25));
	} else {
		const c1 = taskChair(MAT.leatherTan);
		c1.position.set(0, 0, dd / 2 - 0.45);
		g.add(c1);
		g.add(box(w * 0.8, 0.04, 0.4, MAT.woodLight, 0, 0.74, -dd / 2 + 0.3));
	}
	return g;
}
function meetingPod() {
	const g = G();
	const w = 2.4,
		dd = 2.0;
	g.add(box(0.08, 1.9, dd, MAT.woodLight, -w / 2, 0.95, 0));
	g.add(box(w, 1.9, 0.08, MAT.woodLight, 0, 0.95, -dd / 2));
	g.add(box(0.08, 1.9, dd, MAT.glass, w / 2, 0.95, 0));
	g.add(box(w, 0.08, dd, MAT.woodLight, 0, 1.9, 0));
	g.add(box(w * 0.8, 0.4, 0.55, MAT.leatherTan, 0, 0.25, -dd / 2 + 0.35));
	g.add(box(w * 0.8, 0.4, 0.55, MAT.fabricSage, 0, 0.25, dd / 2 - 0.35));
	g.add(box(0.9, 0.04, 0.6, MAT.woodMid, 0, 0.72, 0));
	return g;
}
function daybed() {
	const g = G();
	g.add(box(0.9, 0.4, 2.0, MAT.fabricSage, 0, 0.22, 0));
	g.add(box(0.9, 0.5, 0.2, MAT.fabricSage, 0, 0.4, -0.9));
	g.add(box(0.5, 0.12, 0.4, MAT.fabricCream, 0, 0.46, -0.7));
	return g;
}

/* --------------------------------------------------------- pantry / café --- */
function kitchenCounter() {
	const g = G();
	g.add(box(3.0, 0.95, 0.7, MAT.woodDark, 0, 0.475, 0));
	g.add(box(3.04, 0.05, 0.72, MAT.offWhite, 0, 0.98, 0));
	g.add(box(0.5, 0.5, 0.5, MAT.steelDark, -0.8, 0.7, 0)); // sink/hob hint
	return g;
}
function island() {
	const g = G();
	g.add(box(3.2, 1.0, 1.0, MAT.woodWarm, 0, 0.5, 0));
	g.add(box(3.3, 0.06, 1.1, MAT.offWhite, 0, 1.03, 0));
	for (let i = 0; i < 4; i++) {
		const s = barStool();
		s.position.set(-1.2 + i * 0.8, 0, 0.85);
		g.add(s);
	}
	return g;
}
function cafeTable() {
	// round 4-top with 4 chairs
	const g = G();
	g.add(cyl(0.45, 0.42, 0.04, MAT.woodLight, 0, 0.73, 0, 24));
	g.add(cyl(0.07, 0.1, 0.71, MAT.steelDark, 0, 0.36, 0, 12));
	for (let c = 0; c < 4; c++) {
		const a = (c / 4) * Math.PI * 2 + 0.4;
		const ch = taskChair(c % 2 ? MAT.fabricSage : MAT.fabricGrey);
		ch.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8);
		ch.rotation.y = -a + Math.PI / 2;
		g.add(ch);
	}
	return g;
}

/* ------------------------------------------------- composite workstations --- */
function officeDesk(exec = false) {
	const g = G();
	const topMat = exec ? MAT.woodWarm : MAT.woodMid;
	g.add(box(1.8, 0.06, 0.8, topMat, 0, 0.74, 0));
	g.add(box(1.7, 0.6, 0.7, exec ? MAT.woodDark : MAT.steelDark, 0, 0.37, -0.02));
	g.add(monitor(exec ? 0.6 : 0.5).translateY(0.77).translateZ(-0.12));
	return g;
}
function workstation() {
	// single 1500x600 desk + monitor + chair
	const g = G();
	g.add(box(1.5, 0.04, 0.7, MAT.woodLight, 0, 0.74, 0));
	g.add(box(1.4, 0.5, 0.04, MAT.fabricSage, 0, 0.96, -0.34)); // privacy screen
	for (let i = -1; i <= 1; i += 2) g.add(box(0.05, 0.72, 0.6, MAT.steelDark, i * 0.65, 0.37, 0));
	g.add(monitor(0.5).translateY(0.76).translateZ(-0.22));
	const c = taskChair();
	c.position.set(0, 0, 0.5);
	g.add(c);
	return g;
}
function deskPod6() {
	// cluster of 6 desks back-to-back with a central spine planter
	const g = G();
	for (let back = 0; back < 2; back++) {
		const dz = back === 0 ? -0.36 : 0.36;
		const rot = back === 1 ? Math.PI : 0;
		for (let i = -1; i <= 1; i++) {
			const ws = workstation();
			ws.position.set(i * 1.55, 0, dz);
			ws.rotation.y = rot;
			g.add(ws);
		}
	}
	g.add(planterBox(4.5).translateZ(0));
	return g;
}

/* ============================================================ catalogue === */
export type ObjCategory =
	| 'Seating'
	| 'Tables'
	| 'Workstations'
	| 'Experience Tech'
	| 'Storage & Utility'
	| 'Pods & Wellness'
	| 'Pantry & Café'
	| 'Decor & Greenery'
	| 'Screens';

export interface CatalogItem {
	kind: string;
	label: string;
	category: ObjCategory;
	/** approximate footprint [w, d] in metres — used for bounds clamping */
	footprint: [number, number];
	build: () => THREE.Group;
}

function item(
	kind: string,
	label: string,
	category: ObjCategory,
	footprint: [number, number],
	build: () => THREE.Group
): CatalogItem {
	return { kind, label, category, footprint, build };
}

export const CATALOG: Record<string, CatalogItem> = {
	/* Seating */
	'task-chair': item('task-chair', 'Task Chair', 'Seating', [0.6, 0.6], () => taskChair(MAT.fabricGrey)),
	'task-chair-white': item('task-chair-white', 'Task Chair (white)', 'Seating', [0.6, 0.6], () => taskChair(MAT.whitePlastic)),
	'tub-chair': item('tub-chair', 'Tub Lounge Chair', 'Seating', [0.7, 0.7], () => tubChair(MAT.leatherTan)),
	'exec-chair': item('exec-chair', 'Executive Chair', 'Seating', [0.7, 0.7], () => execChair()),
	'bar-stool': item('bar-stool', 'Bar Stool', 'Seating', [0.45, 0.45], () => barStool()),
	'sofa-2': item('sofa-2', 'Sofa · 2 seat', 'Seating', [2.0, 0.95], () => sofa(2.0, MAT.fabricGrey)),
	'sofa-3': item('sofa-3', 'Sofa · 3 seat', 'Seating', [2.8, 0.95], () => sofa(2.8, MAT.fabricNavy)),

	/* Tables */
	'round-table': item('round-table', 'Round Table', 'Tables', [1.8, 1.8], () => roundTable(0.9)),
	'glass-disc-table': item('glass-disc-table', 'Glass Discussion Table', 'Tables', [2.0, 2.0], () => glassDiscTable()),
	'conf-table': item('conf-table', 'Conference Table', 'Tables', [3.6, 1.5], () => confTable(3.4, 1.3)),
	'coffee-table': item('coffee-table', 'Coffee Table', 'Tables', [1.2, 1.2], () => coffeeTable()),
	'high-table': item('high-table', 'High / Collab Table', 'Tables', [1.5, 0.8], () => highTable()),
	'rug': item('rug', 'Area Rug', 'Decor & Greenery', [2.6, 2.0], () => rug()),

	/* Workstations */
	'workstation': item('workstation', 'Workstation (1500×600)', 'Workstations', [1.6, 1.4], () => workstation()),
	'desk-pod-6': item('desk-pod-6', 'Desk Cluster · 6', 'Workstations', [5.0, 1.8], () => deskPod6()),
	'office-desk': item('office-desk', 'Office Desk', 'Workstations', [1.8, 0.8], () => officeDesk(false)),
	'exec-desk': item('exec-desk', 'Executive Desk', 'Workstations', [1.8, 0.8], () => officeDesk(true)),

	/* Experience tech */
	'brand-counter': item('brand-counter', 'PD-T Brand Counter', 'Experience Tech', [2.0, 2.0], () => brandCounter()),
	'reception-desk': item('reception-desk', 'Curved Reception Desk', 'Experience Tech', [4.0, 2.6], () => receptionDesk()),
	'demo-console': item('demo-console', 'Pro-Touch Demo Console', 'Experience Tech', [1.0, 1.0], () => demoConsole()),
	'istandee': item('istandee', 'Transparent iStandee', 'Experience Tech', [0.8, 0.5], () => iStandee()),
	'protouch-x': item('protouch-x', 'Pro-Touch X Table', 'Experience Tech', [2.5, 1.2], () => protouchX()),
	'pro-edge-console': item('pro-edge-console', 'Pro-Edge Command Console', 'Experience Tech', [2.7, 1.0], () => proEdgeConsole()),
	'mission-console': item('mission-console', 'Mission-Control Console', 'Experience Tech', [1.0, 0.8], () => missionConsole()),
	'podcast-table': item('podcast-table', 'Podcast Table + Mics', 'Experience Tech', [1.5, 1.5], () => podcastTable()),
	'server-rack': item('server-rack', 'Server Rack', 'Experience Tech', [0.7, 1.0], () => serverRack()),

	/* Screens */
	'video-wall': item('video-wall', 'Brand Video Wall', 'Screens', [4.4, 0.2], () => videoWall(4.2, 2.0)),
	'tv-unit': item('tv-unit', 'Wall TV', 'Screens', [1.7, 0.2], () => tvUnit()),
	'whiteboard': item('whiteboard', 'Whiteboard', 'Screens', [2.1, 0.1], () => whiteboard()),

	/* Storage & utility */
	'credenza': item('credenza', 'Credenza', 'Storage & Utility', [1.8, 0.5], () => credenza()),
	'lockers': item('lockers', 'Lockers', 'Storage & Utility', [1.8, 0.5], () => lockers()),
	'shelf-unit': item('shelf-unit', 'Shelving Unit', 'Storage & Utility', [1.6, 0.5], () => shelfUnit()),
	'printer': item('printer', 'Printer / Repro', 'Storage & Utility', [0.9, 0.7], () => printer()),
	'ups-rack': item('ups-rack', 'UPS Cabinet', 'Storage & Utility', [2.6, 0.9], () => equipmentRack(MAT.steelDark)),
	'battery-rack': item('battery-rack', 'Battery Cabinet', 'Storage & Utility', [2.6, 0.9], () => equipmentRack(MAT.consoleBody)),

	/* Pods & wellness */
	'phone-booth-1': item('phone-booth-1', 'Phone Booth · 1', 'Pods & Wellness', [1.2, 1.3], () => phoneBooth(1)),
	'phone-booth-2': item('phone-booth-2', 'Phone Booth · 2', 'Pods & Wellness', [1.5, 2.1], () => phoneBooth(2)),
	'meeting-pod': item('meeting-pod', 'Meeting Pod · 4', 'Pods & Wellness', [2.5, 2.1], () => meetingPod()),
	'daybed': item('daybed', 'Nap Daybed', 'Pods & Wellness', [1.0, 2.1], () => daybed()),

	/* Pantry & café */
	'kitchen-counter': item('kitchen-counter', 'Kitchen Counter', 'Pantry & Café', [3.0, 0.7], () => kitchenCounter()),
	'island': item('island', 'Café Island + Stools', 'Pantry & Café', [3.3, 2.0], () => island()),
	'cafe-table': item('cafe-table', 'Café Table · 4', 'Pantry & Café', [1.8, 1.8], () => cafeTable()),

	/* Decor & greenery */
	'plant-sm': item('plant-sm', 'Plant · small', 'Decor & Greenery', [0.5, 0.5], () => plant(1.0)),
	'plant-lg': item('plant-lg', 'Plant · large', 'Decor & Greenery', [0.7, 0.7], () => plant(1.5)),
	'planter-box': item('planter-box', 'Planter Box', 'Decor & Greenery', [1.6, 0.4], () => planterBox(1.6))
};

export const CATALOG_LIST: CatalogItem[] = Object.values(CATALOG);

export const CATEGORIES: ObjCategory[] = [
	'Seating',
	'Tables',
	'Workstations',
	'Experience Tech',
	'Screens',
	'Pods & Wellness',
	'Pantry & Café',
	'Storage & Utility',
	'Decor & Greenery'
];

export function buildObject(kind: string): THREE.Group | null {
	const it = CATALOG[kind];
	return it ? it.build() : null;
}

export function catalogLabel(kind: string): string {
	return CATALOG[kind]?.label ?? kind;
}
