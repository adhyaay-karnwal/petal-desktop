// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/flexShrink.ts
import { getById, getChildren$2, getDescendantIds, getParentId } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createSetStylesOperation } from "./operations.js";

function isFlexDisplay(styles) {
	const display = styles?.display;
	return display === "flex" || display === "inline-flex";
}
function isFlexParent(store, parentId) {
	return parentId != null && parentId !== "ROOT" && isFlexDisplay(getById(store, parentId)?.styles);
}
function normalizeFlexShrinkOps(storeAfter, ops, options = {}) {
	const extra = [];
	let cur = storeAfter;
	let unapplied = [];
	const touched = /* @__PURE__ */ new Set();
	const storeFor = (id) => {
		if (unapplied.length > 0 && touched.has(id)) {
			cur = applyOperationsToStore(cur, unapplied);
			unapplied = [];
		}
		return cur;
	};
	const commit = (id, op) => {
		if (!op) return;
		extra.push(op);
		unapplied.push(op);
		touched.add(id);
	};
	const addShrink = (id) => {
		const store = storeFor(id);
		const el = getById(store, id);
		if (!el || !isFlexParent(store, getParentId(store, id))) return;
		const styles = el.styles ?? {};
		if (styles.flex !== void 0 || styles.flexShrink !== void 0) return;
		commit(id, createSetStylesOperation(store, id, {
			...styles,
			flexShrink: 0
		}));
	};
	const removeShrink = (id) => {
		const store = storeFor(id);
		const styles = getById(store, id)?.styles;
		if (!styles || styles.flexShrink !== 0 && styles.flexShrink !== "0") return;
		const rest = { ...styles };
		delete rest.flexShrink;
		commit(id, createSetStylesOperation(store, id, rest));
	};
	for (const op of ops) switch (op.type) {
		case "insert":
			if (options.skipInserts) break;
			addShrink(op.element.id);
			for (const descendant of getDescendantIds(cur, op.element.id)) addShrink(descendant);
			break;
		case "move":
			addShrink(op.elementId);
			break;
		case "replace":
			addShrink(op.newElement.id);
			break;
		case "set_styles": {
			const wasFlex = isFlexDisplay(op.oldStyles);
			const nowFlex = isFlexDisplay(op.newStyles);
			if (nowFlex && !wasFlex) for (const child of getChildren$2(cur, op.elementId)) addShrink(child);
			else if (wasFlex && !nowFlex) for (const child of getChildren$2(cur, op.elementId)) removeShrink(child);
			break;
		}
	}
	return extra;
}

export { normalizeFlexShrinkOps };
