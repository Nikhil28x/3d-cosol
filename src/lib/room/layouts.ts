/* ============================================================================
   PER-ROOM EDITABLE SCENES + DECK-DERIVED DOCS
   ----------------------------------------------------------------------------
   sceneForRoom(id)  -> a RoomScene (walls/floor/objects) sized to the real plan
   docForRoom(id)    -> rich editorial content reconstructed from the deck
   Every room from the master floor plan resolves to its own designable page.
   ========================================================================== */
import { ROOMS, ZONES, WORKFIELD, roomById, type Room, type FurnitureKind } from '../data/planData';
import { sectionOf, type SectionId } from '../data/sections';
import type { PlacedObject, RoomScene, RoomDoc, Accent, RoomPartition } from './types';

type Spec = { kind: string; x: number; z: number; rot?: number; scale?: number };

/* ------------------------------------------------------------- helpers ---- */
function ringSeats(kind: string, n: number, rx: number, rz: number, phase = 0): Spec[] {
	const out: Spec[] = [];
	for (let i = 0; i < n; i++) {
		const a = phase + (i / n) * Math.PI * 2;
		const x = Math.cos(a) * rx;
		const z = Math.sin(a) * rz;
		out.push({ kind, x, z, rot: Math.atan2(-x, -z) });
	}
	return out;
}
function rowOf(kind: string, n: number, spanX: number, z: number, rot = 0): Spec[] {
	const out: Spec[] = [];
	for (let i = 0; i < n; i++) {
		const x = n === 1 ? 0 : -spanX / 2 + (spanX / (n - 1)) * i;
		out.push({ kind, x, z, rot });
	}
	return out;
}
function seatsTwoSides(chair: string, seats: number, tw: number, z0 = 0): Spec[] {
	const out: Spec[] = [];
	const perSide = Math.ceil(seats / 2);
	let placed = 0;
	for (let side = 0; side < 2 && placed < seats; side++) {
		const z = z0 + (side === 0 ? 1 : -1) * 0.95;
		const n = Math.min(perSide, seats - placed);
		for (let i = 0; i < n; i++) {
			const x = n === 1 ? 0 : -tw / 2 + (tw / (n - 1)) * i;
			out.push({ kind: chair, x, z, rot: side === 0 ? Math.PI : 0 });
			placed++;
		}
	}
	return out;
}

