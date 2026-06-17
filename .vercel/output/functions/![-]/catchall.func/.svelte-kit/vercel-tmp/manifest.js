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
		client: {start:"_app/immutable/entry/start.Du0-lwdE.js",app:"_app/immutable/entry/app.BfhttmK0.js",imports:["_app/immutable/entry/start.Du0-lwdE.js","_app/immutable/chunks/BylqOf8A.js","_app/immutable/chunks/D7uyVuyn.js","_app/immutable/chunks/DcQRpnSg.js","_app/immutable/chunks/CVpxi8Ro.js","_app/immutable/chunks/-UyI9lYi.js","_app/immutable/entry/app.BfhttmK0.js","_app/immutable/chunks/D7uyVuyn.js","_app/immutable/chunks/fipB-h64.js","_app/immutable/chunks/CTykrBCV.js","_app/immutable/chunks/CVpxi8Ro.js","_app/immutable/chunks/BklgrAvZ.js","_app/immutable/chunks/C0VCD1CY.js","_app/immutable/chunks/CP00e2pD.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/room/reception","/room/lounge","/room/podcast","/room/demo","/room/conference","/room/digital-lab","/room/server","/room/dock","/room/security","/room/it","/room/tac","/room/exe-cabin-1","/room/exe-cabin-2","/room/printer","/room/nap-1","/room/nap-2","/room/ups","/room/battery","/room/collab-1","/room/phone-top-1","/room/phone-top-2","/room/phone-bot-1","/room/phone-bot-2","/room/phone-bot-3","/room/mt-4pax","/room/mt-8pax-top","/room/mt-6pax","/room/cabin-e1","/room/cabin-e2","/room/cabin-e3","/room/cabin-e4","/room/mt-4pax-e","/room/cabin-s1","/room/cabin-s2","/room/mt-8pax-bot","/room/cabin-s3","/room/cabin-s4","/room/exe-cabin-s","/room/pantry","/room/mezz-pod-1","/room/mezz-pod-2","/room/store","/room/workfield"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
