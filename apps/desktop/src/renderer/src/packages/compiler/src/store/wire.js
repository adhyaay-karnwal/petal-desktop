// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/store/wire.ts
import { isTransientUploadProp } from "./sanitize.js";

function toWire(store) {
	const byId = {};
	for (const [id, el] of store.byId) byId[id] = stripNonSerializable$1(el);
	const childrenByParent = {};
	for (const [parent, ids] of store.childrenByParent) childrenByParent[parent] = [...ids];
	return {
		schemaVersion: 2,
		byId,
		childrenByParent
	};
}
function stripNonSerializable$1(el) {
	const cleaned = {};
	for (const key of Object.keys(el)) {
		if (key === "componentRef" || key === "isRegistered") continue;
		const val = el[key];
		if (typeof val === "function") continue;
		if (key === "props" && val && typeof val === "object") {
			const cleanedProps = {};
			for (const [pk, pv] of Object.entries(val)) if (typeof pv !== "function" && !isTransientUploadProp(pk)) cleanedProps[pk] = pv;
			cleaned.props = cleanedProps;
		} else cleaned[key] = val;
	}
	return cleaned;
}

export { toWire };
