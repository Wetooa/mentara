export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["app-screenshots/client-community-sessions.png","app-screenshots/client-community.png","app-screenshots/client-dashboard.png","app-screenshots/client-messages.png","app-screenshots/client-profile.png","app-screenshots/client-sessions.png","app-screenshots/client-therapists.png","app-screenshots/client-worksheet-details.png","app-screenshots/client-worksheets.png","app-screenshots/clients-worksheets.png","app-screenshots/home.png","app-screenshots/loading-matching.png","app-screenshots/login.png","app-screenshots/matching-communities.png","app-screenshots/matching-therapists.png","app-screenshots/preassessment-checklist.png","app-screenshots/preassessment-form.png","app-screenshots/therapist-application.png","app-screenshots/therapist-availability.png","app-screenshots/therapist-clients.png","app-screenshots/therapist-dashboard.png","app-screenshots/therapist-scheduling.png","app-screenshots/therapist-worksheet.png","app-screenshots/verify-login.png","avatar-placeholder.png","favicon.ico","fonts/Futura Md BT Medium.ttf","fonts/Kollektif-Bold.ttf","fonts/Kollektif-BoldItalic.ttf","fonts/Kollektif-Italic.ttf","fonts/Kollektif.ttf","icons/brain.png","icons/community.svg","icons/dashboard.svg","icons/mentara/mentara-icon.png","icons/mentara/mentara-landscape.png","icons/mentara/mentara-with-text.png","icons/messages.svg","icons/sessions.svg","icons/therapist.svg","icons/worksheets.svg","laine.jpg","pages/about/our-story.jpg","pages/landing/woman-flower-crown.png","robots.txt","team/sajulga.jpg","team/segundo.jpg","team/tolentino.jpg","woman-flower-crown.png"]),
	mimeTypes: {".png":"image/png",".ttf":"font/ttf",".svg":"image/svg+xml",".jpg":"image/jpeg",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.Bf9LtgdI.js",app:"_app/immutable/entry/app.CI5Xx9zM.js",imports:["_app/immutable/entry/start.Bf9LtgdI.js","_app/immutable/chunks/CzDmtF2t.js","_app/immutable/chunks/BMebIUkI.js","_app/immutable/chunks/BtlrYmoI.js","_app/immutable/entry/app.CI5Xx9zM.js","_app/immutable/chunks/BMebIUkI.js","_app/immutable/chunks/Dh27SG2G.js","_app/immutable/chunks/d3Ausehq.js","_app/immutable/chunks/BtlrYmoI.js","_app/immutable/chunks/BawLbpPg.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js'))
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
				endpoint: __memo(() => import('./entries/endpoints/api/submit-demo/_server.ts.js'))
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
})();
