// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/state/webviewEditStore.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/**
* Shared state for a live-webview edit session.
*
* The webview renders as a canvas element (WebviewRenderer) but its controls
* (inspect / edit / refresh) and the change list live in the
* editor's RIGHT SIDEBAR (WebviewEditPanel). Rather than thread state up and
* commands down through Canvas → renderElement → WebviewRenderer, both sides
* talk to this tiny external store. One active session at a time, which is all
* the UI supports.
*
* Flow:
*   - Panel sets `mode` / bumps `refreshNonce` → WebviewRenderer reacts.
*   - WebviewRenderer publishes `selection` (with its tier) and appends `changes`.
*   - Panel renders the controls, the tier badge, and the categorized change list.
*/
var initial = {
	active: false,
	activeWebviewId: null,
	mode: "none",
	live: false,
	tool: "interact",
	refreshNonce: 0,
	captureNonce: 0,
	captureMode: "html",
	snapshotNonce: 0,
	snapshotting: false,
	fitHeightNonce: 0,
	fittedHeight: false,
	status: null,
	syncing: false,
	webviewUrl: "",
	webviewWidth: 0,
	webviewHeight: 0,
	selection: null,
	changes: []
};
var state$1 = initial;
var listeners$3 = /* @__PURE__ */ new Set();
var actions = null;
function emit(next) {
	state$1 = {
		...state$1,
		...next
	};
	listeners$3.forEach((l) => l());
}
var webviewEditStore = {
	getState: () => state$1,
	subscribe(listener) {
		listeners$3.add(listener);
		return () => listeners$3.delete(listener);
	},
	setActiveWebview: (id, selected) => {
		if (selected) {
			if (state$1.activeWebviewId === id) return { droppedChanges: 0 };
			const dropped = state$1.changes.filter((c) => !c.saved).length;
			emit({
				active: true,
				activeWebviewId: id,
				live: false,
				fittedHeight: false,
				selection: null,
				changes: [],
				mode: "none",
				status: null,
				syncing: false
			});
			return { droppedChanges: dropped };
		}
		if (state$1.activeWebviewId === id) {
			const dropped = state$1.changes.filter((c) => !c.saved).length;
			emit({
				active: false,
				activeWebviewId: null,
				mode: "none",
				live: false,
				fittedHeight: false,
				selection: null,
				changes: []
			});
			return { droppedChanges: dropped };
		}
		return { droppedChanges: 0 };
	},
	setMode: (mode) => emit({
		mode,
		...mode === "edit" ? {} : { selection: null }
	}),
	/** The active preview takes the pointer with `tool`. */
	goLive: (tool) => emit({
		live: true,
		tool
	}),
	goStatic: () => {
		if (state$1.live) emit({ live: false });
	},
	requestSnapshot: () => emit({ snapshotNonce: state$1.snapshotNonce + 1 }),
	setSnapshotting: (snapshotting) => emit({ snapshotting }),
	requestFitHeight: () => emit({ fitHeightNonce: state$1.fitHeightNonce + 1 }),
	setFittedHeight: (fittedHeight) => {
		if (state$1.fittedHeight !== fittedHeight) emit({ fittedHeight });
	},
	requestRefresh: () => emit({ refreshNonce: state$1.refreshNonce + 1 }),
	requestCapture: (mode) => emit({
		captureNonce: state$1.captureNonce + 1,
		captureMode: mode
	}),
	setSelection: (selection) => emit({ selection }),
	patchSelection: (patch) => emit({ selection: state$1.selection ? {
		...state$1.selection,
		...patch
	} : state$1.selection }),
	/** Record a change (or update the last one for the same property+element so a
	*  stepper drag collapses into a single entry rather than N rows). */
	recordChange: (change) => {
		const existingIdx = state$1.changes.findIndex((c) => c.id === change.id);
		if (existingIdx >= 0) {
			const prev = state$1.changes[existingIdx];
			const mergedEdit = prev.edit?.kind === "style-merge" && change.edit?.kind === "style-merge" ? {
				kind: "style-merge",
				styles: {
					...prev.edit.styles,
					...change.edit.styles
				}
			} : change.edit;
			const next = state$1.changes.slice();
			next[existingIdx] = {
				...change,
				before: prev.before,
				edit: mergedEdit
			};
			emit({ changes: next });
		} else emit({ changes: [...state$1.changes, change] });
	},
	setStatus: (status) => emit({ status }),
	setSyncing: (syncing) => emit({ syncing }),
	setWebviewInfo: (webviewUrl, webviewWidth, webviewHeight) => emit({
		webviewUrl,
		webviewWidth,
		webviewHeight
	}),
	clearChanges: () => emit({ changes: [] }),
	/** Drop already-saved changes, keep anything still pending (e.g. AI-tier). */
	clearSavedChanges: () => emit({ changes: state$1.changes.filter((c) => !c.saved) }),
	setChangeSaved: (id, saved) => emit({ changes: state$1.changes.map((c) => c.id === id ? {
		...c,
		saved
	} : c) }),
	hasUnsaved: () => state$1.changes.some((c) => !c.saved),
	reset: () => emit({ ...initial }),
	setActions: (a) => {
		actions = a;
	},
	getActions: () => actions
};
function useWebviewEditState() {
	return (0, import_react.useSyncExternalStore)(webviewEditStore.subscribe, webviewEditStore.getState, webviewEditStore.getState);
}
/** One value from the store, re-rendering only when that value changes. `select` must return a primitive. */
function useWebviewEditValue(select) {
	const $ = (0, import_compiler_runtime.c)(3);
	let t0;
	let t1;
	if ($[0] !== select) {
		t0 = () => select(state$1);
		t1 = () => select(initial);
		$[0] = select;
		$[1] = t0;
		$[2] = t1;
	} else {
		t0 = $[1];
		t1 = $[2];
	}
	return (0, import_react.useSyncExternalStore)(webviewEditStore.subscribe, t0, t1);
}

export { useWebviewEditState, useWebviewEditValue, webviewEditStore };
