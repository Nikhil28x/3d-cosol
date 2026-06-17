

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BG5au5gJ.js","_app/immutable/chunks/CTykrBCV.js","_app/immutable/chunks/D7uyVuyn.js","_app/immutable/chunks/C0VCD1CY.js"];
export const stylesheets = ["_app/immutable/assets/0.C1Ucf1np.css"];
export const fonts = [];
