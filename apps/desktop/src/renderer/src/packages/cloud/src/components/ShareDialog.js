// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ShareDialog.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { getWebUrl } from "../client.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { useCreateShareLink, useProject, useProjectShares, useRemoveInvite, useRemoveShare, useRevokeShareLink, useSetAllowDuplicate, useShareWithEmail, useUpdateShareLinkAccess } from "../hooks/useProject.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/src/components/Avatar.js";
import { CheckIcon, CopyIcon, FileIcon, LinkIcon, SpinnerIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { Input } from "../../../ui/src/components/Input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/src/components/Select.js";
import { Switch } from "../../../ui/src/components/Switch.js";
import { isPlanLimitError$1 } from "../lib/planRecommendations.js";
import { useSoleSelectedElementId } from "../../../editor/src/shared/state/selection.js";
import { ConfirmDialog } from "../../../editor/src/shell/components/ConfirmDialog.js";
import { useFeatureFlagEnabled } from "../../../../vendor/@posthog/react.js";
import { openUpgradeAfterDialog, useOpenUpgradeModal } from "./UpgradeModalProvider.js";
import { ShareAccessRow } from "./ShareAccessRow.js";

/** Gates the remix link while it is being rolled out (LUN-139). */
var REMIX_LINK_FEATURE_FLAG = "project-remix-link";
/**
* The remix URL carries the project's public id rather than a separate token: the
* `allowDuplicate` flag is what makes the id redeemable, so turning the link off
* revokes every copy of the URL at once.
*/
function buildRemixUrl(projectId) {
	return new URL(`${getWebUrl()}/remix/${projectId}`).toString();
}
function buildShareUrl(linkToken, selectedElementId, activePageId) {
	const url = new URL(`${getWebUrl()}/share/${linkToken}`);
	if (selectedElementId) {
		url.searchParams.set("element", selectedElementId);
		if (activePageId) url.searchParams.set("page", activePageId);
	}
	return url.toString();
}
function ShareDialog(t0) {
	const $ = (0, import_compiler_runtime.c)(55);
	const { projectId, onClose, activePageId } = t0;
	const selectedElementId = useSoleSelectedElementId();
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [remixCopied, setRemixCopied] = (0, import_react.useState)(false);
	const [showDisableRemix, setShowDisableRemix] = (0, import_react.useState)(false);
	const [email, setEmail] = (0, import_react.useState)("");
	const [permission, setPermission] = (0, import_react.useState)("editor");
	const [shareError, setShareError] = (0, import_react.useState)(null);
	const [showRevokeLink, setShowRevokeLink] = (0, import_react.useState)(false);
	const upgradeModal = useOpenUpgradeModal();
	const remixLinkEnabled = useFeatureFlagEnabled(REMIX_LINK_FEATURE_FLAG);
	const { data: project, isLoading } = useProject(projectId);
	const { data: sharesData } = useProjectShares(projectId);
	const shares = sharesData?.shares ?? [];
	const invites = sharesData?.invites ?? [];
	let t1;
	if ($[0] !== sharesData?.owners) {
		t1 = sharesData?.owners ?? [];
		$[0] = sharesData?.owners;
		$[1] = t1;
	} else t1 = $[1];
	const owners = t1;
	const shareWithEmail = useShareWithEmail(projectId);
	const removeShare = useRemoveShare(projectId);
	const removeInvite = useRemoveInvite(projectId);
	const linkToken = project && "linkToken" in project && project.linkToken && project.linkAccess !== "none" ? project.linkToken : null;
	const createLink = useCreateShareLink(projectId);
	const revokeLink = useRevokeShareLink(projectId);
	const updateAccess = useUpdateShareLinkAccess(projectId);
	const currentAccess = project && "linkAccess" in project ? project.linkAccess : "view";
	const allowGuests = (project && "settings" in project && project.settings && typeof project.settings === "object" ? project.settings : null)?.allowGuestComments === true;
	let t2;
	if ($[2] !== activePageId || $[3] !== linkToken || $[4] !== selectedElementId) {
		t2 = linkToken ? buildShareUrl(linkToken, selectedElementId, activePageId) : null;
		$[2] = activePageId;
		$[3] = linkToken;
		$[4] = selectedElementId;
		$[5] = t2;
	} else t2 = $[5];
	const shareUrl = t2;
	const remixEnabled = !!(project && "allowDuplicate" in project && project.allowDuplicate);
	let t3;
	if ($[6] !== projectId || $[7] !== remixEnabled) {
		t3 = remixEnabled ? buildRemixUrl(projectId) : null;
		$[6] = projectId;
		$[7] = remixEnabled;
		$[8] = t3;
	} else t3 = $[8];
	const remixUrl = t3;
	const setAllowDuplicate = useSetAllowDuplicate(projectId);
	let t4;
	if ($[9] !== remixUrl) {
		t4 = () => {
			if (!remixUrl) return;
			navigator.clipboard.writeText(remixUrl);
			setRemixCopied(true);
			setTimeout(() => setRemixCopied(false), 2e3);
		};
		$[9] = remixUrl;
		$[10] = t4;
	} else t4 = $[10];
	const copyRemixUrl = t4;
	let t5;
	if ($[11] !== shareUrl) {
		t5 = () => {
			if (shareUrl) {
				navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2e3);
			}
		};
		$[11] = shareUrl;
		$[12] = t5;
	} else t5 = $[12];
	const copyUrl = t5;
	let t6;
	if ($[13] !== email || $[14] !== onClose || $[15] !== permission || $[16] !== shareWithEmail || $[17] !== upgradeModal?.openUpgradeModal) {
		t6 = () => {
			if (!email.trim()) return;
			setShareError(null);
			shareWithEmail.mutate({
				email: email.trim(),
				permission
			}, {
				onSuccess: () => setEmail(""),
				onError: (err) => {
					if (isPlanLimitError$1(err)) {
						onClose();
						openUpgradeAfterDialog(upgradeModal?.openUpgradeModal, {
							reason: err.reason,
							message: err.message
						});
						return;
					}
					setShareError(err instanceof Error ? err : new Error(String(err)));
				}
			});
		};
		$[13] = email;
		$[14] = onClose;
		$[15] = permission;
		$[16] = shareWithEmail;
		$[17] = upgradeModal?.openUpgradeModal;
		$[18] = t6;
	} else t6 = $[18];
	const handleShareByEmail = t6;
	let t7;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = [
			{
				value: "viewer",
				label: "can view"
			},
			{
				value: "commenter",
				label: "can comment"
			},
			{
				value: "editor",
				label: "can edit"
			}
		];
		$[19] = t7;
	} else t7 = $[19];
	const accessOptions = t7;
	let t8;
	if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
		t8 = (error) => setShareError(error);
		$[20] = t8;
	} else t8 = $[20];
	const mutationOptions = { onError: t8 };
	const changePermission = (email_0, permission_0) => {
		setShareError(null);
		shareWithEmail.mutate({
			email: email_0,
			permission: permission_0,
			notify: false
		}, mutationOptions);
	};
	const permissionLabel = _temp$6;
	const T0 = Dialog;
	const t9 = true;
	let t10;
	if ($[21] !== onClose) {
		t10 = (open) => {
			if (!open) onClose();
		};
		$[21] = onClose;
		$[22] = t10;
	} else t10 = $[22];
	const T1 = DialogContent;
	const t11 = "max-w-[520px] gap-2 rounded-none border-0 bg-transparent shadow-none";
	const t12 = void 0;
	const t13 = "shrink-0 overflow-hidden rounded-[12px] border border-ed-divider bg-ed-background shadow-ed-popover";
	let t14;
	if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Share file" });
		$[23] = t14;
	} else t14 = $[23];
	const t15 = !shareUrl;
	const t16 = copied ? CheckIcon : CopyIcon;
	const t17 = copied ? "Copied" : "Copy link";
	let t18;
	if ($[24] !== copyUrl || $[25] !== t15 || $[26] !== t16 || $[27] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
			className: "gap-x-1",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center justify-between gap-4",
				children: [t14, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "xs",
					variant: "outline",
					disabled: t15,
					LeftIcon: t16,
					onClick: copyUrl,
					children: t17
				})]
			})
		});
		$[24] = copyUrl;
		$[25] = t15;
		$[26] = t16;
		$[27] = t17;
		$[28] = t18;
	} else t18 = $[28];
	const t19 = isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogBody, {
		className: "items-center py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {
			width: 16,
			height: 16,
			className: "animate-spin text-ed-muted-foreground"
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
		className: "gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: "share-invite-email",
				className: "text-[11px] leading-4 font-medium text-ed-foreground",
				children: "Invite by email"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "share-invite-email",
						size: "xs",
						type: "email",
						placeholder: "name@example.com",
						value: email,
						onChange: (e) => {
							setEmail(e.target.value);
							setShareError(null);
						},
						onKeyDown: (e_0) => {
							if (e_0.key === "Enter") handleShareByEmail();
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: permission,
						onValueChange: setPermission,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							size: "xs",
							className: "w-auto shrink-0",
							"aria-label": "Permission",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "viewer",
								children: "can view"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "commenter",
								children: "can comment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "editor",
								children: "can edit"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "xs",
						variant: "outline",
						onClick: handleShareByEmail,
						disabled: !email.trim() || shareWithEmail.isPending,
						loading: shareWithEmail.isPending,
						children: "Invite"
					})
				]
			}),
			shareError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
				as: "p",
				size: "3xs",
				variant: "danger",
				children: shareError.message
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
		className: "gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "h3",
			size: "2xs",
			weight: "medium",
			children: "Who can access"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			role: "list",
			className: "-mx-2 flex flex-col gap-0.5",
			children: [
				owners.map(_temp2$4),
				shares.filter((s) => s.targetType === "user" && !owners.some((owner_0) => owner_0.id === s.targetId)).map((share) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareAccessRow, {
					name: share.userName || share.userEmail || "Unknown user",
					description: share.userName ? share.userEmail ?? void 0 : void 0,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
							src: share.userImage ?? void 0,
							alt: ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "text-[9px]",
							children: (share.userName || share.userEmail || "?").slice(0, 2).toUpperCase()
						})]
					}),
					access: permissionLabel(share.permission),
					value: share.permission,
					options: accessOptions,
					disabled: shareWithEmail.isPending || removeShare.isPending,
					onChange: (permission_2) => {
						if (share.userEmail) changePermission(share.userEmail, permission_2);
					},
					onRemove: () => removeShare.mutate(share.targetId, mutationOptions)
				}, share.targetId)),
				invites.map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareAccessRow, {
					name: invite.email,
					status: "(Invite sent)",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
							className: "border border-dashed border-ed-field-border bg-transparent text-[9px]",
							children: invite.email[0]?.toUpperCase() ?? "?"
						})
					}),
					access: permissionLabel(invite.permission),
					value: invite.permission,
					options: accessOptions,
					disabled: shareWithEmail.isPending || removeInvite.isPending,
					onChange: (permission_3) => changePermission(invite.email, permission_3),
					onRemove: () => removeInvite.mutate(invite.token, mutationOptions)
				}, invite.token)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareAccessRow, {
					name: "Anyone with the link",
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LinkIcon, { className: "size-3.5" }) })
					}),
					access: shareUrl ? currentAccess === "comment" ? "can view & comment" : "can view" : "no access",
					value: shareUrl ? currentAccess : "none",
					options: [{
						value: "view",
						label: "can view"
					}, {
						value: "comment",
						label: "can view & comment"
					}],
					disabled: createLink.isPending || updateAccess.isPending || revokeLink.isPending,
					onChange: (access) => shareUrl ? updateAccess.mutate({ access }, mutationOptions) : createLink.mutate(access, mutationOptions),
					removeLabel: "revoke link",
					onRemove: shareUrl ? () => setShowRevokeLink(true) : void 0
				}),
				shareUrl && currentAccess === "comment" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex min-h-8 items-center gap-2.5 px-2 pl-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						size: "sm",
						"aria-label": "Let people comment without signing in",
						checked: allowGuests,
						disabled: updateAccess.isPending,
						onCheckedChange: (checked) => updateAccess.mutate({ allowGuests: checked }, mutationOptions)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "tertiary",
						children: "Let people comment without signing in, with a name they enter"
					})]
				})
			]
		})]
	})] });
	let t20;
	if ($[29] !== t18 || $[30] !== t19) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: t13,
			children: [t18, t19]
		});
		$[29] = t18;
		$[30] = t19;
		$[31] = t20;
	} else t20 = $[31];
	const t21 = !isLoading && remixLinkEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		"aria-labelledby": "duplicate-link-title",
		className: "shrink-0 rounded-[12px] border border-ed-divider bg-ed-background px-5 py-4 shadow-ed-popover",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				size: "sm",
				className: "mt-px",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, { className: "size-3.5" }) })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
						as: "h3",
						id: "duplicate-link-title",
						size: "2xs",
						weight: "medium",
						children: "Duplicate link"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							size: "sm",
							"aria-label": "Enable duplicate link",
							checked: remixEnabled,
							disabled: setAllowDuplicate.isPending,
							onCheckedChange: (enabled) => enabled ? setAllowDuplicate.mutate(true, mutationOptions) : setShowDisableRemix(true)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "xs",
							variant: "outline",
							disabled: !remixUrl || setAllowDuplicate.isPending,
							LeftIcon: remixCopied ? CheckIcon : CopyIcon,
							onClick: copyRemixUrl,
							children: remixCopied ? "Copied" : "Copy duplicate link"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Text$4, {
						as: "p",
						size: "3xs",
						variant: "tertiary",
						className: "col-span-2",
						children: [
							"Anyone with the duplicate link can make",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"an editable copy of this file."
						]
					})
				]
			})]
		})
	});
	let t22;
	if ($[32] !== T1 || $[33] !== t12 || $[34] !== t20 || $[35] !== t21) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T1, {
			className: t11,
			"aria-describedby": t12,
			children: [t20, t21]
		});
		$[32] = T1;
		$[33] = t12;
		$[34] = t20;
		$[35] = t21;
		$[36] = t22;
	} else t22 = $[36];
	let t23;
	if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
		t23 = () => setShowDisableRemix(false);
		$[37] = t23;
	} else t23 = $[37];
	let t24;
	if ($[38] !== setAllowDuplicate) {
		t24 = () => setAllowDuplicate.mutate(false);
		$[38] = setAllowDuplicate;
		$[39] = t24;
	} else t24 = $[39];
	let t25;
	if ($[40] !== showDisableRemix || $[41] !== t24) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			isOpen: showDisableRemix,
			onClose: t23,
			onConfirm: t24,
			title: "Turn off duplicate link",
			description: "The link stops working immediately. Copies people already made are theirs and are not affected.",
			confirmText: "Turn off",
			destructive: true
		});
		$[40] = showDisableRemix;
		$[41] = t24;
		$[42] = t25;
	} else t25 = $[42];
	let t26;
	if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
		t26 = () => setShowRevokeLink(false);
		$[43] = t26;
	} else t26 = $[43];
	let t27;
	if ($[44] !== revokeLink) {
		t27 = () => revokeLink.mutate();
		$[44] = revokeLink;
		$[45] = t27;
	} else t27 = $[45];
	let t28;
	if ($[46] !== showRevokeLink || $[47] !== t27) {
		t28 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
			isOpen: showRevokeLink,
			onClose: t26,
			onConfirm: t27,
			title: "Revoke share link",
			description: "Anyone with this link will immediately lose access to this file.",
			confirmText: "Revoke link",
			destructive: true
		});
		$[46] = showRevokeLink;
		$[47] = t27;
		$[48] = t28;
	} else t28 = $[48];
	let t29;
	if ($[49] !== T0 || $[50] !== t10 || $[51] !== t22 || $[52] !== t25 || $[53] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(T0, {
			open: t9,
			onOpenChange: t10,
			children: [
				t22,
				t25,
				t28
			]
		});
		$[49] = T0;
		$[50] = t10;
		$[51] = t22;
		$[52] = t25;
		$[53] = t28;
		$[54] = t29;
	} else t29 = $[54];
	return t29;
}
function _temp2$4(owner) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex h-8 items-center gap-2.5 px-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
				size: "sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
					src: owner.image ?? void 0,
					alt: ""
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
					className: "text-[9px]",
					children: (owner.name || owner.email).slice(0, 2).toUpperCase()
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 flex-1 items-baseline gap-1.5 text-[11px] leading-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: owner.name || owner.email
				}), owner.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden truncate text-ed-muted-foreground sm:inline",
					children: owner.email
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex h-6.5 shrink-0 items-center gap-1.5 px-2 text-[11px] leading-4 text-ed-muted-foreground",
				children: ["owner", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					className: "size-3 shrink-0"
				})]
			})
		]
	}, owner.id);
}
function _temp$6(permission_1) {
	return permission_1 === "editor" ? "can edit" : permission_1 === "commenter" ? "can comment" : "can view";
}

export { ShareDialog, buildShareUrl };
