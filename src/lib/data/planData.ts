/* ============================================================================
   CoSol Experience Centre, Bangalore — FLOOR PLAN DATA MODEL
   ----------------------------------------------------------------------------
   Reconstructed from the concept deck "P 2604 Cosol Experience Centre _R3".
   Single source of truth for the 3D scene, the 2D minimap and the room index.

   Coordinate system (metres):
     origin (0,0) = North-West (top-left) corner of the carpet
     +X -> East  (right on plan)
     +Z -> South (down on plan)
     +Y -> Up

   Real areas from the deck:
     Total carpet  1436.21 m²   Experience Centre 578.1 m²
     Workspace      858.06 m²   Mezzanine (pantry) 166.81 m²
   ========================================================================== */

export type ZoneId =
	| 'arrival'
	| 'experience'
	| 'work'
	| 'leadership'
	| 'collab'
	| 'focus'
	| 'wellness'
	| 'support'
	| 'core';

export interface Zone {
	id: ZoneId;
	name: string;
	color: string; // plan / minimap fill
	wall: string; // 3D wall accent
}

export const ZONES: Record<ZoneId, Zone> = {
	arrival: { id: 'arrival', name: 'Arrival / Client Experience', color: '#f4d8a8', wall: '#e9c388' },
	experience: { id: 'experience', name: 'Experience Centre', color: '#cdb7e6', wall: '#b9a0d8' },
	work: { id: 'work', name: 'Operational / Work Zone', color: '#9cc4dd', wall: '#8fb6d2' },
	leadership: { id: 'leadership', name: 'Leadership Zone', color: '#aed6a6', wall: '#9bc991' },
	collab: { id: 'collab', name: 'Collaborative Zone', color: '#f0b483', wall: '#e7a06a' },
	focus: { id: 'focus', name: 'Focus / Privacy', color: '#b07cb0', wall: '#9e679e' },
	wellness: { id: 'wellness', name: 'Wellness Zone', color: '#d98b86', wall: '#cf736d' },
	support: { id: 'support', name: 'Support / Utility', color: '#8fd9e0', wall: '#74ccd5' },
	core: { id: 'core', name: 'Building Core', color: '#b7c0c7', wall: '#9aa6ad' }
};

export type Floor = 'main' | 'mezzanine';

/** How a room is enclosed. */
export type Partition = 'glass' | 'solid' | 'open' | 'half';

/** Drives the furniture factory. */
export type FurnitureKind =
	| 'reception'
	| 'demo-lounge'
	| 'podcast'
	| 'conference'
	| 'digital-lab'
	| 'server'
	| 'dock' // digital operation centre
	| 'security'
	| 'it'
	| 'tac' // technical assistance centre
	| 'cabin'
	| 'exec-cabin'
	| 'meeting'
	| 'phone-1'
	| 'phone-2'
	| 'meeting-pod'
	| 'nap'
	| 'ups'
	| 'battery'
	| 'printer'
	| 'pantry'
	| 'lounge'
	| 'collab'
	| 'store'
	| 'lift-core'
	| 'empty';

export interface Room {
	id: string;
	name: string;
	short?: string;
	zone: ZoneId;
	floor: Floor;
	/** NW corner + size, metres */
	x: number;
	z: number;
	w: number;
	d: number;
	partition: Partition;
	furniture: FurnitureKind;
	/** capacity / quantity label, e.g. "8 PAX" */
	tag?: string;
	/** real dimension caption from the deck, when stated */
	dims?: string;
	/** include in the guided tour list */
	tour?: boolean;
	note?: string;
}

/* Building shell ----------------------------------------------------------- */
export const SHELL = {
	width: 47.5, // X
	depth: 29.0, // Z
	wallH: 3.05, // partition / floor-to-ceiling height (main)
	mezzH: 3.25, // height the mezzanine deck sits at
	mezzCeil: 2.7
};

