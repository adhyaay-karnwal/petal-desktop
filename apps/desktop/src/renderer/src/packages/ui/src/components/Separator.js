// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Separator.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Root$2 } from "../../../../vendor/@radix-ui/react-separator.js";

function Separator(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	let className;
	let props;
	let t1;
	let t2;
	if ($[0] !== t0) {
		({className, orientation: t1, decorative: t2, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = props;
		$[3] = t1;
		$[4] = t2;
	} else {
		className = $[1];
		props = $[2];
		t1 = $[3];
		t2 = $[4];
	}
	const orientation = t1 === void 0 ? "horizontal" : t1;
	const decorative = t2 === void 0 ? true : t2;
	let t3;
	if ($[5] !== className) {
		t3 = cn$2("bg-ed-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", className);
		$[5] = className;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== decorative || $[8] !== orientation || $[9] !== props || $[10] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$2, {
			"data-slot": "separator",
			decorative,
			orientation,
			className: t3,
			...props
		});
		$[7] = decorative;
		$[8] = orientation;
		$[9] = props;
		$[10] = t3;
		$[11] = t4;
	} else t4 = $[11];
	return t4;
}

export { Separator };
