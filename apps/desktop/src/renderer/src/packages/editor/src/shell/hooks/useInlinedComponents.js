// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/useInlinedComponents.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { importHeaderEnd, inlineLocalImportParts } from "../../../../compiler/src/codegen/inlineLocalImports.js";

/**
* Builds the Selection tab's file with every project component it imports
* inlined (File settings → Copy code). The result only depends on the file's
* imports, so it is rebuilt when they change, not on every canvas edit, and
* cached per import set until components recompile. Null until the first build
* lands; the tab shows the plain file meanwhile.
*/
function useInlinedComponents(t0) {
	const $ = (0, import_compiler_runtime.c)(17);
	const { enabled, backend, code, components } = t0;
	let t1;
	bb0: {
		if (!enabled) {
			t1 = null;
			break bb0;
		}
		let t2;
		if ($[0] !== code) {
			const end = importHeaderEnd(code);
			t2 = end == null ? null : code.slice(0, end);
			$[0] = code;
			$[1] = t2;
		} else t2 = $[1];
		t1 = t2;
	}
	const header = t1;
	let t2;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ new Map();
		$[2] = t2;
	} else t2 = $[2];
	const cacheRef = (0, import_react.useRef)(t2);
	const [result, setResult] = (0, import_react.useState)(null);
	let t3;
	if ($[3] !== code) {
		t3 = () => code;
		$[3] = code;
		$[4] = t3;
	} else t3 = $[4];
	const readCode = (0, import_react.useEffectEvent)(t3);
	let t4;
	if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = () => {
			cacheRef.current = /* @__PURE__ */ new Map();
		};
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== backend || $[7] !== components) {
		t5 = [backend, components];
		$[6] = backend;
		$[7] = components;
		$[8] = t5;
	} else t5 = $[8];
	(0, import_react.useEffect)(t4, t5);
	let t6;
	if ($[9] !== backend || $[10] !== header || $[11] !== readCode) {
		t6 = () => {
			if (header == null || !backend) return;
			const cache = cacheRef.current;
			const cached = cache.get(header);
			if (cached) {
				setResult(cached);
				return;
			}
			let cancelled = false;
			const entry = readCode();
			backend.listFiles("").then((paths) => inlineLocalImportParts({
				entry,
				projectPaths: new Set(paths),
				readFile: (path) => backend.readFileRaw(path)
			})).then((file) => {
				const built = {
					...file,
					header: entry.slice(0, file.entryStart)
				};
				cache.set(built.header, built);
				if (!cancelled) setResult(built);
			}).catch(_temp$38);
			return () => {
				cancelled = true;
			};
		};
		$[9] = backend;
		$[10] = header;
		$[11] = readCode;
		$[12] = t6;
	} else t6 = $[12];
	let t7;
	if ($[13] !== backend || $[14] !== components || $[15] !== header) {
		t7 = [
			header,
			backend,
			components
		];
		$[13] = backend;
		$[14] = components;
		$[15] = header;
		$[16] = t7;
	} else t7 = $[16];
	(0, import_react.useEffect)(t6, t7);
	return enabled ? result : null;
}
function _temp$38() {}

export { useInlinedComponents };
