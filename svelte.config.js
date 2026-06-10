import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// pin the Vercel serverless runtime so the build doesn't depend on the
		// build machine's Node version (Vercel was running Node 24)
		adapter: adapter({ runtime: 'nodejs20.x' })
	}
};

export default config;
