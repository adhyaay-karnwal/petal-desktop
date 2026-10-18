// Reconstructed from index.js — original module: packages/compiler/src/runtime/settingsParser.ts
import { import_lib$2 } from "../codegen/saveToCode.js";

/**
* Petal pre-bundles the default icon libraries in the editor
* runtime, so they are always available even if the project's package.json
* doesn't list them. `set_icon_library` (MCP) writes to DB settings, and we
* must honor that even on a project with no icon dep — otherwise the Icons
* tab silently disappears after import.
*/
var BUNDLED_ICON_LIBRARIES = /* @__PURE__ */ new Set([
	"lucide-react",
	"@phosphor-icons/react",
	"@heroicons/react/24/outline",
	"@heroicons/react/24/solid",
	"@heroicons/react/20/solid"
]);
function isLoadableIconLibrary(library) {
	const segment = "[a-z0-9][a-z0-9._~-]*";
	return new RegExp(`^(@${segment}\\/${segment}|${segment})(\\/${segment})*$`).test(library);
}
function isLikelyIconLibraryPackage(name) {
	if (!isLoadableIconLibrary(name)) return false;
	if (BUNDLED_ICON_LIBRARIES.has(name)) return true;
	if (name === "@mui/icons-material" || name === "@tabler/icons-react" || name === "react-icons") return true;
	return /(?:^|[\/@_-])icons?(?:$|[\/_-])/.test(name);
}
import_lib$2.default.default || import_lib$2.default;

export { isLikelyIconLibraryPackage, isLoadableIconLibrary };
