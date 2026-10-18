// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/backends/BackendContext.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";

var BackendContext = (0, import_react.createContext)(null);
/**
* Provider for the PetalBackend.
* 
* Usage:
* ```tsx
* // For web/dev with fetch backend
* <BackendProvider backend={fetchBackend}>
*   <PetalEditor />
* </BackendProvider>
* 
* // For Tauri desktop app
* <BackendProvider backend={tauriBackend}>
*   <PetalEditor />
* </BackendProvider>
* ```
*/
function BackendProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { backend, children } = t0;
	let t1;
	if ($[0] !== backend) {
		t1 = { backend };
		$[0] = backend;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== children || $[3] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackendContext.Provider, {
			value: t1,
			children
		});
		$[2] = children;
		$[3] = t1;
		$[4] = t2;
	} else t2 = $[4];
	return t2;
}
/**
* Hook to access the PetalBackend.
* 
* @throws Error if used outside of BackendProvider
*/
function useBackend() {
	const context = (0, import_react.useContext)(BackendContext);
	if (!context) throw new Error("useBackend must be used within a BackendProvider");
	return context.backend;
}
/**
* Hook to optionally access the PetalBackend.
* Returns null if not within a BackendProvider.
* 
* Useful for gradual migration where backend might not be available.
*/
function useBackendOptional() {
	return (0, import_react.useContext)(BackendContext)?.backend ?? null;
}

export { BackendProvider, useBackend, useBackendOptional };
