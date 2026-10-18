// Offline stand-in for the PostHog client. Feature flags start from the values
// the production app had enabled; nothing is sent anywhere.
var LOCAL_FEATURE_FLAGS = {
	"external-mcp": true,
	"skill-customization": false,
	"agents-v2": false,
	"design-system-audit": false,
	"left-sidebar-v2": true,
	"editor-theme-switcher": true,
	"local-files": false,
	"component-edit-v2": true,
	"files-panel": false,
	"project-css-editor": true,
	"webview-edit": true,
	"import-project": false,
	"project-remix-link": true
};
function createLocalPostHog(flags = LOCAL_FEATURE_FLAGS) {
	let distinctId = "local";
	const props = {};
	const client = {
		featureFlags: { hasLoadedFlags: true },
		conversations: { sendMessage: async () => null },
		getFeatureFlag: (flag) => flags[flag],
		isFeatureEnabled: (flag) => flags[flag] === true,
		getFeatureFlagPayload: () => void 0,
		onFeatureFlags: (cb) => {
			queueMicrotask(() => cb(Object.keys(flags).filter((k) => flags[k]), flags));
			return () => {};
		},
		reloadFeatureFlags: () => {},
		identify: (id) => {
			distinctId = id;
			props.$user_state = "identified";
		},
		reset: () => {
			distinctId = "local";
			delete props.$user_state;
		},
		get_distinct_id: () => distinctId,
		get_property: (key) => props[key],
		capture: () => void 0
	};
	return new Proxy(client, { get: (target, key) => key in target ? target[key] : () => void 0 });
}
export { LOCAL_FEATURE_FLAGS, createLocalPostHog };
