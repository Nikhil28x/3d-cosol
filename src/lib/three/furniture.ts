import * as THREE from 'three';
import { MAT } from './materials';
import type { FurnitureKind } from '../data/planData';

/* ============================================================================
   FURNITURE FACTORY
   Every builder returns a THREE.Group built around the room CENTRE (0,0),
   floor at y=0, sized to fit a room of (w × d) metres. The scene positions
   and rotates the group. Pieces are deliberately low-poly but readable.
   ========================================================================== */

const G = () => new THREE.Group();

function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
	const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	return m;
}
function cyl(
	rt: number,
	rb: number,
	h: number,
	mat: THREE.Material,
	x = 0,
	y = 0,
	z = 0,
	seg = 20
) {
	const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
	m.position.set(x, y, z);
	m.castShadow = true;
	m.receiveShadow = true;
	return m;
}

/* ---------- small reusable items ------------------------------------------ */
function chair(mat: THREE.Material = MAT.fabricGrey) {
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
	const f = MAT.foliage;
	for (let i = 0; i < 5; i++) {
		const s = (0.22 + Math.random() * 0.18) * scale;
		const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), f);
		m.position.set((Math.random() - 0.5) * 0.3 * scale, (0.5 + Math.random() * 0.4) * scale, (Math.random() - 0.5) * 0.3 * scale);
		m.castShadow = true;
		g.add(m);
	}
	return g;
}
function wallScreen(w: number, h: number, mat: THREE.Material = MAT.screen) {
	return box(w, h, 0.06, mat);
}
function rug(w: number, d: number, mat: THREE.Material = MAT.rug) {
	const m = box(w, 0.02, d, mat, 0, 0.011, 0);
	return m;
}
function sofa(w: number, mat: THREE.Material = MAT.fabricGrey) {
	const g = G();
	g.add(box(w, 0.35, 0.9, mat, 0, 0.22, 0));
	g.add(box(w, 0.4, 0.2, mat, 0, 0.5, -0.35));
	g.add(box(0.18, 0.4, 0.9, mat, -w / 2 + 0.09, 0.42, 0));
	g.add(box(0.18, 0.4, 0.9, mat, w / 2 - 0.09, 0.42, 0));
	return g;
}

/* table with N chairs evenly placed around a rectangular top */
function tableWithChairs(
	tw: number,
	td: number,
	seats: number,
	topMat: THREE.Material,
	chairMat: THREE.Material = MAT.fabricGrey,
	h = 0.74
) {
	const g = G();
	g.add(box(tw, 0.05, td, topMat, 0, h, 0));
	g.add(box(tw * 0.5, h - 0.05, td * 0.4, MAT.steelDark, 0, (h - 0.05) / 2, 0));
	const perSide = Math.ceil(seats / 2);
	let placed = 0;
	for (let side = 0; side < 2 && placed < seats; side++) {
		const z = side === 0 ? td / 2 + 0.35 : -td / 2 - 0.35;
		const n = Math.min(perSide, seats - placed);
		for (let i = 0; i < n; i++) {
			const x = -tw / 2 + (tw / (n + 1)) * (i + 1);
			const c = chair(chairMat);
			c.position.set(x, 0, z);
			if (side === 1) c.rotation.y = Math.PI;
			g.add(c);
			placed++;
		}
	}
	return g;
}

/* ============================ ROOM ASSEMBLIES ============================== */

function reception(w: number, d: number) {
	const g = G();
	// curved welcome desk (arc of segments)
	const desk = G();
	const R = 3.0;
	const segs = 9;
	for (let i = 0; i < segs; i++) {
		const a = -Math.PI * 0.42 + (Math.PI * 0.84 * i) / (segs - 1);
		const seg = box(R * Math.PI * 0.84 / segs + 0.05, 1.05, 0.7, MAT.woodWarm, Math.cos(a) * R, 0.525, Math.sin(a) * R);
		seg.rotation.y = -a + Math.PI / 2;
		desk.add(seg);
	}
	desk.position.set(-w * 0.18, 0, d * 0.16);
	g.add(desk);
	// brand video counter — circular plinth + glowing ring + tablets
	const brand = G();
	brand.add(cyl(1.5, 1.6, 0.5, MAT.whitePlastic, 0, 0.25, 0));
	brand.add(cyl(1.2, 1.2, 0.06, MAT.brand, 0, 0.53, 0));
	brand.add(box(0.45, 0.32, 0.03, MAT.screenBrand, -0.5, 0.7, 0.2));
	brand.add(box(0.45, 0.32, 0.03, MAT.screenBrand, 0.55, 0.7, -0.1));
	brand.position.set(w * 0.16, 0, -d * 0.05);
	g.add(brand);
	// curved brand video wall behind
	const vw = wallScreen(4.2, 2.0, MAT.screenBrand);
	vw.position.set(w * 0.34, 1.5, -d * 0.34);
	vw.rotation.y = -0.5;
	g.add(vw);
	// waiting seats
	const s1 = sofa(2.0, MAT.leatherTan);
	s1.position.set(-w * 0.32, 0, -d * 0.2);
	g.add(s1);
	g.add(plant(1.2).translateX(w * 0.4).translateZ(d * 0.3));
	g.add(rug(4, 3, MAT.rug).translateX(-w * 0.18).translateZ(d * 0.16));
	return g;
}

