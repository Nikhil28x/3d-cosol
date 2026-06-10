export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.CBzKESlo.js",app:"_app/immutable/entry/app.qj9PJsyS.js",imports:["_app/immutable/entry/start.CBzKESlo.js","_app/immutable/chunks/CTUECO15.js","_app/immutable/chunks/DDhsS-Wm.js","_app/immutable/chunks/QNxlJi4g.js","_app/immutable/entry/app.qj9PJsyS.js","_app/immutable/chunks/DDhsS-Wm.js","_app/immutable/chunks/ihNSxD_9.js","_app/immutable/chunks/a6X0N27H.js","_app/immutable/chunks/QNxlJi4g.js","_app/immutable/chunks/C1KfLP2s.js","_app/immutable/chunks/B3yufWZ0.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
