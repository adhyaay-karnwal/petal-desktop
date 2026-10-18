// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentComposer.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ScrollArea } from "../../../../ui/src/components/ScrollArea.js";
import { LOCAL_SHORTCUTS } from "../../shared/shortcuts/catalog.js";
import { matchesShortcut } from "../../shared/shortcuts/matchShortcut.js";
import { useCommentPopoverPosition } from "../../shared/hooks/useCommentPopoverPosition.js";
import { useCommentOutsideClick } from "../../shared/hooks/useCommentOutsideClick.js";
import { CommentInput } from "./CommentInput.js";

function CommentComposer(t0) {
	const $ = (0, import_compiler_runtime.c)(21);
	const { position, onSubmit, onCancel, placeholder: t1, identityPrompt, allowAttachments, onCreateGuestIdentity } = t0;
	const placeholder = t1 === void 0 ? "Add a comment" : t1;
	const { ref, style, pinX, pinY } = useCommentPopoverPosition(position.canvasX, position.canvasY, 296, 18);
	useCommentOutsideClick(ref, onCancel);
	let t2;
	let t3;
	if ($[0] !== onCancel) {
		t2 = () => {
			const handleKeyDown = (event) => {
				if (matchesShortcut(event, LOCAL_SHORTCUTS.comments.cancelComposer)) {
					event.stopPropagation();
					onCancel();
				}
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => window.removeEventListener("keydown", handleKeyDown);
		};
		t3 = [onCancel];
		$[0] = onCancel;
		$[1] = t2;
		$[2] = t3;
	} else {
		t2 = $[1];
		t3 = $[2];
	}
	(0, import_react.useEffect)(t2, t3);
	let t4;
	if ($[3] !== pinX || $[4] !== pinY) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-comment-draft-pin",
			style: {
				left: pinX,
				top: pinY
			},
			"aria-hidden": "true"
		});
		$[3] = pinX;
		$[4] = pinY;
		$[5] = t4;
	} else t4 = $[5];
	let t5;
	if ($[6] !== allowAttachments || $[7] !== identityPrompt || $[8] !== onCreateGuestIdentity || $[9] !== onSubmit || $[10] !== placeholder) {
		t5 = identityPrompt ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentInput, {
			onSubmit,
			placeholder,
			autoFocus: true,
			allowAttachments,
			onCreateGuestIdentity
		});
		$[6] = allowAttachments;
		$[7] = identityPrompt;
		$[8] = onCreateGuestIdentity;
		$[9] = onSubmit;
		$[10] = placeholder;
		$[11] = t5;
	} else t5 = $[11];
	let t6;
	if ($[12] !== t5) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
			className: "ed-comment-composer-scroll",
			children: t5
		});
		$[12] = t5;
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] !== ref || $[15] !== style || $[16] !== t6) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			"data-comment-ui": true,
			className: "ed-comment-composer ed-comment-surface",
			style,
			role: "region",
			"aria-label": "New comment",
			children: t6
		});
		$[14] = ref;
		$[15] = style;
		$[16] = t6;
		$[17] = t7;
	} else t7 = $[17];
	let t8;
	if ($[18] !== t4 || $[19] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t4, t7] });
		$[18] = t4;
		$[19] = t7;
		$[20] = t8;
	} else t8 = $[20];
	return t8;
}

export { CommentComposer };