function demoLounge(w: number, d: number) {
	const g = G();
	// row of 5 Pro-Touch circular demo consoles + transparent iStandees along back wall
	for (let i = 0; i < 5; i++) {
		const x = -w / 2 + 1.2 + i * ((w - 2.4) / 4);
		g.add(cyl(0.45, 0.5, 0.95, MAT.whitePlastic, x, 0.475, -d / 2 + 0.9));
		g.add(cyl(0.4, 0.4, 0.04, MAT.screenBrand, x, 0.97, -d / 2 + 0.9));
		// transparent standee behind
		const st = box(0.7, 1.3, 0.05, MAT.glass, x, 1.4, -d / 2 + 0.35);
		st.rotation.x = -0.12;
		g.add(st);
	}
	// round discussion table + 6 chairs
	const t = G();
	t.add(cyl(0.95, 0.9, 0.04, MAT.glass, 0, 0.74, 0));
	t.add(cyl(0.12, 0.16, 0.72, MAT.chrome, 0, 0.37, 0));
	for (let i = 0; i < 6; i++) {
		const a = (i / 6) * Math.PI * 2;
		const c = chair(MAT.whitePlastic);
		c.position.set(Math.cos(a) * 1.45, 0, Math.sin(a) * 1.45);
		c.rotation.y = -a + Math.PI / 2;
		t.add(c);
	}
	t.position.set(w * 0.12, 0, d * 0.18);
	g.add(t);
	// small round meeting of stools (left)
	const t2 = G();
	t2.add(cyl(0.55, 0.55, 0.04, MAT.woodLight, 0, 0.74, 0));
	t2.add(cyl(0.1, 0.12, 0.72, MAT.chrome, 0, 0.37, 0));
	t2.position.set(-w * 0.28, 0, d * 0.12);
	g.add(t2);
	return g;
}

function podcast(w: number, d: number) {
	const g = G();
	const t = G();
	t.add(cyl(0.7, 0.65, 0.04, MAT.woodMid, 0, 0.72, 0));
	t.add(box(0.1, 0.7, 0.1, MAT.steelDark, 0, 0.36, 0));
	// mics
	for (const a of [0.6, 2.0, 3.5, 5.0]) t.add(cyl(0.02, 0.02, 0.35, MAT.dark, Math.cos(a) * 0.4, 0.9, Math.sin(a) * 0.4, 6));
	for (let i = 0; i < 4; i++) {
		const a = (i / 4) * Math.PI * 2 + 0.4;
		const c = tubChair(MAT.whitePlastic);
		c.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15);
		c.rotation.y = -a + Math.PI / 2;
		t.add(c);
	}
	t.position.set(0, 0, d * 0.06);
	g.add(t);
	const s = sofa(1.8, MAT.fabricCream);
	s.position.set(0, 0, d / 2 - 0.5);
	s.rotation.y = Math.PI;
	g.add(s);
	g.add(wallScreen(1.4, 0.85).translateX(w / 2 - 0.1).translateY(1.4).rotateY(-Math.PI / 2));
	return g;
}