/* ---------------------------------------------------- per-kind layouts ---- */
function specsFor(room: Room | { id: string; furniture: FurnitureKind; w: number; d: number; tag?: string }): Spec[] {
	const w = room.w;
	const d = room.d;
	const hx = w / 2 - 0.6;
	const hz = d / 2 - 0.6;
	const seats = room.tag ? parseInt(room.tag) || 0 : 0;

	switch (room.furniture) {
		case 'reception':
			return [
				{ kind: 'rug', x: -w * 0.16, z: d * 0.12, scale: 1.4 },
				{ kind: 'reception-desk', x: -w * 0.18, z: d * 0.1, rot: 0.25 },
				{ kind: 'brand-counter', x: w * 0.14, z: -d * 0.04 },
				{ kind: 'video-wall', x: w * 0.18, z: -hz, rot: 0 },
				{ kind: 'sofa-3', x: -w * 0.3, z: -d * 0.18, rot: 0 },
				{ kind: 'tub-chair', x: -w * 0.34, z: d * 0.12, rot: -0.6 },
				{ kind: 'tub-chair', x: -w * 0.22, z: d * 0.2, rot: -1.0 },
				{ kind: 'istandee', x: -hx, z: hz, rot: -0.4 },
				{ kind: 'istandee', x: hx, z: hz, rot: 0.4 },
				{ kind: 'plant-lg', x: hx, z: -hz },
				{ kind: 'plant-lg', x: -hx, z: -hz }
			];
		case 'lounge':
			return [
				{ kind: 'rug', x: -w * 0.05, z: d * 0.05, scale: 1.3 },
				{ kind: 'sofa-3', x: -w * 0.18, z: -d * 0.12, rot: 0 },
				{ kind: 'tub-chair', x: w * 0.2, z: d * 0.18, rot: -2.3 },
				{ kind: 'tub-chair', x: w * 0.28, z: -d * 0.02, rot: -3.2 },
				{ kind: 'coffee-table', x: w * 0.03, z: d * 0.06 },
				{ kind: 'round-table', x: -w * 0.32, z: d * 0.22 },
				{ kind: 'plant-lg', x: -hx, z: -hz },
				{ kind: 'plant-lg', x: hx, z: hz }
			];
		case 'demo-lounge': {
			const out: Spec[] = [];
			const n = 5;
			for (let i = 0; i < n; i++) {
				const x = -w / 2 + 1.4 + i * ((w - 2.8) / (n - 1));
				out.push({ kind: 'demo-console', x, z: -d * 0.28 });
				out.push({ kind: 'istandee', x, z: -d * 0.42, rot: 0 });
			}
			out.push({ kind: 'glass-disc-table', x: w * 0.1, z: d * 0.2 });
			out.push(...ringSeats('task-chair-white', 6, 1.5, 1.5).map((s) => ({ ...s, x: s.x + w * 0.1, z: s.z + d * 0.2 })));
			out.push({ kind: 'round-table', x: -w * 0.28, z: d * 0.16, scale: 0.7 });
			out.push({ kind: 'video-wall', x: w * 0.28, z: -hz });
			out.push({ kind: 'plant-lg', x: hx, z: hz });
			return out;
		}
		case 'podcast': {
			const out: Spec[] = [{ kind: 'podcast-table', x: 0, z: d * 0.04 }];
			out.push(...ringSeats('tub-chair', 4, 1.15, 1.15, 0.4).map((s) => ({ ...s, z: s.z + d * 0.04 })));
			out.push({ kind: 'sofa-2', x: 0, z: hz - 0.2, rot: Math.PI });
			out.push({ kind: 'tv-unit', x: hx, z: 0, rot: -Math.PI / 2 });
			return out;
		}
		case 'conference': {
			const n = seats || 18;
			const out: Spec[] = [{ kind: 'conf-table', x: 0, z: 0, scale: Math.min(1.2, w / 3.6) }];
			const tw = Math.min(w * 0.55, 5.2);
			out.push(...seatsTwoSides('task-chair-white', n - 2, tw, 0));
			out.push({ kind: 'task-chair-white', x: -tw / 2 - 0.7, z: 0, rot: -Math.PI / 2 });
			out.push({ kind: 'task-chair-white', x: tw / 2 + 0.7, z: 0, rot: Math.PI / 2 });
			out.push({ kind: 'video-wall', x: 0, z: -hz, scale: Math.min(1.2, w / 4.5) });
			out.push({ kind: 'credenza', x: 0, z: hz - 0.3, rot: Math.PI });
			return out;
		}
		case 'digital-lab':
			return [
				{ kind: 'protouch-x', x: 0, z: d * 0.05 },
				...ringSeats('bar-stool', 4, 1.5, 1.0, 0.2).map((s) => ({ ...s, z: s.z + d * 0.05 })),
				{ kind: 'whiteboard', x: w * 0.2, z: -hz },
				{ kind: 'tv-unit', x: -hx, z: 0, rot: Math.PI / 2 }
			];
		case 'server': {
			const out: Spec[] = [];
			const cols = Math.max(3, Math.floor(w / 1.4));
			for (let r = 0; r < 2; r++)
				for (let i = 0; i < cols; i++) {
					const x = -w / 2 + 1.0 + i * ((w - 2) / Math.max(1, cols - 1));
					out.push({ kind: 'server-rack', x, z: -d * 0.2 + r * 1.8, rot: r === 0 ? 0 : Math.PI });
				}
			return out;
		}
		case 'dock': {
			const out: Spec[] = [];
			const rows = 4;
			for (let r = 0; r < rows; r++) {
				const z = -hz + 1.4 + r * ((d - 2.8) / (rows - 1));
				out.push({ kind: 'pro-edge-console', x: 0, z, scale: Math.min(1.3, w / 3) });
				out.push({ kind: 'task-chair-white', x: -1.0, z: z + 0.9, rot: 0 });
				out.push({ kind: 'task-chair-white', x: 1.0, z: z + 0.9, rot: 0 });
			}
			out.push({ kind: 'video-wall', x: 0, z: -hz, scale: Math.min(1.5, w / 4) });
			return out;
		}
		case 'security': {
			const out: Spec[] = [];
			for (let r = 0; r < 2; r++)
				for (let i = 0; i < 4; i++) {
					const x = -w / 2 + 0.9 + i * ((w - 1.8) / 3);
					const z = -d * 0.18 + r * 2.0;
					out.push({ kind: 'mission-console', x, z });
					out.push({ kind: 'task-chair-white', x, z: z + 0.8, rot: 0 });
				}
			out.push({ kind: 'video-wall', x: 0, z: -hz, scale: Math.min(1.4, w / 4) });
			out.push({ kind: 'plant-lg', x: hx, z: hz });
			return out;
		}
		case 'it': {
			const span = Math.min(d - 1.6, 3.0);
			return rowOf('workstation', 3, span, 0).map((s) => ({ kind: s.kind, x: -w * 0.12, z: s.x, rot: Math.PI / 2 }));
		}
		case 'tac': {
			const out: Spec[] = [];
			for (let bank = -1; bank <= 1; bank += 2) {
				out.push({ kind: 'desk-pod-6', x: bank * w * 0.22, z: -d * 0.05, rot: Math.PI / 2, scale: Math.min(1, d / 6) });
			}
			out.push({ kind: 'lockers', x: 0, z: hz - 0.3, rot: Math.PI });
			out.push({ kind: 'plant-lg', x: -hx, z: -hz });
			return out;
		}
		case 'cabin':
			return [
				{ kind: 'rug', x: 0, z: d * 0.05, scale: 0.9 },
				{ kind: 'office-desk', x: 0, z: -d * 0.12, rot: 0 },
				{ kind: 'exec-chair', x: 0, z: -d * 0.3, rot: Math.PI },
				{ kind: 'task-chair', x: -0.5, z: d * 0.16, rot: 0 },
				{ kind: 'task-chair', x: 0.5, z: d * 0.16, rot: 0 },
				{ kind: 'credenza', x: hx, z: 0, rot: -Math.PI / 2 }
			];
		case 'exec-cabin':
			return [
				{ kind: 'rug', x: -w * 0.12, z: -d * 0.05, scale: 1.0 },
				{ kind: 'exec-desk', x: -w * 0.12, z: -d * 0.18, rot: 0 },
				{ kind: 'exec-chair', x: -w * 0.12, z: -d * 0.36, rot: Math.PI },
				{ kind: 'glass-disc-table', x: w * 0.22, z: d * 0.2, scale: 0.7 },
				...ringSeats('tub-chair', 3, 1.0, 1.0, 1).map((s) => ({ ...s, x: s.x + w * 0.22, z: s.z + d * 0.2 })),
				{ kind: 'credenza', x: -hx, z: d * 0.05, rot: Math.PI / 2 },
				{ kind: 'plant-lg', x: hx, z: -hz }
			];
		case 'meeting': {
			const n = seats || 6;
			if (n <= 4) {
				return [
					{ kind: 'round-table', x: 0, z: 0, scale: 0.85 },
					...ringSeats('task-chair-white', n, 1.1, 1.1),
					{ kind: 'tv-unit', x: 0, z: -hz }
				];
			}
			const tw = Math.min(w * 0.5, n > 6 ? 2.6 : 1.8);
			return [
				{ kind: 'conf-table', x: 0, z: 0, scale: Math.min(1, tw / 3.4 + 0.3) },
				...seatsTwoSides('task-chair-white', n, tw, 0),
				{ kind: 'video-wall', x: 0, z: -hz, scale: Math.min(0.9, w / 5) }
			];
		}
		case 'phone-1':
			return [{ kind: 'phone-booth-1', x: 0, z: 0 }];
		case 'phone-2':
			return [{ kind: 'phone-booth-2', x: 0, z: 0 }];
		case 'meeting-pod':
			return [{ kind: 'meeting-pod', x: 0, z: 0 }];
		case 'nap':
			return [
				{ kind: 'daybed', x: 0, z: 0 },
				{ kind: 'plant-sm', x: hx, z: hz }
			];
		case 'ups':
			return [{ kind: 'ups-rack', x: 0, z: 0 }];
		case 'battery':
			return [{ kind: 'battery-rack', x: 0, z: 0 }];
		case 'printer':
			return [
				{ kind: 'printer', x: -w * 0.2, z: 0 },
				{ kind: 'printer', x: w * 0.2, z: 0 },
				{ kind: 'shelf-unit', x: 0, z: -hz, rot: 0 }
			];
		case 'pantry': {
			const out: Spec[] = [
				{ kind: 'kitchen-counter', x: 0, z: -hz + 0.4, rot: 0 },
				{ kind: 'island', x: -w * 0.18, z: -d * 0.06 }
			];
			const cols = 4,
				rows = 2;
			for (let c = 0; c < cols; c++)
				for (let r = 0; r < rows; r++) {
					const x = w * 0.08 + c * 1.9 - 0.5;
					const z = d * 0.08 + r * 1.9;
					if (x > hx || z > hz) continue;
					out.push({ kind: 'cafe-table', x, z });
				}
			out.push({ kind: 'plant-lg', x: hx, z: -hz });
			out.push({ kind: 'plant-lg', x: -hx, z: hz });
			return out;
		}
		case 'collab':
			return [
				{ kind: 'sofa-2', x: 0, z: -d * 0.22, rot: 0 },
				{ kind: 'high-table', x: 0, z: d * 0.2 },
				{ kind: 'bar-stool', x: -0.45, z: d * 0.2 + 0.55, rot: Math.PI },
				{ kind: 'bar-stool', x: 0.45, z: d * 0.2 + 0.55, rot: Math.PI },
				{ kind: 'plant-sm', x: hx, z: -hz }
			];
		case 'store':
			return [
				{ kind: 'shelf-unit', x: 0, z: -hz, rot: 0 },
				{ kind: 'shelf-unit', x: -hx, z: 0, rot: Math.PI / 2 }
			];
		default:
			return [];
	}
}

