// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/utils/selectionColors.ts
import { getById, getDescendantIds } from "../../../../compiler/src/store/read.js";
import { getTailwindCategory } from "../../shared/utils/tailwindScale.js";
import { fakeSolidLayer, parseFills, serializeFills, unfakeSolid } from "./backgroundFills.js";
import { canvasColorToParts, parseColorParts } from "./colorMath.js";
import { colorTokenName } from "./colorTokenMatch.js";

/**
* Selection colors: every color and gradient written in the selected layers and
* their descendants, and the writes that recolor every use of one of them.
*
* Scope: any color or gradient in an inline style value (shorthands, shadows,
* filters and gradient layers included), in a text node's rich-text runs, in an
* SVG paint prop (fill, stroke, …), and the Tailwind color classes for
* background, text, border and outline. A solid stacked as a background layer
* (`linear-gradient(c, c)`) is listed as its color. Inherited colors, CSS variables and
* colors inside component code are not listed: they aren't written on the layer.
*
* Uses bound to a class are grouped by token name, so `bg-primary` and
* `text-primary` are one row. Recoloring a token row rebinds its uses; it never
* edits the token's definition.
*/
/** Color properties a Tailwind color class can set, and the class prefix for each. */
var PROPERTY_PREFIX = {
	backgroundColor: "bg-",
	color: "text-",
	borderColor: "border-",
	borderTopColor: "border-t-",
	borderRightColor: "border-r-",
	borderBottomColor: "border-b-",
	borderLeftColor: "border-l-",
	outlineColor: "outline-"
};
var isClassProperty = (p) => p in PROPERTY_PREFIX;
/** Tailwind class categories that set exactly one color property. */
var CATEGORY_PROPERTY = {
	background: "backgroundColor",
	"text-color": "color",
	"border-color": "borderColor",
	"border-color-top": "borderTopColor",
	"border-color-right": "borderRightColor",
	"border-color-bottom": "borderBottomColor",
	"border-color-left": "borderLeftColor"
};
/** Style properties whose values may hold a color. Font names like "Red Hat" are never scanned. */
var COLOR_STYLE = /color|background|border|outline|shadow|fill|stroke|filter|decoration|caret|accent|columnRule|mask|emphasis/i;
/** SVG paint props that hold a color. */
var COLOR_PROPS$1 = [
	"fill",
	"stroke",
	"stopColor",
	"floodColor",
	"lightingColor"
];
var NAMED_COLORS = new Set("aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" "));
var TOKEN_START = /(?:repeating-)?(?:linear|radial|conic)-gradient\(|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color|var|url|env)\(|#[0-9a-f]+|[a-z][a-z-]*/gi;
/** Index just past the parenthesis that closes the one opened before `from`. */
function closeParen(s, from) {
	let depth = 1;
	for (let i = from; i < s.length; i++) if (s[i] === "(") depth++;
	else if (s[i] === ")" && --depth === 0) return i + 1;
	return s.length;
}
/**
* The colors and gradients in a CSS value, in order. A gradient is one token;
* the colors inside it are not listed separately. `var()`, `url()` and `env()`
* are skipped whole.
*/
function findColorTokens(value) {
	const tokens = [];
	TOKEN_START.lastIndex = 0;
	let m;
	while (m = TOKEN_START.exec(value)) {
		const start = m.index;
		let end = start + m[0].length;
		const word = m[0].toLowerCase();
		if (word.endsWith("(")) {
			end = closeParen(value, end);
			TOKEN_START.lastIndex = end;
			if (/^(var|url|env)\(/.test(word)) continue;
			tokens.push({
				start,
				end,
				text: value.slice(start, end),
				gradient: word.includes("gradient")
			});
			continue;
		}
		if (start > 0 && /[\w-]/.test(value[start - 1])) continue;
		if (word.startsWith("#") ? [
			4,
			5,
			7,
			9
		].includes(word.length) : NAMED_COLORS.has(word)) tokens.push({
			start,
			end,
			text: m[0],
			gradient: false
		});
	}
	return tokens;
}
/** The value's only token, when the value is exactly one color. */
function loneSolid(value) {
	const tokens = findColorTokens(value);
	const t = tokens.length === 1 ? tokens[0] : null;
	return t && !t.gradient && t.start === 0 && t.end === value.length ? t : null;
}
var normalizedKeys = /* @__PURE__ */ new Map();
/** Grouping key for a color: equal colors written differently group together. */
function valueKey(value) {
	const raw = value.trim().toLowerCase();
	let key = normalizedKeys.get(raw);
	if (key === void 0) {
		const parts = parseColorParts(raw) ?? canvasColorToParts(raw);
		key = parts ? `${Math.round(parts.r)},${Math.round(parts.g)},${Math.round(parts.b)},${Math.round(parts.a * 1e3)}` : raw;
		normalizedKeys.set(raw, key);
	}
	return key;
}
var gradientKey = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");
function classNameOf$1(el) {
	if (el.type === "text") return String(el.className ?? "");
	return String(el.props?.className ?? "");
}
var styleText$1 = (v) => typeof v === "string" ? v.trim() : "";
/** Color uses of one styled thing: an element, or one run of a text node. */
function styledUses(elementId, run, styles, classes, resolve, out) {
	for (const [property, raw] of Object.entries(styles)) {
		const value = styleText$1(raw);
		if (!value || !COLOR_STYLE.test(property)) continue;
		if (loneSolid(value) && (isClassProperty(property) || property === "background" && !styles.backgroundColor)) {
			const as = property === "background" ? "backgroundColor" : property;
			out.push({
				elementId,
				run,
				source: "style",
				property: as,
				value,
				key: `value:${valueKey(value)}`
			});
			continue;
		}
		findColorTokens(value).forEach((t, index) => {
			const solid = t.gradient ? unfakeSolid(t.text) : null;
			const gradient = t.gradient && !solid;
			out.push({
				elementId,
				run,
				source: "style",
				property,
				index,
				value: solid ?? t.text,
				gradient: gradient || void 0,
				key: gradient ? `gradient:${gradientKey(t.text)}` : `value:${valueKey(solid ?? t.text)}`
			});
		});
	}
	for (const cls of classes.split(/\s+/)) {
		const category = cls ? getTailwindCategory(cls) : null;
		const property = category ? CATEGORY_PROPERTY[category] : void 0;
		if (!property) continue;
		if (styleText$1(styles[property]) || property === "backgroundColor" && styleText$1(styles.background)) continue;
		const value = resolve(cls, property);
		if (value === void 0) continue;
		out.push({
			elementId,
			run,
			source: "style",
			property,
			className: cls,
			value,
			key: `token:${colorTokenName(cls)}`
		});
	}
}
/** The element's own color uses, its rich-text runs' included. */
function usesOf(el, resolve) {
	const uses = [];
	styledUses(el.id, void 0, el.styles ?? {}, classNameOf$1(el), resolve, uses);
	if (el.type === "text") el.children?.forEach((run, i) => styledUses(el.id, i, run.styles ?? {}, classNameOf$1(run), resolve, uses));
	else if ("props" in el && el.props) for (const property of COLOR_PROPS$1) findColorTokens(styleText$1(el.props[property])).forEach((t, index) => {
		if (t.gradient) return;
		uses.push({
			elementId: el.id,
			source: "prop",
			property,
			index,
			value: t.text,
			key: `value:${valueKey(t.text)}`
		});
	});
	return uses;
}
/**
* Every distinct color and gradient used by `rootIds` and their descendants,
* in the order first seen. `cache` keeps each element's uses while the element
* object is unchanged, so recollecting after an unrelated edit only walks the tree.
*/
function collectSelectionColors(store, rootIds, resolve, cache) {
	const seen = /* @__PURE__ */ new Set();
	const groups = /* @__PURE__ */ new Map();
	const visit = (id) => {
		if (seen.has(id)) return;
		seen.add(id);
		const el = getById(store, id);
		if (!el || el.type === "webview") return;
		let uses = cache?.get(el);
		if (!uses) {
			uses = usesOf(el, resolve);
			cache?.set(el, uses);
		}
		for (const use of uses) {
			const group = groups.get(use.key);
			if (group) group.uses.push(use);
			else groups.set(use.key, {
				key: use.key,
				token: use.className ? colorTokenName(use.className) : void 0,
				gradient: use.gradient,
				value: use.value,
				uses: [use]
			});
		}
	};
	for (const id of rootIds) {
		visit(id);
		for (const child of getDescendantIds(store, id)) visit(child);
	}
	return [...groups.values()];
}
/** True when `a` and `b` point at the same place, whatever color is there now. */
function sameColorSlot(a, b) {
	return a.elementId === b.elementId && a.run === b.run && a.source === b.source && a.property === b.property && a.index === b.index;
}
/**
* Replaces the `index`th color token in `value`, or returns null when it's gone.
* A solid stacked as a layer stays a layer when it gets a new color.
*/
function replaceToken(value, index, next) {
	const t = findColorTokens(value)[index];
	if (!t) return null;
	const text = t.gradient && !next.includes("gradient(") && unfakeSolid(t.text) ? fakeSolidLayer(next) : next;
	return value.slice(0, t.start) + text + value.slice(t.end);
}
/**
* The write that moves this element's `uses` to `target`. Each use is applied
* to what the element holds now, not to what it held when the uses were
* collected, so a picker session can move a use between a class and an inline
* value and back. A plain color property becomes the token's class or an
* inline value; a color inside a longer value is replaced in place.
*/
function recolorElement(el, uses, target, resolve) {
	const mine = uses.filter((u) => u.elementId === el.id);
	if (mine.length === 0) return null;
	const draft = (styles, className) => ({
		styles: { ...styles ?? {} },
		classes: className.split(/\s+/).filter(Boolean)
	});
	const base = draft(el.styles, classNameOf$1(el));
	const runs = el.type === "text" ? el.children : void 0;
	const runDrafts = /* @__PURE__ */ new Map();
	const props = "props" in el ? { ...el.props ?? {} } : void 0;
	for (const use of mine) {
		if (use.source === "prop") {
			if (!props || use.index === void 0 || "token" in target && !target.value) continue;
			const next = replaceToken(styleText$1(props[use.property]), use.index, target.value);
			if (next !== null) props[use.property] = next;
			continue;
		}
		let d = base;
		if (use.run !== void 0) {
			const run = runs?.[use.run];
			if (!run) continue;
			d = runDrafts.get(use.run) ?? draft(run.styles, classNameOf$1(run));
			runDrafts.set(use.run, d);
		}
		if (use.index !== void 0) {
			if ("token" in target && !target.value) continue;
			const next = replaceToken(styleText$1(d.styles[use.property]), use.index, target.value);
			if (next !== null) d.styles[use.property] = next;
			continue;
		}
		const property = use.property;
		d.classes = d.classes.filter((cls) => {
			const category = getTailwindCategory(cls);
			return !(category && CATEGORY_PROPERTY[category] === property && resolve(cls, property) !== void 0);
		});
		if (property === "backgroundColor" && loneSolid(styleText$1(d.styles.background))) delete d.styles.background;
		if ("token" in target) {
			delete d.styles[property];
			const cls = `${PROPERTY_PREFIX[property]}${target.token}`;
			if (!d.classes.includes(cls)) d.classes.push(cls);
		} else d.styles[property] = target.value;
	}
	const write = {};
	const changedStyles = (before, after) => JSON.stringify(before ?? {}) !== JSON.stringify(after);
	if (changedStyles(el.styles, base.styles)) write.styles = base.styles;
	const className = base.classes.join(" ");
	if (className !== classNameOf$1(el).split(/\s+/).filter(Boolean).join(" ")) write.className = className;
	if (props && changedStyles("props" in el && el.props || {}, props)) write.props = props;
	if (runs && runDrafts.size > 0) {
		const next = runs.map((run, i) => {
			const d = runDrafts.get(i);
			if (!d) return run;
			const cls = d.classes.join(" ");
			return {
				...run,
				styles: d.styles,
				className: cls || void 0
			};
		});
		if (next.some((run, i) => run !== runs[i])) write.runs = next;
	}
	return Object.keys(write).length > 0 ? write : null;
}
/** Properties whose gradient layers can become a solid fill. */
var BACKGROUND_LAYERS = /* @__PURE__ */ new Set(["background", "backgroundImage"]);
/** True when every use is a background gradient layer, which a solid can replace. */
var canBecomeSolid = (uses) => uses.every((u) => u.source === "style" && u.run === void 0 && BACKGROUND_LAYERS.has(u.property));
var BG_KEYS = [
	"backgroundColor",
	"backgroundImage",
	"background",
	"backgroundSize",
	"backgroundPosition",
	"backgroundRepeat",
	"backgroundBlendMode"
];
/**
* The write that turns this element's gradient `uses` into solid fills of
* `color`, as Figma does when a gradient fill switches to Solid. Each gradient
* becomes a solid in its layer, and the layers are written back the way the
* Background section writes them: the bottom-most solid becomes
* `background-color`; a solid above another layer stays a layer. Also returns
* where the new solids now are, for a picker that keeps editing them.
*/
function gradientToSolid(el, uses, color, resolve) {
	const mine = uses.filter((u) => u.elementId === el.id && u.index !== void 0 && canBecomeSolid([u]));
	if (mine.length === 0) return null;
	const styles = { ...el.styles ?? {} };
	for (const use of mine) {
		const next = replaceToken(styleText$1(styles[use.property]), use.index, fakeSolidLayer(color));
		if (next !== null) styles[use.property] = next;
	}
	const css = {};
	for (const key of BG_KEYS) css[key] = styleText$1(styles[key]) || void 0;
	const fills = parseFills(css);
	if (!css.backgroundColor && !css.background) for (const cls of classNameOf$1(el).split(/\s+/)) {
		const value = (cls ? getTailwindCategory(cls) : null) === "background" ? resolve(cls, "backgroundColor") : void 0;
		if (value === void 0) continue;
		fills.push({
			kind: "solid",
			value,
			token: cls
		});
		break;
	}
	for (const [key, value] of Object.entries(serializeFills(fills))) if (value === void 0) delete styles[key];
	else styles[key] = value;
	if (JSON.stringify(el.styles ?? {}) === JSON.stringify(styles)) return null;
	const key = `value:${valueKey(color)}`;
	return {
		write: { styles },
		uses: usesOf({
			...el,
			styles
		}, resolve).filter((u) => u.key === key && u.run === void 0 && /^background/.test(u.property))
	};
}

export { canBecomeSolid, collectSelectionColors, gradientToSolid, recolorElement, sameColorSlot };
