import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["app-screenshots/client-dashboard.png","app-screenshots/client-messages.png","app-screenshots/client-profile.png","app-screenshots/client-sessions.png","app-screenshots/client-therapists.png","app-screenshots/client-worksheets.png","app-screenshots/home.png","app-screenshots/login.png","app-screenshots/preassessment-checklist.png","app-screenshots/preassessment-forms.png","app-screenshots/therapist-dashboard.png","app-screenshots/therapist-scheduling.png","app-screenshots/therapist-worksheets.png","avatar-placeholder.png","favicon.ico","fonts/Futura Md BT Medium.ttf","fonts/Kollektif-Bold.ttf","fonts/Kollektif-BoldItalic.ttf","fonts/Kollektif-Italic.ttf","fonts/Kollektif.ttf","icons/brain.png","icons/community.svg","icons/dashboard.svg","icons/mentara/mentara-icon.png","icons/mentara/mentara-landscape.png","icons/mentara/mentara-with-text.png","icons/messages.svg","icons/sessions.svg","icons/therapist.svg","icons/worksheets.svg","laine.jpg","pages/about/our-story.jpg","pages/landing/woman-flower-crown.png","robots.txt","team/sajulga.jpg","team/segundo.jpg","team/tolentino.jpg","woman-flower-crown.png"]),
	mimeTypes: {".png":"image/png",".ttf":"font/ttf",".svg":"image/svg+xml",".jpg":"image/jpeg",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.DbyYUW1P.js",app:"_app/immutable/entry/app.BJE5z08I.js",imports:["_app/immutable/entry/start.DbyYUW1P.js","_app/immutable/chunks/BHcdja7X.js","_app/immutable/chunks/DGNEGb3f.js","_app/immutable/chunks/BewDUm5m.js","_app/immutable/entry/app.BJE5z08I.js","_app/immutable/chunks/DGNEGb3f.js","_app/immutable/chunks/C6BjpI8V.js","_app/immutable/chunks/DIWaqjXu.js","_app/immutable/chunks/BewDUm5m.js","_app/immutable/chunks/BGU2TdNx.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js')),
			__memo(() => import('../server/nodes/2.js')),
			__memo(() => import('../server/nodes/3.js')),
			__memo(() => import('../server/nodes/4.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/submit-demo",
				pattern: /^\/api\/submit-demo\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/submit-demo/_server.ts.js'))
			},
			{
				id: "/demo",
				pattern: /^\/demo\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
