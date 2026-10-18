// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/assets/claudeMark.webp
import { import_jsx_runtime } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { cn$2 } from "../../../ui/src/lib/utils.js";
import { Badge } from "../../../ui/src/components/Badge.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { I$2, m$3, m$4, n$3, s$13 } from "../../../../vendor/@phosphor-icons/react.js";
import { Input } from "../../../ui/src/components/Input.js";
import { Checkbox } from "../../../ui/src/components/Checkbox.js";
import { Switch } from "../../../ui/src/components/Switch.js";

var claudeMark_default = "data:image/webp;base64,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";
/** Canvas selection chrome, as drawn on the real editor canvas. */
function SelectionFrame(t0) {
	const $ = (0, import_compiler_runtime.c)(14);
	const { label, tone, midHandles: t1 } = t0;
	const midHandles = t1 === void 0 ? false : t1;
	const border = tone === "selection" ? "border-ed-canvas-selection" : "border-ed-canvas-component";
	const text = tone === "selection" ? "text-ed-canvas-selection" : "text-ed-canvas-component";
	let t2;
	if ($[0] !== border || $[1] !== label || $[2] !== midHandles || $[3] !== text) {
		const handle = cn$2("absolute z-20 size-1.5 rounded-[1px] border-[1.5px] bg-white", border);
		let t3;
		if ($[5] !== border) {
			t3 = cn$2("pointer-events-none absolute inset-0 z-10 border-[1.5px]", border);
			$[5] = border;
			$[6] = t3;
		} else t3 = $[6];
		let t4;
		if ($[7] !== t3) {
			t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: t3 });
			$[7] = t3;
			$[8] = t4;
		} else t4 = $[8];
		let t5;
		if ($[9] !== text) {
			t5 = cn$2("absolute -top-5 left-0 z-10 text-xs leading-none", text);
			$[9] = text;
			$[10] = t5;
		} else t5 = $[10];
		let t6;
		if ($[11] !== label || $[12] !== t5) {
			t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: t5,
				children: label
			});
			$[11] = label;
			$[12] = t5;
			$[13] = t6;
		} else t6 = $[13];
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t4,
			t6,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-top-0.5 -left-0.5") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-top-0.5 -right-0.5") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-bottom-0.5 -left-0.5") }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-bottom-0.5 -right-0.5") }),
			midHandles && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-top-0.5 left-1/2 -translate-x-1/2") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "-bottom-0.5 left-1/2 -translate-x-1/2") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "top-1/2 -left-0.5 -translate-y-1/2") }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn$2(handle, "top-1/2 -right-0.5 -translate-y-1/2") })
			] })
		] });
		$[0] = border;
		$[1] = label;
		$[2] = midHandles;
		$[3] = text;
		$[4] = t2;
	} else t2 = $[4];
	return t2;
}
function PanelShell(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { children, className, fill: t1 } = t0;
	const fill = t1 === void 0 ? false : t1;
	const t2 = fill ? "100%" : 466;
	let t3;
	if ($[0] !== t2) {
		t3 = {
			width: t2,
			height: 416
		};
		$[0] = t2;
		$[1] = t3;
	} else t3 = $[1];
	const t4 = !fill && "mx-auto";
	let t5;
	if ($[2] !== className || $[3] !== t4) {
		t5 = cn$2("relative", t4, className);
		$[2] = className;
		$[3] = t4;
		$[4] = t5;
	} else t5 = $[4];
	let t6;
	if ($[5] !== children || $[6] !== t3 || $[7] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: t3,
			className: t5,
			children
		});
		$[5] = children;
		$[6] = t3;
		$[7] = t5;
		$[8] = t6;
	} else t6 = $[8];
	return t6;
}
/** GitHub's mark. Not Phosphor's GithubLogo — that's a different glyph. */
function GithubMark() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			viewBox: "0 0 24 24",
			width: "13",
			height: "13",
			fill: "currentColor",
			className: "shrink-0 align-text-bottom",
			"aria-hidden": true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M10.303 16.652c-2.837-.344-4.835-2.385-4.835-5.028 0-1.074.387-2.235 1.031-3.008-.279-.709-.236-2.214.086-2.837.86-.107 2.02.344 2.708.967.816-.258 1.676-.386 2.728-.386 1.053 0 1.913.128 2.686.365.666-.602 1.848-1.053 2.708-.946.3.581.344 2.085.064 2.815.688.817 1.053 1.913 1.053 3.03 0 2.643-1.998 4.641-4.877 5.006.73.473 1.224 1.504 1.224 2.686v2.235c0 .644.537 1.01 1.182.752 3.889-1.483 6.94-5.372 6.94-10.185 0-6.081-4.942-11.044-11.022-11.044-6.081 0-10.98 4.963-10.98 11.044a10.84 10.84 0 0 0 7.112 10.206c.58.215 1.139-.172 1.139-.752v-1.719a2.768 2.768 0 0 1-1.032.215c-1.418 0-2.256-.773-2.857-2.213-.237-.58-.495-.924-.989-.988-.258-.022-.344-.129-.344-.258 0-.258.43-.451.86-.451.623 0 1.16.386 1.719 1.181.43.623.881.903 1.418.903.537 0 .881-.194 1.375-.688.365-.365.645-.687.903-.902Z" })
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
var SHADCN_CHECKBOX = "size-3.5";
function ComponentRow(t0) {
	const $ = (0, import_compiler_runtime.c)(5);
	const { file, children } = t0;
	let t1;
	if ($[0] !== file) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex-1 font-mono text-[10px] text-ed-muted-foreground",
			children: file
		});
		$[0] = file;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== children || $[3] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-10 shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5",
			children: [t1, children]
		});
		$[2] = children;
		$[3] = t1;
		$[4] = t2;
	} else t2 = $[4];
	return t2;
}
function CodeComponentsPanel() {
	const $ = (0, import_compiler_runtime.c)(8);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GithubMark, {});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center gap-2.5 border-b border-ed-border px-4 py-3",
			children: [
				t0,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 flex-col gap-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold text-ed-foreground",
						children: "acme/acme-web"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] text-ed-muted-foreground",
						children: "128 components found"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "secondary",
					children: "Imported"
				})
			]
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentRow, {
			file: "button.tsx",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						children: "Button"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						children: "Button"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "secondary",
						children: "Button"
					})
				]
			})
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentRow, {
			file: "badge.tsx",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Badge" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						children: "Badge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "secondary",
						children: "Badge"
					})
				]
			})
		});
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentRow, {
			file: "input.tsx",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				readOnly: true,
				placeholder: "you@acme.com",
				className: "h-7 w-32 shrink-0"
			})
		});
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentRow, {
			file: "switch.tsx",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				defaultChecked: true,
				className: "shrink-0"
			})
		});
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-10 flex w-[368px] shrink-0 flex-col overflow-hidden rounded-[10px] border border-ed-border bg-ed-card shadow-2xl/7",
			children: [t1, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 flex-col gap-0.5 p-2.5",
				children: [
					t2,
					t3,
					t4,
					t5,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ComponentRow, {
						file: "checkbox.tsx",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
								defaultChecked: true,
								className: cn$2("shrink-0", SHADCN_CHECKBOX)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-ed-foreground",
								children: "Remember me"
							})]
						})
					})
				]
			})]
		});
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelShell, {
			className: "flex items-center justify-center overflow-hidden",
			children: [t6, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-6 left-1/2 flex shrink-0 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-ed-border bg-ed-background px-3 py-2 shadow-2xl/7",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GithubMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "xs",
					children: "Imported from GitHub"
				})]
			})]
		});
		$[7] = t7;
	} else t7 = $[7];
	return t7;
}
var SWATCH_GROUPS = [{
	title: "Warm Whites",
	colors: [
		["Ivory", "#FAF8F5"],
		["Linen", "#F5F0EB"],
		["Sand", "#EDE8E1"],
		["Oat", "#E6DFD5"]
	]
}, {
	title: "Accents",
	colors: [
		["Butter", "#F9F0E2"],
		["Rose", "#F5E1E8"],
		["Mint", "#E8F0ED"],
		["Thistle", "#EDE5F0"]
	]
}];
function SwatchGroup(t0) {
	const $ = (0, import_compiler_runtime.c)(9);
	const { title, colors } = t0;
	let t1;
	if ($[0] !== title) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[8px] font-semibold uppercase tracking-[0.8px] text-ed-muted-foreground",
			children: title
		});
		$[0] = title;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== colors) {
		t2 = colors.map(_temp$5);
		$[2] = colors;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] !== t2) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1 flex gap-1",
			children: t2
		});
		$[4] = t2;
		$[5] = t3;
	} else t3 = $[5];
	let t4;
	if ($[6] !== t1 || $[7] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [t1, t3] });
		$[6] = t1;
		$[7] = t3;
		$[8] = t4;
	} else t4 = $[8];
	return t4;
}
function _temp$5(t0) {
	const [name, hex] = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-6 rounded-md border border-black/5",
				style: { background: hex }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-[8px] font-medium text-ed-foreground",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[7px] text-ed-muted-foreground",
				children: hex
			})
		]
	}, name);
}
function ChatBubble(t0) {
	const $ = (0, import_compiler_runtime.c)(2);
	const { children } = t0;
	let t1;
	if ($[0] !== children) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 justify-end",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-full shrink-0 rounded-md border border-ed-border bg-ed-background px-2 py-1.5 text-[10px] leading-normal shadow-md/4",
				children
			})
		});
		$[0] = children;
		$[1] = t1;
	} else t1 = $[1];
	return t1;
}
function MentionChip(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { icon, label } = t0;
	let t1;
	if ($[0] !== label) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 text-[10px]",
			children: label
		});
		$[0] = label;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$3, {
			size: 8,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] !== icon || $[4] !== t1) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex shrink-0 items-center gap-1 rounded-md bg-ed-selected px-2 py-0.5 align-middle font-medium text-ed-selected-foreground",
			children: [
				icon,
				t1,
				t2
			]
		});
		$[3] = icon;
		$[4] = t1;
		$[5] = t3;
	} else t3 = $[5];
	return t3;
}
function ClaudeCanvasPanel() {
	const $ = (0, import_compiler_runtime.c)(11);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionFrame, {
			label: "ColorPaletteCard",
			tone: "component"
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$4, {
					size: 14,
					weight: "duotone",
					className: "shrink-0 text-ed-primary"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "xs",
					weight: "semibold",
					children: "Color Palette System"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-[9px] text-ed-muted-foreground",
				children: "12 colors"
			})]
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex min-w-0 flex-1 items-center justify-center overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-[224px] shrink-0 border border-ed-border bg-ed-card p-3 text-ed-card-foreground",
				children: [
					t0,
					t1,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwatchGroup, { ...SWATCH_GROUPS[0] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwatchGroup, { ...SWATCH_GROUPS[1] })
				]
			})
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, { children: "Design a color palette card with warm whites and soft pastel accents." });
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-2.5 overflow-hidden p-2.5",
			children: [
				t3,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-col gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						variant: "tertiary",
						children: "9 tool calls"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						size: "3xs",
						children: "I've added a ColorPaletteCard with a Warm Whites row and a pastel Accents row - 12 colors total, each with name and hex."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, { children: "make the accents warmer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					children: "Adjusting accent hues…"
				})
			]
		});
		$[4] = t4;
	} else t4 = $[4];
	let t5;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			size: "3xs",
			variant: "tertiary",
			className: "flex-1",
			children: "Reply to Claude…"
		});
		$[5] = t5;
	} else t5 = $[5];
	let t6;
	if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "m-2.5 flex shrink-0 items-center gap-1.5 rounded-md border border-ed-border bg-ed-background px-2 py-1.5 shadow-md/4",
			children: [t5, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-4.5 shrink-0 items-center justify-center rounded-full bg-ed-primary text-ed-primary-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$13, {
					size: 10,
					weight: "bold"
				})
			})]
		});
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Use this" });
		$[7] = t7;
	} else t7 = $[7];
	let t8;
	if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-wrap items-center text-[10px] text-ed-foreground",
			children: [
				t7,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionChip, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I$2, { size: 13 }),
					label: "Screenshot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "as design inspiration and update this color palette" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MentionChip, { label: "ColorPaletteCard" })
			]
		});
		$[8] = t8;
	} else t8 = $[8];
	let t9;
	if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(m$3, {
			size: 14,
			className: "shrink-0 text-ed-muted-foreground"
		});
		$[9] = t9;
	} else t9 = $[9];
	let t10;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelShell, {
			fill: true,
			className: "flex items-stretch",
			children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-1 -mt-1.5 flex h-[404px] w-[190px] shrink-0 flex-col rounded-md border border-ed-border bg-ed-background",
				children: [
					t4,
					t6,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute -bottom-6 -left-6 z-50 flex w-[240px] shrink-0 flex-col justify-between rounded-xl border border-ed-border bg-ed-background p-2.5 shadow-2xl/7",
						children: [
							t8,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex shrink-0 items-center justify-between gap-2",
								children: [t9, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-5 shrink-0 items-center justify-center rounded-md bg-ed-primary text-ed-primary-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$13, {
										size: 10,
										weight: "bold"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: claudeMark_default,
								alt: "",
								className: "absolute right-0 bottom-28 z-50 size-12 shrink-0 overflow-hidden rounded-xl border border-ed-border object-cover shadow-2xl"
							})
						]
					})
				]
			})]
		});
		$[10] = t10;
	} else t10 = $[10];
	return t10;
}
var SYNTAX = {
	kw: "#cf222e",
	fn: "#8250df",
	str: "#0a3069",
	plain: "#1f2328",
	attr: "#953800",
	num: "#0550ae",
	tag: "#116329"
};
var CODE_LINES = [
	[
		[SYNTAX.kw, "import"],
		[SYNTAX.plain, " { "],
		[SYNTAX.fn, "Toast"],
		[SYNTAX.plain, " } "],
		[SYNTAX.kw, "from"],
		[SYNTAX.str, " \"./Toast\""]
	],
	[
		[SYNTAX.kw, "import"],
		[SYNTAX.plain, " { "],
		[SYNTAX.fn, "Button"],
		[SYNTAX.plain, " } "],
		[SYNTAX.kw, "from"],
		[SYNTAX.str, " \"./Button\""]
	],
	[
		[SYNTAX.kw, "import"],
		[SYNTAX.plain, " { "],
		[SYNTAX.fn, "CheckCircle"],
		[SYNTAX.plain, " } "],
		[SYNTAX.kw, "from"],
		[SYNTAX.str, " \"lucide-react\""]
	],
	[],
	[
		[SYNTAX.kw, "export function"],
		[SYNTAX.fn, " SavedToast"],
		[SYNTAX.plain, "() {"]
	],
	[[SYNTAX.kw, "  return"], [SYNTAX.plain, " ("]],
	[
		[SYNTAX.plain, "    <"],
		[SYNTAX.fn, "Toast"],
		[SYNTAX.attr, " className"],
		[SYNTAX.plain, "="],
		[SYNTAX.str, "\"bg-popover border-border\""],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "      <"],
		[SYNTAX.fn, "CheckCircle"],
		[SYNTAX.attr, " size"],
		[SYNTAX.plain, "={"],
		[SYNTAX.num, "18"],
		[SYNTAX.plain, "}"],
		[SYNTAX.attr, " className"],
		[SYNTAX.plain, "="],
		[SYNTAX.str, "\"text-chart-2\""],
		[SYNTAX.plain, " />"]
	],
	[
		[SYNTAX.plain, "      <"],
		[SYNTAX.tag, "div"],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "        <"],
		[SYNTAX.tag, "p"],
		[SYNTAX.attr, " className"],
		[SYNTAX.plain, "="],
		[SYNTAX.str, "\"text-foreground\""],
		[SYNTAX.plain, ">Changes saved</"],
		[SYNTAX.tag, "p"],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "        <"],
		[SYNTAX.tag, "p"],
		[SYNTAX.attr, " className"],
		[SYNTAX.plain, "="],
		[SYNTAX.str, "\"text-muted-foreground\""],
		[SYNTAX.plain, ">"]
	],
	[[SYNTAX.plain, "          Your edits have been synced"]],
	[
		[SYNTAX.plain, "        </"],
		[SYNTAX.tag, "p"],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "      </"],
		[SYNTAX.tag, "div"],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "      <"],
		[SYNTAX.fn, "Button"],
		[SYNTAX.attr, " variant"],
		[SYNTAX.plain, "="],
		[SYNTAX.str, "\"outline\""],
		[SYNTAX.plain, ">Undo</"],
		[SYNTAX.fn, "Button"],
		[SYNTAX.plain, ">"]
	],
	[
		[SYNTAX.plain, "    </"],
		[SYNTAX.fn, "Toast"],
		[SYNTAX.plain, ">"]
	],
	[[SYNTAX.plain, "  )"]],
	[[SYNTAX.plain, "}"]]
];
var TRAFFIC_LIGHTS = [
	"#ff5f57",
	"#febc2e",
	"#28c840"
];
function ProduceCodePanel() {
	const $ = (0, import_compiler_runtime.c)(5);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectionFrame, {
			label: "Toast",
			tone: "selection",
			midHandles: true
		});
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: "14",
			height: "14",
			viewBox: "0 0 24 24",
			fill: "none",
			className: "shrink-0 text-green-600 dark:text-green-400",
			"aria-hidden": true,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "12",
				r: "10",
				stroke: "currentColor",
				strokeWidth: "2"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 12.5l2.5 2.5L16 9.5",
				stroke: "currentColor",
				strokeWidth: "2",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			})]
		});
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto inline-block w-fit shrink-0",
			children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2.5 rounded-md border border-ed-border bg-ed-popover px-3 py-2.5 text-ed-popover-foreground shadow-lg",
				children: [
					t1,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mr-2.5 flex shrink-0 flex-col gap-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "xs",
							weight: "medium",
							className: "whitespace-nowrap",
							children: "Changes saved"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
							size: "3xs",
							variant: "tertiary",
							className: "whitespace-nowrap",
							children: "Your edits have been synced"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						children: "Undo"
					})
				]
			})]
		});
		$[2] = t2;
	} else t2 = $[2];
	let t3;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between border-b border-ed-border bg-ed-muted px-3 py-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					children: TRAFFIC_LIGHTS.map(_temp2$3)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
					size: "3xs",
					variant: "tertiary",
					className: "ml-1.5",
					children: "Selection"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				size: "3xs",
				variant: "tertiary",
				className: "tracking-[0.4px]",
				children: "COPY"
			})]
		});
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PanelShell, {
			className: "flex flex-col items-center justify-start gap-5 overflow-hidden px-6 py-24",
			children: [t2, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "z-5 w-full shrink-0 overflow-hidden rounded-lg bg-ed-background shadow-[0_2px_16px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)]",
				children: [t3, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto bg-white px-4 py-2.5 font-mono text-[10px] leading-relaxed",
					children: CODE_LINES.map(_temp4$2)
				})]
			})]
		});
		$[4] = t4;
	} else t4 = $[4];
	return t4;
}
function _temp4$2(tokens, i) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-3 w-6 shrink-0 select-none text-right text-ed-muted-foreground",
			children: i + 1
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "whitespace-pre",
			children: tokens.map(_temp3$2)
		})]
	}, i);
}
function _temp3$2(t0, j) {
	const [color_0, text] = t0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		style: { color: color_0 },
		children: text
	}, j);
}
function _temp2$3(color) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "size-2.5 rounded-full",
		style: { background: color }
	}, color);
}

export { ClaudeCanvasPanel, CodeComponentsPanel, ProduceCodePanel };
