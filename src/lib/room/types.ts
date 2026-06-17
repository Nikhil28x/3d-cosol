/* Shared types for the per-room 3D designer. */

export type Accent = 'cool' | 'warm';
export type RoomPartition = 'glass' | 'solid' | 'open' | 'half';

/** One piece of furniture placed in a room, in room-local metres (origin = room centre). */
export interface PlacedObject {
	id: string;
	kind: string; // key into CATALOG
	x: number;
	z: number;
	rot: number; // radians about Y
	scale?: number; // uniform scale, default 1
}

/** The editable 3D scene for a single room. */
export interface RoomScene {
	id: string;
	name: string;
	zone: string; // ZoneId
	w: number; // metres (X)
	d: number; // metres (Z)
	wallH: number;
	partition: RoomPartition;
	floorColor: string; // hex of the floor finish
	accent: Accent; // lighting mood
	objects: PlacedObject[];
}

/** Rich, deck-derived editorial content shown alongside the 3D room. */
export interface RoomDoc {
	id: string;
	name: string;
	zone: string;
	zoneName: string;
	zoneColor: string;
	section: string;
	tagline: string;
	summary: string;
	area?: string;
	dims?: string;
	capacity?: string;
	characteristics: string[];
	offers: string[];
	devices: string[];
	palette: { hex: string; name: string }[];
	materials: string[];
}
