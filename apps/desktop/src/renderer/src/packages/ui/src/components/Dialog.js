// Reconstructed from index-C74mRL57.js — original module: packages/ui/src/components/Dialog.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../cloud/src/hooks/useSession.js";
import { cn$2 } from "../lib/utils.js";
import { XIcon } from "../icons.js";
import { Button } from "./Button.js";
import { Close, Content$1, Description, Overlay, Portal$3, Root$3, Title } from "../../../../vendor/@radix-ui/react-dialog.js";

var DialogLayoutContext = import_react.createContext({
	legacy: false,
	showCloseButton: true
});
function Dialog(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	let props;
	if ($[0] !== t0) {
		({...props} = t0);
		$[0] = t0;
		$[1] = props;
	} else props = $[1];
	let t1;
	if ($[2] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root$3, {
			"data-slot": "dialog",
			...props
		});
		$[2] = props;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function DialogPortal(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	let props;
	if ($[0] !== t0) {
		({...props} = t0);
		$[0] = t0;
		$[1] = props;
	} else props = $[1];
	let t1;
	if ($[2] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal$3, {
			"data-slot": "dialog-portal",
			...props
		});
		$[2] = props;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function DialogClose(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	let props;
	if ($[0] !== t0) {
		({...props} = t0);
		$[0] = t0;
		$[1] = props;
	} else props = $[1];
	let t1;
	if ($[2] !== props) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Close, {
			"data-slot": "dialog-close",
			...props
		});
		$[2] = props;
		$[3] = t1;
	} else t1 = $[3];
	return t1;
}
function DialogOverlay(t0) {
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
		t1 = cn$2("fixed inset-0 z-50 bg-black/50", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
			"data-slot": "dialog-overlay",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
/**
* The shared modal surface: app background, subtle divider border, 12px radius, popover
* shadow, no padding of its own. Compose it from DialogHeader, DialogBody and DialogFooter,
* which carry the padding. Only the header and footer add divider lines.
*
* Centered with auto margins rather than a 50% transform: a transform of half an odd height
* lands the 1px border on a half pixel and the top edge antialiases away.
*/
function DialogContent(t0) {
	const $ = (0, import_compiler_runtime.c)(24);
	let children;
	let className;
	let props;
	let t1;
	let t2;
	if ($[0] !== t0) {
		({className, children, showCloseButton: t1, layout: t2, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = props;
		$[4] = t1;
		$[5] = t2;
	} else {
		children = $[1];
		className = $[2];
		props = $[3];
		t1 = $[4];
		t2 = $[5];
	}
	const showCloseButton = t1 === void 0 ? true : t1;
	const legacy = (t2 === void 0 ? "modal" : t2) === "legacy";
	let t3;
	if ($[6] !== legacy || $[7] !== showCloseButton) {
		t3 = {
			legacy,
			showCloseButton
		};
		$[6] = legacy;
		$[7] = showCloseButton;
		$[8] = t3;
	} else t3 = $[8];
	const context = t3;
	let t4;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {});
		$[9] = t4;
	} else t4 = $[9];
	const t5 = legacy ? "bg-ed-popover text-ed-popover-foreground fixed top-[50%] left-[50%] z-50 grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-ed-border p-6 shadow-ed-popover" : "fixed inset-0 z-50 m-auto flex h-fit max-h-[calc(100%-2rem)] w-[calc(100%-2rem)] max-w-[440px] flex-col overflow-x-hidden overflow-y-auto rounded-[12px] border border-ed-divider bg-ed-background text-ed-foreground shadow-ed-popover";
	let t6;
	if ($[10] !== className || $[11] !== t5) {
		t6 = cn$2(t5, className);
		$[10] = className;
		$[11] = t5;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== legacy || $[14] !== showCloseButton) {
		t7 = legacy && showCloseButton && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Close, {
			className: "absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 focus:ring-2 focus:ring-ed-ring focus:outline-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		});
		$[13] = legacy;
		$[14] = showCloseButton;
		$[15] = t7;
	} else t7 = $[15];
	let t8;
	if ($[16] !== children || $[17] !== context || $[18] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogLayoutContext.Provider, {
			value: context,
			children: [children, t7]
		});
		$[16] = children;
		$[17] = context;
		$[18] = t7;
		$[19] = t8;
	} else t8 = $[19];
	let t9;
	if ($[20] !== props || $[21] !== t6 || $[22] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, {
			"data-slot": "dialog-portal",
			children: [t4, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content$1, {
				"data-slot": "dialog-content",
				"data-dismissable-layer": "",
				className: t6,
				...props,
				children: t8
			})]
		});
		$[20] = props;
		$[21] = t6;
		$[22] = t8;
		$[23] = t9;
	} else t9 = $[23];
	return t9;
}
/**
* Title bar: the title on the left, the close button on the right, and an optional
* DialogDescription on a second line under the title. Laid out as a grid so the close
* button stays centred on the title line whether or not a description follows.
*/
function DialogHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	let children;
	let className;
	let props;
	let showCloseButton;
	if ($[0] !== t0) {
		({className, children, showCloseButton, ...props} = t0);
		$[0] = t0;
		$[1] = children;
		$[2] = className;
		$[3] = props;
		$[4] = showCloseButton;
	} else {
		children = $[1];
		className = $[2];
		props = $[3];
		showCloseButton = $[4];
	}
	const layout = import_react.useContext(DialogLayoutContext);
	const t1 = layout.legacy ? "flex flex-col gap-2 text-left" : "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-ed-divider px-5 py-2 text-left";
	let t2;
	if ($[5] !== className || $[6] !== t1) {
		t2 = cn$2(t1, className);
		$[5] = className;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	let t3;
	if ($[8] !== layout.legacy || $[9] !== layout.showCloseButton || $[10] !== showCloseButton) {
		t3 = !layout.legacy && (showCloseButton ?? layout.showCloseButton) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "ghost",
				size: "icon-xs",
				"aria-label": "Close",
				LeftIcon: XIcon,
				className: "col-start-2 row-start-1 -mr-1.5"
			})
		});
		$[8] = layout.legacy;
		$[9] = layout.showCloseButton;
		$[10] = showCloseButton;
		$[11] = t3;
	} else t3 = $[11];
	let t4;
	if ($[12] !== children || $[13] !== props || $[14] !== t2 || $[15] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"data-slot": "dialog-header",
			className: t2,
			...props,
			children: [children, t3]
		});
		$[12] = children;
		$[13] = props;
		$[14] = t2;
		$[15] = t3;
		$[16] = t4;
	} else t4 = $[16];
	return t4;
}
/**
* One content section. Adjacent sections share a single spacing step without a divider.
* Header and footer separators are supplied by their respective components.
*/
function DialogBody(t0) {
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
		t1 = cn$2("flex shrink-0 flex-col gap-4 px-5 py-4 text-ed-ui leading-4 text-ed-foreground [[data-slot=dialog-body]+&]:pt-0", className);
		$[3] = className;
		$[4] = t1;
	} else t1 = $[4];
	let t2;
	if ($[5] !== props || $[6] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-slot": "dialog-body",
			className: t1,
			...props
		});
		$[5] = props;
		$[6] = t1;
		$[7] = t2;
	} else t2 = $[7];
	return t2;
}
function DialogFooter(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
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
	const { legacy } = import_react.useContext(DialogLayoutContext);
	const t1 = legacy ? "flex flex-row justify-end gap-2" : "flex shrink-0 flex-row items-center justify-end gap-2 border-t border-ed-divider px-5 py-3";
	let t2;
	if ($[3] !== className || $[4] !== t1) {
		t2 = cn$2(t1, className);
		$[3] = className;
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"data-slot": "dialog-footer",
			className: t2,
			...props
		});
		$[6] = props;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}
function DialogTitle(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
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
	const { legacy } = import_react.useContext(DialogLayoutContext);
	const t1 = legacy ? "text-ed-foreground text-lg leading-none font-semibold" : "col-start-1 min-h-6.5 content-center text-ed-ui leading-4 font-medium text-ed-foreground";
	let t2;
	if ($[3] !== className || $[4] !== t1) {
		t2 = cn$2(t1, className);
		$[3] = className;
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title, {
			"data-slot": "dialog-title",
			className: t2,
			...props
		});
		$[6] = props;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}
function DialogDescription(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
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
	const { legacy } = import_react.useContext(DialogLayoutContext);
	const t1 = legacy ? "text-ed-muted-foreground text-sm" : "col-start-1 text-[11px] leading-4 text-pretty text-ed-muted-foreground [[data-slot=dialog-header]>&]:pb-1";
	let t2;
	if ($[3] !== className || $[4] !== t1) {
		t2 = cn$2(t1, className);
		$[3] = className;
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	let t3;
	if ($[6] !== props || $[7] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description, {
			"data-slot": "dialog-description",
			className: t2,
			...props
		});
		$[6] = props;
		$[7] = t2;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle };
