// Reconstructed from index.js — original module: packages/compiler/src/store/sanitize.ts

/** DOM attrs Petal sets from element.id — never user/agent-editable props */
var LUNAGRAPH_OWNED_DOM_PROPS = ["data-element-id", "dataElementId"];
/**
* Coerce a parsed `className` prop into a CSS class string.
* Streaming / shadcn JSX often uses `className={cn(...)}`, arrays, or
* `{ flex: true }` maps — those are not strings, and `.match` on them
* takes down the whole editor.
*/
function coerceClassName(value) {
	if (value == null || value === false) return void 0;
	if (typeof value === "string") return value;
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	if (Array.isArray(value)) {
		const parts = value.map(coerceClassName).filter((part) => !!part);
		return parts.length > 0 ? parts.join(" ") : void 0;
	}
	if (typeof value === "object") {
		const parts = Object.keys(value).filter((key) => !!value[key]);
		return parts.length > 0 ? parts.join(" ") : void 0;
	}
}
function sanitizeElementProps(props) {
	if (!props) return props;
	let changed = false;
	const next = { ...props };
	for (const key of LUNAGRAPH_OWNED_DOM_PROPS) if (key in next) {
		delete next[key];
		changed = true;
	}
	if ("className" in next) {
		const className = coerceClassName(next.className);
		if (className === void 0) {
			delete next.className;
			changed = true;
		} else if (className !== next.className) {
			next.className = className;
			changed = true;
		}
	}
	if (!changed) return props;
	return Object.keys(next).length > 0 ? next : void 0;
}
/**
* Editor-only upload-progress markers. Kept in the live store so the loading
* placeholder renders, but never serialized (toWire) or emitted in codegen —
* a `blob:` preview URL or a stuck `data-uploading` would be meaningless (and
* a permanent spinner) once outside the session that created them.
*
* Unlike LUNAGRAPH_OWNED_DOM_PROPS these are NOT stripped by sanitizeElementProps:
* sanitize runs on the insert path, where the marker must survive so the
* placeholder can show its spinner.
*/
var TRANSIENT_UPLOAD_PROPS = ["data-uploading", "data-upload-preview"];
function isTransientUploadProp(key) {
	return TRANSIENT_UPLOAD_PROPS.includes(key);
}

export { isTransientUploadProp, sanitizeElementProps };
