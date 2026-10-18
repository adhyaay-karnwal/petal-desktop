// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/ButtonGroup.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { cva } from "../../../../vendor/class-variance-authority.js";

var buttonGroupVariants = cva("flex w-fit items-stretch has-[>[data-slot=button-group]]:gap-2 [&>*]:focus-visible:relative [&>*]:focus-visible:z-10 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-md [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1", {
	variants: { orientation: {
		horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
		vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none"
	} },
	defaultVariants: { orientation: "horizontal" }
});
function ButtonGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(11);
	let className;
	let orientation;
	let props;
	if ($[0] !== t0) {
		({className, orientation, ...props} = t0);
		$[0] = t0;
		$[1] = className;
		$[2] = orientation;
		$[3] = props;
	} else {
		className = $[1];
		orientation = $[2];
		props = $[3];
	}
	const t1 = orientation ?? "horizontal";
	let t2;
	if ($[4] !== className || $[5] !== orientation) {
		t2 = cn$2(buttonGroupVariants({ orientation }), className);
		$[4] = className;
		$[5] = orientation;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== props || $[8] !== t1 || $[9] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "group",
			"data-slot": "button-group",
			"data-orientation": t1,
			className: t2,
			...props
		});
		$[7] = props;
		$[8] = t1;
		$[9] = t2;
		$[10] = t3;
	} else t3 = $[10];
	return t3;
}

export { ButtonGroup };
