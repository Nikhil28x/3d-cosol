/* ============================================================================
   CINEMATIC ROOM WALKTHROUGHS
   ----------------------------------------------------------------------------
   Fly-through clips, keyed by room id (same ids as layouts.ts / planData.ts).
   Add an entry as each room's clip is produced; the room page automatically
   surfaces a "▶ Walkthrough" player whenever its id appears here.
   Files live in /static/walkthrough/.
   ========================================================================== */
import { base } from '$app/paths';
import { docForRoom } from '../room/layouts';

export interface Walkthrough {
	file: string; // file under /static/walkthrough/
	note?: string; // short description of the shot, shown in the caption
}

/** Narrative order for the continuous scroll walkthrough (/walkthrough-demo).
   Ids not present in WALKTHROUGHS are skipped; new clips slot in automatically. */
export const TOUR_ORDER: string[] = [
	'reception',
	'demo',
	'digital-lab',
	'conference',
	'podcast',
	'security'
];

/** One chapter of the scroll tour, resolved with its editorial doc. */
export interface TourStop {
	id: string;
	name: string;
	zoneName: string;
	zoneColor: string;
	tagline: string;
	src: string;
	note?: string;
}

export function tourStops(): TourStop[] {
	const stops: TourStop[] = [];
	for (const id of TOUR_ORDER) {
		const w = WALKTHROUGHS[id];
		if (!w) continue;
		const doc = docForRoom(id);
		stops.push({
			id,
			name: doc?.name ?? id,
			zoneName: doc?.zoneName ?? '',
			zoneColor: doc?.zoneColor ?? '#00aeef',
			tagline: doc?.tagline ?? '',
			src: `${base}/walkthrough/${w.file}`,
			note: w.note
		});
	}
	return stops;
}

export const WALKTHROUGHS: Record<string, Walkthrough> = {
	reception: {
		file: 'reception.mp4',
		note: 'Forward dolly past the brand counter to the curved video wall'
	},
	demo: {
		file: 'demo.mp4',
		note: 'Glide between the demo consoles and iStandee panels'
	},
	'digital-lab': {
		file: 'digital-lab.mp4',
		note: 'Approach the Pro-Touch interactive table past the server racks'
	},
	conference: {
		file: 'conference.mp4',
		note: 'Glide along the boardroom table toward the GLOBAL DASHBOARD video wall'
	},
	podcast: {
		file: 'podcast.mp4',
		note: 'Move in to the podcast table with gooseneck mics and AV displays'
	},
	security: {
		file: 'security.mp4',
		note: 'Sweep past the command desks to the Active Connections data wall'
	}
};

/** Public src for a room's walkthrough video, or null if none exists yet. */
export function walkthroughSrc(id: string): string | null {
	const w = WALKTHROUGHS[id];
	return w ? `${base}/walkthrough/${w.file}` : null;
}

export function walkthroughFor(id: string): Walkthrough | null {
	return WALKTHROUGHS[id] ?? null;
}
