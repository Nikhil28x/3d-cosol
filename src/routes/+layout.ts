// This app is a fully client-side WebGL experience (Three.js). There is no
// server logic, so we disable SSR and prerender the page shell as a static
// asset — this avoids loading browser-only Three.js code on the server
// (which crashed the Vercel serverless function) and removes the function
// from the deploy entirely.
export const ssr = false;
export const prerender = true;
