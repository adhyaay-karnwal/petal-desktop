// Reconstructed from index-C74mRL57.js — original module: vendor/@radix-ui/react-use-is-hydrated
import { require_shim } from "../use-sync-external-store.js";

var import_shim = require_shim();
function useIsHydrated() {
	return (0, import_shim.useSyncExternalStore)(subscribe$1, () => true, () => false);
}
function subscribe$1() {
	return () => {};
}

export { import_shim, useIsHydrated };
