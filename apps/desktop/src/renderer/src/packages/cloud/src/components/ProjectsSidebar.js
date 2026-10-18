// Reconstructed from index-C74mRL57.js — original module: packages/cloud/src/components/ProjectsSidebar.tsx
import { import_jsx_runtime, import_react } from "../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../hooks/useSession.js";
import { useCreateOrganization, useOrganizations, useSetActiveOrganization } from "../hooks/useOrganizations.js";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/src/components/Avatar.js";
import { ArrowSquareOutIcon, CaretDownIcon, CheckIcon, FileIcon, PlusIcon, SearchIcon, SettingsIcon, TrashIcon, UsersIcon } from "../../../ui/src/icons.js";
import { Text$4 } from "../../../ui/src/components/Text.js";
import { Button } from "../../../ui/src/components/Button.js";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../../ui/src/components/Dialog.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../../../ui/src/components/DropdownMenu.js";
import { Input } from "../../../ui/src/components/Input.js";
import { Kbd } from "../../../ui/src/components/Kbd.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../../ui/src/components/InputGroup.js";
import { SidebarRow, SidebarRowIcon } from "../../../ui/src/components/SidebarRow.js";
import { useEditorThemeContext } from "../../../ui/src/hooks/EditorThemeProvider.js";
import { isElectronApp } from "../utils/isElectronApp.js";
import { ProjectsSidebarFeedback } from "./ProjectsSidebarFeedback.js";
import { useProjectSearchNav } from "./ProjectSearchNavContext.js";

