export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","favicon.svg","walkthrough/conference.mp4","walkthrough/demo.mp4","walkthrough/digital-lab.mp4","walkthrough/podcast.mp4","walkthrough/reception.mp4","walkthrough/security.mp4"]),
	mimeTypes: {".svg":"image/svg+xml",".mp4":"video/mp4"},
	_: {
		client: {start:"_app/immutable/entry/start.DJxyz24l.js",app:"_app/immutable/entry/app.BQN04Fe-.js",imports:["_app/immutable/entry/start.DJxyz24l.js","_app/immutable/chunks/CCk7ttlD.js","_app/immutable/chunks/CERoudke.js","_app/immutable/chunks/DB30q7mk.js","_app/immutable/chunks/BiP7d6Yf.js","_app/immutable/chunks/-UyI9lYi.js","_app/immutable/entry/app.BQN04Fe-.js","_app/immutable/chunks/CERoudke.js","_app/immutable/chunks/BAj-gdhS.js","_app/immutable/chunks/BZF36lAy.js","_app/immutable/chunks/BiP7d6Yf.js","_app/immutable/chunks/ByGwLUsU.js","_app/immutable/chunks/DkFCrrF_.js","_app/immutable/chunks/COgAXcJ6.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/explore","/reel","/room/main-area","/room/reception","/room/lounge","/room/podcast","/room/demo","/room/conference","/room/digital-lab","/room/server","/room/dock","/room/security","/room/it","/room/tac","/room/exe-cabin-1","/room/exe-cabin-2","/room/printer","/room/nap-1","/room/nap-2","/room/ups","/room/battery","/room/collab-1","/room/phone-top-1","/room/phone-top-2","/room/phone-bot-1","/room/phone-bot-2","/room/phone-bot-3","/room/mt-4pax","/room/mt-8pax-top","/room/mt-6pax","/room/cabin-e1","/room/cabin-e2","/room/cabin-e3","/room/cabin-e4","/room/mt-4pax-e","/room/cabin-s1","/room/cabin-s2","/room/mt-8pax-bot","/room/cabin-s3","/room/cabin-s4","/room/exe-cabin-s","/room/pantry","/room/mezz-pod-1","/room/mezz-pod-2","/room/store","/room/workfield"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
