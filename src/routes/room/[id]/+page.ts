import { error } from '@sveltejs/kit';
import { ROOM_IDS } from '$lib/room/layouts';

// Pure client-side WebGL, like the index — no SSR. Prerender a static shell for
// every room so the whole app stays a static deploy (no serverless functions).
export const ssr = false;
export const prerender = true;

export function entries() {
	return ROOM_IDS.map((id) => ({ id }));
}

export function load({ params }: { params: { id: string } }) {
	if (!ROOM_IDS.includes(params.id)) throw error(404, `No room "${params.id}"`);
	return { id: params.id };
}
