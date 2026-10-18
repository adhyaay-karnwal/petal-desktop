// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/ChatReferenceChip.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { FileIcon, FolderIcon, ImageIcon, PlugsIcon } from "../../../../ui/src/icons.js";
import { getById } from "../../../../compiler/src/store/read.js";
import { AREA_CHIP_ATTR, getAreaHighlight, publishAreaHighlight } from "../../shared/state/areaHighlightChannel.js";
import { useHover } from "../../shared/state/hover.js";
import { connectionDisplayName } from "../hooks/useClaudeContext.js";
import { ContextChip } from "./ChatContextControls.js";
import { CanvasContextChip } from "./CanvasContextChip.js";
import { ImageContextChip } from "./ImageContextChip.js";

var REFERENCE_ICONS = {
	image: ImageIcon,
	file: FileIcon,
	connection: PlugsIcon,
	folder: FolderIcon,
	page: FileIcon
};
/**
* Draft and sent sources share their label, icon, chip geometry, and hover
* behavior. Hovering a canvas reference points at it on the canvas: an element
* gets the canvas hover outline, a masked area its outline and label.
*/
function ChatReferenceChip(props) {
	const $ = (0, import_compiler_runtime.c)(22);
	const { reference } = props;
	const region = reference.region;
	const isElement = reference.type === "element";
	let t0;
	let t1;
	if ($[0] !== isElement || $[1] !== reference.id || $[2] !== region) {
		t0 = () => () => {
			if (region && getAreaHighlight()?.key === reference.id) publishAreaHighlight(null);
			if (isElement) useHover.getState().clearHover(reference.id);
		};
		t1 = [
			reference.id,
			region,
			isElement
		];
		$[0] = isElement;
		$[1] = reference.id;
		$[2] = region;
		$[3] = t0;
		$[4] = t1;
	} else {
		t0 = $[3];
		t1 = $[4];
	}
	(0, import_react.useEffect)(t0, t1);
	let t2;
	if ($[5] !== props) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceChipBody, { ...props });
		$[5] = props;
		$[6] = t2;
	} else t2 = $[6];
	const chip = t2;
	if (!region && !isElement) return chip;
	let t3;
	if ($[7] !== reference.id || $[8] !== region) {
		t3 = region ? { [AREA_CHIP_ATTR]: reference.id } : {};
		$[7] = reference.id;
		$[8] = region;
		$[9] = t3;
	} else t3 = $[9];
	let t4;
	if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = { display: "contents" };
		$[10] = t4;
	} else t4 = $[10];
	let t5;
	if ($[11] !== reference.id || $[12] !== reference.name || $[13] !== region) {
		t5 = () => {
			if (region) publishAreaHighlight({
				key: reference.id,
				label: reference.name,
				rect: region.rect,
				pageId: region.pageId
			});
			else useHover.getState().setHovered(reference.id, "panel");
		};
		$[11] = reference.id;
		$[12] = reference.name;
		$[13] = region;
		$[14] = t5;
	} else t5 = $[14];
	let t6;
	if ($[15] !== region) {
		t6 = () => {
			if (region) publishAreaHighlight(null);
			else useHover.getState().clearHover();
		};
		$[15] = region;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== chip || $[18] !== t3 || $[19] !== t5 || $[20] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			...t3,
			style: t4,
			onMouseEnter: t5,
			onMouseLeave: t6,
			children: chip
		});
		$[17] = chip;
		$[18] = t3;
		$[19] = t5;
		$[20] = t6;
		$[21] = t7;
	} else t7 = $[21];
	return t7;
}
function ReferenceChipBody(t0) {
	const $ = (0, import_compiler_runtime.c)(36);
	const { reference, store, onRemove, onSelectElement, className } = t0;
	if (reference.type === "component") {
		const t1 = reference.path ?? reference.name;
		let t2;
		if ($[0] !== className || $[1] !== onRemove || $[2] !== reference.name || $[3] !== t1) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
				component: true,
				label: reference.name,
				title: t1,
				onRemove,
				className
			});
			$[0] = className;
			$[1] = onRemove;
			$[2] = reference.name;
			$[3] = t1;
			$[4] = t2;
		} else t2 = $[4];
		return t2;
	}
	if (reference.type === "element") {
		let t1;
		if ($[5] !== reference.id || $[6] !== store) {
			t1 = getById(store, reference.id);
			$[5] = reference.id;
			$[6] = store;
			$[7] = t1;
		} else t1 = $[7];
		const element = t1;
		let t2;
		if ($[8] !== reference.name) {
			let t3;
			if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
				t3 = /^<([^>]+)>.*$/;
				$[10] = t3;
			} else t3 = $[10];
			t2 = reference.name.replace(t3, "$1");
			$[8] = reference.name;
			$[9] = t2;
		} else t2 = $[9];
		const label = t2;
		const t3 = reference.elementKind === "component";
		const t4 = element && onSelectElement ? `Show ${label} on canvas` : reference.name;
		let t5;
		if ($[11] !== onSelectElement || $[12] !== reference.id) {
			t5 = onSelectElement ? () => onSelectElement(reference.id) : void 0;
			$[11] = onSelectElement;
			$[12] = reference.id;
			$[13] = t5;
		} else t5 = $[13];
		const t6 = !onRemove;
		let t7;
		if ($[14] !== className || $[15] !== element || $[16] !== label || $[17] !== onRemove || $[18] !== t3 || $[19] !== t4 || $[20] !== t5 || $[21] !== t6) {
			t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasContextChip, {
				element,
				label,
				component: t3,
				title: t4,
				onClick: t5,
				onRemove,
				showNavigationIcon: t6,
				className
			});
			$[14] = className;
			$[15] = element;
			$[16] = label;
			$[17] = onRemove;
			$[18] = t3;
			$[19] = t4;
			$[20] = t5;
			$[21] = t6;
			$[22] = t7;
		} else t7 = $[22];
		return t7;
	}
	let t1;
	if ($[23] !== reference) {
		t1 = reference.type === "connection" ? connectionDisplayName(reference) : reference.name;
		$[23] = reference;
		$[24] = t1;
	} else t1 = $[24];
	const label_0 = t1;
	if (reference.type === "image" && reference.data) {
		let t2;
		if ($[25] !== className || $[26] !== label_0 || $[27] !== onRemove || $[28] !== reference.data) {
			t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageContextChip, {
				src: reference.data,
				label: label_0,
				onRemove,
				className
			});
			$[25] = className;
			$[26] = label_0;
			$[27] = onRemove;
			$[28] = reference.data;
			$[29] = t2;
		} else t2 = $[29];
		return t2;
	}
	const t2 = REFERENCE_ICONS[reference.type];
	const t3 = reference.type === "folder" ? `${reference.path}\nFor this message only` : reference.name;
	let t4;
	if ($[30] !== className || $[31] !== label_0 || $[32] !== onRemove || $[33] !== t2 || $[34] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextChip, {
			icon: t2,
			label: label_0,
			title: t3,
			className,
			onRemove
		});
		$[30] = className;
		$[31] = label_0;
		$[32] = onRemove;
		$[33] = t2;
		$[34] = t3;
		$[35] = t4;
	} else t4 = $[35];
	return t4;
}

export { ChatReferenceChip };
