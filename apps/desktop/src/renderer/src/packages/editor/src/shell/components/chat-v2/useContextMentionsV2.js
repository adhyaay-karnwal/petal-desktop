// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/chat-v2/useContextMentionsV2.ts
import { import_react } from "../../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../../cloud/src/hooks/useSession.js";
import { getContextOptions, readContextToken } from "../../utils/chatContextReferences.js";

/**
* `@` mentions for agents-v2. Connections are the selected agent's MCP servers,
* loaded by the panel; null while that list is still on its way.
*/
function useContextMentionsV2(inputRef, components, pages, onSelect, onInput, servers) {
	const $ = (0, import_compiler_runtime.c)(29);
	const id = (0, import_react.useId)();
	const [query, setQuery] = (0, import_react.useState)(null);
	const [index, setIndex] = (0, import_react.useState)(0);
	const dismissed = (0, import_react.useRef)(null);
	const open = query !== null;
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = () => setQuery(null);
		$[0] = t0;
	} else t0 = $[0];
	const close = t0;
	let t1;
	if ($[1] !== inputRef || $[2] !== query) {
		t1 = () => {
			const token = readContextToken(inputRef.current);
			if (!token) {
				dismissed.current = null;
				setQuery(null);
				return;
			}
			const next = token.toString().slice(1);
			if (dismissed.current !== null && next.startsWith(dismissed.current)) return;
			dismissed.current = null;
			if (query !== next) setIndex(0);
			setQuery(next);
		};
		$[1] = inputRef;
		$[2] = query;
		$[3] = t1;
	} else t1 = $[3];
	const sync = t1;
	let t2;
	if ($[4] !== components || $[5] !== open || $[6] !== pages || $[7] !== query || $[8] !== servers) {
		t2 = open ? getContextOptions(components, pages, servers ?? [], /* @__PURE__ */ new Set(), query) : [];
		$[4] = components;
		$[5] = open;
		$[6] = pages;
		$[7] = query;
		$[8] = servers;
		$[9] = t2;
	} else t2 = $[9];
	const options = t2;
	const selectedIndex = Math.min(index, Math.max(0, options.length - 1));
	let t3;
	if ($[10] !== inputRef || $[11] !== onInput || $[12] !== onSelect) {
		t3 = (option) => {
			const token_0 = readContextToken(inputRef.current);
			if (!token_0) return;
			token_0.deleteContents();
			token_0.collapse(true);
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(token_0);
			close();
			onSelect(option);
			onInput();
		};
		$[10] = inputRef;
		$[11] = onInput;
		$[12] = onSelect;
		$[13] = t3;
	} else t3 = $[13];
	const select = t3;
	let t4;
	if ($[14] !== open || $[15] !== options || $[16] !== query || $[17] !== select || $[18] !== selectedIndex) {
		t4 = (event) => {
			if (!open || event.nativeEvent.isComposing) return false;
			if (event.key === "Escape") {
				event.preventDefault();
				dismissed.current = query;
				close();
				return true;
			}
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				if (options.length) setIndex((selectedIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
				return true;
			}
			if (event.key === "Tab" || event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				if (options[selectedIndex]) select(options[selectedIndex]);
				return true;
			}
			return false;
		};
		$[14] = open;
		$[15] = options;
		$[16] = query;
		$[17] = select;
		$[18] = selectedIndex;
		$[19] = t4;
	} else t4 = $[19];
	const onKeyDown = t4;
	const t5 = servers === null;
	let t6;
	if ($[20] !== id || $[21] !== onKeyDown || $[22] !== open || $[23] !== options || $[24] !== select || $[25] !== selectedIndex || $[26] !== sync || $[27] !== t5) {
		t6 = {
			id,
			open,
			options,
			selectedIndex,
			setIndex,
			select,
			onKeyDown,
			sync,
			close,
			loading: t5
		};
		$[20] = id;
		$[21] = onKeyDown;
		$[22] = open;
		$[23] = options;
		$[24] = select;
		$[25] = selectedIndex;
		$[26] = sync;
		$[27] = t5;
		$[28] = t6;
	} else t6 = $[28];
	return t6;
}

export { useContextMentionsV2 };
