// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ProjectSearchNavContext.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";

var Context = (0, import_react.createContext)(null);
function ProjectSearchNavProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { value, children } = t0;
	let t1;
	if ($[0] !== children || $[1] !== value) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Context.Provider, {
			value,
			children
		});
		$[0] = children;
		$[1] = value;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}
/** Null outside a `ProjectsPage` — the sidebar renders standalone in places. */
function useProjectSearchNav() {
	return (0, import_react.useContext)(Context);
}

export { ProjectSearchNavProvider, useProjectSearchNav };
