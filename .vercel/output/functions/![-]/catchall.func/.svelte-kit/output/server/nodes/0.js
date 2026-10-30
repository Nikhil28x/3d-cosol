

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BkmwsEwx.js","_app/immutable/chunks/Cmc5WvyW.js","_app/immutable/chunks/C-sctB2i.js","_app/immutable/chunks/DA3CHA85.js"];
export const stylesheets = ["_app/immutable/assets/0.C1Ucf1np.css"];
export const fonts = [];
