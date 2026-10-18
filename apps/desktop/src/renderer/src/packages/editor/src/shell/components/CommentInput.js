// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentInput.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { ArrowUpIcon, PaperclipIcon, XIcon } from "../../../../ui/src/icons.js";
import { Button } from "../../../../ui/src/components/Button.js";
import { Input } from "../../../../ui/src/components/Input.js";
import { Popover, PopoverAnchor, PopoverContent } from "../../../../ui/src/components/Popover.js";
import { useCommentMentions } from "./CommentMentionContext.js";
import { useUploadImage } from "../../shared/hooks/useUploadImage.js";
import { useAssetResolver } from "../../shared/contexts/AssetContext.js";
import { CommentAvatar } from "../../canvas/components/CommentAvatar.js";
import { commentMentionQuery, moveCommentMentions } from "../../shared/utils/commentMentions.js";

var SIZES_TO_CONTENT = typeof CSS !== "undefined" && CSS.supports("field-sizing", "content");
/** The same compact composer is used for new comments and replies. */
function CommentInput(t0) {
	const $ = (0, import_compiler_runtime.c)(118);
	const { onSubmit, placeholder: t1, autoFocus: t2, allowAttachments: t3, onCreateGuestIdentity, initialValue: t4, initialMentions: t5, allowAgentMentions: t6, onCancel } = t0;
	const placeholder = t1 === void 0 ? "Add a comment" : t1;
	const autoFocus = t2 === void 0 ? false : t2;
	const allowAttachments = t3 === void 0 ? true : t3;
	const initialValue = t4 === void 0 ? "" : t4;
	let t7;
	if ($[0] !== t5) {
		t7 = t5 === void 0 ? [] : t5;
		$[0] = t5;
		$[1] = t7;
	} else t7 = $[1];
	const initialMentions = t7;
	const allowAgentMentions = t6 === void 0 ? true : t6;
	const [value, setValue] = (0, import_react.useState)(initialValue);
	const [mentions, setMentions] = (0, import_react.useState)(initialMentions);
	const [caret, setCaret] = (0, import_react.useState)(initialValue.length);
	const [pickerDismissed, setPickerDismissed] = (0, import_react.useState)(false);
	const [selected, setSelected] = (0, import_react.useState)(0);
	const { people, agentAvailable } = useCommentMentions();
	const pickerId = (0, import_react.useId)();
	let query;
	let t8;
	if ($[2] !== agentAvailable || $[3] !== allowAgentMentions || $[4] !== caret || $[5] !== people || $[6] !== pickerDismissed || $[7] !== value) {
		query = !pickerDismissed ? commentMentionQuery(value, caret) : null;
		t8 = [...agentAvailable && allowAgentMentions ? [{
			id: "agent",
			name: "Agent",
			image: null
		}] : [], ...people].filter((person) => query && (person.name ?? "").toLocaleLowerCase().includes(query.query)).slice(0, 8);
		$[2] = agentAvailable;
		$[3] = allowAgentMentions;
		$[4] = caret;
		$[5] = people;
		$[6] = pickerDismissed;
		$[7] = value;
		$[8] = query;
		$[9] = t8;
	} else {
		query = $[8];
		t8 = $[9];
	}
	const candidates = t8;
	const showPicker = !!query && candidates.length > 0;
	const selectedIndex = Math.min(selected, candidates.length - 1);
	let t9;
	if ($[10] !== mentions || $[11] !== query || $[12] !== value) {
		t9 = (person_0) => {
			if (!query) return;
			const label = person_0.name?.trim() || "Unknown";
			const next = value.slice(0, query.start) + `@${label} ` + value.slice(query.end);
			const end = query.start + label.length + 1;
			setMentions([...moveCommentMentions(value, next, mentions.filter((mention) => mention.end <= query.start || mention.start >= query.end)), {
				id: person_0.id,
				label,
				start: query.start,
				end
			}].sort(_temp$35));
			setValue(next);
			setCaret(end + 1);
			setPickerDismissed(true);
			requestAnimationFrame(() => {
				textareaRef.current?.focus();
				textareaRef.current?.setSelectionRange(end + 1, end + 1);
			});
		};
		$[10] = mentions;
		$[11] = query;
		$[12] = value;
		$[13] = t9;
	} else t9 = $[13];
	const chooseMention = t9;
	const [name, setName] = (0, import_react.useState)("");
	const nameRef = (0, import_react.useRef)(null);
	let t10;
	if ($[14] !== name || $[15] !== onCreateGuestIdentity || $[16] !== value) {
		t10 = !!value.trim() && (!onCreateGuestIdentity || !!name.trim());
		$[14] = name;
		$[15] = onCreateGuestIdentity;
		$[16] = value;
		$[17] = t10;
	} else t10 = $[17];
	const canSubmit = t10;
	let t11;
	if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = [];
		$[18] = t11;
	} else t11 = $[18];
	const [attachments, setAttachments] = (0, import_react.useState)(t11);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const submittingRef = (0, import_react.useRef)(false);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const uploadImage = useUploadImage();
	const resolveAsset = useAssetResolver();
	const fileRef = (0, import_react.useRef)(null);
	const textareaRef = (0, import_react.useRef)(null);
	const uploadInProgress = (0, import_react.useRef)(false);
	const pendingEdit = (0, import_react.useRef)(void 0);
	const rowRef = (0, import_react.useRef)(null);
	let t12;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t12 = () => {
			const input = textareaRef.current;
			const row = rowRef.current;
			if (!input || !row) return;
			const fit = () => {
				if (SIZES_TO_CONTENT) return input.clientHeight;
				input.style.height = "auto";
				input.style.height = `${input.scrollHeight}px`;
				return input.scrollHeight;
			};
			row.removeAttribute("data-multiline");
			if (fit() > 26) {
				row.setAttribute("data-multiline", "");
				fit();
			}
			if (input.selectionEnd !== input.value.length) return;
			const viewport = input.closest("[data-slot=\"scroll-area-viewport\"]");
			if (!viewport) return;
			const frame = requestAnimationFrame(() => {
				viewport.scrollTop = viewport.scrollHeight;
			});
			return () => cancelAnimationFrame(frame);
		};
		$[19] = t12;
	} else t12 = $[19];
	let t13;
	if ($[20] !== value) {
		t13 = [value];
		$[20] = value;
		$[21] = t13;
	} else t13 = $[21];
	(0, import_react.useLayoutEffect)(t12, t13);
	let t14;
	let t15;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = () => {
			const input_0 = textareaRef.current;
			if (!input_0) return;
			const beforeInput = (event) => {
				pendingEdit.current = {
					start: input_0.selectionStart,
					end: input_0.selectionEnd,
					inputType: event.inputType
				};
			};
			input_0.addEventListener("beforeinput", beforeInput);
			return () => input_0.removeEventListener("beforeinput", beforeInput);
		};
		t15 = [];
		$[22] = t14;
		$[23] = t15;
	} else {
		t14 = $[22];
		t15 = $[23];
	}
	(0, import_react.useEffect)(t14, t15);
	let t16;
	if ($[24] !== attachments.length || $[25] !== uploadImage) {
		t16 = async (file) => {
			if (uploadInProgress.current) return;
			if (attachments.length >= 10) {
				setError("You can attach up to 10 images.");
				return;
			}
			uploadInProgress.current = true;
			setUploading(true);
			setError(null);
			try {
				const dataUrl = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.onload = () => resolve(String(reader.result));
					reader.onerror = () => reject(reader.error);
					reader.readAsDataURL(file);
				});
				const result = await uploadImage(dataUrl, file.type);
				if (result.url) {
					const url = result.url;
					setAttachments((previous) => previous.includes(url) ? previous : [...previous, url]);
				} else setError("Couldn’t upload the image. Try again.");
			} catch {
				setError("Couldn’t upload the image. Try again.");
			}
			uploadInProgress.current = false;
			setUploading(false);
		};
		$[24] = attachments.length;
		$[25] = uploadImage;
		$[26] = t16;
	} else t16 = $[26];
	const attach = t16;
	let t17;
	if ($[27] !== attachments || $[28] !== mentions || $[29] !== name || $[30] !== onCreateGuestIdentity || $[31] !== onSubmit || $[32] !== uploading || $[33] !== value) {
		t17 = async () => {
			if (!value.trim() || uploading || submittingRef.current) return;
			if (onCreateGuestIdentity && !name.trim()) {
				nameRef.current?.focus();
				return;
			}
			submittingRef.current = true;
			setSubmitting(true);
			setError(null);
			const submittedAttachments = attachments.length ? attachments : void 0;
			const textarea = textareaRef.current;
			const leading = value.length - value.trimStart().length;
			try {
				if (onCreateGuestIdentity) await onCreateGuestIdentity(name.trim());
				await onSubmit(value.trim(), submittedAttachments, mentions.map((mention_0) => ({
					...mention_0,
					start: mention_0.start - leading,
					end: mention_0.end - leading
				})));
				setValue("");
				setMentions([]);
				setAttachments([]);
				if (textarea) textarea.style.removeProperty("height");
			} catch (t18) {
				const error_0 = t18;
				setError(error_0 instanceof Error ? error_0.message : "Couldn’t send your comment. Try again.");
			}
			submittingRef.current = false;
			setSubmitting(false);
		};
		$[27] = attachments;
		$[28] = mentions;
		$[29] = name;
		$[30] = onCreateGuestIdentity;
		$[31] = onSubmit;
		$[32] = uploading;
		$[33] = value;
		$[34] = t17;
	} else t17 = $[34];
	const submit = t17;
	let t18;
	if ($[35] !== autoFocus || $[36] !== name || $[37] !== onCreateGuestIdentity || $[38] !== submitting) {
		t18 = onCreateGuestIdentity && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-comment-name-row",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				ref: nameRef,
				size: "xs",
				name: "name",
				autoComplete: "name",
				"aria-label": "Your name",
				placeholder: "Your name",
				className: "ed-comment-name-input",
				maxLength: 80,
				value: name,
				autoFocus,
				disabled: submitting,
				onChange: (event_0) => setName(event_0.target.value),
				onKeyDown: (event_1) => {
					if (event_1.key === "Enter" && !event_1.nativeEvent.isComposing) {
						event_1.preventDefault();
						textareaRef.current?.focus();
					}
				}
			})
		});
		$[35] = autoFocus;
		$[36] = name;
		$[37] = onCreateGuestIdentity;
		$[38] = submitting;
		$[39] = t18;
	} else t18 = $[39];
	let t19;
	if ($[40] === Symbol.for("react.memo_cache_sentinel")) {
		t19 = (open) => {
			if (!open) setPickerDismissed(true);
		};
		$[40] = t19;
	} else t19 = $[40];
	const t20 = showPicker ? pickerId : void 0;
	const t21 = showPicker ? `${pickerId}-${selectedIndex}` : void 0;
	let t22;
	if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
		t22 = (event_2) => setCaret(event_2.currentTarget.selectionStart);
		$[41] = t22;
	} else t22 = $[41];
	const t23 = autoFocus && !onCreateGuestIdentity;
	let t24;
	if ($[42] !== mentions || $[43] !== value) {
		t24 = (event_3) => {
			setMentions(moveCommentMentions(value, event_3.target.value, mentions, pendingEdit.current));
			pendingEdit.current = void 0;
			setValue(event_3.target.value);
			setCaret(event_3.target.selectionStart);
			setSelected(0);
			setPickerDismissed(false);
		};
		$[42] = mentions;
		$[43] = value;
		$[44] = t24;
	} else t24 = $[44];
	let t25;
	if ($[45] !== candidates || $[46] !== chooseMention || $[47] !== onCancel || $[48] !== selectedIndex || $[49] !== showPicker || $[50] !== submit) {
		t25 = (event_4) => {
			if (event_4.nativeEvent.isComposing) return;
			if (showPicker) {
				if (event_4.key === "ArrowDown" || event_4.key === "ArrowUp") {
					event_4.preventDefault();
					event_4.stopPropagation();
					setSelected((selectedIndex + (event_4.key === "ArrowDown" ? 1 : candidates.length - 1)) % candidates.length);
					return;
				}
				if (event_4.key === "Enter" || event_4.key === "Tab") {
					event_4.preventDefault();
					event_4.stopPropagation();
					chooseMention(candidates[selectedIndex]);
					return;
				}
				if (event_4.key === "Escape") {
					event_4.preventDefault();
					event_4.stopPropagation();
					setPickerDismissed(true);
					return;
				}
			}
			if (event_4.key === "Escape" && onCancel) {
				event_4.preventDefault();
				event_4.stopPropagation();
				onCancel();
				return;
			}
			if (event_4.key === "Enter" && !event_4.shiftKey && !event_4.nativeEvent.isComposing) {
				event_4.preventDefault();
				submit();
			}
		};
		$[45] = candidates;
		$[46] = chooseMention;
		$[47] = onCancel;
		$[48] = selectedIndex;
		$[49] = showPicker;
		$[50] = submit;
		$[51] = t25;
	} else t25 = $[51];
	let t26;
	if ($[52] !== allowAttachments || $[53] !== attach) {
		t26 = (event_5) => {
			const file_0 = (allowAttachments ? Array.from(event_5.clipboardData.items).find(_temp2$20) : void 0)?.getAsFile();
			if (file_0) {
				event_5.preventDefault();
				attach(file_0);
				return;
			}
			const pasted = event_5.clipboardData.getData("text/plain");
			const trimmed = pasted.replace(/\s+$/, "");
			if (trimmed !== pasted) {
				event_5.preventDefault();
				document.execCommand("insertText", false, trimmed);
			}
		};
		$[52] = allowAttachments;
		$[53] = attach;
		$[54] = t26;
	} else t26 = $[54];
	let t27;
	if ($[55] !== placeholder || $[56] !== submitting || $[57] !== t20 || $[58] !== t21 || $[59] !== t23 || $[60] !== t24 || $[61] !== t25 || $[62] !== t26 || $[63] !== value) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverAnchor, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				ref: textareaRef,
				"aria-label": placeholder,
				"aria-autocomplete": "list",
				"aria-controls": t20,
				"aria-activedescendant": t21,
				onSelect: t22,
				placeholder,
				autoFocus: t23,
				value,
				disabled: submitting,
				rows: 1,
				maxLength: 1e4,
				onChange: t24,
				onKeyDown: t25,
				onPaste: t26
			})
		});
		$[55] = placeholder;
		$[56] = submitting;
		$[57] = t20;
		$[58] = t21;
		$[59] = t23;
		$[60] = t24;
		$[61] = t25;
		$[62] = t26;
		$[63] = value;
		$[64] = t27;
	} else t27 = $[64];
	let t28;
	if ($[65] === Symbol.for("react.memo_cache_sentinel")) {
		t28 = (event_8) => {
			if (event_8.target === textareaRef.current) event_8.preventDefault();
		};
		$[65] = t28;
	} else t28 = $[65];
	let t29;
	if ($[66] !== candidates || $[67] !== chooseMention || $[68] !== pickerId || $[69] !== selectedIndex) {
		t29 = candidates.map((person_1, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			id: `${pickerId}-${index}`,
			role: "option",
			"aria-selected": index === selectedIndex,
			onPointerMove: () => setSelected(index),
			onMouseDown: _temp5$14,
			onClick: () => chooseMention(person_1),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommentAvatar, { author: {
				name: person_1.name,
				image: person_1.image
			} }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: person_1.id === "agent" ? "Agent" : person_1.name })]
		}, person_1.id));
		$[66] = candidates;
		$[67] = chooseMention;
		$[68] = pickerId;
		$[69] = selectedIndex;
		$[70] = t29;
	} else t29 = $[70];
	let t30;
	if ($[71] !== pickerId || $[72] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
			side: "top",
			align: "start",
			sideOffset: 8,
			onOpenAutoFocus: _temp3$16,
			onCloseAutoFocus: _temp4$16,
			onInteractOutside: t28,
			id: pickerId,
			role: "listbox",
			"aria-label": "Mention someone",
			className: "ed-comment-mention-picker",
			"data-comment-menu": true,
			children: t29
		});
		$[71] = pickerId;
		$[72] = t29;
		$[73] = t30;
	} else t30 = $[73];
	let t31;
	if ($[74] !== showPicker || $[75] !== t27 || $[76] !== t30) {
		t31 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
			open: showPicker,
			onOpenChange: t19,
			children: [t27, t30]
		});
		$[74] = showPicker;
		$[75] = t27;
		$[76] = t30;
		$[77] = t31;
	} else t31 = $[77];
	let t32;
	if ($[78] !== onCancel || $[79] !== submitting) {
		t32 = onCancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-xs",
			isChildText: false,
			"aria-label": "Cancel edit",
			title: "Cancel edit",
			disabled: submitting,
			onClick: onCancel,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
				width: 14,
				height: 14
			})
		});
		$[78] = onCancel;
		$[79] = submitting;
		$[80] = t32;
	} else t32 = $[80];
	let t33;
	if ($[81] !== allowAttachments || $[82] !== attachments.length || $[83] !== submitting || $[84] !== uploading) {
		t33 = allowAttachments && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "icon-xs",
			className: "text-ed-muted-foreground",
			isChildText: false,
			"aria-label": "Attach image",
			title: "Attach image",
			disabled: submitting || uploading || attachments.length >= 10,
			onClick: () => fileRef.current?.click(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaperclipIcon, {
				className: "size-3.5",
				width: 14,
				height: 14
			})
		});
		$[81] = allowAttachments;
		$[82] = attachments.length;
		$[83] = submitting;
		$[84] = uploading;
		$[85] = t33;
	} else t33 = $[85];
	let t34;
	if ($[86] !== attach) {
		t34 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			hidden: true,
			onChange: (event_10) => {
				const file_1 = event_10.target.files?.[0];
				if (file_1) attach(file_1);
				event_10.target.value = "";
			}
		});
		$[86] = attach;
		$[87] = t34;
	} else t34 = $[87];
	const t35 = canSubmit ? void 0 : "text-ed-muted-foreground";
	const t36 = placeholder === "Reply…" ? "Send reply" : "Post comment";
	const t37 = !canSubmit || uploading || submitting;
	const t38 = uploading || submitting;
	let t39;
	if ($[88] === Symbol.for("react.memo_cache_sentinel")) {
		t39 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpIcon, {
			className: "size-3.5",
			width: 14,
			height: 14
		});
		$[88] = t39;
	} else t39 = $[88];
	let t40;
	if ($[89] !== submit || $[90] !== t35 || $[91] !== t36 || $[92] !== t37 || $[93] !== t38) {
		t40 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "secondary",
			size: "icon-xs",
			className: t35,
			isChildText: false,
			"aria-label": t36,
			title: "Send (Enter)",
			"aria-disabled": t37,
			disabled: t38,
			onClick: submit,
			children: t39
		});
		$[89] = submit;
		$[90] = t35;
		$[91] = t36;
		$[92] = t37;
		$[93] = t38;
		$[94] = t40;
	} else t40 = $[94];
	let t41;
	if ($[95] !== t32 || $[96] !== t33 || $[97] !== t34 || $[98] !== t40) {
		t41 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-input-actions",
			children: [
				t32,
				t33,
				t34,
				t40
			]
		});
		$[95] = t32;
		$[96] = t33;
		$[97] = t34;
		$[98] = t40;
		$[99] = t41;
	} else t41 = $[99];
	let t42;
	if ($[100] !== t31 || $[101] !== t41) {
		t42 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: rowRef,
			className: "ed-comment-input-row",
			children: [t31, t41]
		});
		$[100] = t31;
		$[101] = t41;
		$[102] = t42;
	} else t42 = $[102];
	let t43;
	if ($[103] !== attachments || $[104] !== resolveAsset) {
		t43 = attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "ed-comment-attachment-previews",
			children: attachments.map((url_0, index_0) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ed-comment-attachment-preview",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: resolveAsset ? resolveAsset(url_0) : url_0,
					alt: `Attachment ${index_0 + 1}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": `Remove attachment ${index_0 + 1}`,
					onClick: () => setAttachments((previous_0) => previous_0.filter((_, i) => i !== index_0)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XIcon, {
						width: 10,
						height: 10
					})
				})]
			}, url_0))
		});
		$[103] = attachments;
		$[104] = resolveAsset;
		$[105] = t43;
	} else t43 = $[105];
	let t44;
	if ($[106] !== uploading) {
		t44 = uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "ed-comment-input-status",
			role: "status",
			children: "Uploading…"
		});
		$[106] = uploading;
		$[107] = t44;
	} else t44 = $[107];
	let t45;
	if ($[108] !== error) {
		t45 = error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "ed-comment-input-status ed-comment-error",
			role: "alert",
			children: error
		});
		$[108] = error;
		$[109] = t45;
	} else t45 = $[109];
	let t46;
	if ($[110] !== t42 || $[111] !== t43 || $[112] !== t44 || $[113] !== t45) {
		t46 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-message-card",
			children: [
				t42,
				t43,
				t44,
				t45
			]
		});
		$[110] = t42;
		$[111] = t43;
		$[112] = t44;
		$[113] = t45;
		$[114] = t46;
	} else t46 = $[114];
	let t47;
	if ($[115] !== t18 || $[116] !== t46) {
		t47 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "ed-comment-input",
			children: [t18, t46]
		});
		$[115] = t18;
		$[116] = t46;
		$[117] = t47;
	} else t47 = $[117];
	return t47;
}
function _temp5$14(event_9) {
	return event_9.preventDefault();
}
function _temp4$16(event_7) {
	return event_7.preventDefault();
}
function _temp3$16(event_6) {
	return event_6.preventDefault();
}
function _temp2$20(item) {
	return item.type.startsWith("image/");
}
function _temp$35(a, b) {
	return a.start - b.start;
}

export { CommentInput };