function conference(w: number, d: number) {
	const g = G();
	const tw = w * 0.4;
	const td = d * 0.66;
	g.add(box(tw, 0.06, td, MAT.woodMid, 0, 0.74, 0));
	g.add(box(tw * 0.6, 0.7, td * 0.5, MAT.steelDark, 0, 0.36, 0));
	const seatsSide = Math.max(5, Math.round(td / 1.0));
	for (let side = -1; side <= 1; side += 2) {
		for (let i = 0; i < seatsSide; i++) {
			const z = -td / 2 + (td / (seatsSide - 1)) * i;
			const c = chair(MAT.whitePlastic);
			c.position.set((tw / 2 + 0.4) * side, 0, z);
			c.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
			g.add(c);
		}
	}
	// head chair
	const head = chair(MAT.whitePlastic);
	head.position.set(0, 0, -td / 2 - 0.4);
	g.add(head);
	// video wall
	g.add(wallScreen(w * 0.55, 1.7).translateZ(d / 2 - 0.08).translateY(1.5));
	return g;
}

function digitalLab(w: number, d: number) {
	const g = G();
	// Pro-Touch X interactive table
	g.add(box(2.4, 0.12, 1.1, MAT.consoleTop, 0, 0.78, 0));
	g.add(box(2.2, 0.5, 0.9, MAT.steelDark, 0, 0.4, 0));
	g.add(box(2.2, 0.02, 0.9, MAT.screen, 0, 0.85, 0));
	// whiteboard
	g.add(box(2.6, 1.1, 0.04, MAT.whitePlastic, 0, 1.5, -d / 2 + 0.06));
	// wall tv side
	g.add(wallScreen(1.4, 0.8).translateX(-w / 2 + 0.1).translateY(1.5).rotateY(Math.PI / 2));
	return g;
}

function serverRoom(w: number, d: number) {
	const g = G();
	const rows = 2;
	for (let r = 0; r < rows; r++) {
		const z = -d / 2 + 1.0 + r * 1.8;
		for (let i = 0; i < Math.floor(w / 0.8) - 1; i++) {
			const x = -w / 2 + 0.8 + i * 0.85;
			const rack = box(0.6, 2.0, 0.9, MAT.steelDark, x, 1.0, z);
			g.add(rack);
			g.add(box(0.5, 1.8, 0.02, MAT.screen, x, 1.0, z + 0.46));
		}
	}
	return g;
}

function dock(w: number, d: number) {
	// Digital Operation Centre — tiered command consoles facing a video wall
	const g = G();
	const rows = 4;
	for (let r = 0; r < rows; r++) {
		const z = d / 2 - 1.0 - r * ((d - 2) / rows);
		const tier = box(w - 1.4, 0.12, 0.9, MAT.consoleTop, 0, 0.78 + r * 0.12, z);
		g.add(tier);
		g.add(box(w - 1.4, 0.5, 0.6, MAT.consoleBody, 0, 0.4 + r * 0.12, z - 0.1));
		const seats = 5;
		for (let i = 0; i < seats; i++) {
			const x = -(w - 2.4) / 2 + ((w - 2.4) / (seats - 1)) * i;
			g.add(monitor(0.5).translateX(x).translateY(0.82 + r * 0.12).translateZ(z - 0.15));
			const c = chair(MAT.whitePlastic);
			c.position.set(x, r * 0.12, z + 0.55);
			c.rotation.y = Math.PI;
			g.add(c);
		}
		// step
		if (r > 0) g.add(box(w - 1.0, r * 0.12, 0.4, MAT.floorCarpet, 0, (r * 0.12) / 2, z + 1.1));
	}
	// large video wall
	g.add(wallScreen(w * 0.7, 1.9, MAT.screenBrand).translateZ(-d / 2 + 0.1).translateY(1.6));
	return g;
}

function security(w: number, d: number) {
	const g = G();
	for (let r = 0; r < 2; r++) {
		const z = -d / 2 + 1.6 + r * 2.2;
		for (let i = 0; i < 4; i++) {
			const x = -w / 2 + 0.9 + i * ((w - 1.8) / 3);
			g.add(box(0.9, 0.5, 0.7, MAT.consoleBody, x, 0.45, z));
			g.add(box(0.06, 0.7, 0.4, MAT.ledGreen, x - 0.42, 0.35, z));
			g.add(box(0.8, 0.02, 0.5, MAT.screen, x, 0.72, z));
			const c = chair(MAT.whitePlastic);
			c.position.set(x, 0, z + 0.6);
			c.rotation.y = Math.PI;
			g.add(c);
		}
	}
	g.add(wallScreen(w * 0.85, 1.6, MAT.screenBrand).translateZ(-d / 2 + 0.08).translateY(1.5));
	return g;
}

