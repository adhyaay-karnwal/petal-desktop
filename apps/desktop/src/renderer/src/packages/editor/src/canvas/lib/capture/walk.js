// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/lib/capture/walk.ts
import { authoredChildrenKind, detectIcon, extractComponentProps, findAncestorCompositeByName, findContainingComponent, findImmediateComposite, findKnownComponentRenderingHost, findOwningComponent, getComponentName, getFiber, isLiveSafeComponent, pickKnownComponentName, registryNameFromDataSlot, registryNameFromLgAttr, resolveAsChildOwner, stripPropSynthesizedChildren } from "./fiber.js";
import { PASSTHROUGH_TAGS, SKIP_TAGS$1, VOID_ELEMENTS$1 } from "./constants.js";
import { getAttrs$2, isSensitiveInput } from "./attrs.js";
import { applyStyleHeuristics, extractInlineStyles, getStyles, lockRatioSizedBox, stripAuthoredLayout, stripCanvasInvalidPosition, stripKeywordSizes } from "./styles.js";
import { captureSvg } from "./svg.js";
import { backdropColor, capturePseudo, getSnapshotStyles, snapshotText, svgPaintStyles } from "./snapshot.js";

/**
* DOM walker — converts a DOM subtree into captured nodes.
*
* Branches per element into:
*   - component: when fiber is present and componentName is in knownComponents
*   - svg:       when we hit an <svg> root (rebuilt as an element tree)
*   - html:      everything else, with computed styles for visual fidelity
*
* Carries a per-walk context so callers don't have to thread every flag
* through each recursion.
*/
function createIdGen() {
	let idCounter = 0;
	return () => `capture-${++idCounter}-${Math.random().toString(36).slice(2, 10)}`;
}
var RESPONSIVE_DISPLAY_CLASS = /(?:^|\s|:)(?:sm|md|lg|xl|2xl|max-sm|max-md|max-lg|max-xl):(?:hidden|block|inline|inline-block|flex|inline-flex|grid|inline-grid|table|table-cell|table-row|contents|flow-root)(?:\s|$)/;
function hasResponsiveDisplayClass(el) {
	const cls = el.getAttribute?.("class");
	return typeof cls === "string" && RESPONSIVE_DISPLAY_CLASS.test(cls);
}
function isInlineFlowSibling(n) {
	if (!n) return false;
	if (n.nodeType === Node.TEXT_NODE) return !!n.textContent && !!docTrim(n.textContent);
	if (n.nodeType === Node.ELEMENT_NODE) {
		const d = window.getComputedStyle(n).display;
		return d.startsWith("inline") || d === "contents";
	}
	return false;
}
/** The nearest sibling that isn't a comment; React leaves them between text runs (`of<!-- --> <span>`). */
function siblingPast(node, direction) {
	let sibling = node[direction];
	while (sibling && sibling.nodeType === Node.COMMENT_NODE) sibling = sibling[direction];
	return sibling;
}
/** Trim document whitespace only; `String.trim` also drops non-breaking spaces, which render. */
var docTrim = (text) => text.replace(/^[ \t\n\r\f]+|[ \t\n\r\f]+$/g, "");
/** Recurse over `parent.childNodes`, producing a flat list of captured nodes. */
function walkChildren(parent, depth, parentCS, parentFlexDir, ctx) {
	const out = [];
	const cn = (parent.shadowRoot ?? parent).childNodes;
	let allText = cn.length > 0;
	let joined = "";
	for (let i = 0; i < cn.length; i++) {
		const c = cn[i];
		if (c.nodeType !== Node.TEXT_NODE) {
			allText = false;
			break;
		}
		joined += c.textContent || "";
	}
	if (allText) {
		const trimmed = docTrim(joined);
		if (ctx.ua && parentCS && parentCS.getPropertyValue("white-space-collapse") !== "collapse" && joined) {
			const { text, styles } = snapshotText(joined, parentCS);
			const node = {
				id: ctx.nextId(),
				type: "text",
				tag: "span",
				text
			};
			if (styles) node.styles = styles;
			out.push(node);
		} else if (trimmed && ctx.ua) {
			const inline = parentCS?.display.startsWith("inline") ?? false;
			let edged = trimmed;
			if (inline) {
				edged = joined.replace(/[ \t\n\r\f]+/g, " ");
				if (!isInlineFlowSibling(siblingPast(parent, "previousSibling"))) edged = edged.replace(/^ /, "");
				if (!isInlineFlowSibling(siblingPast(parent, "nextSibling"))) edged = edged.replace(/ $/, "");
			}
			const { text, styles } = snapshotText(edged, parentCS);
			const node = {
				id: ctx.nextId(),
				type: "text",
				tag: "span",
				text
			};
			if (styles) node.styles = styles;
			out.push(node);
		} else if (trimmed) {
			const parentFiber = ctx.withFiber ? getFiber(parent) : null;
			const parentComp = parentFiber ? findContainingComponent(parentFiber) : null;
			const node = {
				id: ctx.nextId(),
				type: "text",
				tag: "span",
				text: trimmed
			};
			if (parentFiber) node._fiber = parentFiber;
			if (parentComp) {
				const compName = getComponentName(parentComp);
				if (compName) node._compNameHint = compName;
			}
			out.push(node);
		}
		return out;
	}
	for (let i = 0; i < cn.length; i++) {
		const node = cn[i];
		const captured = walkNode(node, depth, parentCS, parentFlexDir, ctx);
		if (captured) out.push(captured);
	}
	return out;
}
/** Convert a single DOM node into a captured node. */
function walkNode(node, depth, parentCS, parentFlexDir, ctx) {
	if (depth > ctx.maxDepth) return null;
	if (node.nodeType === Node.TEXT_NODE) {
		const raw = node.textContent || "";
		if (!docTrim(raw) && ctx.ua && parentCS && parentCS.getPropertyValue("white-space-collapse") !== "collapse") return {
			id: ctx.nextId(),
			type: "text",
			tag: "span",
			text: raw
		};
		if (!docTrim(raw)) {
			if (!isInlineFlowSibling(siblingPast(node, "previousSibling")) || !isInlineFlowSibling(siblingPast(node, "nextSibling"))) return null;
			const pf = node.parentElement && ctx.withFiber && !ctx.ua ? getFiber(node.parentElement) : null;
			const spaceNode = {
				id: ctx.nextId(),
				type: "text",
				tag: "span",
				text: " "
			};
			if (pf) spaceNode._fiber = pf;
			return spaceNode;
		}
		const parentFiber = node.parentElement && ctx.withFiber && !ctx.ua ? getFiber(node.parentElement) : null;
		const parentComp = parentFiber ? findContainingComponent(parentFiber) : null;
		const result = {
			id: ctx.nextId(),
			type: "text",
			tag: "span",
			text: raw
		};
		if (ctx.ua) {
			let edged = raw;
			if ((parentCS?.getPropertyValue("white-space-collapse") || "collapse") === "collapse") {
				if (!isInlineFlowSibling(siblingPast(node, "previousSibling"))) edged = edged.replace(/^[ \t\n\r\f]+/, "");
				if (!isInlineFlowSibling(siblingPast(node, "nextSibling"))) edged = edged.replace(/[ \t\n\r\f]+$/, "");
			}
			const { text, styles } = snapshotText(edged, parentCS);
			result.text = text;
			if (styles) result.styles = styles;
		}
		if (parentFiber) result._fiber = parentFiber;
		if (parentComp) {
			const compName = getComponentName(parentComp);
			if (compName) result._compNameHint = compName;
		}
		return result;
	}
	if (node.nodeType !== Node.ELEMENT_NODE) return null;
	const el = node;
	const tagUpper = el.tagName.toUpperCase();
	if (ctx.ua && tagUpper === "BR") {
		if (window.getComputedStyle(el).display === "none") return null;
		return {
			id: ctx.nextId(),
			type: "text",
			tag: "span",
			text: "\n"
		};
	}
	if (SKIP_TAGS$1.has(tagUpper)) return null;
	if (ctx.skipSelector) try {
		if (el.matches(ctx.skipSelector)) return null;
	} catch {}
	if (el.id === "devtools-indicator") return null;
	if (el.closest && el.closest("#devtools-indicator")) return null;
	if (el.hasAttribute?.("data-nextjs-toast")) return null;
	if (el.hasAttribute?.("data-next-badge-root")) return null;
	if (el.hasAttribute?.("data-nextjs-dialog-overlay")) return null;
	if (el.hasAttribute?.("data-nextjs-scroll-focus-boundary")) return null;
	if (tagUpper.startsWith("NEXTJS-") || tagUpper === "NEXT-ROUTE-ANNOUNCER") return null;
	const cs = window.getComputedStyle(el);
	if (cs.visibility === "hidden" && !ctx.ua) return null;
	if (cs.display === "none" && (ctx.ua || !hasResponsiveDisplayClass(el))) return null;
	const snapshotBody = !!ctx.ua && depth === 0 && tagUpper === "BODY";
	if (PASSTHROUGH_TAGS.has(tagUpper) && !snapshotBody) {
		const children = walkChildren(el, depth, parentCS, parentFlexDir, ctx);
		return children.length === 1 ? children[0] : null;
	}
	const isSvg = typeof SVGElement !== "undefined" && el instanceof SVGElement;
	if (isSvg && tagUpper === "SVG") {
		const hostFiber = ctx.withFiber ? getFiber(el) : null;
		const componentFiber = findKnownComponentRenderingHost(hostFiber, ctx.knownComponents);
		const componentName = componentFiber ? getComponentName(componentFiber) : null;
		if (componentFiber && componentName && !ctx.emittedComponentFibers.has(componentFiber) && !(componentFiber.alternate && ctx.emittedComponentFibers.has(componentFiber.alternate))) {
			ctx.emittedComponentFibers.add(componentFiber);
			if (componentFiber.alternate) ctx.emittedComponentFibers.add(componentFiber.alternate);
			const authored = authoredChildrenKind(componentFiber.memoizedProps?.children);
			return {
				id: ctx.nextId(),
				type: "component",
				componentName,
				props: extractComponentProps(componentFiber.memoizedProps),
				children: authored.kind === "text" ? authored.texts.map((text) => ({
					id: ctx.nextId(),
					type: "text",
					tag: "span",
					text
				})) : void 0,
				_fiber: componentFiber
			};
		}
		if (ctx.ua) {
			const svgStyles = getSnapshotStyles(cs, "svg", depth === 0 ? null : parentCS, ctx.ua);
			svgStyles.width = cs.width;
			svgStyles.height = cs.height;
			if (depth === 0) stripRootPlacement(svgStyles);
			return captureSvg(el, {
				cs,
				makeId: ctx.nextId,
				svgStyles,
				snapshot: { paint: (node, parent) => svgPaintStyles(node, parent) }
			});
		}
		const svgStyles = ctx.withComputedStyles ? getStyles(el, {
			parentCS,
			sheetCache: ctx.sheetCache,
			cs
		}) : void 0;
		const width = parseFloat(cs.width);
		const height = parseFloat(cs.height);
		const iconSized = width > 0 && width <= 64 && height > 0 && height <= 64;
		const icon = hostFiber && iconSized ? detectIcon(el, hostFiber) : null;
		return captureSvg(el, {
			cs,
			makeId: ctx.nextId,
			svgStyles,
			iconName: icon?.name,
			iconProps: icon?.fiber ? extractComponentProps(icon.fiber.memoizedProps) : void 0,
			iconSize: iconSized ? width : void 0
		});
	}
	if (isSvg) return null;
	const isVoid = VOID_ELEMENTS$1.has(tagUpper);
	const tagLower = el.tagName.toLowerCase();
	const hostFiber = ctx.withFiber ? getFiber(el) : null;
	const owningFiber = hostFiber ? resolveAsChildOwner(findOwningComponent(hostFiber)) : null;
	const owningName = owningFiber ? getComponentName(owningFiber) : null;
	const componentFiber = hostFiber ? resolveAsChildOwner(findContainingComponent(hostFiber)) : null;
	const fiberComponentName = componentFiber ? getComponentName(componentFiber) : null;
	const lgName = registryNameFromLgAttr(el.getAttribute("data-lg-component"), ctx.knownComponents);
	const slotName = registryNameFromDataSlot(el.getAttribute("data-slot"), ctx.knownComponents);
	const componentName = pickKnownComponentName([
		lgName,
		owningName,
		slotName,
		fiberComponentName
	], ctx.knownComponents);
	const emitFiber = (componentName ? findAncestorCompositeByName(hostFiber, componentName) : null) || (componentName && owningName === componentName ? owningFiber : null) || (componentName && fiberComponentName === componentName ? componentFiber : null) || null;
	const immediateComposite = hostFiber ? findImmediateComposite(hostFiber) : null;
	if (immediateComposite) {
		const stack = immediateComposite._debugStack?.stack;
		if (stack && stack.includes("next-devtools")) return null;
	}
	const childFlexDir = flexDirOf(cs);
	const isFirstEncounter = ctx.withFiber && componentName !== null && (emitFiber !== null || slotName !== null) && (emitFiber !== null && !ctx.emittedComponentFibers.has(emitFiber) && !(emitFiber.alternate && ctx.emittedComponentFibers.has(emitFiber.alternate)) || emitFiber === null && slotName !== null && componentName === slotName);
	let shouldEmitAsComponent = false;
	if (isFirstEncounter && componentName) shouldEmitAsComponent = ctx.knownComponents !== null && ctx.knownComponents.has(componentName);
	if (shouldEmitAsComponent && componentName) {
		if (emitFiber) {
			ctx.emittedComponentFibers.add(emitFiber);
			if (emitFiber.alternate) ctx.emittedComponentFibers.add(emitFiber.alternate);
		}
		const props = emitFiber ? extractComponentProps(emitFiber.memoizedProps) : void 0;
		let children;
		if (!isVoid && emitFiber) {
			const authored = authoredChildrenKind(emitFiber.memoizedProps?.children);
			if (authored.kind === "empty") children = void 0;
			else if (authored.kind === "text") children = authored.texts.map((text) => ({
				id: ctx.nextId(),
				type: "text",
				tag: "span",
				text
			}));
			else children = stripPropSynthesizedChildren(walkChildren(el, depth + 1, cs, childFlexDir, ctx), props);
		} else if (!isVoid) children = stripPropSynthesizedChildren(walkChildren(el, depth + 1, cs, childFlexDir, ctx), props);
		const result = {
			id: ctx.nextId(),
			type: "component",
			componentName,
			props,
			children: children && children.length > 0 ? children : void 0
		};
		if (emitFiber) result._fiber = emitFiber;
		return result;
	}
	if (ctx.ua) {
		const node = snapshotHtml(el, tagLower, isVoid, depth, cs, parentCS, childFlexDir, ctx, ctx.ua);
		if (snapshotBody) node.tag = "div";
		const owner = hostFiber ? resolveAsChildOwner(findOwningComponent(hostFiber)) : null;
		const hint = componentHint(owner ? getComponentName(owner) : null, el.getAttribute("data-slot"));
		if (hint) node.props = {
			...node.props,
			"data-source-component": hint
		};
		return node;
	}
	let attrs = getAttrs$2(el);
	const annotateName = pickKnownComponentName([
		lgName,
		owningName,
		slotName
	], ctx.knownComponents);
	const shouldAnnotate = !!annotateName && (lgName !== null || owningFiber !== null || slotName !== null && annotateName === slotName);
	if (shouldAnnotate && annotateName) {
		if (!attrs) attrs = {};
		attrs["data-component"] = annotateName;
	}
	const inlineStyles = extractInlineStyles(el);
	const computedStyles = ctx.withComputedStyles ? getStyles(el, {
		parentCS,
		sheetCache: ctx.sheetCache,
		cs
	}) : void 0;
	let styles;
	if (computedStyles || inlineStyles) styles = {
		...computedStyles || {},
		...inlineStyles || {}
	};
	const children = isVoid ? void 0 : walkChildren(el, depth + 1, cs, childFlexDir, ctx);
	if (styles && ctx.withStyleHeuristics) applyStyleHeuristics(styles, tagLower, {
		parentFlexDir,
		childNodes: (el.shadowRoot ?? el).childNodes,
		element: el,
		sheetCache: ctx.sheetCache
	});
	if (styles && ctx.withComputedStyles) {
		stripKeywordSizes(el, tagUpper, styles, parentFlexDir, ctx.sheetCache);
		lockRatioSizedBox(el, cs, styles);
		stripAuthoredLayout(el, styles, inlineStyles, ctx.sheetCache);
	}
	if (styles) stripCanvasInvalidPosition(styles, depth === 0);
	const result = {
		id: ctx.nextId(),
		type: "html",
		tag: tagLower,
		props: attrs,
		styles: styles && Object.keys(styles).length > 0 ? styles : void 0,
		children: children && children.length > 0 ? children : void 0
	};
	if (shouldAnnotate && annotateName) {
		const propsFiber = emitFiber || (owningName === annotateName ? owningFiber : null) || findAncestorCompositeByName(hostFiber, annotateName);
		result.capturedComponent = {
			name: annotateName,
			props: propsFiber ? extractComponentProps(propsFiber.memoizedProps) : void 0,
			liveSafe: propsFiber ? isLiveSafeComponent(propsFiber) : false
		};
	}
	if (hostFiber) result._fiber = hostFiber;
	if (componentFiber) {
		const compName = getComponentName(componentFiber);
		if (compName) result._compNameHint = compName;
	}
	return result;
}
/**
* A component name worth showing the agent: an app-style fiber name (not a
* minified `v` or a library internal like `Primitive.div`), else a
* `data-slot` design-system hint (`button` → `Button`).
*/
function componentHint(fiberName, slot) {
	if (fiberName && /^[A-Z][A-Za-z0-9]{2,}$/.test(fiberName)) return fiberName;
	if (!slot) return null;
	return slot.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join("") || null;
}
var isStylingHook = (name) => name === "className" || name === "id" || name.startsWith("data-");
/**
* A fixed element is pinned to a viewport the canvas doesn't have. Place it
* absolutely where it sat, relative to the nearest positioned captured
* ancestor. The computed `left`/`top` are its position before transforms and
* margins, so both stay as they are. A root is placed by the canvas instead.
*/
function placeFixed(cs, styles, from, ctx) {
	let anchor = from;
	while (anchor && !ctx.captureRoots.has(anchor) && window.getComputedStyle(anchor).position === "static") anchor = anchor.parentElement;
	if (!anchor) return;
	let originX = 0;
	let originY = 0;
	for (let node = from; node; node = node.parentElement) {
		const ncs = window.getComputedStyle(node);
		if (ncs.transform !== "none" || ncs.filter !== "none" || ncs.perspective !== "none" || /paint|layout|strict|content/.test(ncs.contain) || ncs.backdropFilter !== "none") {
			const box = node.getBoundingClientRect();
			originX = box.left + node.clientLeft;
			originY = box.top + node.clientTop;
			break;
		}
	}
	const frame = anchor.getBoundingClientRect();
	for (const key of [
		"top",
		"right",
		"bottom",
		"left",
		"inset"
	]) delete styles[key];
	styles.position = "absolute";
	styles.left = `${Math.round(originX + parseFloat(cs.left) - frame.left - anchor.clientLeft)}px`;
	styles.top = `${Math.round(originY + parseFloat(cs.top) - frame.top - anchor.clientTop)}px`;
	if (styles.width === void 0) styles.width = cs.width;
}
/** `x,y,width,height` of an element relative to its capture root. */
function captureRect(el, ctx) {
	let root = el;
	while (!ctx.captureRoots.has(root) && root.parentElement) root = root.parentElement;
	const box = el.getBoundingClientRect();
	const origin = root.getBoundingClientRect();
	return [
		box.left - origin.left,
		box.top - origin.top,
		box.width,
		box.height
	].map((n) => Math.round(n)).join(",");
}
/** A top-level node is placed by the canvas, not by its old surroundings. */
function stripRootPlacement(styles) {
	for (const key of [
		"margin",
		"marginTop",
		"marginRight",
		"marginBottom",
		"marginLeft"
	]) delete styles[key];
}
/** Html element for a snapshot capture (see `snapshot.ts`). */
function snapshotHtml(el, tagLower, isVoid, depth, cs, parentCS, childFlexDir, ctx, ua) {
	const isRoot = depth === 0;
	const props = getAttrs$2(el) ?? {};
	for (const name of Object.keys(props)) if (isStylingHook(name)) delete props[name];
	if (el instanceof HTMLInputElement && !isSensitiveInput(el) || el instanceof HTMLTextAreaElement) {
		if (el.value) props.value = el.value;
	}
	const styles = getSnapshotStyles(cs, tagLower, isRoot ? null : parentCS, ua, el);
	stripKeywordSizes(el, tagLower.toUpperCase(), styles, void 0, null);
	lockRatioSizedBox(el, cs, styles);
	if (isRoot) ctx.captureRoots.add(el);
	if (cs.position === "fixed" && !isRoot) placeFixed(cs, styles, el.parentElement, ctx);
	if (cs.position === "sticky") {
		styles.position = "relative";
		for (const key of [
			"top",
			"right",
			"bottom",
			"left",
			"inset"
		]) delete styles[key];
	}
	if (isRoot && (cs.position === "fixed" || cs.position === "absolute")) {
		delete styles.translate;
		if (/^matrix\(1, 0, 0, 1, /.test(cs.transform)) delete styles.transform;
	}
	if (isRoot) {
		stripRootPlacement(styles);
		const backdrop = backdropColor(el);
		if (backdrop) styles.backgroundColor = backdrop;
		if (cs.display === "inline" || cs.display === "contents") {
			styles.display = "block";
			const parent = el.parentElement;
			const width = el.getBoundingClientRect().width || parent?.clientWidth || 0;
			if (width) styles.width = `${Math.round(width)}px`;
		}
		if (styles.width === void 0 && !cs.display.startsWith("inline") && el instanceof HTMLElement) styles.width = `${el.offsetWidth}px`;
	}
	stripCanvasInvalidPosition(styles, isRoot);
	if (el instanceof HTMLCanvasElement) try {
		const src = el.toDataURL("image/webp", .92);
		if (src.startsWith("data:image/")) {
			if (ctx.annotateGeometry) props["data-capture-rect"] = captureRect(el, ctx);
			return {
				id: ctx.nextId(),
				type: "html",
				tag: "img",
				props: {
					...props,
					src,
					alt: ""
				},
				styles: Object.keys(styles).length > 0 ? styles : void 0
			};
		}
	} catch {}
	const children = [];
	if (!isVoid) {
		const inline = cs.display.startsWith("inline");
		const pseudo = {
			nextId: ctx.nextId,
			counters: ctx.counters,
			place: (pcs, ps) => placeFixed(pcs, ps, el, ctx),
			inlineBefore: inline && isInlineFlowSibling(siblingPast(el, "previousSibling")),
			inlineAfter: inline && isInlineFlowSibling(siblingPast(el, "nextSibling"))
		};
		const before = capturePseudo(el, "::before", cs, ua, pseudo);
		if (before) children.push(before);
		children.push(...walkChildren(el, depth + 1, cs, childFlexDir, ctx));
		const after = capturePseudo(el, "::after", cs, ua, pseudo);
		if (after) children.push(after);
	}
	if (ctx.annotateGeometry) props["data-capture-rect"] = captureRect(el, ctx);
	return {
		id: ctx.nextId(),
		type: "html",
		tag: tagLower,
		props: Object.keys(props).length > 0 ? props : void 0,
		styles: Object.keys(styles).length > 0 ? styles : void 0,
		children: children.length > 0 ? children : void 0
	};
}
/** Helper: flex-direction of an element, or undefined when not flex. */
function flexDirOf(cs) {
	if (cs.display === "flex" || cs.display === "inline-flex") return cs.flexDirection;
}

export { createIdGen, walkChildren, walkNode };
