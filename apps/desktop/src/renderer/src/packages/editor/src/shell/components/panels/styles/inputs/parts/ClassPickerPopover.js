// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/inputs/parts/ClassPickerPopover.tsx
import { import_jsx_runtime } from "../../../../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../../../../cloud/src/hooks/useSession.js";
import { InspectorPopoverContent } from "../../InspectorPopover.js";
import { ClassPickerContent } from "../ClassPickerContent.js";

/**
* The inspector popover + ClassPickerContent pairing shared by every style
* input that offers Tailwind-class suggestions.
*/
function ClassPickerPopover(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { suggestions, cssProperty, sourceClass, onSelect, onClose } = t0;
	let t1;
	if ($[0] !== cssProperty || $[1] !== onClose || $[2] !== onSelect || $[3] !== sourceClass || $[4] !== suggestions) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorPopoverContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClassPickerContent, {
			suggestions,
			cssProperty,
			sourceClass,
			onSelect,
			onClose
		}) });
		$[0] = cssProperty;
		$[1] = onClose;
		$[2] = onSelect;
		$[3] = sourceClass;
		$[4] = suggestions;
		$[5] = t1;
	} else t1 = $[5];
	return t1;
}

export { ClassPickerPopover };