function itTeam(w: number, d: number) {
	const g = G();
	for (let i = 0; i < 3; i++) {
		const z = -d / 2 + 0.9 + i * 1.1;
		g.add(box(1.4, 0.04, 0.7, MAT.woodLight, -w / 2 + 1.0, 0.74, z));
		g.add(monitor(0.5).translateX(-w / 2 + 1.0).translateY(0.76).translateZ(z - 0.1));
		const c = chair();
		c.position.set(-w / 2 + 1.0, 0, z + 0.5);
		c.rotation.y = Math.PI;
		g.add(c);
	}
	return g;
}

function tac(w: number, d: number) {
	// Technical Assistance Centre — two benches of linear workstations + lockers
	const g = G();
	for (let bank = -1; bank <= 1; bank += 2) {
		const bx = bank * w * 0.2;
		g.add(box(1.5, 0.04, d * 0.7, MAT.whitePlastic, bx, 0.74, 0));
		const rows = 4;
		for (let i = 0; i < rows; i++) {
			const z = -d * 0.32 + (d * 0.64 / (rows - 1)) * i;
			g.add(monitor(0.48).translateX(bx - 0.35).translateY(0.76).translateZ(z));
			g.add(monitor(0.48).translateX(bx + 0.35).translateY(0.76).translateZ(z));
			const c1 = chair();
			c1.position.set(bx - 0.7, 0, z);
			c1.rotation.y = -Math.PI / 2;
			const c2 = chair();
			c2.position.set(bx + 0.7, 0, z);
			c2.rotation.y = Math.PI / 2;
			g.add(c1, c2);
		}
	}
	// lockers
	g.add(box(w * 0.9, 1.0, 0.45, MAT.offWhite, 0, 0.5, d / 2 - 0.3));
	return g;
}

function cabin(w: number, d: number) {
	const g = G();
	g.add(box(1.8, 0.06, 0.8, MAT.woodMid, 0, 0.74, -d * 0.1));
	g.add(box(1.7, 0.6, 0.7, MAT.woodDark, 0, 0.37, -d * 0.1));
	g.add(monitor(0.5).translateY(0.77).translateZ(-d * 0.1));
	const ex = chair(MAT.leatherTan);
	ex.position.set(0, 0, -d * 0.32);
	g.add(ex);
	const c1 = chair(MAT.fabricCream);
	c1.position.set(-0.5, 0, d * 0.18);
	c1.rotation.y = Math.PI;
	const c2 = chair(MAT.fabricCream);
	c2.position.set(0.5, 0, d * 0.18);
	c2.rotation.y = Math.PI;
	g.add(c1, c2);
	g.add(box(0.5, 1.0, d * 0.7, MAT.woodLight, w / 2 - 0.3, 0.5, 0)); // credenza / shelf
	g.add(rug(2.4, 2.0).translateZ(d * 0.05));
	return g;
}

function execCabin(w: number, d: number) {
	const g = G();
	g.add(box(2.1, 0.07, 0.9, MAT.woodWarm, -w * 0.12, 0.75, -d * 0.18));
	g.add(box(2.0, 0.62, 0.8, MAT.woodDark, -w * 0.12, 0.37, -d * 0.18));
	g.add(monitor(0.55).translateX(-w * 0.12).translateY(0.78).translateZ(-d * 0.18));
	const ex = chair(MAT.leatherTan);
	ex.position.set(-w * 0.12, 0, -d * 0.36);
	g.add(ex);
	// meeting setting
	const t = G();
	t.add(cyl(0.55, 0.55, 0.04, MAT.glass, 0, 0.72, 0));
	t.add(cyl(0.1, 0.12, 0.7, MAT.chrome, 0, 0.36, 0));
	for (let i = 0; i < 3; i++) {
		const a = (i / 3) * Math.PI * 2 + 1;
		const c = tubChair(MAT.fabricGrey);
		c.position.set(Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0);
		c.rotation.y = -a + Math.PI / 2;
		t.add(c);
	}
	t.position.set(w * 0.22, 0, d * 0.2);
	g.add(t);
	g.add(box(0.5, 1.3, d * 0.7, MAT.woodLight, -w / 2 + 0.3, 0.65, -d * 0.05));
	g.add(rug(2.6, 2.2).translateX(w * 0.22).translateZ(d * 0.2));
	return g;
}