/* ------------------------------------------------------------------ ROOMS -- */
export const ROOMS: Room[] = [
	/* ===================== ARRIVAL ===================== */
	{
		id: 'reception',
		name: 'Reception & Brand Gallery',
		short: 'Reception',
		zone: 'arrival',
		floor: 'main',
		x: 16.8,
		z: 0,
		w: 13.4,
		d: 7.2,
		partition: 'open',
		furniture: 'reception',
		dims: '6.4 × 5.8 m',
		tour: true,
		note: 'Curved welcome desk, circular brand video counter (PD-T) and waiting lounge — the first impression for every visitor.'
	},
	{
		id: 'lounge',
		name: 'Reception Lounge',
		short: 'Lounge',
		zone: 'arrival',
		floor: 'main',
		x: 30.2,
		z: 0,
		w: 9.0,
		d: 7.2,
		partition: 'open',
		furniture: 'lounge',
		tour: true,
		note: 'Hospitality-inspired waiting lounge beside the staircase up to the pantry mezzanine.'
	},

	/* ===================== EXPERIENCE CENTRE (west) ===================== */
	{
		id: 'podcast',
		name: 'Podcast / AV Room',
		short: 'Podcast / AV',
		zone: 'experience',
		floor: 'main',
		x: 0,
		z: 0,
		w: 5.0,
		d: 4.6,
		partition: 'solid',
		furniture: 'podcast',
		dims: '5.2 × 3 m',
		tour: true,
		note: 'Acoustically treated podcast / AV studio — round table, mics and wall TV.'
	},
	{
		id: 'demo',
		name: 'Customer Experience / Demo Lounge',
		short: 'Demo Lounge',
		zone: 'experience',
		floor: 'main',
		x: 5.2,
		z: 0,
		w: 11.4,
		d: 6.6,
		partition: 'glass',
		furniture: 'demo-lounge',
		dims: '12.4 × 6.1 m',
		tour: true,
		note: 'Transparent iStandees, Pro-Touch circular demo consoles and a discussion table for live product demos.'
	},
	{
		id: 'conference',
		name: 'Conference Room',
		zone: 'collab',
		floor: 'main',
		x: 0,
		z: 6.9,
		w: 8.7,
		d: 5.4,
		partition: 'glass',
		furniture: 'conference',
		tag: '20 PAX',
		dims: '8.9 × 5.4 m',
		tour: true,
		note: 'Boardroom with a boat-shaped conference table and a digital video wall.'
	},
	{
		id: 'digital-lab',
		name: 'Digital Lab',
		zone: 'experience',
		floor: 'main',
		x: 9.0,
		z: 6.9,
		w: 6.3,
		d: 5.4,
		partition: 'glass',
		furniture: 'digital-lab',
		dims: '6.5 × 5.4 m',
		tour: true,
		note: 'Pro-Touch X-Series interactive table behind a folding glass wall, with whiteboard.'
	},
	{
		id: 'server',
		name: 'Server Room',
		zone: 'support',
		floor: 'main',
		x: 15.5,
		z: 6.9,
		w: 6.1,
		d: 5.4,
		partition: 'solid',
		furniture: 'server',
		dims: '6.3 × 5.4 m',
		note: 'Strengthened floor for server loading — rack rows and cooling.'
	},
	{
		id: 'dock',
		name: 'Digital Operation Centre',
		short: 'Digital Ops',
		zone: 'work',
		floor: 'main',
		x: 0,
		z: 12.6,
		w: 10.2,
		d: 8.0,
		partition: 'glass',
		furniture: 'dock',
		dims: '10.2 × 10.6 m',
		tour: true,
		note: 'Tiered command floor — rows of Pro-Edge consoles facing a large video wall.'
	},
	{
		id: 'security',
		name: 'Security Operations',
		short: 'Security',
		zone: 'work',
		floor: 'main',
		x: 10.5,
		z: 12.6,
		w: 5.0,
		d: 7.7,
		partition: 'glass',
		furniture: 'security',
		dims: '5.1 × 7.9 m',
		tour: true,
		note: 'ProTouch Mission-Control consoles facing a wall of CoSol brand screens.'
	},
	{
		id: 'it',
		name: 'IT Team',
		zone: 'work',
		floor: 'main',
		x: 15.7,
		z: 12.6,
		w: 5.0,
		d: 3.3,
		partition: 'glass',
		furniture: 'it',
		dims: '5.1 × 3.35 m',
		note: 'IT support pod.'
	},
	{
		id: 'tac',
		name: 'Technical Assistance Centre',
		short: 'Tech Assistance',
		zone: 'work',
		floor: 'main',
		x: 0,
		z: 20.9,
		w: 10.5,
		d: 8.1,
		partition: 'glass',
		furniture: 'tac',
		dims: '10.6 × 9.1 m',
		tour: true,
		note: 'Linear workstation benches with personal lockers and a full window wall.'
	},

	/* ---- Exec cabins on the experience/work boundary ---- */
	{
		id: 'exe-cabin-1',
		name: 'Executive Cabin',
		short: 'Exec Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 16.0,
		z: 9.6,
		w: 4.0,
		d: 2.9,
		partition: 'glass',
		furniture: 'exec-cabin',
		tag: 'EXE'
	},
	{
		id: 'exe-cabin-2',
		name: 'Executive Cabin',
		short: 'Exec Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 16.0,
		z: 12.7,
		w: 4.0,
		d: 3.0,
		partition: 'glass',
		furniture: 'exec-cabin',
		tag: 'EXE'
	},

	/* ===================== SUPPORT / WELLNESS CLUSTER (centre) ============ */
	{
		id: 'printer',
		name: 'Printer Bay',
		zone: 'support',
		floor: 'main',
		x: 5.0,
		z: 20.9,
		w: 3.6,
		d: 2.6,
		partition: 'half',
		furniture: 'printer',
		note: 'Reprographics / printer bay.'
	},
	{
		id: 'nap-1',
		name: 'Nap Room',
		zone: 'wellness',
		floor: 'main',
		x: 11.0,
		z: 21.0,
		w: 2.8,
		d: 3.2,
		partition: 'solid',
		furniture: 'nap',
		tour: true,
		note: 'Quiet wellness pod with a daybed.'
	},
	{
		id: 'nap-2',
		name: 'Nap Room',
		zone: 'wellness',
		floor: 'main',
		x: 13.9,
		z: 21.0,
		w: 2.8,
		d: 3.2,
		partition: 'solid',
		furniture: 'nap'
	},
	{
		id: 'ups',
		name: 'UPS Room',
		zone: 'support',
		floor: 'main',
		x: 11.0,
		z: 24.4,
		w: 3.4,
		d: 3.4,
		partition: 'solid',
		furniture: 'ups'
	},
	{
		id: 'battery',
		name: 'Battery Room',
		zone: 'support',
		floor: 'main',
		x: 14.6,
		z: 24.4,
		w: 3.4,
		d: 3.4,
		partition: 'solid',
		furniture: 'battery'
	},

	/* ===================== WORKSPACE — COLLAB top band ==================== */
	{
		id: 'collab-1',
		name: 'Work Lounge / Collab',
		short: 'Collab',
		zone: 'collab',
		floor: 'main',
		x: 20.4,
		z: 9.3,
		w: 4.6,
		d: 3.2,
		partition: 'open',
		furniture: 'collab',
		tour: true,
		note: 'Informal work-lounge with soft seating and a high table.'
	},
	{
		id: 'phone-top-1',
		name: 'Phone Booth · 2 seater',
		short: 'Phone Booth',
		zone: 'focus',
		floor: 'main',
		x: 25.6,
		z: 9.3,
		w: 1.6,
		d: 2.4,
		partition: 'solid',
		furniture: 'phone-2',
		tag: '2 PAX'
	},
	{
		id: 'phone-top-2',
		name: 'Phone Booth · 2 seater',
		short: 'Phone Booth',
		zone: 'focus',
		floor: 'main',
		x: 33.2,
		z: 9.3,
		w: 1.6,
		d: 2.4,
		partition: 'solid',
		furniture: 'phone-2',
		tag: '2 PAX'
	},

	/* ---- phone booths along the bottom of the workstation field ---- */
	{
		id: 'phone-bot-1',
		name: 'Phone Booth · 1 seater',
		zone: 'focus',
		floor: 'main',
		x: 22.0,
		z: 23.0,
		w: 1.3,
		d: 1.6,
		partition: 'solid',
		furniture: 'phone-1',
		tag: '1 PAX'
	},
	{
		id: 'phone-bot-2',
		name: 'Phone Booth · 1 seater',
		zone: 'focus',
		floor: 'main',
		x: 28.0,
		z: 23.0,
		w: 1.3,
		d: 1.6,
		partition: 'solid',
		furniture: 'phone-1',
		tag: '1 PAX'
	},
	{
		id: 'phone-bot-3',
		name: 'Phone Booth · 1 seater',
		zone: 'focus',
		floor: 'main',
		x: 34.0,
		z: 23.0,
		w: 1.3,
		d: 1.6,
		partition: 'solid',
		furniture: 'phone-1',
		tag: '1 PAX'
	},

	/* ===================== WORKSPACE — east meeting / leadership ========= */
	{
		id: 'mt-4pax',
		name: 'Meeting Room · 4 seater',
		short: '4 PAX Mtg',
		zone: 'collab',
		floor: 'main',
		x: 39.6,
		z: 0.6,
		w: 3.6,
		d: 3.6,
		partition: 'glass',
		furniture: 'meeting',
		tag: '4 PAX'
	},
	{
		id: 'mt-8pax-top',
		name: 'Meeting Room · 8 seater',
		short: '8 PAX Mtg',
		zone: 'collab',
		floor: 'main',
		x: 43.4,
		z: 0.6,
		w: 4.0,
		d: 4.4,
		partition: 'glass',
		furniture: 'meeting',
		tag: '8 PAX',
		tour: true,
		note: 'Glass-walled meeting room with city views.'
	},
	{
		id: 'mt-6pax',
		name: 'Meeting Room · 6 seater',
		short: '6 PAX Mtg',
		zone: 'collab',
		floor: 'main',
		x: 43.0,
		z: 5.4,
		w: 4.4,
		d: 3.8,
		partition: 'glass',
		furniture: 'meeting',
		tag: '6 PAX'
	},
	{
		id: 'cabin-e1',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 43.4,
		z: 9.6,
		w: 4.0,
		d: 3.0,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'cabin-e2',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 43.4,
		z: 12.8,
		w: 4.0,
		d: 3.0,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'cabin-e3',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 43.4,
		z: 16.0,
		w: 4.0,
		d: 3.0,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'cabin-e4',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 43.4,
		z: 19.2,
		w: 4.0,
		d: 3.0,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'mt-4pax-e',
		name: 'Meeting Room · 4 seater',
		short: '4 PAX Mtg',
		zone: 'collab',
		floor: 'main',
		x: 43.4,
		z: 22.4,
		w: 4.0,
		d: 3.4,
		partition: 'glass',
		furniture: 'meeting',
		tag: '4 PAX'
	},

	/* ---- bottom band: cabins + big meeting room + exec ---- */
	{
		id: 'cabin-s1',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 19.6,
		z: 25.2,
		w: 3.4,
		d: 3.6,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'cabin-s2',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 23.1,
		z: 25.2,
		w: 3.4,
		d: 3.6,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'mt-8pax-bot',
		name: 'Meeting Room · 8 seater',
		short: '8 PAX Mtg',
		zone: 'collab',
		floor: 'main',
		x: 26.7,
		z: 25.2,
		w: 5.2,
		d: 3.6,
		partition: 'glass',
		furniture: 'meeting',
		tag: '8 PAX'
	},
	{
		id: 'cabin-s3',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 32.1,
		z: 25.2,
		w: 3.4,
		d: 3.6,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'cabin-s4',
		name: 'Manager Cabin',
		short: 'Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 35.6,
		z: 25.2,
		w: 3.4,
		d: 3.6,
		partition: 'glass',
		furniture: 'cabin'
	},
	{
		id: 'exe-cabin-s',
		name: 'Executive Cabin',
		short: 'Exec Cabin',
		zone: 'leadership',
		floor: 'main',
		x: 39.1,
		z: 25.2,
		w: 4.4,
		d: 3.6,
		partition: 'glass',
		furniture: 'exec-cabin',
		tag: 'EXE',
		tour: true,
		note: 'Corner executive cabin with private meeting setting.'
	},

	/* ===================== BUILDING CORE (north spine) =================== */
	{
		id: 'core',
		name: 'Lift Lobby & Service Core',
		short: 'Core',
		zone: 'core',
		floor: 'main',
		x: 39.6,
		z: 0,
		w: 7.9,
		d: 0, // drawn as a thin marker strip; see note
		partition: 'open',
		furniture: 'empty',
		note: 'Passenger + service lifts and main entry (north-east).'
	},

	/* ===================== MEZZANINE — Pantry / Café ==================== */
	{
		id: 'pantry',
		name: 'Pantry / Café',
		short: 'Pantry',
		zone: 'arrival',
		floor: 'mezzanine',
		x: 30.0,
		z: 0.5,
		w: 13.5,
		d: 8.6,
		partition: 'open',
		furniture: 'pantry',
		tag: '45 seats',
		dims: '166.81 m²',
		tour: true,
		note: 'Mezzanine pantry & café — counter, island and 45 covers overlooking the floor. Reached by the reception staircase.'
	},
	{
		id: 'mezz-pod-1',
		name: 'Meeting Pod · 4 seater',
		short: 'Meeting Pod',
		zone: 'collab',
		floor: 'mezzanine',
		x: 30.4,
		z: 0.8,
		w: 2.6,
		d: 2.2,
		partition: 'glass',
		furniture: 'meeting-pod',
		tag: '4 PAX'
	},
	{
		id: 'mezz-pod-2',
		name: 'Meeting Pod · 4 seater',
		short: 'Meeting Pod',
		zone: 'collab',
		floor: 'mezzanine',
		x: 34.2,
		z: 0.8,
		w: 2.6,
		d: 2.2,
		partition: 'glass',
		furniture: 'meeting-pod',
		tag: '4 PAX'
	},
	{
		id: 'store',
		name: 'Store Room',
		zone: 'support',
		floor: 'mezzanine',
		x: 43.7,
		z: 0.5,
		w: 3.3,
		d: 3.4,
		partition: 'solid',
		furniture: 'store'
	}
];

