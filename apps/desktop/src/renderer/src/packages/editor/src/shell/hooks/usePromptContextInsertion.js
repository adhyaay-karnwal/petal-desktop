// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/hooks/usePromptContextInsertion.ts
import { import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

/** Wait for the last chat to load and become visible before inserting canvas context. */
function usePromptContextInsertion(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { loading, visible, chatCount, activeChatId, panelRef, reveal, createChat } = t0;
	let t1;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = [];
		$[0] = t1;
	} else t1 = $[0];
	const pending = (0, import_react.useRef)(t1);
	let t2;
	if ($[1] !== chatCount || $[2] !== createChat || $[3] !== loading || $[4] !== panelRef || $[5] !== visible) {
		t2 = () => {
			if (pending.current.length === 0 || loading || !visible) return;
			if (chatCount === 0) {
				createChat();
				return;
			}
			const panel = panelRef.current;
			if (!panel) return;
			const insertions = pending.current;
			pending.current = [];
			for (const insert of insertions) insert(panel);
		};
		$[1] = chatCount;
		$[2] = createChat;
		$[3] = loading;
		$[4] = panelRef;
		$[5] = visible;
		$[6] = t2;
	} else t2 = $[6];
	let t3;
	if ($[7] !== activeChatId || $[8] !== chatCount || $[9] !== createChat || $[10] !== loading || $[11] !== panelRef || $[12] !== visible) {
		t3 = [
			loading,
			visible,
			chatCount,
			activeChatId,
			panelRef,
			createChat
		];
		$[7] = activeChatId;
		$[8] = chatCount;
		$[9] = createChat;
		$[10] = loading;
		$[11] = panelRef;
		$[12] = visible;
		$[13] = t3;
	} else t3 = $[13];
	(0, import_react.useLayoutEffect)(t2, t3);
	let t4;
	if ($[14] !== chatCount || $[15] !== createChat || $[16] !== loading || $[17] !== panelRef || $[18] !== reveal || $[19] !== visible) {
		t4 = (insert_0) => {
			const panel_0 = panelRef.current;
			if (!loading && visible && chatCount > 0 && panel_0) {
				const insertions_0 = [...pending.current, insert_0];
				pending.current = [];
				for (const queued of insertions_0) queued(panel_0);
				return;
			}
			pending.current = [...pending.current, insert_0];
			reveal();
			if (!loading && chatCount === 0) createChat();
		};
		$[14] = chatCount;
		$[15] = createChat;
		$[16] = loading;
		$[17] = panelRef;
		$[18] = reveal;
		$[19] = visible;
		$[20] = t4;
	} else t4 = $[20];
	return t4;
}

export { usePromptContextInsertion };
