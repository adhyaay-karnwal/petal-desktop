// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/components/DesktopFileLoading.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../packages/cloud/src/hooks/useSession.js";
import { EditorLoadingScreen } from "../../../../../packages/ui/src/components/EditorLoadingScreen.js";
import { logoIcon_default } from "../../../../../packages/cloud/src/assets/logoIcon.png.js";

var FileLoadingContext = (0, import_react.createContext)(() => {});
var useDesktopFileLoading = () => {
	return (0, import_react.useContext)(FileLoadingContext);
};
function hostCoverFor(state) {
	if (state.activeProjectId === null) return "none";
	return state.tabs.find((tab) => tab.projectId === state.activeProjectId)?.loading === false ? "covered" : "loading";
}
function DesktopFileLoading(t0) {
	const $ = (0, import_compiler_runtime.c)(10);
	const { children, projectView } = t0;
	const [loading, setLoading] = (0, import_react.useState)(projectView);
	const [hostCover, setHostCover] = (0, import_react.useState)(projectView ? "none" : "loading");
	let t1;
	let t2;
	if ($[0] !== projectView) {
		t1 = () => {
			if (projectView) return;
			let receivedUpdate = false;
			let disposed = false;
			const unsubscribe = window.api.on("desktop_tabs_changed", (state) => {
				receivedUpdate = true;
				setHostCover(hostCoverFor(state));
			});
			window.api.invoke("desktop_tabs_get").then((state_0) => {
				if (!disposed && !receivedUpdate) setHostCover(hostCoverFor(state_0));
			}).catch(_temp$2);
			return () => {
				disposed = true;
				unsubscribe();
			};
		};
		t2 = [projectView];
		$[0] = projectView;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useEffect)(t1, t2);
	const top = projectView ? 0 : 42;
	let t3;
	if ($[3] !== hostCover || $[4] !== loading || $[5] !== top) {
		t3 = loading || hostCover === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-x-0 bottom-0 z-[100]",
			style: { top },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorLoadingScreen, { logoSrc: logoIcon_default })
		}) : hostCover === "covered" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-x-0 bottom-0 z-[100] bg-ed-background",
			style: { top }
		});
		$[3] = hostCover;
		$[4] = loading;
		$[5] = top;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== children || $[8] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FileLoadingContext.Provider, {
			value: setLoading,
			children: [children, t3]
		});
		$[7] = children;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	return t4;
}
function _temp$2() {}

export { DesktopFileLoading, useDesktopFileLoading };
