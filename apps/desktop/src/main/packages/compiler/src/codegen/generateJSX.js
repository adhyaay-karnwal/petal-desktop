// Reconstructed from index.js — original module: packages/compiler/src/codegen/generateJSX.ts
import { isTransientUploadProp } from "../store/sanitize.js";
import { getById, getChildren, getParentId, getRootIds } from "../store/read.js";
import { commentedStyleComment, splitCommentedStyles } from "../store/commentedStyles.js";
import { VIDEO_FILL_PROP, canHoldVideoFill, parseVideoFill, videoFillElement } from "../store/videoFill.js";
import { normalizeReactAttrs } from "./htmlAttrCasing.js";

/** Marker embedded in budget truncation stubs — canvas_update hard-rejects if present. */
var LUNAGRAPH_TRUNCATED_MARKER = "petal:truncated";
function jsxContainsTruncationStub(jsx) {
	return jsx.includes(LUNAGRAPH_TRUNCATED_MARKER);
}
function elementTagLabel(element) {
	switch (element.type) {
		case "html": return element.tag || "div";
		case "component": return element.componentName || "Component";
		case "icon": return element.iconName || "icon";
		case "text": return "text";
		case "capture": return "capture";
		case "webview": return "webview";
	}
}
function truncationStubBody(id, tag) {
	return `{/* ${LUNAGRAPH_TRUNCATED_MARKER} id="${id}" tag="${tag}" */}`;
}
function truncationStub(id, element, indent) {
	return `${"  ".repeat(indent)}${truncationStubBody(id, elementTagLabel(element))}`;
}
/** Matches the render-time check in the editor's renderElement. */
function looksLikeAssetPath(v) {
	return v.includes(".petal-assets/") || v.startsWith("/assets/") || v.startsWith("/public/");
}
function resolveStyleValue(value, assetResolver) {
	if (!assetResolver || typeof value !== "string" || !value.includes("url(")) return value;
	return value.replace(/url\((['"]?)([^'")]+)\1\)/g, (match, quote, path) => looksLikeAssetPath(path) ? `url(${quote}${assetResolver(path)}${quote})` : match);
}
/**
* Generate JSX code from a flat Store
*/
function generateJSX(store, indent = 0, options = {}) {
	return (options.rootId != null ? [options.rootId] : getRootIds(store)).map((id) => generateElement(store, id, indent, options)).join("\n");
}
function generateElement(store, id, indent, options) {
	const element = getById(store, id);
	if (!element) return "";
	if (options.stubbedIds?.has(id)) return truncationStub(id, element, indent);
	const spaces = "  ".repeat(indent);
	if (element.type === "text") {
		const inner = element.children && element.children.length > 0 ? element.children.map(emitInlineRun).join("") : emitText(element.text || "");
		const hasOuterStyles = element.styles && Object.keys(element.styles).length > 0;
		const hasOuterClass = !!element.className;
		if (hasOuterStyles || hasOuterClass) {
			let attrs = generateAttributes(id, element.styles, {}, options);
			if (hasOuterClass) attrs += ` className="${escapeAttribute(element.className)}"`;
			return `${spaces}<span${attrs}>${inner}</span>`;
		}
		return `${spaces}${inner}`;
	}
	if (element.type === "html") {
		const children = getChildren(store, element.id);
		const attrs = generateAttributes(id, element.styles, element.props || {}, options);
		const opening = `${spaces}<${element.tag}${attrs}>`;
		const fill = canHoldVideoFill(element) ? parseVideoFill(element.props?.[VIDEO_FILL_PROP]) : null;
		const childLines = children.map((childId) => generateElement(store, childId, indent + 1, options));
		if (fill) {
			const { props, styles } = videoFillElement(fill);
			childLines.unshift(`${"  ".repeat(indent + 1)}<video${generateAttributes(void 0, styles, props, options)}></video>`);
		}
		if (childLines.length === 0) return `${opening}</${element.tag}>`;
		return `${opening}\n${childLines.join("\n")}\n${spaces}</${element.tag}>`;
	}
	if (element.type === "capture") {
		const children = getChildren(store, element.id);
		if (children.length === 0) return `${spaces}<></>`;
		if (children.length === 1) return generateElement(store, children[0], indent, options);
		return `${spaces}<>\n${children.map((childId) => generateElement(store, childId, indent + 1, options)).join("\n")}\n${spaces}</>`;
	}
	if (element.type === "component") {
		const attrs = generateAttributes(id, element.styles, element.props || {}, options);
		const opening = `${spaces}<${element.componentName}${attrs}`;
		const children = getChildren(store, element.id);
		if (children.length === 0) return `${opening} />`;
		return `${opening}>\n${children.map((childId) => generateElement(store, childId, indent + 1, options)).join("\n")}\n${spaces}</${element.componentName}>`;
	}
	if (element.type === "icon") {
		const attrs = generateAttributes(id, element.styles, element.props || {}, options);
		return `${spaces}<${element.iconName}${attrs} />`;
	}
	return "";
}
function generateAttributes(elementId, styles, props, options) {
	let attrs = "";
	if (options?.includeDataElementId === true && elementId != null) attrs += ` data-element-id="${elementId}"`;
	if (styles) {
		const { styles: renderStyles, commented } = splitCommentedStyles(styles);
		const cssEntries = Object.entries(renderStyles).map(([key, value]) => [key, resolveStyleValue(value, options?.assetResolver)]);
		if (cssEntries.length === 1 && commented.length === 0) {
			const styleObj = Object.fromEntries(cssEntries);
			attrs += ` style={${JSON.stringify(styleObj)}}`;
		} else if (cssEntries.length > 1 && commented.length === 0) {
			const formattedStyles = cssEntries.map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(",\n");
			attrs += ` style={{\n${formattedStyles}\n  }}`;
		} else if (commented.length > 0) {
			const lines = [...cssEntries.map(([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`), ...commented.map((entry) => `    /* ${commentedStyleComment(entry)} */`)];
			attrs += ` style={{\n${lines.join("\n")}\n  }}`;
		}
	}
	const normalizedProps = normalizeReactAttrs(props);
	if (normalizedProps) Object.entries(normalizedProps).forEach(([key, value]) => {
		if (key === "style") return;
		if (key === "data-element-id" || key === "dataElementId") return;
		if (isTransientUploadProp(key)) return;
		if (key === "data-lg-component" || key === "data-lg-map" || key === "data-lg-src" || key === "data-lg-image-adjust" || key === "data-lg-video-fill") return;
		if (value === void 0) return;
		if (typeof value === "string") {
			const resolved = options?.assetResolver && looksLikeAssetPath(value) ? options.assetResolver(value) : value;
			attrs += ` ${key}="${escapeAttribute(resolved)}"`;
		} else if (typeof value === "boolean") {
			if (value) attrs += ` ${key}`;
		} else attrs += ` ${key}={${JSON.stringify(value)}}`;
	});
	return attrs;
}
function emitInlineRun(run) {
	const text = emitText(run.text ?? "");
	const styles = run.styles;
	const className = run.className;
	const hasStyles = styles && Object.keys(styles).length > 0;
	const hasClass = !!className;
	if (!hasStyles && !hasClass) return text;
	let attrs = "";
	if (hasStyles) attrs += generateAttributes(void 0, styles);
	if (hasClass) attrs += ` className="${escapeAttribute(className)}"`;
	return `<span${attrs}>${text}</span>`;
}
function emitText(text) {
	if (!text) return "";
	return /[<>{}]/.test(text) || /&[#a-zA-Z0-9]+;/.test(text) ? `{${JSON.stringify(text)}}` : text;
}
function escapeAttribute(str) {
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
/** FNV-1a 64-bit hex — pure JS so renderer + Node tests share one digest. */
function hashStringFnv1a64(input) {
	let h = 14695981039346656037n;
	const prime = 1099511628211n;
	for (let i = 0; i < input.length; i++) {
		h ^= BigInt(input.charCodeAt(i));
		h = h * prime & 18446744073709551615n;
	}
	return h.toString(16).padStart(16, "0");
}
function stableJson(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
	const obj = value;
	return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stableJson(obj[k])}`).join(",")}}`;
}
function stablePropsJson(props) {
	if (!props) return "";
	return stableJson(Object.fromEntries(Object.entries(props).filter(([k]) => !isTransientUploadProp(k))));
}
/** Content fingerprint for one node (no children) — used by covering-read hashes. */
function elementFingerprint(el) {
	const styles = el.styles ? stableJson(el.styles) : "";
	const name = el.name ?? "";
	switch (el.type) {
		case "html": return `html\0${el.id}\0${el.tag}\0${stablePropsJson(el.props)}\0${styles}\0${name}`;
		case "component": return `component\0${el.id}\0${el.componentName}\0${stablePropsJson(el.props)}\0${styles}\0${name}`;
		case "text": {
			const runs = el.children ? stableJson(el.children) : "";
			return `text\0${el.id}\0${el.text ?? ""}\0${runs}\0${el.className ?? ""}\0${styles}\0${name}`;
		}
		case "icon": return `icon\0${el.id}\0${el.library}\0${el.iconName}\0${stablePropsJson(el.props)}\0${styles}\0${name}`;
		case "webview": return `webview\0${el.id}\0${el.src}\0${styles}\0${name}`;
		case "capture": return `capture\0${el.id}\0${el.original.componentName}\0${styles}\0${name}`;
		default: return `unknown\0${el.id}`;
	}
}
/** Bottom-up hash walk; optionally records every descendant hash into `out`. */
function hashSubtreeWalk(store, id, out) {
	const el = getById(store, id);
	if (!el) {
		const empty = hashStringFnv1a64("");
		out?.set(id, empty);
		return empty;
	}
	const childHashes = getChildren(store, id).map((childId) => hashSubtreeWalk(store, childId, out));
	const h = hashStringFnv1a64([elementFingerprint(el), ...childHashes].join("\n"));
	out?.set(id, h);
	return h;
}
/**
* Bottom-up subtree hashes for `rootId` and every descendant.
* O(subtree) — sibling edits change that sibling's hash (and ancestors) only.
*
* Pass the `stubbedIds` of a truncated read to keep only the nodes it showed in
* full: a stub hides its subtree and leaves its ancestors partly shown.
*/
function hashAllElementSubtreesFrom(store, rootId, stubbedIds) {
	const out = /* @__PURE__ */ new Map();
	if (getById(store, rootId)) hashSubtreeWalk(store, rootId, out);
	for (const stubId of stubbedIds ?? []) {
		const stack = [stubId];
		while (stack.length > 0) {
			const id = stack.pop();
			out.delete(id);
			stack.push(...getChildren(store, id));
		}
		let parent = getParentId(store, stubId);
		while (parent && parent !== "ROOT" && out.delete(parent)) parent = getParentId(store, parent);
	}
	return out;
}

export { generateJSX, hashAllElementSubtreesFrom, jsxContainsTruncationStub };