/* ---------------------------------------------------- workfield (synthetic) */
function workfieldSpecs(): Spec[] {
	const out: Spec[] = [];
	const cols = 4,
		rows = 2;
	const w = WORKFIELD.w,
		d = WORKFIELD.d;
	const gx = w / cols,
		gz = d / rows;
	for (let c = 0; c < cols; c++)
		for (let r = 0; r < rows; r++) {
			const x = -w / 2 + gx / 2 + c * gx;
			const z = -d / 2 + gz / 2 + r * gz;
			out.push({ kind: 'desk-pod-6', x, z, scale: 0.9 });
		}
	out.push({ kind: 'plant-lg', x: -w / 2 + 0.6, z: 0 });
	out.push({ kind: 'plant-lg', x: w / 2 - 0.6, z: 0 });
	return out;
}

/* ------------------------------------------------ scene + floor resolution */
function floorColorFor(room: Room): string {
	if (room.zone === 'support' || room.zone === 'core') return '#cdd2d6';
	if (sectionOf(room) === 'experience') return '#e6e9ec';
	if (room.zone === 'experience') return '#e6e9ec';
	return '#c9b79c';
}
function accentFor(room: Room): Accent {
	return sectionOf(room) === 'experience' ? 'cool' : 'warm';
}
function shellPartition(p: RoomPartition): RoomPartition {
	return p === 'open' || p === 'half' ? 'glass' : p;
}

