// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/shortcuts/useGlobalShortcut.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { GLOBAL_SHORTCUTS } from "./catalog.js";
import { matchesShortcut } from "./matchShortcut.js";

var registrationsById = /* @__PURE__ */ new Map();
var listening = false;
function startListening() {
	if (listening) return;
	window.addEventListener("keydown", dispatch);
	listening = true;
}
function stopListeningIfIdle() {
	for (const registrations of registrationsById.values()) if (registrations.size > 0) return;
	if (!listening) return;
	window.removeEventListener("keydown", dispatch);
	listening = false;
}
function registrationsFor(id) {
	let registrations = registrationsById.get(id);
	if (!registrations) {
		registrations = /* @__PURE__ */ new Set();
		registrationsById.set(id, registrations);
	}
	return registrations;
}
function dispatch(e) {
	for (const id of Object.keys(GLOBAL_SHORTCUTS)) {
		if (!matchesShortcut(e, GLOBAL_SHORTCUTS[id])) continue;
		const registrations = registrationsById.get(id);
		if (!registrations) continue;
		for (const registration of registrations) if (registration.enabledRef.current) registration.handlerRef.current(e);
	}
}
/**
* Registers `handler` against a GLOBAL_SHORTCUTS entry. Every call site shares
* one window keydown listener (module-level) instead of adding its own — the
* dispatcher looks up the pressed combo and invokes every enabled handler
* registered for it, matching how the independent per-site listeners this
* replaces used to behave.
*/
function useGlobalShortcut(id, handler, t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const enabled = t0 === void 0 ? true : t0;
	const handlerRef = (0, import_react.useRef)(handler);
	const enabledRef = (0, import_react.useRef)(enabled);
	let t1;
	if ($[0] !== enabled || $[1] !== handler) {
		t1 = () => {
			handlerRef.current = handler;
			enabledRef.current = enabled;
		};
		$[0] = enabled;
		$[1] = handler;
		$[2] = t1;
	} else t1 = $[2];
	(0, import_react.useLayoutEffect)(t1);
	let t2;
	let t3;
	if ($[3] !== id) {
		t2 = () => {
			const registration = {
				handlerRef,
				enabledRef
			};
			const registrations = registrationsFor(id);
			registrations.add(registration);
			startListening();
			return () => {
				registrations.delete(registration);
				stopListeningIfIdle();
			};
		};
		t3 = [id];
		$[3] = id;
		$[4] = t2;
		$[5] = t3;
	} else {
		t2 = $[4];
		t3 = $[5];
	}
	(0, import_react.useEffect)(t2, t3);
}

export { useGlobalShortcut };