function meeting(w: number, d: number, seats: number) {
	const g = G();
	const tw = Math.min(w * 0.5, seats > 6 ? 2.6 : 1.6);
	const td = Math.min(d * 0.5, 1.1);
	g.add(tableWithChairs(tw, td, seats, MAT.woodMid, seats > 6 ? MAT.fabricSage : MAT.leatherTan));
	g.add(wallScreen(Math.min(w * 0.6, 1.8), 1.0).translateZ(-d / 2 + 0.08).translateY(1.4));
	return g;
}

function phoneBooth(seats: 1 | 2) {
	const g = G();
	const w = seats === 1 ? 1.1 : 1.4;
	const dd = seats === 1 ? 1.2 : 2.0;
	// shell
	g.add(box(0.06, 2.1, dd, MAT.fabricNavy, -w / 2, 1.05, 0));
	g.add(box(0.06, 2.1, dd, MAT.fabricNavy, w / 2, 1.05, 0));
	g.add(box(w, 2.1, 0.06, MAT.fabricNavy, 0, 1.05, -dd / 2));
	g.add(box(w, 2.1, 0.05, MAT.glass, 0, 1.05, dd / 2));
	g.add(box(w, 0.08, dd, MAT.steelDark, 0, 2.1, 0));
	if (seats === 1) {
		g.add(cyl(0.22, 0.22, 0.6, MAT.leatherTan, 0, 0.3, 0.1));
		g.add(box(w * 0.7, 0.04, 0.35, MAT.woodLight, 0, 0.78, -dd / 2 + 0.25));
	} else {
		const c1 = chair(MAT.leatherTan);
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
	// banquette seating + table
	g.add(box(w * 0.8, 0.4, 0.55, MAT.leatherTan, 0, 0.25, -dd / 2 + 0.35));
	g.add(box(w * 0.8, 0.4, 0.55, MAT.fabricSage, 0, 0.25, dd / 2 - 0.35));
	g.add(box(0.9, 0.04, 0.6, MAT.woodMid, 0, 0.72, 0));
	return g;
}

function nap() {
	const g = G();
	g.add(box(0.9, 0.4, 2.0, MAT.fabricSage, 0, 0.22, 0));
	g.add(box(0.9, 0.5, 0.2, MAT.fabricSage, 0, 0.4, -0.9));
	g.add(box(0.5, 0.12, 0.4, MAT.fabricCream, 0, 0.46, -0.7));
	return g;
}

function equipment(color: THREE.Material) {
	const g = G();
	g.add(box(1.2, 1.8, 0.8, color, -0.7, 0.9, 0));
	g.add(box(1.2, 1.8, 0.8, color, 0.7, 0.9, 0));
	g.add(box(0.1, 0.3, 0.1, MAT.ledGreen, -0.7, 1.6, 0.41));
	return g;
}

function printerBay() {
	const g = G();
	g.add(box(0.8, 1.1, 0.6, MAT.offWhite, -0.5, 0.55, 0));
	g.add(box(0.8, 1.1, 0.6, MAT.offWhite, 0.5, 0.55, 0));
	g.add(box(0.7, 0.05, 0.5, MAT.screen, -0.5, 1.12, 0));
	return g;
}

function pantry(w: number, d: number) {
	const g = G();
	// kitchen counter run along back
	g.add(box(w * 0.7, 0.95, 0.7, MAT.woodDark, 0, 0.475, -d / 2 + 0.5));
	g.add(box(w * 0.7, 0.05, 0.72, MAT.offWhite, 0, 0.98, -d / 2 + 0.5));
	// island with bar stools
	g.add(box(3.2, 1.0, 1.0, MAT.woodWarm, -w * 0.18, 0.5, -d * 0.08));
	g.add(box(3.3, 0.06, 1.1, MAT.offWhite, -w * 0.18, 1.03, -d * 0.08));
	for (let i = 0; i < 4; i++) {
		const x = -w * 0.18 - 1.2 + i * 0.8;
		g.add(cyl(0.18, 0.18, 0.75, MAT.leatherTan, x, 0.38, -d * 0.08 + 0.85));
	}
	// café tables (45 covers) — round 4-tops
	const cols = 4,
		rows = 3;
	for (let cxi = 0; cxi < cols; cxi++) {
		for (let r = 0; r < rows; r++) {
			const x = w * 0.06 + cxi * 1.7 - 0.5;
			const z = -d * 0.18 + r * 1.7 + 0.4;
			if (x > w / 2 - 0.8) continue;
			const t = G();
			t.add(cyl(0.45, 0.42, 0.04, MAT.woodLight, 0, 0.73, 0));
			t.add(cyl(0.07, 0.1, 0.71, MAT.steelDark, 0, 0.36, 0));
			for (let c = 0; c < 4; c++) {
				const a = (c / 4) * Math.PI * 2 + 0.4;
				const ch = chair(c % 2 ? MAT.fabricSage : MAT.fabricGrey);
				ch.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8);
				t.add(ch);
			}
			t.position.set(x, 0, z);
			g.add(t);
		}
	}
	g.add(plant(1.4).translateX(w / 2 - 0.7).translateZ(-d / 2 + 0.6));
	g.add(plant(1.1).translateX(-w / 2 + 0.7).translateZ(d / 2 - 0.7));
	return g;
}