function finalize(id: string, specs: Spec[]): PlacedObject[] {
	const counts: Record<string, number> = {};
	return specs.map((s) => {
		counts[s.kind] = (counts[s.kind] ?? 0) + 1;
		return {
			id: `${id}__${s.kind}-${counts[s.kind]}`,
			kind: s.kind,
			x: +s.x.toFixed(3),
			z: +s.z.toFixed(3),
			rot: +(s.rot ?? 0).toFixed(4),
			scale: s.scale ?? 1
		};
	});
}

export function sceneForRoom(id: string): RoomScene | null {
	if (id === 'workfield') {
		return {
			id,
			name: 'Open Workstations',
			zone: 'work',
			w: WORKFIELD.w,
			d: WORKFIELD.d,
			wallH: 3.0,
			partition: 'glass',
			floorColor: '#c9b79c',
			accent: 'warm',
			objects: finalize(id, workfieldSpecs())
		};
	}
	const room = roomById(id);
	if (!room || room.furniture === 'empty') return null;
	const w = Math.max(room.w, 2.4);
	const dd = Math.max(room.d, 2.2);
	return {
		id: room.id,
		name: room.name,
		zone: room.zone,
		w,
		d: dd,
		wallH: room.floor === 'mezzanine' ? 2.7 : 3.0,
		partition: shellPartition(room.partition),
		floorColor: floorColorFor(room),
		accent: accentFor(room),
		objects: finalize(room.id, specsFor({ ...room, w, d: dd }))
	};
}

/* ============================================================ DOC CONTENT == */
interface KindDoc {
	tagline: string;
	summary: string;
	characteristics: string[];
	offers: string[];
	devices: string[];
	palette: { hex: string; name: string }[];
	materials: string[];
}

const CY = { hex: '#00aeef', name: 'Brand Cyan' };
const WHITE = { hex: '#f2f3f4', name: 'Gallery White' };
const TAN = { hex: '#c9b79c', name: 'Warm Oak' };
const TERRA = { hex: '#b5754a', name: 'Terracotta' };
const SAGE = { hex: '#93a481', name: 'Sage' };
const NAVY = { hex: '#2f3b4c', name: 'Ink Navy' };
const CONCRETE = { hex: '#e6e9ec', name: 'Polished Concrete' };
const STEEL = { hex: '#2b3137', name: 'Graphite' };

