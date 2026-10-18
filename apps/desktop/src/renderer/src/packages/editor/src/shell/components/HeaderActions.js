// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/HeaderActions.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { DotsThreeIcon } from "../../../../ui/src/icons.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui/src/components/Tooltip.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../../../ui/src/components/DropdownMenu.js";

/**
* The project header's right-hand action row, with responsive overflow (LUN-115).
*
* `leading` (Present/Play) and `trailing` (Share) are always visible; everything in
* `collapsible` moves into a "..." menu once the row can no longer fit them inline.
*
* The show/hide is a pure container query (see `.ed-header-actions` in styles.css), not a
* JS measurement. Two reasons that matters here: the row is `justify-end`, so overflow
* spills past the LEFT edge and `scrollWidth` never exceeds `clientWidth` (a JS version
* has to sum child widths instead); and a measure-then-setState approach has to cache a
* "natural width" as hysteresis, or collapsing frees space that immediately looks like
* room to expand again. The container query sidesteps both — the row's inline size comes
* from its parent, never from its own contents, so there is no feedback loop.
*
* The collapsed controls are described twice (an `inline` button and a `menuItem` row),
* with CSS showing exactly one. The menu row reuses the standard DropdownMenu styling so
* the overflow matches the Present/Preview menu, while the inline button keeps its own
* look and any adornments (e.g. GitHub's status dot).
*/
function HeaderActions(t0) {
	const $ = (0, import_compiler_runtime.c)(15);
	const { leading, collapsible, trailing } = t0;
	const hasCollapsible = collapsible.length > 0;
	let t1;
	if ($[0] !== leading) {
		t1 = leading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: leading
		});
		$[0] = leading;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== collapsible || $[3] !== hasCollapsible) {
		t2 = hasCollapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-header-actions-inline flex shrink-0 items-center gap-[2px]",
			children: collapsible.map(_temp$20)
		});
		$[2] = collapsible;
		$[3] = hasCollapsible;
		$[4] = t2;
	} else t2 = $[4];
	let t3;
	if ($[5] !== collapsible || $[6] !== hasCollapsible) {
		t3 = hasCollapsible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-header-actions-overflow shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
				modal: false,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon-xs",
							"aria-label": "More actions",
							isChildText: false,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DotsThreeIcon, {
								width: 16,
								height: 16
							})
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, {
					side: "bottom",
					children: "More actions"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuContent, {
					align: "end",
					"data-header-overflow-menu": "",
					children: collapsible.map(_temp2$12)
				})]
			})
		});
		$[5] = collapsible;
		$[6] = hasCollapsible;
		$[7] = t3;
	} else t3 = $[7];
	let t4;
	if ($[8] !== trailing) {
		t4 = trailing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ml-1 shrink-0",
			children: trailing
		});
		$[8] = trailing;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== t1 || $[11] !== t2 || $[12] !== t3 || $[13] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-header-actions flex min-w-0 flex-1 items-center justify-end gap-[2px]",
			children: [
				t1,
				t2,
				t3,
				t4
			]
		});
		$[10] = t1;
		$[11] = t2;
		$[12] = t3;
		$[13] = t4;
		$[14] = t5;
	} else t5 = $[14];
	return t5;
}
function _temp2$12(item_0) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: item_0.menuItem }, item_0.key);
}
function _temp$20(item) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Fragment, { children: item.inline }, item.key);
}

export { HeaderActions };