/* --------------------------------------------------- OPEN WORKSTATION FIELD --
   60 workstations (1500×600) arranged as 6-desk clusters with planters, sitting
   in the central operational zone. Generated by the scene + minimap. */
export const WORKFIELD = {
	x: 20.2,
	z: 11.4,
	w: 22.0,
	d: 11.2,
	cols: 5, // clusters across
	rows: 2, // clusters deep  ->  5 x 2 x 6 desks = 60
	deskW: 1.5,
	deskD: 0.7
};

/* ------------------------------------------------------------- STAIRCASE ---- */
export const STAIR = { x: 27.6, z: 0.4, w: 2.2, d: 6.0 };

/* ----------------------------------------------------------- GUIDED TOUR ---- */
export interface TourStop {
	id: string;
	label: string;
}
export const TOUR_ORDER: string[] = [
	'reception',
	'demo',
	'podcast',
	'digital-lab',
	'conference',
	'dock',
	'security',
	'tac',
	'collab-1',
	'lounge',
	'mt-8pax-top',
	'exe-cabin-s',
	'pantry'
];

/* ------------------------------------------------------------- KEY FACTS ---- */
export const FACTS = {
	project: 'Connectivity Solutions — Experience Centre',
	location: 'Purva Zentech, Bangalore',
	revision: 'Concept Design · Revision 03',
	totalCarpet: '1,436 m²  /  15,460 ft²',
	experience: '578 m²  /  6,223 ft²',
	workspace: '858 m²  /  9,236 ft²',
	mezzanine: '167 m²  /  1,795 ft²',
	workstations: 60,
	cabins: 12,
	meetingRooms: 7
};

export const roomById = (id: string): Room | undefined => ROOMS.find((r) => r.id === id);
export const cx = (r: Room) => r.x + r.w / 2;
export const cz = (r: Room) => r.z + r.d / 2;