const CONTENT: Partial<Record<FurnitureKind, KindDoc>> = {
	reception: {
		tagline: 'The first impression — brand storytelling at the door.',
		summary:
			'A bright, gallery-like arrival anchored by a curved welcome desk and the circular PD-T brand video counter, with a curved video wall narrating the Connectivity Solutions story.',
		characteristics: [
			'Futuristic-but-welcoming mood; the drum-shaped brand counter is the sculptural centrepiece.',
			'Curved, flowing layout funnels visitors from entry toward the brand gallery and demo lounge.',
			'Open, double-height feel beside the mezzanine staircase.',
			'Soft daylight from full-height glazing plus a circular illuminated ceiling cove over the counter.',
			'Monochrome white/grey palette reads as a high-tech showroom; brand cyan reserved for digital content.'
		],
		offers: [
			'Curved hospitality welcome desk',
			'PD-T interactive brand counter with Windows touch tablets',
			'Curved brand video wall',
			'Transparent iStandee greeting totems',
			'Waiting lounge seating'
		],
		devices: ['PD-T Digital Counter', 'Curved Video Wall', 'Transparent iStandee', 'Windows touch tablets'],
		palette: [WHITE, CY, { hex: '#f2a65a', name: 'Arrival Tan' }, { hex: '#bfc1c3', name: 'Soft Grey' }],
		materials: ['White solid-surface counter', 'Polished microcement floor', 'Glass curtain wall', 'Brushed-metal signage']
	},
	lounge: {
		tagline: 'Hospitality-driven waiting, between gallery and workplace.',
		summary:
			'A soft waiting lounge of informal seating clusters where visitors relax before being hosted — the warm transition between the futuristic gallery and the workplace.',
		characteristics: [
			'Hospitality-driven, warm and human in mood.',
			'Relaxed clustered furniture encouraging informal conversation.',
			'Soft, warm-temperature diffuse lighting.',
			'Sits in the arrival/comfort plan zone beside the staircase.'
		],
		offers: ['Lounge sofas & armchairs', 'Low coffee and side tables', 'Greenery framing the lounge', 'Experience touchpoints'],
		devices: ['Experience touchpoints', 'iStandee'],
		palette: [{ hex: '#f2a65a', name: 'Arrival Tan' }, { hex: '#e8d9c5', name: 'Sand' }, TERRA, { hex: '#c9e8ef', name: 'Sky Tint' }],
		materials: ['Warm timber flooring', 'Upholstered fabric seating', 'Light rug', 'Glass + timber partitions']
	},
	'demo-lounge': {
		tagline: 'Live, interactive product demos in an immersive lounge.',
		summary:
			'The largest experiential room — a row of Pro-Touch circular demo consoles and transparent iStandees with a glass discussion table, built for live workflow demos and co-creation.',
		characteristics: [
			'Interactive, agile, dynamic character built around live demos.',
			'Multiple seating clusters allow several simultaneous demo groups.',
			'Showcase lighting: feature/accent lighting on displays with brand-cyan highlights.',
			'Opens to the brand gallery so the demo journey flows naturally from arrival.'
		],
		offers: [
			'Five Pro-Touch circular demo consoles',
			'Five transparent iStandee display panels',
			'Glass discussion table with swivel armchairs',
			'Brand wall signage'
		],
		devices: ['Pro-Touch Circular series', 'Transparent iStandee', 'PD-T', 'Mounted demo monitors'],
		palette: [WHITE, CY, { hex: '#f4dce2', name: 'Blush Field' }, { hex: '#9b9ea1', name: 'Mid Grey' }],
		materials: ['White solid-surface consoles', 'Glass tabletops', 'Polished concrete', 'Brand graphic wall']
	},
	podcast: {
		tagline: 'Acoustically treated podcast & AV studio.',
		summary:
			'A compact, acoustically-treated recording room with a round podcast table, gooseneck mics and a wall AV display for podcasts and media capture.',
		characteristics: [
			'Sound-treated, intimate studio mood.',
			'Round table keeps eye contact between hosts and guests.',
			'Soft lounge seating for pre/post-recording.',
			'Wall-mounted smart TV for monitoring and playback.'
		],
		offers: ['Round podcast table with mics', 'Barrel/tub armchairs for hosts', 'Loveseat lounge seating', 'Wall AV display'],
		devices: ['Gooseneck podcast microphones', 'Wall-mounted Smart TV / AV display'],
		palette: [{ hex: '#9aa0a6', name: 'Acoustic Grey' }, STEEL, CY, TAN],
		materials: ['Acoustic wall panels', 'Warm timber table', 'Upholstered seating', 'Carpet floor']
	},
	conference: {
		tagline: 'The flagship boardroom for strategy & client sessions.',
		summary:
			'A formal yet dynamic boardroom seating ~20 around a boat-shaped table, focused on a digital video wall, wrapped in glazed walls.',
		characteristics: [
			'Formal boardroom mood for strategy sessions and client presentations.',
			'Symmetrical long-table arrangement focused toward the presentation wall.',
			'Even ambient lighting with a feature pendant over the table.',
			'Glazed walls connect to the experience-centre circulation.'
		],
		offers: ['Boat-shaped boardroom table', '~20 ergonomic mesh chairs', 'Digital video wall', 'In-table power/AV modules', 'AV credenza'],
		devices: ['Video Wall / Digital Screen', 'In-table power & AV connectivity', 'PD-T'],
		palette: [WHITE, { hex: '#9fd3c7', name: 'Teal Field' }, STEEL, TAN],
		materials: ['Timber/veneer table', 'Mesh task seating', 'Glass partitions', 'Acoustic ceiling']
	},
	'digital-lab': {
		tagline: 'Hands-on lab for prototyping digital workflows.',
		summary:
			'A hands-on technology lab built around a Pro-Touch X-Series interactive table behind a folding glass wall, with whiteboard and wall display.',
		characteristics: [
			'Interactive, experimental mood for showcasing digital workflows.',
			'Pro-Touch X table is the collaborative centrepiece.',
			'Folding glass partition opens the lab to adjacent demo flow.',
			'Whiteboard + wall display support working sessions.'
		],
		offers: ['Pro-Touch X interactive table', 'Perch stools', 'Whiteboard', 'Wall-mounted display'],
		devices: ['Pro-Touch X Series', 'Wall-mounted display', 'PD-T'],
		palette: [WHITE, CY, { hex: '#c8c6de', name: 'Lavender Field' }, STEEL],
		materials: ['Interactive glass table', 'Glass folding partition', 'Polished concrete', 'White walls']
	},
	server: {
		tagline: 'Secure equipment room on a strengthened floor.',
		summary: 'A secure server room with rack rows and cooling, sitting on a strengthened floor for equipment loading.',
		characteristics: ['Restricted, utilitarian mood.', 'Rack rows with hot/cold orientation.', 'Strengthened floor for server loading.', 'Cooled and access-controlled.'],
		offers: ['Server rack rows', 'Cooling', 'Strengthened floor', 'Access control'],
		devices: ['Server racks'],
		palette: [{ hex: '#d9d6e4', name: 'Cool Lilac' }, STEEL, WHITE],
		materials: ['Raised/strengthened floor', 'Steel racks', 'Painted block walls']
	},
	dock: {
		tagline: 'NOC-style command floor under a video wall.',
		summary:
			'A tiered Digital Operation Centre — rows of Pro-Edge command consoles all oriented toward a large operations video wall, lit like a NOC/SOC.',
		characteristics: [
			'Command/control mood — dark, focused, blue-screen-lit.',
			'Linear rows of consoles oriented toward the front video wall.',
			'Lower ambient lighting favours screen visibility.',
			'Pro-Edge consoles give it a high-tech mission-control identity.'
		],
		offers: ['Tiered Pro-Edge command consoles', 'Curved operator monitors', 'Large operations video wall', 'Operator task chairs'],
		devices: ['Pro-Edge command Consoles', 'Curved dual-monitor displays', 'Operations video wall'],
		palette: [{ hex: '#c7d9c0', name: 'Sage Field' }, STEEL, CY, { hex: '#1e6fb8', name: 'Screen Blue' }],
		materials: ['Dark console finishes', 'Tiered platform', 'Carpet tile', 'Glass rear partition']
	},
	security: {
		tagline: 'Surveillance & security command room.',
		summary:
			'A focused security operations room with paired ProTouch Mission-Control desks facing a wall of CoSol brand screens.',
		characteristics: [
			'Focused surveillance mood, screen-oriented and access-restricted.',
			'Paired desk rows for shift-based monitoring.',
			'ProTouch Mission-Control consoles give an integrated command look.',
			'Lower, controlled lighting.'
		],
		offers: ['ProTouch Mission-Control consoles', 'Embedded touch monitors', 'Curved brand video wall', 'CS backlit signage'],
		devices: ['ProTouch Mission Control Consoles', 'Curved video wall', 'CS branded signage'],
		palette: [{ hex: '#e8c9c0', name: 'Peach Field' }, STEEL, { hex: '#1f8f4e', name: 'Status Green' }, CY],
		materials: ['Dark console finishes', 'Brand screen wall', 'Carpet tile']
	},
	it: {
		tagline: 'IT support pod beside the server room.',
		summary: 'A small IT support room with a short run of workstations for technical staff, adjacent to the server room.',
		characteristics: ['Compact support mood.', 'Linear desks against the glazed wall.', 'Direct adjacency to the server room.'],
		offers: ['IT support workstations', 'Task seating', 'Glass partition'],
		devices: ['PD-T'],
		palette: [{ hex: '#d9b8d8', name: 'Lilac Field' }, WHITE, STEEL],
		materials: ['Light desks', 'Task chairs', 'Glass partition']
	},
	tac: {
		tagline: 'Technical Assistance Centre — clustered support teams.',
		summary:
			'One of the largest team rooms: linear workstation benches in pod clusters with personal lockers and a full window wall.',
		characteristics: [
			'Collaborative support-team mood with pod-based desking.',
			'Open layout encouraging team interaction.',
			'Even ambient office lighting.',
			'Floor-to-ceiling window glazing along one wall.'
		],
		offers: ['Linear bench workstations in clusters', 'Dual-monitor support desks', 'Personal lockers', 'Window wall'],
		devices: ['Linear workstations', 'Dual-monitor desks', 'PD-T'],
		palette: [{ hex: '#cfd7b8', name: 'Olive Field' }, WHITE, CY, STEEL],
		materials: ['Bench desking', 'Task seating', 'Locker units', 'Glazed wall']
	},
	cabin: {
		tagline: 'Private manager cabin.',
		summary: 'A compact single-occupant manager office with a desk, guest chairs and storage, lining the workspace edge.',
		characteristics: ['Private, focused work mood.', 'Desk plus two-guest meeting setting.', 'Glass-walled for daylight and visibility.', 'Warm, hospitality-led palette.'],
		offers: ['Manager desk + executive chair', 'Two guest chairs', 'Storage credenza', 'Rug'],
		devices: ['PD-T'],
		palette: [{ hex: '#f2d9c0', name: 'Warm Sand' }, TERRA, { hex: '#aed6a6', name: 'Leadership Green' }, WHITE],
		materials: ['Timber desk', 'Leather/fabric seating', 'Glass partitions', 'Soft rug']
	},
	'exec-cabin': {
		tagline: 'Executive cabin with a private meeting setting.',
		summary: 'A private executive office pairing a generous desk with a small lounge/meeting setting and storage.',
		characteristics: ['Leadership mood — warm, generous, private.', 'Desk plus a round meeting setting.', 'Glass-walled with a soft rug anchoring the suite.', 'Corner positions enjoy city views.'],
		offers: ['Executive desk + high-back chair', 'Round meeting table with lounge chairs', 'Storage credenza', 'Greenery'],
		devices: ['PD-T'],
		palette: [{ hex: '#f2d9c0', name: 'Warm Sand' }, TERRA, { hex: '#aed6a6', name: 'Leadership Green' }, WHITE],
		materials: ['Warm timber desk', 'Leather seating', 'Glass partitions', 'Wool rug']
	},
	meeting: {
		tagline: 'Glass-walled meeting room.',
		summary: 'A glass-walled meeting room sized for 4, 6 or 8, with a table and a wall display for team and client sessions.',
		characteristics: ['Bright, glazed and connected to the workspace.', 'Table focused on a wall display.', 'Sized to its occupancy.', 'Collaborative, agile mood.'],
		offers: ['Meeting table', 'Task seating', 'Wall display screen'],
		devices: ['Wall-mounted display', 'PD-T'],
		palette: [{ hex: '#8fcbd4', name: 'Collab Teal' }, WHITE, TERRA, CY],
		materials: ['Timber table', 'Task seating', 'Glass partitions']
	},
	'phone-1': {
		tagline: 'Single-occupant acoustic phone booth.',
		summary: 'A single-person acoustic booth for private calls, with a perch seat and mini ledge.',
		characteristics: ['Quiet, enclosed acoustic privacy.', 'Perch seat + work ledge.', 'Glazed door for light.'],
		offers: ['Acoustic enclosure', 'Perch seat', 'Work ledge'],
		devices: [],
		palette: [{ hex: '#e0c7a8', name: 'Warm Felt' }, { hex: '#a14e9b', name: 'Focus Plum' }, STEEL],
		materials: ['Acoustic felt', 'Glazed door', 'Timber ledge']
	},
	'phone-2': {
		tagline: 'Two-person acoustic booth.',
		summary: 'A two-person acoustic booth for small private calls or quick huddles.',
		characteristics: ['Acoustic privacy for two.', 'Bench seating + small table.', 'Glazed front for light.'],
		offers: ['Acoustic enclosure', 'Two-seat bench', 'Small table'],
		devices: [],
		palette: [{ hex: '#e0c7a8', name: 'Warm Felt' }, { hex: '#a14e9b', name: 'Focus Plum' }, STEEL],
		materials: ['Acoustic felt', 'Glazed front', 'Timber table']
	},
	'meeting-pod': {
		tagline: 'Freestanding 4-seat meeting pod.',
		summary: 'A freestanding glazed pod (device "POD") seating four for ad-hoc huddles.',
		characteristics: ['Self-contained huddle pod.', 'Banquette seating around a small table.', 'Glazed + timber enclosure.'],
		offers: ['4-seat pod', 'Banquette seating', 'Huddle table'],
		devices: ['POD'],
		palette: [{ hex: '#9aa0a6', name: 'Pod Grey' }, TAN, { hex: '#2ec4c6', name: 'Pod Teal' }, WHITE],
		materials: ['Timber frame', 'Glazing', 'Upholstered banquettes']
	},
	nap: {
		tagline: 'Quiet wellness nap room.',
		summary: 'A small wellness nap/rest room with a daybed for staff downtime.',
		characteristics: ['Calm, dim wellness mood.', 'Daybed for rest.', 'Soft, muted palette.'],
		offers: ['Daybed', 'Soft lighting', 'Privacy'],
		devices: [],
		palette: [{ hex: '#e8d9c5', name: 'Sand' }, { hex: '#c96a6a', name: 'Wellness Clay' }, WHITE],
		materials: ['Upholstered daybed', 'Acoustic walls', 'Soft textiles']
	},
	ups: {
		tagline: 'UPS / power-backup room.',
		summary: 'A service room housing UPS power-backup cabinets within the central service core.',
		characteristics: ['Utility/service mood.', 'Equipment cabinets.', 'Access-controlled.'],
		offers: ['UPS cabinets', 'Power backup', 'Service access'],
		devices: [],
		palette: [{ hex: '#8fd3d8', name: 'Support Aqua' }, STEEL, WHITE],
		materials: ['Steel cabinets', 'Block walls']
	},
	battery: {
		tagline: 'Battery-bank room.',
		summary: 'A service room for the battery banks supporting the UPS, in the service core.',
		characteristics: ['Utility/service mood.', 'Battery racks.', 'Ventilated & access-controlled.'],
		offers: ['Battery racks', 'Ventilation', 'Service access'],
		devices: [],
		palette: [{ hex: '#9bd3d0', name: 'Support Aqua' }, STEEL, WHITE],
		materials: ['Steel racks', 'Block walls']
	},
	printer: {
		tagline: 'Reprographics / printer bay.',
		summary: 'A printing and reprographics bay serving the open workspace from the service core.',
		characteristics: ['Shared utility point.', 'Multi-function printers + supplies.', 'Half-height enclosure.'],
		offers: ['Multi-function printers', 'Supplies counter', 'Shelving'],
		devices: ['Repro / printing devices'],
		palette: [{ hex: '#e8d9c5', name: 'Sand' }, TERRA, WHITE],
		materials: ['Laminate worktop', 'Shelving', 'Half-height partition']
	},
	pantry: {
		tagline: 'Mezzanine pantry & café — the social heart.',
		summary:
			'A mezzanine pantry & café with a long service island and clustered café seating for 45, overlooking the floor via the reception staircase.',
		characteristics: [
			'Hospitality-driven, warm and informal dining/breakout mood.',
			'Open clustered seating around a central service island.',
			'Bright daylight from perimeter glazing plus planting.',
			'Reached via the staircase from the reception double-height void.'
		],
		offers: ['Pantry service island & counter', '45 café covers on round 4-tops', 'High banquette near the windows', 'Planting'],
		devices: ['iStandee'],
		palette: [{ hex: '#f2e2b0', name: 'Café Yellow' }, { hex: '#e0a06a', name: 'Toast' }, SAGE, WHITE],
		materials: ['Herringbone timber floor', 'Stone counters', 'Café seating', 'Planting']
	},
	collab: {
		tagline: 'Informal work-lounge / collab.',
		summary: 'An informal collaboration work-lounge with soft seating and a high table for casual co-working.',
		characteristics: ['Casual, agile co-working mood.', 'Soft seating + high collab table.', 'Open to the workspace.'],
		offers: ['Lounge sofa', 'High collaboration table + stools', 'Greenery'],
		devices: ['PD-T', 'Pro-Touch X Series'],
		palette: [{ hex: '#e0c7a8', name: 'Warm Felt' }, { hex: '#2ec4c6', name: 'Collab Teal' }, SAGE],
		materials: ['Upholstered seating', 'Timber high table', 'Steel stools']
	},
	store: {
		tagline: 'Mezzanine store room.',
		summary: 'A storage room on the mezzanine adjacent to the pantry/café.',
		characteristics: ['Back-of-house storage.', 'Shelving runs.', 'Solid enclosure.'],
		offers: ['Storage shelving', 'Solid enclosure'],
		devices: [],
		palette: [{ hex: '#e8d9c5', name: 'Sand' }, WHITE, { hex: '#bfc4c9', name: 'Grey' }],
		materials: ['Steel shelving', 'Block walls']
	}
};

