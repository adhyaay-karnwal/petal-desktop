// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/idUtils.ts
import { nanoid$1 } from "../../../../../vendor/nanoid.js";

/**
* Generate an ID with a prefix (e.g., "element-", "component-")
* Used for local canvas element IDs, NOT for database entity IDs.
*/
function generatePrefixedId(prefix) {
	return `${prefix}-${nanoid$1()}`;
}

export { generatePrefixedId };
