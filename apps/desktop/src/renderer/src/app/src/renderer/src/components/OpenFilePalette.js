// Reconstructed from index-C74mRL57.js — original module: app/src/renderer/src/components/OpenFilePalette.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime, useSession } from "../../../../../packages/cloud/src/hooks/useSession.js";
import { useCreateProject, useProjects } from "../../../../../packages/cloud/src/hooks/useProjects.js";
import { cn$2 } from "../../../../../packages/ui/src/lib/utils.js";
import { Dialog, DialogContent, DialogTitle } from "../../../../../packages/ui/src/components/Dialog.js";
import { c$15, f$3, n$7, s$13 } from "../../../../../vendor/@phosphor-icons/react.js";
import { Kbd } from "../../../../../packages/ui/src/components/Kbd.js";
import { ScrollArea } from "../../../../../packages/ui/src/components/ScrollArea.js";
import { toast } from "../../../../../vendor/sonner.js";
import { usePostHog } from "../../../../../vendor/@posthog/react.js";
import { useOpenUpgradeModal } from "../../../../../packages/cloud/src/components/UpgradeModalProvider.js";
import { useDesktopFileLoading } from "./DesktopFileLoading.js";

/**
* Command-style file switcher. Project tabs are separate renderers painted over
* the host, so the tab bar can't overlay them; main asks whichever renderer is
* visible to open this instead.
*/
function OpenFilePalette() {
	const { session } = useSession();
	const organizationId = session?.activeOrganizationId ?? null;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)(0);
	const listRef = (0, import_react.useRef)(null);
	const openedProjectRef = (0, import_react.useRef)(false);
	const creatingRef = (0, import_react.useRef)(false);
	const { data: projects, isLoading } = useProjects(organizationId);
	const createProject = useCreateProject();
	const upgradeModal = useOpenUpgradeModal();
	const posthog = usePostHog();
	const setFileLoading = useDesktopFileLoading();
	(0, import_react.useEffect)(() => window.api.on("desktop_open_file_palette", () => {
		setQuery("");
		setActive(0);
		setOpen(true);
	}), []);
	(0, import_react.useEffect)(() => window.api.on("desktop_close_file_palette", () => setOpen(false)), []);
	(0, import_react.useEffect)(() => {
		if (!open) window.api.invoke("desktop_palette_state", { open: false }).catch(() => {});
	}, [open]);
	const createFileRef = (0, import_react.useRef)(async () => {});
	(0, import_react.useEffect)(() => window.api.on("desktop_new_file", () => void createFileRef.current()), []);
	const trimmed = query.trim().toLowerCase();
	const results = (0, import_react.useMemo)(() => {
		const sorted = [...projects ?? []].sort((a, b) => Date.parse(b.editedAt ?? b.updatedAt) - Date.parse(a.editedAt ?? a.updatedAt));
		return trimmed ? sorted.filter((p) => p.name.toLowerCase().includes(trimmed)) : sorted;
	}, [projects, trimmed]);
	const showNewFile = !trimmed;
	const rowCount = results.length + (showNewFile ? 1 : 0);
	(0, import_react.useEffect)(() => {
		listRef.current?.querySelector("[data-active=\"true\"]")?.scrollIntoView({ block: "nearest" });
	}, [active]);
	const openProject = (projectId, name, options) => {
		setFileLoading(true);
		openedProjectRef.current = true;
		setOpen(false);
		posthog.capture("project_opened", {
			project_id: projectId,
			source: "file-palette"
		});
		return window.api.invoke("desktop_tabs_open", {
			projectId,
			name,
			...options
		}).catch((error) => {
			console.error("[Tabs] Failed to open file", error);
			toast.error("Could not open file", { description: error instanceof Error ? error.message : String(error) });
		}).finally(() => setFileLoading(false));
	};
	const createFile = async () => {
		if (!organizationId || creatingRef.current) return;
		creatingRef.current = true;
		setFileLoading(true);
		openedProjectRef.current = true;
		setOpen(false);
		try {
			const { project } = await createProject.mutateAsync({
				name: "Untitled file",
				organizationId
			});
			posthog.capture("project_created", {
				project_id: project.id,
				source: "file-palette"
			});
			await openProject(project.id, project.name, { focusChat: true });
		} catch (err) {
			setFileLoading(false);
			setOpen(false);
			window.setTimeout(() => {
				if (!upgradeModal?.openUpgradeFromError(err)) toast.error(err instanceof Error ? err.message : "Could not create file");
			}, 0);
		}
		creatingRef.current = false;
	};
	createFileRef.current = createFile;
	const activate = (index) => {
		if (creatingRef.current) return;
		if (showNewFile && index === 0) {
			createFile();
			return;
		}
		const project_0 = results[showNewFile ? index - 1 : index];
		if (project_0) openProject(project_0.id, project_0.name);
	};
	const onKeyDown = (event) => {
		if (event.key === "ArrowDown" || event.key === "ArrowUp") {
			event.preventDefault();
			if (rowCount) setActive((active + (event.key === "ArrowDown" ? 1 : -1) + rowCount) % rowCount);
		} else if (event.key === "Enter") {
			event.preventDefault();
			activate(active);
		} else if (event.key === "Escape") {
			event.preventDefault();
			setOpen(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			layout: "legacy",
			showCloseButton: false,
			onOpenAutoFocus: (event_0) => {
				event_0.preventDefault();
				event_0.currentTarget.querySelector("input")?.focus();
				window.api.invoke("desktop_palette_state", { open: true }).catch(() => {});
			},
			onCloseAutoFocus: (event_1) => {
				if (openedProjectRef.current) event_1.preventDefault();
				openedProjectRef.current = false;
			},
			className: "w-[560px] max-w-[calc(100%-2rem)] gap-0 overflow-hidden bg-ed-background p-0 text-[11px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "sr-only",
					children: "Open file"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-10 items-center gap-2 border-b border-ed-border px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f$3, { className: "size-4 shrink-0 text-ed-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: query,
						onChange: (event_2) => {
							setQuery(event_2.target.value);
							setActive(0);
						},
						onKeyDown,
						placeholder: "Search files…",
						spellCheck: false,
						className: "h-full w-full bg-transparent text-[11px] text-ed-foreground outline-none placeholder:text-ed-muted-foreground"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ScrollArea, {
					className: "h-[320px]",
					viewportRef: listRef,
					viewportClassName: "p-1.5",
					role: "listbox",
					"aria-label": "Files",
					children: [
						showNewFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaletteRow, {
							index: 0,
							active: active === 0,
							onActivate: activate,
							onHover: setActive,
							className: "h-8 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(n$7, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "New file" })]
						}),
						results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-1.5 pt-2.5 pb-1 text-[11px] text-ed-muted-foreground",
							children: trimmed ? "Files" : "Recents"
						}),
						results.map((project_1, i) => {
							const index_0 = showNewFile ? i + 1 : i;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaletteRow, {
								index: index_0,
								active: active === index_0,
								onActivate: activate,
								onHover: setActive,
								className: "h-9",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectThumbnail, { project: project_1 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: project_1.name
								})]
							}, project_1.id);
						}),
						results.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-10 text-center text-[11px] text-ed-muted-foreground",
							children: isLoading ? "Loading files…" : "No files found."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-9 items-center justify-end gap-2.5 border-t border-ed-border px-3 text-[11px] text-ed-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [
								"Navigate ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
									className: "rounded-[4px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(c$15, {})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
									className: "rounded-[4px]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s$13, {})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-px bg-ed-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
								className: "rounded-[4px]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReturnKeyIcon, {})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-px bg-ed-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: ["Close ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kbd, {
								className: "rounded-[4px] text-[11px]",
								children: "Esc"
							})]
						})
					]
				})
			]
		})
	});
}
function PaletteRow(t0) {
	const $ = (0, import_compiler_runtime.c)(16);
	const { index, active, onActivate, onHover, className, children } = t0;
	let t1;
	if ($[0] !== index || $[1] !== onActivate) {
		t1 = () => onActivate(index);
		$[0] = index;
		$[1] = onActivate;
		$[2] = t1;
	} else t1 = $[2];
	let t2;
	if ($[3] !== active || $[4] !== index || $[5] !== onHover) {
		t2 = () => {
			if (!active) onHover(index);
		};
		$[3] = active;
		$[4] = index;
		$[5] = onHover;
		$[6] = t2;
	} else t2 = $[6];
	const t3 = active && "bg-ed-muted";
	let t4;
	if ($[7] !== className || $[8] !== t3) {
		t4 = cn$2("flex w-full items-center gap-2.5 rounded-md px-1.5 text-left text-[11px] text-ed-foreground", t3, className);
		$[7] = className;
		$[8] = t3;
		$[9] = t4;
	} else t4 = $[9];
	let t5;
	if ($[10] !== active || $[11] !== children || $[12] !== t1 || $[13] !== t2 || $[14] !== t4) {
		t5 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "option",
			"aria-selected": active,
			"data-active": active,
			tabIndex: -1,
			onClick: t1,
			onMouseMove: t2,
			className: t4,
			children
		});
		$[10] = active;
		$[11] = children;
		$[12] = t1;
		$[13] = t2;
		$[14] = t4;
		$[15] = t5;
	} else t5 = $[15];
	return t5;
}
/** Return arrow with a short tail; Phosphor's elbow arrow reads too tall at key-cap size. */
function ReturnKeyIcon() {
	const $ = (0, import_compiler_runtime.c)(1);
	let t0;
	if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
		t0 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
			className: "size-3",
			viewBox: "0 0 12 12",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.25",
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.5 3.5v2a1.5 1.5 0 0 1-1.5 1.5H3M5 5 3 7l2 2" })
		});
		$[0] = t0;
	} else t0 = $[0];
	return t0;
}
/** Canvas preview, falling back to a blank tile until one has been captured. */
function ProjectThumbnail(t0) {
	const $ = (0, import_compiler_runtime.c)(4);
	const { project } = t0;
	const [failed, setFailed] = (0, import_react.useState)(false);
	const url = project.previewUrl;
	if (!url || failed) {
		let t1;
		if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
			t1 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-6 w-9 shrink-0 rounded-sm border border-ed-border bg-ed-muted" });
			$[0] = t1;
		} else t1 = $[0];
		return t1;
	}
	let t1;
	if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
		t1 = () => setFailed(true);
		$[1] = t1;
	} else t1 = $[1];
	let t2;
	if ($[2] !== url) {
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: url,
			alt: "",
			loading: "lazy",
			onError: t1,
			className: "h-6 w-9 shrink-0 rounded-sm border border-ed-border bg-ed-muted object-cover object-top"
		});
		$[2] = url;
		$[3] = t2;
	} else t2 = $[3];
	return t2;
}

export { OpenFilePalette };
