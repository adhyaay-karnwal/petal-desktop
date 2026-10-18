// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/main.tsx
import { QueryClientProvider, import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { createInteropJsxRuntime, import_client, import_react_dom, import_server_browser } from "../../../../packages/compiler/src/runtime/runtime.js";
import { initApi } from "../../../../packages/cloud/src/client.js";
import { queryClient } from "../../../../packages/cloud/src/queryClient.js";
import { captureElementImage, captureLivePreviewPage, resolveCaptureElement } from "../../../../packages/editor/src/shared/utils/captureElementImage.js";
import { installMouseButtonPolicy } from "../../../../packages/editor/src/shared/utils/mouseButtonPolicy.js";
import { App } from "./App.js";
import { failedImages } from "./failedImages.js";

var ReactDOM = {
	...import_react_dom,
	...import_client
};
installMouseButtonPolicy();
window.React = import_react.default;
window.ReactDOM = import_react_dom;
window.ReactDOMClient = import_client;
window.__LUNAGRAPH_REACT_DOM_SERVER__ = import_server_browser;
window.__LUNAGRAPH_REACT_JSX_RUNTIME__ = createInteropJsxRuntime(import_jsx_runtime);
async function boot() {
	initApi(await window.api.getApiUrl(), { webUrl: await window.api.getWebUrl() });
	ReactDOM.createRoot(document.getElementById("petal-root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {})
	}) }));
}
boot().catch((err) => {
	console.error("[boot] Failed to initialize:", err);
	document.getElementById("petal-root").textContent = "Failed to connect to server. Please restart.";
});
/**
* Bounds in the top-level renderer viewport for Electron's native capturePage.
* Elements commonly live in the same-origin canvas iframe, so accumulate each
* containing frame's offset before clipping to the visible window.
*/
function nativeCaptureRect(el) {
	el = resolveCaptureElement(el);
	const rect = el.getBoundingClientRect();
	let left = rect.left;
	let top = rect.top;
	let ownerWindow = el.ownerDocument.defaultView;
	while (ownerWindow && ownerWindow !== window) {
		const frame = ownerWindow.frameElement;
		if (!frame) return null;
		const frameRect = frame.getBoundingClientRect();
		left += frameRect.left + frame.clientLeft;
		top += frameRect.top + frame.clientTop;
		ownerWindow = frame.ownerDocument.defaultView;
	}
	const x = Math.max(0, Math.floor(left));
	const y = Math.max(0, Math.floor(top));
	const right = Math.min(window.innerWidth, Math.ceil(left + rect.width));
	const bottom = Math.min(window.innerHeight, Math.ceil(top + rect.height));
	if (right <= x || bottom <= y) return null;
	return {
		x,
		y,
		width: right - x,
		height: bottom - y
	};
}
if (window.api?.on) window.api.on("screenshot_request_mcp", async (event) => {
	if (event.projectId !== new URLSearchParams(window.location.search).get("projectTab")) {
		window.api.send("screenshot_result", {
			requestId: event.requestId,
			dataUrl: null
		});
		return;
	}
	try {
		let el = null;
		if (event.elementId) {
			el = document.querySelector(`[data-element-id="${event.elementId}"]`);
			if (!el) for (const iframe of Array.from(document.querySelectorAll("iframe"))) try {
				const iframeDoc = iframe.contentDocument;
				if (iframeDoc) {
					const found = iframeDoc.querySelector(`[data-element-id="${event.elementId}"]`);
					if (found) {
						el = found;
						break;
					}
				}
			} catch {}
		}
		if (!el) {
			window.api.send("screenshot_result", {
				requestId: event.requestId,
				dataUrl: null
			});
			return;
		}
		const preview = await captureLivePreviewPage(el);
		if (preview) {
			window.api.send("screenshot_result", preview.dataUrl || !preview.url ? {
				requestId: event.requestId,
				dataUrl: preview.dataUrl
			} : {
				requestId: event.requestId,
				iframeUrl: preview.url,
				iframeSize: {
					width: el.offsetWidth || 1200,
					height: el.offsetHeight || 800
				}
			});
			return;
		}
		const iframeEl = el.querySelector("iframe");
		const iframeSrc = iframeEl?.src;
		let isCrossOrigin = false;
		if (iframeEl) {
			try {
				iframeEl.contentDocument;
			} catch {
				isCrossOrigin = true;
			}
			if (!iframeEl.contentDocument) isCrossOrigin = true;
		}
		if (!isCrossOrigin) try {
			const dataUrl = await captureElementImage(el, { timeoutMs: 7e3 });
			window.api.send("screenshot_result", {
				requestId: event.requestId,
				dataUrl,
				failedImages: failedImages(el)
			});
			return;
		} catch (err) {
			console.warn("[MCP Screenshot] DOM capture failed:", err);
			window.api.send("screenshot_result", {
				requestId: event.requestId,
				nativeCaptureRect: nativeCaptureRect(el),
				captureError: err instanceof Error ? err.message : String(err),
				failedImages: failedImages(el)
			});
			return;
		}
		if (iframeSrc) {
			const iframeWidth = iframeEl.offsetWidth || 1200;
			const iframeHeight = iframeEl.offsetHeight || 800;
			window.api.send("screenshot_result", {
				requestId: event.requestId,
				iframeUrl: iframeSrc,
				iframeSize: {
					width: iframeWidth,
					height: iframeHeight
				}
			});
		} else window.api.send("screenshot_result", {
			requestId: event.requestId,
			dataUrl: null
		});
	} catch (err) {
		console.warn("[MCP Screenshot] Failed:", err);
		window.api.send("screenshot_result", {
			requestId: event.requestId,
			dataUrl: null
		});
	}
});

