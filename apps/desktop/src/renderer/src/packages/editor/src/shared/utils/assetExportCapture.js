// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/assetExportCapture.ts
import { getCameraScale } from "../../shell/hooks/useCommentAgent.js";
import { measureVisibleBounds, resolveObservedElements } from "./visibleElement.js";
import { fontEmbedCss } from "./fontEmbedCss.js";
import { accumulatedLinearTransform } from "../../canvas/utils/transformMatrix.js";
import { toSvg } from "../../../../../vendor/html-to-image.js";

var SVG_NS$chunk1 = "http://www.w3.org/2000/svg";
var HTML_NS = "http://www.w3.org/1999/xhtml";
/** A bounded wait for remote fonts/images; export must never spin forever. */
async function withExportTimeout(promise, milliseconds = 3e4) {
	let timer;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timer = setTimeout(() => reject(/* @__PURE__ */ new Error("Export timed out. Check that images and fonts have loaded, then retry.")), milliseconds);
		})]);
	} finally {
		clearTimeout(timer);
	}
}
function getExportBridge() {
	return window.api;
}
function cleanSnapshot(root) {
	for (const node of [root, ...root.querySelectorAll("*")]) {
		if ([
			"script",
			"iframe",
			"object",
			"embed",
			"webview",
			"link",
			"meta",
			"base"
		].includes(node.localName)) {
			node.remove();
			continue;
		}
		for (const attr of [...node.attributes]) if (attr.name.startsWith("on") || attr.name === "srcdoc" || /^(javascript|file):/i.test(attr.value.trim())) node.removeAttribute(attr.name);
		for (const attr of [...node.attributes]) if (attr.name.startsWith("data-")) node.removeAttribute(attr.name);
	}
}
function includeCaptureNode(node) {
	return !node.matches?.("[data-overlay-container], [data-drag-overlay], script, style, link, meta, base");
}
function restoreFontSizes(source, clone) {
	const style = clone.style;
	if (style) {
		style.fontSize = getComputedStyle(source).fontSize;
		style.animation = "none";
		style.transition = "none";
	}
	const sources = [...(source.shadowRoot ?? source).children].filter(includeCaptureNode);
	const targets = [...clone.children].filter((child) => child.localName !== "style");
	if (sources.length !== targets.length) return;
	sources.forEach((child, index) => restoreFontSizes(child, targets[index]));
}
async function cloneVisualNode(node) {
	const dataUrl = await toSvg(node, {
		fontEmbedCSS: await fontEmbedCss(node),
		includeQueryParams: true,
		pixelRatio: 1,
		filter: includeCaptureNode
	});
	const xml = new DOMParser().parseFromString(decodeURIComponent(dataUrl.slice(dataUrl.indexOf(",") + 1)), "image/svg+xml");
	const clone = xml.querySelector("foreignObject")?.firstElementChild;
	if (!clone || xml.querySelector("parsererror")) throw new Error("Could not capture this selection.");
	restoreFontSizes(node, clone);
	const sources = [node, ...node.querySelectorAll("webview")].filter((el) => el.localName === "webview");
	const targets = [clone, ...clone.querySelectorAll("webview")].filter((el) => el.localName === "webview");
	for (let i = 0; i < sources.length; i++) {
		const source = sources[i];
		const bridge = getExportBridge();
		if (!bridge || !source.getWebContentsId) throw new Error("Capture the embedded page onto the canvas before exporting it.");
		const src = await bridge.invoke("assets:capture-webview", { id: source.getWebContentsId() });
		const img = xml.createElementNS(HTML_NS, "img");
		img.setAttribute("src", src);
		img.setAttribute("style", targets[i]?.getAttribute("style") || "");
		if (targets[i] === clone) return img;
		targets[i]?.replaceWith(img);
	}
	if (clone.querySelector("iframe") || clone.localName === "iframe") throw new Error("Capture the embedded page onto the canvas before exporting it.");
	cleanSnapshot(clone);
	return clone;
}
function renderedHost(elementId) {
	const host = Array.from(document.querySelectorAll(`[data-element-id="${CSS.escape(elementId)}"]`)).find((node) => !node.closest("[data-drag-overlay]"));
	if (!host) throw new Error("This layer is not rendered. Open it on the canvas and retry.");
	return host;
}
function unionRect(rects) {
	if (!rects.length) return new DOMRect();
	const left = Math.min(...rects.map((rect) => rect.left)), top = Math.min(...rects.map((rect) => rect.top));
	const right = Math.max(...rects.map((rect) => rect.right)), bottom = Math.max(...rects.map((rect) => rect.bottom));
	return new DOMRect(left, top, right - left, bottom - top);
}
/** Freeze the selected boxes with their computed screen styles and embedded assets, framed together. */
async function captureAsset(elementIds) {
	const selected = elementIds.map(renderedHost);
	const hosts = selected.filter((host) => !selected.some((other) => other !== host && other.contains(host))).sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
	if (!hosts.length) throw new Error("Select a layer to export.");
	await withExportTimeout(document.fonts.ready);
	const bounds = unionRect(hosts.map(measureVisibleBounds).filter((rect) => rect.width > 0 || rect.height > 0));
	const cameraScale = hosts[0].closest(".react-transform-component") ? getCameraScale() : 1;
	const width = bounds.width / cameraScale, height = bounds.height / cameraScale;
	if (![width, height].every((value) => Number.isFinite(value) && value > 0)) throw new Error("This layer has no visible bounds to export.");
	const container = document.createElement("div");
	for (const node of hosts.flatMap(resolveObservedElements)) {
		const rect = node.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) continue;
		const clone = await withExportTimeout(cloneVisualNode(node));
		let output = clone;
		if (node instanceof SVGGraphicsElement && !(node instanceof SVGSVGElement)) {
			const box = node.getBBox();
			const screen = node.getScreenCTM();
			if (!screen) throw new Error("Could not measure the selected vector shape.");
			const svg = document.createElementNS(SVG_NS$chunk1, "svg");
			svg.setAttribute("width", String(rect.width / cameraScale));
			svg.setAttribute("height", String(rect.height / cameraScale));
			svg.setAttribute("viewBox", `0 0 ${rect.width / cameraScale} ${rect.height / cameraScale}`);
			for (const defs of node.ownerSVGElement?.querySelectorAll("defs") || []) svg.append(defs.cloneNode(true));
			const g = document.createElementNS(SVG_NS$chunk1, "g");
			const a = screen.a / cameraScale, b = screen.b / cameraScale, c = screen.c / cameraScale, d = screen.d / cameraScale;
			const x = a * box.x + c * box.y + Math.min(0, a * box.width) + Math.min(0, c * box.height);
			const y = b * box.x + d * box.y + Math.min(0, b * box.width) + Math.min(0, d * box.height);
			g.setAttribute("transform", `matrix(${a} ${b} ${c} ${d} ${-x} ${-y})`);
			clone.removeAttribute("transform");
			clone.style.transform = "none";
			g.append(clone);
			svg.append(g);
			output = svg;
		} else {
			const computed = getComputedStyle(node);
			const w = node.offsetWidth || parseFloat(computed.width) || rect.width / cameraScale;
			const h = node.offsetHeight || parseFloat(computed.height) || rect.height / cameraScale;
			const m = accumulatedLinearTransform(node);
			const x = -(Math.min(0, m.a * w) + Math.min(0, m.c * h));
			const y = -(Math.min(0, m.b * w) + Math.min(0, m.d * h));
			Object.assign(output.style, {
				width: `${w}px`,
				height: `${h}px`,
				minWidth: "0",
				minHeight: "0",
				maxWidth: "none",
				maxHeight: "none",
				boxSizing: "border-box",
				transformOrigin: "0 0",
				transform: `matrix(${m.a},${m.b},${m.c},${m.d},${x},${y})`,
				translate: "none",
				rotate: "none",
				scale: "none"
			});
		}
		Object.assign(output.style, {
			position: "absolute",
			margin: "0",
			right: "auto",
			bottom: "auto",
			left: `${(rect.left - bounds.left) / cameraScale}px`,
			top: `${(rect.top - bounds.top) / cameraScale}px`
		});
		container.append(output);
	}
	return {
		html: container.innerHTML,
		width,
		height
	};
}

export { captureAsset, getExportBridge, withExportTimeout };
