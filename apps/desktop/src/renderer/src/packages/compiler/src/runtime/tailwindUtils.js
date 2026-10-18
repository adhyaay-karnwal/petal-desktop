// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/tailwindUtils.ts
import { ROOT } from "../store/types.js";
import { ensureV2 } from "../store/ensureV2.js";
import { getById, walk } from "../store/read.js";

/**
* Shared Tailwind CSS utilities
*
* Pure functions (no I/O, no platform deps) for extracting class names from
* canvas stores. Used by cloud, api, and vite-plugin-petal-local.
*/
/** Walk canvas elements, collect all className strings.
*  Accepts any payload ensureV2 understands: Store, StoreWireV2, legacy
*  FEElement[], or `{ elements: ... }` envelope. */
function extractClassNames(input) {
	const store = ensureV2(input);
	const elements = [];
	walk(store, ROOT, (id) => {
		const el = getById(store, id);
		if (el) elements.push(el);
	});
	return extractElementClassNames(elements);
}
/** className strings of the given elements only, without their descendants. */
function extractElementClassNames(elements) {
	const classNames = /* @__PURE__ */ new Set();
	const add = (value) => {
		if (!value || typeof value !== "string") return;
		for (const cls of value.split(/\s+/)) if (cls) classNames.add(cls);
	};
	for (const el of elements) {
		add(el?.props?.className ?? el?.className);
		add(el?.styles?.className);
	}
	return classNames;
}

export { extractClassNames, extractElementClassNames };