function getInitials(name) {
	return name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
}
/** App-wide theme control in the user menu. */
function ThemeMenuSub() {
	const $ = (0, import_compiler_runtime.c)(9);
	const { theme, setTheme } = useEditorThemeContext();
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubTrigger, { children: "Theme" });
		$[0] = t0;
	} else t0 = $[0];
	let t1;
	if ($[1] !== setTheme) {
		t1 = (value) => {
			if (value === "light" || value === "dark" || value === "system") setTheme(value);
		};
		$[1] = setTheme;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	let t3;
	let t4;
	if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
			value: "light",
			children: "Light"
		});
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
			value: "dark",
			children: "Dark"
		});
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuRadioItem, {
			value: "system",
			children: "System"
		});
		$[3] = t2;
		$[4] = t3;
		$[5] = t4;
	} else {
		t2 = $[3];
		t3 = $[4];
		t4 = $[5];
	}
	let t5;
	if ($[6] !== t1 || $[7] !== theme) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuSub, { children: [t0, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSubContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuRadioGroup, {
			value: theme,
			onValueChange: t1,
			children: [
				t2,
				t3,
				t4
			]
		}) })] });
		$[6] = t1;
		$[7] = theme;
		$[8] = t5;
	} else t5 = $[8];
	return t5;
}
/** Projects sidebar chrome. Header and body are composed in via slots. */
function ProjectsSidebar(t0) {
	const $ = (0, import_compiler_runtime.c)(8);
	const { header, content } = t0;
	let t1;
	if ($[0] !== header) {
		t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col",
			children: header
		});
		$[0] = header;
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== content) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-0 flex-1 flex-col overflow-hidden",
			children: content
		});
		$[2] = content;
		$[3] = t2;
	} else t2 = $[3];
	let t3;
	if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
		t3 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex shrink-0 flex-col p-3 pt-0",
			children: null /* feedback hidden in Petal */
		});
		$[4] = t3;
	} else t3 = $[4];
	let t4;
	if ($[5] !== t1 || $[6] !== t2) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full min-h-0 w-64 flex-col bg-ed-background text-ed-foreground",
			children: [
				t1,
				t2,
				t3
			]
		});
		$[5] = t1;
		$[6] = t2;
		$[7] = t4;
	} else t4 = $[7];
	return t4;
}
function ProjectsSidebarHeader(t0) {
	const $ = (0, import_compiler_runtime.c)(49);
	const { user, onSignOut, search, onSearchChange } = t0;
	let t1;
	if ($[0] !== user.name) {
		t1 = getInitials(user.name);
		$[0] = user.name;
		$[1] = t1;
	} else t1 = $[1];
	const initials = t1;
	const searchInputRef = (0, import_react.useRef)(null);
	const showSearch = search !== void 0 && onSearchChange !== void 0;
	const searchNav = useProjectSearchNav();
	let t2;
	if ($[2] !== onSearchChange || $[3] !== search || $[4] !== searchNav) {
		t2 = (e) => {
			if (e.key === "Escape") {
				e.preventDefault();
				if (search) onSearchChange?.("");
				else searchInputRef.current?.blur();
				return;
			}
			searchNav?.onKeyDown(e);
		};
		$[2] = onSearchChange;
		$[3] = search;
		$[4] = searchNav;
		$[5] = t2;
	} else t2 = $[5];
	const handleKeyDown = t2;
	let t3;
	let t4;
	if ($[6] !== showSearch) {
		t3 = () => {
			if (!showSearch) return;
			const onKeyDown = (e_0) => {
				if (!(e_0.metaKey || e_0.ctrlKey) || e_0.shiftKey || e_0.altKey) return;
				if (e_0.key.toLowerCase() !== "f") return;
				e_0.preventDefault();
				searchInputRef.current?.focus();
				searchInputRef.current?.select();
			};
			window.addEventListener("keydown", onKeyDown);
			return () => window.removeEventListener("keydown", onKeyDown);
		};
		t4 = [showSearch];
		$[6] = showSearch;
		$[7] = t3;
		$[8] = t4;
	} else {
		t3 = $[7];
		t4 = $[8];
	}
	(0, import_react.useEffect)(t3, t4);
	const t5 = user.image ?? void 0;
	let t6;
	if ($[9] !== t5 || $[10] !== user.name) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
			src: t5,
			alt: user.name
		});
		$[9] = t5;
		$[10] = user.name;
		$[11] = t6;
	} else t6 = $[11];
	let t7;
	if ($[12] !== initials) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
			className: "text-[8px] font-medium",
			children: initials
		});
		$[12] = initials;
		$[13] = t7;
	} else t7 = $[13];
	let t8;
	if ($[14] !== t6 || $[15] !== t7) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
			className: "size-5",
			children: [t6, t7]
		});
		$[14] = t6;
		$[15] = t7;
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] !== user.name) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate font-medium text-ed-foreground",
			children: user.name
		});
		$[17] = user.name;
		$[18] = t9;
	} else t9 = $[18];
	let t10;
	if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "ml-auto shrink-0" });
		$[19] = t10;
	} else t10 = $[19];
	let t11;
	if ($[20] !== t8 || $[21] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, { children: [
				t8,
				t9,
				t10
			] })
		});
		$[20] = t8;
		$[21] = t9;
		$[22] = t11;
	} else t11 = $[22];
	let t12;
	if ($[23] !== user.name) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate font-medium",
			children: user.name
		});
		$[23] = user.name;
		$[24] = t12;
	} else t12 = $[24];
	let t13;
	if ($[25] !== user.email) {
		t13 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate text-ed-muted-foreground",
			children: user.email
		});
		$[25] = user.email;
		$[26] = t13;
	} else t13 = $[26];
	let t14;
	if ($[27] !== t12 || $[28] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
			className: "p-0 font-normal",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid px-1.5 py-1 text-left text-[11px] leading-4 tracking-[-0.01em]",
				children: [t12, t13]
			})
		});
		$[27] = t12;
		$[28] = t13;
		$[29] = t14;
	} else t14 = $[29];
	let t15;
	let t16;
	if ($[30] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeMenuSub, {});
		$[30] = t15;
		$[31] = t16;
	} else {
		t15 = $[30];
		t16 = $[31];
	}
	let t17;
	if ($[32] !== onSignOut) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
			onClick: onSignOut,
			children: "Sign out"
		});
		$[32] = onSignOut;
		$[33] = t17;
	} else t17 = $[33];
	let t18;
	if ($[34] !== t14 || $[35] !== t17) {
		t18 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			side: "bottom",
			align: "start",
			sideOffset: 4,
			className: "w-[var(--radix-dropdown-menu-trigger-width)]",
			children: [
				t14,
				t15,
				t16,
				t17
			]
		});
		$[34] = t14;
		$[35] = t17;
		$[36] = t18;
	} else t18 = $[36];
	let t19;
	if ($[37] !== t11 || $[38] !== t18) {
		t19 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex h-12.5 shrink-0 items-center border-b border-ed-divider px-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex w-full min-w-0 flex-col",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t11, t18] }) })
			})
		});
		$[37] = t11;
		$[38] = t18;
		$[39] = t19;
	} else t19 = $[39];
	let t20;
	if ($[40] !== handleKeyDown || $[41] !== onSearchChange || $[42] !== search || $[43] !== searchNav || $[44] !== showSearch) {
		t20 = showSearch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-3 pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(InputGroup, {
				size: "xs",
				className: "h-8 shadow-none focus-within:ring-0!",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
						align: "inline-start",
						className: "pl-[5px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-5 shrink-0 items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchIcon, { className: "size-[15px] text-ed-foreground-secondary" })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupInput, {
						ref: searchInputRef,
						placeholder: "Search",
						value: search,
						onChange: (e_1) => onSearchChange(e_1.target.value),
						onKeyDown: handleKeyDown,
						"aria-label": "Search files",
						role: "combobox",
						"aria-expanded": searchNav?.isActive ?? false,
						"aria-controls": searchNav?.isActive ? searchNav.listboxId : void 0,
						"aria-activedescendant": searchNav?.activeOptionId ?? void 0,
						"aria-autocomplete": "list",
						className: "pl-1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InputGroupAddon, {
						align: "inline-end",
						className: "pr-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
							className: "bg-transparent px-0 text-ed-muted-foreground/50",
							children: "⌘F"
						})
					})
				]
			})
		});
		$[40] = handleKeyDown;
		$[41] = onSearchChange;
		$[42] = search;
		$[43] = searchNav;
		$[44] = showSearch;
		$[45] = t20;
	} else t20 = $[45];
	let t21;
	if ($[46] !== t19 || $[47] !== t20) {
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [t19, t20] });
		$[46] = t19;
		$[47] = t20;
		$[48] = t21;
	} else t21 = $[48];
	return t21;
}
function ProjectsSidebarContent(t0) {
	const $ = (0, import_compiler_runtime.c)(59);
	const { filter, setFilter, onOpenSettings } = t0;
	const [showCreateOrg, setShowCreateOrg] = (0, import_react.useState)(false);
	const { data: t1 } = useOrganizations();
	const organizations = t1 === void 0 ? [] : t1;
	const setActiveOrganization = useSetActiveOrganization();
	const orgName = organizations.find(_temp$8)?.name ?? "Organization";
	const orgOptions = organizations.length > 0 ? organizations : [{
		id: "",
		name: orgName,
		active: true
	}];
	const initials = getInitials(orgName);
	const t2 = filter === "shared";
	let t3;
	if ($[0] !== setFilter) {
		t3 = () => setFilter("shared");
		$[0] = setFilter;
		$[1] = t3;
	} else t3 = $[1];
	let t4;
	let t5;
	if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarRowIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsersIcon, {}) });
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Shared with me" });
		$[2] = t4;
		$[3] = t5;
	} else {
		t4 = $[2];
		t5 = $[3];
	}
	let t6;
	if ($[4] !== t2 || $[5] !== t3) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-ed-divider px-3 pt-1.5 pb-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex w-full min-w-0 flex-col gap-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, {
					isActive: t2,
					onClick: t3,
					children: [t4, t5]
				}) })
			})
		});
		$[4] = t2;
		$[5] = t3;
		$[6] = t6;
	} else t6 = $[6];
	let t7;
	if ($[7] !== initials) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			className: "size-5 bg-ed-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
				className: "bg-ed-secondary text-[8px] font-medium text-ed-secondary-foreground",
				children: initials
			})
		});
		$[7] = initials;
		$[8] = t7;
	} else t7 = $[8];
	let t8;
	if ($[9] !== orgName) {
		t8 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate font-medium text-ed-foreground",
			children: orgName
		});
		$[9] = orgName;
		$[10] = t8;
	} else t8 = $[10];
	let t9;
	if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CaretDownIcon, { className: "ml-auto shrink-0" });
		$[11] = t9;
	} else t9 = $[11];
	let t10;
	if ($[12] !== t7 || $[13] !== t8) {
		t10 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, { children: [
				t7,
				t8,
				t9
			] })
		});
		$[12] = t7;
		$[13] = t8;
		$[14] = t10;
	} else t10 = $[14];
	let t11;
	let t12;
	if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, { children: "Organizations" });
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[15] = t11;
		$[16] = t12;
	} else {
		t11 = $[15];
		t12 = $[16];
	}
	let t13;
	if ($[17] !== orgOptions || $[18] !== setActiveOrganization) {
		let t14;
		if ($[20] !== setActiveOrganization) {
			t14 = (org) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				onClick: org.active || !org.id ? void 0 : () => setActiveOrganization.mutate(org.id),
				children: [org.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4" }), org.name]
			}, org.id || org.name);
			$[20] = setActiveOrganization;
			$[21] = t14;
		} else t14 = $[21];
		t13 = orgOptions.map(t14);
		$[17] = orgOptions;
		$[18] = setActiveOrganization;
		$[19] = t13;
	} else t13 = $[19];
	let t14;
	if ($[22] === Symbol.for("react.memo_cache_sentinel")) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {});
		$[22] = t14;
	} else t14 = $[22];
	let t15;
	if ($[23] === Symbol.for("react.memo_cache_sentinel")) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
			onClick: () => setShowCreateOrg(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlusIcon, {}), "Create organization"]
		});
		$[23] = t15;
	} else t15 = $[23];
	let t16;
	if ($[24] !== t13) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			side: "bottom",
			align: "start",
			sideOffset: 4,
			className: "w-[var(--radix-dropdown-menu-trigger-width)]",
			children: [
				t11,
				t12,
				t13,
				t14,
				t15
			]
		});
		$[24] = t13;
		$[25] = t16;
	} else t16 = $[25];
	let t17;
	if ($[26] !== t10 || $[27] !== t16) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex w-full min-w-0 flex-col",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [t10, t16] }) })
		});
		$[26] = t10;
		$[27] = t16;
		$[28] = t17;
	} else t17 = $[28];
	const t18 = filter === "all";
	let t19;
	if ($[29] !== setFilter) {
		t19 = () => setFilter("all");
		$[29] = setFilter;
		$[30] = t19;
	} else t19 = $[30];
	let t20;
	let t21;
	if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
		t20 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarRowIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileIcon, {}) });
		t21 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Files" });
		$[31] = t20;
		$[32] = t21;
	} else {
		t20 = $[31];
		t21 = $[32];
	}
	let t22;
	if ($[33] !== t18 || $[34] !== t19) {
		t22 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, {
			isActive: t18,
			onClick: t19,
			children: [t20, t21]
		}) });
		$[33] = t18;
		$[34] = t19;
		$[35] = t22;
	} else t22 = $[35];
	const t23 = filter === "trash";
	let t24;
	if ($[36] !== setFilter) {
		t24 = () => setFilter("trash");
		$[36] = setFilter;
		$[37] = t24;
	} else t24 = $[37];
	let t25;
	let t26;
	if ($[38] === Symbol.for("react.memo_cache_sentinel")) {
		t25 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarRowIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrashIcon, {}) });
		t26 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Trash" });
		$[38] = t25;
		$[39] = t26;
	} else {
		t25 = $[38];
		t26 = $[39];
	}
	let t27;
	if ($[40] !== t23 || $[41] !== t24) {
		t27 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, {
			isActive: t23,
			onClick: t24,
			children: [t25, t26]
		}) });
		$[40] = t23;
		$[41] = t24;
		$[42] = t27;
	} else t27 = $[42];
	let t28;
	if ($[43] !== onOpenSettings) {
		t28 = false && onOpenSettings && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SidebarRow, {
			onClick: onOpenSettings,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarRowIcon, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsIcon, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Admin" }),
				isElectronApp() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowSquareOutIcon, { className: "ml-auto shrink-0 opacity-0 group-hover/sidebar-row:opacity-100" })
			]
		}) });
		$[43] = onOpenSettings;
		$[44] = t28;
	} else t28 = $[44];
	let t29;
	if ($[45] !== t22 || $[46] !== t27 || $[47] !== t28) {
		t29 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "flex w-full min-w-0 flex-col gap-1.5",
			children: [
				t22,
				t27,
				t28
			]
		});
		$[45] = t22;
		$[46] = t27;
		$[47] = t28;
		$[48] = t29;
	} else t29 = $[48];
	let t30;
	if ($[49] !== t17 || $[50] !== t29) {
		t30 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-1.5 p-3",
			children: [t17, t29]
		});
		$[49] = t17;
		$[50] = t29;
		$[51] = t30;
	} else t30 = $[51];
	let t31;
	if ($[52] === Symbol.for("react.memo_cache_sentinel")) {
		t31 = () => setShowCreateOrg(false);
		$[52] = t31;
	} else t31 = $[52];
	let t32;
	if ($[53] !== showCreateOrg) {
		t32 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewOrganizationModal, {
			isOpen: showCreateOrg,
			onClose: t31
		});
		$[53] = showCreateOrg;
		$[54] = t32;
	} else t32 = $[54];
	let t33;
	if ($[55] !== t30 || $[56] !== t32 || $[57] !== t6) {
		t33 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			t6,
			t30,
			t32
		] });
		$[55] = t30;
		$[56] = t32;
		$[57] = t6;
		$[58] = t33;
	} else t33 = $[58];
	return t33;
}
/**
* Name a new organization. Follows the project dialog pattern: serif title,
* a labeled name field, and a secondary/primary footer. On success the
* mutation reloads into the new org.
*/
function _temp$8(o) {
	return o.active;
}
function NewOrganizationModal(t0) {
	const $ = (0, import_compiler_runtime.c)(42);
	const { isOpen, onClose } = t0;
	const [name, setName] = (0, import_react.useState)("");
	const [failed, setFailed] = (0, import_react.useState)(false);
	const createOrg = useCreateOrganization();
	let t1;
	if ($[0] !== name) {
		t1 = name.trim();
		$[0] = name;
		$[1] = t1;
	} else t1 = $[1];
	const trimmed = t1;
	let t2;
	if ($[2] !== createOrg.isPending || $[3] !== onClose) {
		t2 = function handleClose() {
			if (createOrg.isPending) return;
			setName("");
			setFailed(false);
			onClose();
		};
		$[2] = createOrg.isPending;
		$[3] = onClose;
		$[4] = t2;
	} else t2 = $[4];
	const handleClose = t2;
	let t3;
	if ($[5] !== createOrg || $[6] !== onClose || $[7] !== trimmed) {
		t3 = function handleSubmit() {
			if (!trimmed || createOrg.isPending) return;
			setFailed(false);
			createOrg.mutate(trimmed, {
				onSuccess: () => {
					setName("");
					onClose();
				},
				onError: () => setFailed(true)
			});
		};
		$[5] = createOrg;
		$[6] = onClose;
		$[7] = trimmed;
		$[8] = t3;
	} else t3 = $[8];
	const handleSubmit = t3;
	let t4;
	if ($[9] !== handleClose) {
		t4 = (open) => {
			if (!open) handleClose();
		};
		$[9] = handleClose;
		$[10] = t4;
	} else t4 = $[10];
	let t5;
	if ($[11] !== handleSubmit) {
		t5 = (e) => {
			e.preventDefault();
			handleSubmit();
		};
		$[11] = handleSubmit;
		$[12] = t5;
	} else t5 = $[12];
	let t6;
	if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
		t6 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create organization" }) });
		$[13] = t6;
	} else t6 = $[13];
	let t7;
	if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
		t7 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			htmlFor: "organization-name",
			className: "text-[11px] leading-4 font-medium text-ed-foreground",
			children: "Organization name"
		});
		$[14] = t7;
	} else t7 = $[14];
	let t8;
	if ($[15] !== failed) {
		t8 = (e_0) => {
			setName(e_0.target.value);
			if (failed) setFailed(false);
		};
		$[15] = failed;
		$[16] = t8;
	} else t8 = $[16];
	let t9;
	if ($[17] !== name || $[18] !== t8) {
		t9 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: "organization-name",
			size: "xs",
			autoFocus: true,
			value: name,
			onChange: t8,
			placeholder: "Acme Studio",
			"aria-label": "Organization name",
			maxLength: 100
		});
		$[17] = name;
		$[18] = t8;
		$[19] = t9;
	} else t9 = $[19];
	let t10;
	if ($[20] !== failed) {
		t10 = failed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Text$4, {
			as: "p",
			size: "3xs",
			variant: "danger",
			children: "Couldn't create the organization. Try again."
		});
		$[20] = failed;
		$[21] = t10;
	} else t10 = $[21];
	let t11;
	if ($[22] !== t10 || $[23] !== t9) {
		t11 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogBody, {
			className: "gap-2",
			children: [
				t7,
				t9,
				t10
			]
		});
		$[22] = t10;
		$[23] = t9;
		$[24] = t11;
	} else t11 = $[24];
	let t12;
	if ($[25] !== createOrg.isPending || $[26] !== handleClose) {
		t12 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			variant: "ghost",
			size: "xs",
			onClick: handleClose,
			disabled: createOrg.isPending,
			children: "Cancel"
		});
		$[25] = createOrg.isPending;
		$[26] = handleClose;
		$[27] = t12;
	} else t12 = $[27];
	const t13 = !trimmed || createOrg.isPending;
	let t14;
	if ($[28] !== createOrg.isPending || $[29] !== t13) {
		t14 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "submit",
			variant: "outline",
			size: "xs",
			disabled: t13,
			loading: createOrg.isPending,
			children: "Create organization"
		});
		$[28] = createOrg.isPending;
		$[29] = t13;
		$[30] = t14;
	} else t14 = $[30];
	let t15;
	if ($[31] !== t12 || $[32] !== t14) {
		t15 = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [t12, t14] });
		$[31] = t12;
		$[32] = t14;
		$[33] = t15;
	} else t15 = $[33];
	let t16;
	if ($[34] !== t11 || $[35] !== t15 || $[36] !== t5) {
		t16 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			"aria-describedby": void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: t5,
				children: [
					t6,
					t11,
					t15
				]
			})
		});
		$[34] = t11;
		$[35] = t15;
		$[36] = t5;
		$[37] = t16;
	} else t16 = $[37];
	let t17;
	if ($[38] !== isOpen || $[39] !== t16 || $[40] !== t4) {
		t17 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: isOpen,
			onOpenChange: t4,
			children: t16
		});
		$[38] = isOpen;
		$[39] = t16;
		$[40] = t4;
		$[41] = t17;
	} else t17 = $[41];
	return t17;
}

export { ProjectsSidebar, ProjectsSidebarContent, ProjectsSidebarHeader };
