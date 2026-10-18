// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/uncompiledClasses.ts
import { getTailwindCategory } from "../../shared/utils/tailwindScale.js";

function classNameOf(el) {
	if (!el) return "";
	if (el.type === "text") return String(el.className ?? "");
	return String(el.props?.className ?? "");
}
var tokens = (className) => String(className ?? "").split(/\s+/).filter(Boolean);
/**
* Utility classes the class edits in `ops` add (set_props, and the replace a
* text node's class edit becomes) that `isCompiled` doesn't know. Inserted
* subtrees aren't scanned: a paste or an agent's paint keeps the debounce.
*/
function addedUncompiledClasses(ops, isCompiled) {
	const added = /* @__PURE__ */ new Set();
	for (const op of ops) {
		let before;
		let after;
		if (op.type === "set_props") {
			before = tokens(op.oldProps?.className);
			after = tokens(op.newProps?.className);
		} else if (op.type === "replace" && op.oldElement.id === op.newElement.id) {
			before = tokens(classNameOf(op.oldElement));
			after = tokens(classNameOf(op.newElement));
		} else continue;
		for (const cls of after) if (!before.includes(cls) && getTailwindCategory(cls) && !isCompiled(cls)) added.add(cls);
	}
	return [...added];
}

export { addedUncompiledClasses };
