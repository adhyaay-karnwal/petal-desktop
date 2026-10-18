// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/components/PanelDivider.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../../../../ui/src/lib/utils.js";
import { PanelResizeHandle, disableGlobalCursorStyles } from "../../../../../vendor/react-resizable-panels.js";

disableGlobalCursorStyles();
/**
* Horizontal divider between two vertically stacked panels. An invisible strip,
* as tall as the library's hit area, shows the resize cursor on hover; while
* dragging it covers the window so the cursor stays when the pointer leaves it.
*/
function PanelDivider(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	let className;
	let props;
	if ($[0] !== t0) {
		({className, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
	} else {
		className = $[1];
		props = $[2];
	}
	let t1;
	if ($[3] !== className) {
		t1 = cn$2("relative h-px cursor-ns-resize", "after:absolute after:inset-x-0 after:-inset-y-[5px] after:z-10 after:cursor-ns-resize", "data-[resize-handle-state=drag]:after:fixed data-[resize-handle-state=drag]:after:inset-0 data-[resize-handle-state=drag]:after:z-[9999]", "data-[panel-resize-handle-enabled=false]:cursor-auto data-[panel-resize-handle-enabled=false]:after:hidden", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelResizeHandle, {
			...props,
			className: t1
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}

export { PanelDivider };