const WORKFIELD_DOC: KindDoc = {
	tagline: 'The open workstation field — 60 benching desks.',
	summary:
		'The central operational zone: sixty 1500×600 benching workstations in greened six-desk clusters with collaborative spines, ringed by cabins, meeting rooms and phone booths.',
	characteristics: [
		'Greened six-desk clusters keep the open plan human.',
		'Collaborative spine screens divide back-to-back desks.',
		'Planter strips bring greenery between clusters.',
		'Central position connects to leadership, collab and focus zones.'
	],
	offers: ['Sixty 1500×600 workstations', 'Six-desk greened clusters', 'Privacy spine screens', 'Planter dividers'],
	devices: ['PD-T'],
	palette: [{ hex: '#e8e4d0', name: 'Workspace Beige' }, SAGE, CY, TAN],
	materials: ['Light timber desks', 'Fabric spine screens', 'Carpet tile', 'Planting']
};

export function docForRoom(id: string): RoomDoc | null {
	if (id === 'workfield') {
		const z = ZONES.work;
		return {
			id,
			name: 'Open Workstations',
			zone: 'work',
			zoneName: z.name,
			zoneColor: z.color,
			section: 'workspace',
			tagline: WORKFIELD_DOC.tagline,
			summary: WORKFIELD_DOC.summary,
			area: '858 m² zone',
			dims: '22 × 11 m field',
			capacity: '60 desks',
			characteristics: WORKFIELD_DOC.characteristics,
			offers: WORKFIELD_DOC.offers,
			devices: WORKFIELD_DOC.devices,
			palette: WORKFIELD_DOC.palette,
			materials: WORKFIELD_DOC.materials
		};
	}
	const room = roomById(id);
	if (!room || room.furniture === 'empty') return null;
	const z = ZONES[room.zone];
	const c = CONTENT[room.furniture];
	const section: SectionId = sectionOf(room);
	return {
		id: room.id,
		name: room.name,
		zone: room.zone,
		zoneName: z.name,
		zoneColor: z.color,
		section,
		tagline: c?.tagline ?? room.note ?? room.name,
		summary: c?.summary ?? room.note ?? '',
		area: undefined,
		dims: room.dims,
		capacity: room.tag,
		characteristics: c?.characteristics ?? [],
		offers: c?.offers ?? [],
		devices: c?.devices ?? [],
		palette: c?.palette ?? [WHITE, CY, TAN],
		materials: c?.materials ?? []
	};
}

/* All room ids that have a designable page (every plan room + the open field). */
export const ROOM_IDS: string[] = [
	...ROOMS.filter((r) => r.furniture !== 'empty').map((r) => r.id),
	'workfield'
];

export function hasRoomPage(id: string): boolean {
	return ROOM_IDS.includes(id);
}
