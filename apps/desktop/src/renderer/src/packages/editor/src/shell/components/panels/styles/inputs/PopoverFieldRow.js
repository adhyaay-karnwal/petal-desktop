// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/PopoverFieldRow.tsx
import { import_jsx_runtime } from "../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../cloud/src/hooks/useSession.js";

/** Label + control row for picker popovers. Every control shares one column, so rows align. */
function PopoverFieldRow(t0) {
	const $ = (0, import_compiler_runtime.c)(3);
	const { label, children } = t0;
	let t1;
	if ($[0] !== children || $[1] !== label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[minmax(0,1fr)_112px] items-center gap-x-2",
			children: [label, children]
		});
		$[0] = children;
		$[1] = label;
		$[2] = t1;
	} else t1 = $[2];
	return t1;
}

export { PopoverFieldRow };
