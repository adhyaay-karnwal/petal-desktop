// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CommentPins.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { CheckIcon } from "../../../../ui/src/icons.js";
import { getCamera } from "../../shell/hooks/useCommentAgent.js";
import { commentAnchorAt, findCommentElement, paintCommentPin, resolveCommentPosition } from "../../shared/utils/commentAnchor.js";
import { CommentAvatar } from "./CommentAvatar.js";
import { formatCommentTime } from "../../shared/utils/commentTime.js";

/** The mounted pins' machine drags, by comment id. */
var pinDrags = /* @__PURE__ */ new Map();
/** Starts the machine's drag of a pin from the press at `start`; null when the pin is gone or cannot move. */
function beginPinDrag(commentId, start) {
	return pinDrags.get(commentId)?.(start) ?? null;
}
function DraggablePin(t0) {
	const $ = (0, import_compiler_runtime.c)(63);
	const { comment, screenX, screenY, isActive, onSelectComment, onMoveComment } = t0;
	const btnRef = (0, import_react.useRef)(null);
	let t1;
	let t2;
	if ($[0] !== comment) {
		t1 = () => {
			const pin = btnRef.current;
			const viewport = pin?.closest("[data-canvas-viewport]");
			if (pin && viewport && comment.elementId) paintCommentPin(pin, resolveCommentPosition(comment, viewport));
		};
		t2 = [comment];
		$[0] = comment;
		$[1] = t1;
		$[2] = t2;
	} else {
		t1 = $[1];
		t2 = $[2];
	}
	(0, import_react.useLayoutEffect)(t1, t2);
	let t3;
	if ($[3] !== comment.elementId || $[4] !== comment.id || $[5] !== onMoveComment) {
		t3 = (clientX, clientY, offsetX, offsetY) => {
			if (!onMoveComment) return;
			const overlay = btnRef.current?.closest("[data-overlay-container]");
			const rect = overlay?.getBoundingClientRect();
			if (!rect) return;
			const { scale, positionX, positionY } = getCamera();
			const canvasX = Math.round((clientX - rect.left - positionX) / scale - offsetX);
			const canvasY = Math.round((clientY - rect.top - positionY) / scale - offsetY);
			const viewport_0 = overlay?.parentElement?.closest("[data-canvas-viewport]") ?? overlay?.parentElement;
			const element = comment.elementId && viewport_0 ? findCommentElement(viewport_0, comment.elementId) : null;
			const anchor = element ? commentAnchorAt(element, rect.left + canvasX * scale + positionX, rect.top + canvasY * scale + positionY) : void 0;
			onMoveComment(comment.id, canvasX, canvasY, anchor);
		};
		$[3] = comment.elementId;
		$[4] = comment.id;
		$[5] = onMoveComment;
		$[6] = t3;
	} else t3 = $[6];
	const commitMove = t3;
	let t4;
	if ($[7] !== comment.canvasX || $[8] !== comment.canvasY) {
		t4 = (pin_0, clientX_0, clientY_0) => {
			const rect_0 = pin_0.closest("[data-overlay-container]")?.getBoundingClientRect();
			const camera = getCamera();
			return {
				offsetX: rect_0 ? (clientX_0 - rect_0.left - camera.positionX) / camera.scale - (comment.canvasX ?? 0) : 0,
				offsetY: rect_0 ? (clientY_0 - rect_0.top - camera.positionY) / camera.scale - (comment.canvasY ?? 0) : 0
			};
		};
		$[7] = comment.canvasX;
		$[8] = comment.canvasY;
		$[9] = t4;
	} else t4 = $[9];
	const grabOffset = t4;
	let t5;
	if ($[10] !== commitMove || $[11] !== grabOffset || $[12] !== onMoveComment) {
		t5 = (start) => {
			const pin_1 = btnRef.current;
			if (!onMoveComment || !pin_1) return null;
			const { offsetX: offsetX_0, offsetY: offsetY_0 } = grabOffset(pin_1, start.x, start.y);
			const marked = [pin_1, pin_1.querySelector(".ed-comment-pin")].filter(_temp$88);
			const mark = (dragging) => {
				for (const node_0 of marked) node_0.setAttribute("data-dragging", String(dragging));
			};
			mark(true);
			return {
				move(at) {
					pin_1.style.translate = `${at.x - start.x}px ${at.y - start.y}px`;
				},
				end(commit, at_0) {
					pin_1.style.translate = "";
					mark(false);
					if (commit && pin_1.isConnected) commitMove(at_0.x, at_0.y, offsetX_0, offsetY_0);
				}
			};
		};
		$[10] = commitMove;
		$[11] = grabOffset;
		$[12] = onMoveComment;
		$[13] = t5;
	} else t5 = $[13];
	const startMachineDrag = (0, import_react.useEffectEvent)(t5);
	let t6;
	if ($[14] !== comment.id || $[15] !== startMachineDrag) {
		t6 = () => {
			const id = comment.id;
			const start_0 = (at_1) => startMachineDrag(at_1);
			pinDrags.set(id, start_0);
			return () => {
				if (pinDrags.get(id) === start_0) pinDrags.delete(id);
			};
		};
		$[14] = comment.id;
		$[15] = startMachineDrag;
		$[16] = t6;
	} else t6 = $[16];
	let t7;
	if ($[17] !== comment.id) {
		t7 = [comment.id];
		$[17] = comment.id;
		$[18] = t7;
	} else t7 = $[18];
	(0, import_react.useLayoutEffect)(t6, t7);
	const agentWorking = comment.agentStatus === "working";
	const authorName = comment.author.name ?? "?";
	const t8 = `${authorName}: ${comment.body || "Image attachment"}${agentWorking ? ", Agent working..." : ""}`;
	let t9;
	if ($[19] !== screenX || $[20] !== screenY) {
		t9 = {
			left: screenX,
			top: screenY,
			cursor: "default"
		};
		$[19] = screenX;
		$[20] = screenY;
		$[21] = t9;
	} else t9 = $[21];
	const t10 = onMoveComment ? _temp2$56 : void 0;
	let t11;
	if ($[22] !== comment.id || $[23] !== onSelectComment) {
		t11 = () => onSelectComment(comment.id);
		$[22] = comment.id;
		$[23] = onSelectComment;
		$[24] = t11;
	} else t11 = $[24];
	let t12;
	if ($[25] !== agentWorking || $[26] !== comment.author || $[27] !== comment.resolved) {
		t12 = comment.resolved && !agentWorking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-avatar ed-comment-resolved-avatar",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {
				width: 14,
				height: 14
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentAvatar, {
			author: comment.author,
			working: agentWorking
		});
		$[25] = agentWorking;
		$[26] = comment.author;
		$[27] = comment.resolved;
		$[28] = t12;
	} else t12 = $[28];
	let t13;
	if ($[29] !== authorName) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-author",
			children: authorName
		});
		$[29] = authorName;
		$[30] = t13;
	} else t13 = $[30];
	let t14;
	if ($[31] !== comment.author.isGuest) {
		t14 = comment.author.isGuest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-guest-badge",
			children: "Guest"
		});
		$[31] = comment.author.isGuest;
		$[32] = t14;
	} else t14 = $[32];
	let t15;
	if ($[33] !== agentWorking || $[34] !== comment.createdAt) {
		t15 = agentWorking ? "Agent working..." : formatCommentTime(comment.createdAt);
		$[33] = agentWorking;
		$[34] = comment.createdAt;
		$[35] = t15;
	} else t15 = $[35];
	let t16;
	if ($[36] !== t15) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t15 });
		$[36] = t15;
		$[37] = t16;
	} else t16 = $[37];
	let t17;
	if ($[38] !== t13 || $[39] !== t14 || $[40] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ed-comment-meta",
			children: [
				t13,
				t14,
				t16
			]
		});
		$[38] = t13;
		$[39] = t14;
		$[40] = t16;
		$[41] = t17;
	} else t17 = $[41];
	const t18 = comment.body || "Image attachment";
	let t19;
	if ($[42] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ed-comment-pin-excerpt",
			children: t18
		});
		$[42] = t18;
		$[43] = t19;
	} else t19 = $[43];
	let t20;
	if ($[44] !== t17 || $[45] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ed-comment-pin-preview",
			"aria-hidden": "true",
			children: [t17, t19]
		});
		$[44] = t17;
		$[45] = t19;
		$[46] = t20;
	} else t20 = $[46];
	let t21;
	if ($[47] !== comment.resolved || $[48] !== isActive || $[49] !== t12 || $[50] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "ed-comment-pin",
			"data-active": isActive,
			"data-resolved": comment.resolved,
			children: [t12, t20]
		});
		$[47] = comment.resolved;
		$[48] = isActive;
		$[49] = t12;
		$[50] = t20;
		$[51] = t21;
	} else t21 = $[51];
	let t22;
	if ($[52] !== comment.canvasX || $[53] !== comment.canvasY || $[54] !== comment.id || $[55] !== comment.resolved || $[56] !== isActive || $[57] !== t10 || $[58] !== t11 || $[59] !== t21 || $[60] !== t8 || $[61] !== t9) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			ref: btnRef,
			type: "button",
			"data-comment-ui": true,
			"data-comment-pin": true,
			"data-comment-id": comment.id,
			"data-comment-canvas-x": comment.canvasX,
			"data-comment-canvas-y": comment.canvasY,
			"data-active": isActive,
			"data-resolved": comment.resolved,
			"aria-label": t8,
			"aria-expanded": isActive,
			className: "ed-comment-pin-trigger",
			style: t9,
			onPointerDown: t10,
			onClick: t11,
			children: t21
		});
		$[52] = comment.canvasX;
		$[53] = comment.canvasY;
		$[54] = comment.id;
		$[55] = comment.resolved;
		$[56] = isActive;
		$[57] = t10;
		$[58] = t11;
		$[59] = t21;
		$[60] = t8;
		$[61] = t9;
		$[62] = t22;
	} else t22 = $[62];
	return t22;
}
function _temp2$56(e) {
	return e.preventDefault();
}
function _temp$88(node) {
	return !!node;
}
function CommentPins(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { comments, transform, activeCommentId, onSelectComment, onMoveComment, showResolved } = t0;
	const { scale, positionX, positionY } = transform;
	let t1;
	if ($[0] !== activeCommentId || $[1] !== comments || $[2] !== onMoveComment || $[3] !== onSelectComment || $[4] !== positionX || $[5] !== positionY || $[6] !== scale || $[7] !== showResolved) {
		let t2;
		if ($[9] !== activeCommentId || $[10] !== showResolved) {
			t2 = (c) => c.canvasX != null && c.canvasY != null && (!c.resolved || showResolved || c.id === activeCommentId);
			$[9] = activeCommentId;
			$[10] = showResolved;
			$[11] = t2;
		} else t2 = $[11];
		const visibleComments = comments.filter(t2);
		let t3;
		if ($[12] !== activeCommentId || $[13] !== onMoveComment || $[14] !== onSelectComment || $[15] !== positionX || $[16] !== positionY || $[17] !== scale) {
			t3 = (comment) => {
				const screenX = comment.canvasX * scale + positionX;
				const screenY = comment.canvasY * scale + positionY;
				const isActive = activeCommentId === comment.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraggablePin, {
					comment,
					screenX,
					screenY,
					isActive,
					onSelectComment,
					onMoveComment
				}, comment.id);
			};
			$[12] = activeCommentId;
			$[13] = onMoveComment;
			$[14] = onSelectComment;
			$[15] = positionX;
			$[16] = positionY;
			$[17] = scale;
			$[18] = t3;
		} else t3 = $[18];
		t1 = visibleComments.map(t3);
		$[0] = activeCommentId;
		$[1] = comments;
		$[2] = onMoveComment;
		$[3] = onSelectComment;
		$[4] = positionX;
		$[5] = positionY;
		$[6] = scale;
		$[7] = showResolved;
		$[8] = t1;
	} else t1 = $[8];
	let t2;
	if ($[19] !== t1) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: t1 });
		$[19] = t1;
		$[20] = t2;
	} else t2 = $[20];
	return t2;
}

export { CommentPins, beginPinDrag };
