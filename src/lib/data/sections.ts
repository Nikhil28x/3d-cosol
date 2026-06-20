import { ROOMS, ZONES, type Room, type ZoneId } from './planData';

export type SectionId = 'overview' | 'experience' | 'workspace' | 'mezzanine';

export interface Section {
	id: SectionId;
	label: string;
	blurb: string;
	/** camera focus room when the tab is opened */
	focus?: string;
}

export const SECTIONS: Section[] = [
	{
		id: 'overview',
		label: 'Overview',
		blurb: 'The whole floor — arrival, experience centre, workspace and pantry mezzanine.'
	},
	{
		id: 'experience',
		label: 'Experience Centre',
		blurb: 'High-tech, immersive arrival journey: brand gallery, demo lounge, labs and command floors.',
		focus: 'reception'
	},
	{
		id: 'workspace',
		label: 'Workspace',
		blurb: 'Warm, hospitality-driven work zone: 60 workstations, cabins, meeting rooms and lounges.',
		focus: 'workfield'
	},
	{
		id: 'mezzanine',
		label: 'Mezzanine',
		blurb: 'Pantry & café for 45 with meeting pods, reached by the reception staircase.',
		focus: 'pantry'
	}
];

/* explicit membership so the tabs read exactly like the deck's chapters */
const EXPERIENCE = new Set([
	'reception',
	'demo',
	'podcast',
	'digital-lab',
	'conference',
	'server',
	'dock',
	'security',
	'it',
	'tac'
]);

export function sectionOf(room: Room): SectionId {
	if (room.floor === 'mezzanine') return 'mezzanine';
	if (EXPERIENCE.has(room.id)) return 'experience';
	return 'workspace';
}

export interface UiRoom {
	id: string;
	name: string;
	short: string;
	zone: ZoneId;
	zoneName: string;
	zoneColor: string;
	tag?: string;
	dims?: string;
	note?: string;
	section: SectionId;
	tour?: boolean;
}

export const UI_ROOMS: UiRoom[] = ROOMS.filter((r) => r.furniture !== 'empty').map((r) => ({
	id: r.id,
	name: r.name,
	short: r.short ?? r.name,
	zone: r.zone,
	zoneName: ZONES[r.zone].name,
	zoneColor: ZONES[r.zone].color,
	tag: r.tag,
	dims: r.dims,
	note: r.note,
	section: sectionOf(r),
	tour: r.tour
}));

// synthetic entry for the combined arrival hall — shown first in the directory
UI_ROOMS.unshift({
	id: 'main-area',
	name: 'Main Area — Reception & Arrival',
	short: 'Main Area',
	zone: 'arrival',
	zoneName: ZONES.arrival.name,
	zoneColor: ZONES.arrival.color,
	tag: 'Arrival',
	dims: '≈ 22 × 8 m',
	note: 'The whole arrival hall — reception, brand gallery and waiting lounge — as one designable space.',
	section: 'experience',
	tour: false
});

// synthetic entry for the central open-plan field
UI_ROOMS.push({
	id: 'workfield',
	name: 'Open Workstations',
	short: 'Open Workstations',
	zone: 'work',
	zoneName: ZONES.work.name,
	zoneColor: ZONES.work.color,
	tag: '60 desks',
	note: 'Central operational zone — sixty 1500×600 workstations in greened clusters with collab spines.',
	section: 'workspace',
	tour: false
});

export function roomsInSection(s: SectionId): UiRoom[] {
	if (s === 'overview') return UI_ROOMS;
	return UI_ROOMS.filter((r) => r.section === s);
}

export const ZONE_LIST = Object.values(ZONES);
