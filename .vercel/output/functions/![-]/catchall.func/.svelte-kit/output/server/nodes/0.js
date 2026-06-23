

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CuCgOx9f.js","_app/immutable/chunks/CENLX1kc.js","_app/immutable/chunks/QQ9aj7Ru.js","_app/immutable/chunks/C3GP_Uj8.js"];
export const stylesheets = ["_app/immutable/assets/0.C1Ucf1np.css"];
export const fonts = [];
