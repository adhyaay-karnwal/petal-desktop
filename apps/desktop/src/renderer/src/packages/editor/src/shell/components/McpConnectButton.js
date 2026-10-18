// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/McpConnectButton.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { McpConnectModal } from "./McpConnectModal.js";

/**
* Headless MCP-connect state: an `openMcp` action plus the modal node to render.
*
* Render `mcpModal` somewhere that stays mounted independently of the trigger — in
* particular NOT inside a DropdownMenu's content, which unmounts its children when the
* menu closes and would tear down the modal the instant it opens (LUN-115). A menu row
* should call `openMcp` while the modal lives at a stable spot in the tree.
*/
function useMcpConnect(fetchMcpInfo) {
	const $ = (0, import_compiler_runtime.c)(9);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [info, setInfo] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	let t0;
	if ($[0] !== fetchMcpInfo) {
		t0 = async () => {
			setOpen(true);
			if (!fetchMcpInfo) return;
			setLoading(true);
			await fetchMcpInfo().then(setInfo).catch(() => setInfo(null)).finally(() => setLoading(false));
		};
		$[0] = fetchMcpInfo;
		$[1] = t0;
	} else t0 = $[1];
	const openMcp = t0;
	const t1 = loading && !!fetchMcpInfo;
	let t2;
	if ($[2] !== info || $[3] !== open || $[4] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(McpConnectModal, {
			open,
			onOpenChange: setOpen,
			info,
			loading: t1
		});
		$[2] = info;
		$[3] = open;
		$[4] = t1;
		$[5] = t2;
	} else t2 = $[5];
	const mcpModal = t2;
	let t3;
	if ($[6] !== mcpModal || $[7] !== openMcp) {
		t3 = {
			openMcp,
			mcpModal
		};
		$[6] = mcpModal;
		$[7] = openMcp;
		$[8] = t3;
	} else t3 = $[8];
	return t3;
}

export { useMcpConnect };
