// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/HoverCard.tsx
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { Content2$1, Portal$1, Root2$3, Trigger$2 } from "../../../../vendor/@radix-ui/react-hover-card.js";

function HoverCard(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	let props;
	if ($[0] !== t0) {
		({...props} = t0);
		$[0] = t0;
		$[1] = props;
	} else props = $[1];
	let t1;
	if ($[2] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2$3, {
			"data-slot": "hover-card",
			...props
		});
		$[2] = props;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function HoverCardTrigger(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	let props;
	if ($[0] !== t0) {
		({...props} = t0);
		$[0] = t0;
		$[1] = props;
	} else props = $[1];
	let t1;
	if ($[2] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger$2, {
			"data-slot": "hover-card-trigger",
			...props
		});
		$[2] = props;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function HoverCardContent(t0) {
	const $ = (0, import_compiler_runtime.c)(12);
	let className;
	let props;
	let t1;
	let t2;
	if ($[0] !== t0) {
		({className, align: t1, sideOffset: t2, ...props} = t0);
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
	const align = t1 === void 0 ? "center" : t1;
	const sideOffset = t2 === void 0 ? 4 : t2;
	let t3;
	if ($[5] !== className) {
		t3 = cn$2("z-50 w-64 rounded-xl border border-ed-border bg-ed-popover text-ed-popover-foreground shadow-ed-popover outline-hidden", className);
		$[5] = className;
		$[6] = t3;
	} else t3 = $[6];
	let t4;
	if ($[7] !== align || $[8] !== props || $[9] !== sideOffset || $[10] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$1, {
			"data-slot": "hover-card-portal",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2$1, {
				"data-slot": "hover-card-content",
				align,
				sideOffset,
				className: t3,
				...props
			})
		});
		$[7] = align;
		$[8] = props;
		$[9] = sideOffset;
		$[10] = t3;
		$[11] = t4;
	} else t4 = $[11];
	return t4;
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
