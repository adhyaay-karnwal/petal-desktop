// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/contexts/AssetContext.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

var defaultResolver = (url) => url;
var AssetContext = (0, import_react.createContext)(defaultResolver);
function AssetProvider(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { resolver, children } = t0;
	const resolverFn = resolver || defaultResolver;
	let t1;
	if ($[0] !== children || $[1] !== resolverFn) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AssetContext.Provider, {
			value: resolverFn,
			children
		});
		$[0] = children;
		$[1] = resolverFn;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}
function useAssetResolver() {
	return (0, import_react.useContext)(AssetContext);
}

export { AssetProvider, useAssetResolver };
