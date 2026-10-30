import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Pin the Vercel serverless runtime to the project's supported Node line.
		adapter: adapter({ runtime: 'nodejs24.x' })
	}
};

export default config;