function lounge(w: number, d: number) {
	const g = G();
	const s1 = sofa(2.6, MAT.fabricNavy);
	s1.position.set(-w * 0.15, 0, d * 0.1);
	g.add(s1);
	const a1 = tubChair(MAT.leatherTan);
	a1.position.set(w * 0.18, 0, d * 0.22);
	a1.rotation.y = -2.2;
	const a2 = tubChair(MAT.leatherTan);
	a2.position.set(w * 0.28, 0, -d * 0.05);
	a2.rotation.y = -3.4;
	g.add(a1, a2);
	g.add(cyl(0.6, 0.6, 0.4, MAT.woodMid, w * 0.05, 0.2, d * 0.1, 24)); // round coffee table
	g.add(plant(1.5).translateX(-w * 0.38).translateZ(-d * 0.28));
	g.add(plant(1.2).translateX(w * 0.4).translateZ(d * 0.3));
	g.add(rug(w * 0.7, d * 0.6, MAT.rug).translateX(-w * 0.02).translateZ(d * 0.08));
	return g;
}

function collab(w: number, d: number) {
	const g = G();
	const s = sofa(1.8, MAT.fabricSage);
	s.position.set(0, 0, -d * 0.25);
	g.add(s);
	// high table + stools
	g.add(box(1.4, 0.04, 0.7, MAT.woodLight, 0, 1.05, d * 0.2));
	g.add(box(0.1, 1.05, 0.5, MAT.steelDark, 0, 0.52, d * 0.2));
	for (let i = -1; i <= 1; i += 2)
		g.add(cyl(0.16, 0.16, 0.75, MAT.leatherTan, i * 0.4, 0.38, d * 0.2 + 0.55));
	g.add(plant(1.0).translateX(w * 0.35).translateZ(-d * 0.3));
	return g;
}

function store(w: number, d: number) {
	const g = G();
	g.add(box(w * 0.8, 2.0, 0.5, MAT.offWhite, 0, 1.0, -d / 2 + 0.35));
	g.add(box(0.5, 2.0, d * 0.7, MAT.offWhite, -w / 2 + 0.35, 1.0, 0.2));
	return g;
}

/* ----------------------------------------------------------- dispatcher --- */
export function buildFurniture(kind: FurnitureKind, w: number, d: number): THREE.Group | null {
	switch (kind) {
		case 'reception':
			return reception(w, d);
		case 'demo-lounge':
			return demoLounge(w, d);
		case 'podcast':
			return podcast(w, d);
		case 'conference':
			return conference(w, d);
		case 'digital-lab':
			return digitalLab(w, d);
		case 'server':
			return serverRoom(w, d);
		case 'dock':
			return dock(w, d);
		case 'security':
			return security(w, d);
		case 'it':
			return itTeam(w, d);
		case 'tac':
			return tac(w, d);
		case 'cabin':
			return cabin(w, d);
		case 'exec-cabin':
			return execCabin(w, d);
		case 'meeting':
			return meeting(w, d, 6);
		case 'phone-1':
			return phoneBooth(1);
		case 'phone-2':
			return phoneBooth(2);
		case 'meeting-pod':
			return meetingPod();
		case 'nap':
			return nap();
		case 'ups':
			return equipment(MAT.steelDark);
		case 'battery':
			return equipment(MAT.consoleBody);
		case 'printer':
			return printerBay();
		case 'pantry':
			return pantry(w, d);
		case 'lounge':
			return lounge(w, d);
		case 'collab':
			return collab(w, d);
		case 'store':
			return store(w, d);
		default:
			return null;
	}
}

/* The big central open-plan field, built with InstancedMesh for performance.
   Returns a group placed at the field centre. */
export function buildWorkstationField(field: {
	w: number;
	d: number;
	cols: number;
	rows: number;
	deskW: number;
	deskD: number;
}) {
	const g = G();
	const { w, d, cols, rows } = field;
	// cluster = 2 rows of 3 desks back-to-back (6 desks)
	const clusterW = 3 * field.deskW + 0.1;
	const clusterD = 2 * field.deskD + 0.1;
	const gapX = (w - cols * clusterW) / (cols + 1);
	const gapZ = (d - rows * clusterD) / (rows + 1);

	const deskCount = cols * rows * 6;
	const deskGeo = new THREE.BoxGeometry(field.deskW - 0.04, 0.04, field.deskD - 0.04);
	const desks = new THREE.InstancedMesh(deskGeo, MAT.woodLight, deskCount);
	const legGeo = new THREE.BoxGeometry(field.deskW - 0.1, 0.72, 0.05);
	const legs = new THREE.InstancedMesh(legGeo, MAT.steelDark, deskCount);
	const monGeo = new THREE.BoxGeometry(0.5, 0.3, 0.025);
	const mons = new THREE.InstancedMesh(monGeo, MAT.screen, deskCount);
	const chairSeat = new THREE.BoxGeometry(0.48, 0.46, 0.48);
	const chairs = new THREE.InstancedMesh(chairSeat, MAT.fabricGrey, deskCount);
	const screenGeo = new THREE.BoxGeometry(field.deskW * 3 + 0.1, 0.45, 0.06);
	const screens = new THREE.InstancedMesh(screenGeo, MAT.fabricSage, cols * rows * 2);

	desks.castShadow = legs.castShadow = chairs.castShadow = mons.castShadow = true;
	desks.receiveShadow = true;

	const m = new THREE.Matrix4();
	const q = new THREE.Quaternion();
	const s = new THREE.Vector3(1, 1, 1);
	let di = 0;
	let si = 0;
	for (let c = 0; c < cols; c++) {
		for (let r = 0; r < rows; r++) {
			const cx0 = -w / 2 + gapX + clusterW / 2 + c * (clusterW + gapX);
			const cz0 = -d / 2 + gapZ + clusterD / 2 + r * (clusterD + gapZ);
			// central spine screen
			m.compose(new THREE.Vector3(cx0, 1.0, cz0), q, s);
			screens.setMatrixAt(si++, m);
			for (let back = 0; back < 2; back++) {
				const dz = back === 0 ? -field.deskD / 2 : field.deskD / 2;
				const rot = back === 0 ? new THREE.Quaternion() : q.clone().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
				for (let i = 0; i < 3; i++) {
					const dx = cx0 - clusterW / 2 + field.deskW / 2 + i * field.deskW;
					const dzz = cz0 + dz;
					m.compose(new THREE.Vector3(dx, 0.74, dzz), new THREE.Quaternion(), s);
					desks.setMatrixAt(di, m);
					m.compose(new THREE.Vector3(dx, 0.37, dzz + (back ? 0.3 : -0.3)), new THREE.Quaternion(), s);
					legs.setMatrixAt(di, m);
					m.compose(new THREE.Vector3(dx, 0.92, dzz + (back ? 0.34 : -0.34)), rot, s);
					mons.setMatrixAt(di, m);
					m.compose(new THREE.Vector3(dx, 0.46, dzz + (back ? 0.78 : -0.78)), new THREE.Quaternion(), s);
					chairs.setMatrixAt(di, m);
					di++;
				}
			}
		}
	}
	desks.instanceMatrix.needsUpdate = true;
	legs.instanceMatrix.needsUpdate = true;
	mons.instanceMatrix.needsUpdate = true;
	chairs.instanceMatrix.needsUpdate = true;
	screens.instanceMatrix.needsUpdate = true;
	g.add(desks, legs, mons, chairs, screens);

	// planters around the field edge for greenery
	for (let c = 0; c <= cols; c++) {
		const x = -w / 2 + (w / cols) * c;
		g.add(plant(0.9).translateX(x).translateZ(-d / 2 - 0.2));
		g.add(plant(0.9).translateX(x).translateZ(d / 2 + 0.2));
	}
	return g;
}
