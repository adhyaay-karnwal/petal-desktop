// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/canvas.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { commandResult, defineTool, errorResult, getToolContext, textResult } from "./utils.js";

/**
* Canvas MCP tools.
*
* Each definition validates its input, maps the model-facing snake_case fields
* onto the typed camelCase command args and calls the host, which resolves the
* command's structured data or throws. The tool builds the MCP result (text and,
* for screenshots, an image) from that data here — the host knows nothing about
* presentation. Nothing is locked: `canvas_read` records the subtree hash of
* every node it showed, each write moves those hashes along with it, and
* `canvas_update` / `canvas_delete` send the hash so the renderer refuses to
* discard edits the agent has not seen.
*/
/** Keep a project name with braces or angle brackets from breaking scaffold JSX. */
function escapeJsxText$1(text) {
	return text.replace(/[{}<>]/g, " ").replace(/\s+/g, " ").trim();
}
/**
* The hash `canvas_update` / `canvas_delete` must match: the subtree as the
* agent last read it. Missing means the agent never read it this session.
*/
function readHashFor(session, elementId) {
	return session.coveringReads.get(elementId) ?? null;
}
function notReadMessage(elementId) {
	return `${elementId} has not been read in this session. canvas_read it (or an ancestor) first, so the change does not overwrite edits you have not seen.`;
}
/** Extract the SDK request abort signal without importing its types. */
function signalFromExtra(extra) {
	if (extra && typeof extra === "object" && "signal" in extra) return extra.signal;
}
var IMPORT_SCAFFOLD_SECTIONS$1 = [
	{
		key: "colors",
		heading: "Color tokens",
		note: "every semantic colour token, each swatch drawn with the utility it documents"
	},
	{
		key: "typography",
		heading: "Typography",
		note: "the type scale in the source fonts"
	},
	{
		key: "spacing",
		heading: "Radius, spacing & motion",
		note: "radii, gutters, and transition tokens"
	},
	{
		key: "icons",
		heading: "Icons",
		note: "a representative set from the source icon pack"
	},
	{
		key: "components",
		heading: "Components",
		note: "one subsection per component you actually imported, by its real exported name"
	}
];
/** The canvas tool catalog; every tool drives the call context's `host`. */
function createCanvasTools() {
	/** Run one `addToCanvas` for the import scaffold and return the new id. */
	const addScaffoldElement = async (jsx, parentId) => {
		const { session, host } = getToolContext();
		const data = await host.addToCanvas({
			jsx,
			...parentId ? { parentId } : {}
		});
		session.recordCanvasWrite(data);
		const id = data.elementIds[0];
		if (!id) throw new Error("canvas add returned no element id");
		return id;
	};
	return [
		{
			name: "canvas_list",
			config: {
				description: "List canvas pages (names, IDs, loaded/active) plus each page's existing top-level frames. Call when you need page IDs or frame positions. canvas_add writes to the active page and auto-places new roots to the right of those frames.",
				inputSchema: {}
			},
			async execute(_args, extra) {
				const data = await getToolContext().host.listPages({}, signalFromExtra(extra));
				return commandResult("listPages", data, `${data.note}\n${JSON.stringify(data.pages, null, 2)}`);
			}
		},
		{
			name: "canvas_create_page",
			config: {
				description: "Create a new empty canvas page and make it the active canvas. Returns the new page id. Use before bulk canvas work so you build on a dedicated page.",
				inputSchema: { name: require_dist$2.string().optional().describe("Name for the new page, e.g. \"Design System\"") }
			},
			async execute(args, extra) {
				const data = await getToolContext().host.createPage({ name: typeof args.name === "string" ? args.name : void 0 }, signalFromExtra(extra));
				return commandResult("createPage", data, `${data.reused ? "Reusing page" : "Created page"} "${data.name}" (id ${data.id}). It is now the active canvas — subsequent canvas_add calls target it.`);
			}
		},
		{
			name: "canvas_read",
			config: {
				description: "Read elements from a canvas page as JSX. Pass element_id to read a specific element instead of the whole page. Oversized trees may include petal:truncated stubs — read those ids next. canvas_update and canvas_delete need a current read of the element (or an ancestor).",
				inputSchema: {
					canvas_id: require_dist$2.string().describe("Canvas page ID to read from"),
					element_id: require_dist$2.string().optional().describe("Read a specific element instead of the whole canvas")
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = typeof args.element_id === "string" ? args.element_id : void 0;
				const data = await host.readCanvas({
					canvasId: String(args.canvas_id),
					...elementId ? { elementId } : {}
				}, signalFromExtra(extra));
				if (data.coveringReads) session.recordCoveringReads(data.coveringReads);
				return commandResult("readCanvas", data, data.text);
			}
		},
		{
			name: "canvas_add",
			config: {
				description: "Add new elements to the active canvas page from JSX. The canvas paints as JSX arrives — add a visible shell first, then 2–4 chunks into it with parent_id. Nothing is locked: the user may be editing nearby while you work.",
				inputSchema: {
					jsx: require_dist$2.string().describe("JSX code for the new element(s)"),
					canvas_id: require_dist$2.string().optional().describe("Optional active canvas page ID"),
					parent_id: require_dist$2.string().optional().describe("Parent element ID to add inside (omit for root)"),
					x: require_dist$2.number().optional().describe("Root X position; omit to auto-place right of existing frames"),
					y: require_dist$2.number().optional().describe("Root Y position; omit to auto-place")
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const data = await host.addToCanvas({
					jsx: String(args.jsx),
					...typeof args.canvas_id === "string" ? { canvasId: args.canvas_id } : {},
					...typeof args.parent_id === "string" ? { parentId: args.parent_id } : {},
					...typeof args.x === "number" ? { x: args.x } : {},
					...typeof args.y === "number" ? { y: args.y } : {}
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				return commandResult("addToCanvas", data, `Added ${data.elementIds.length} element(s):\n${data.outline}`);
			}
		},
		{
			name: "canvas_update",
			config: {
				description: "Replace an existing element's full JSX. Prefer canvas_edit/canvas_insert for surgical changes. Replaces the whole subtree, so it is refused if the element changed since you last read it: canvas_read it again and retry. You MAY include data-element-id from canvas_read to preserve child identity.",
				inputSchema: {
					element_id: require_dist$2.string(),
					jsx: require_dist$2.string()
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = String(args.element_id);
				const expectedHash = readHashFor(session, elementId);
				if (!expectedHash) return errorResult(notReadMessage(elementId));
				const data = await host.updateElement({
					elementId,
					jsx: String(args.jsx),
					expectedHash
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				const s = data.summary;
				return commandResult("updateElement", data, `Updated element ${elementId}. Change summary: preserved=${s.nodesPreserved}, added=${s.nodesAdded}, removed=${s.nodesRemoved}${data.added}`);
			}
		},
		{
			name: "canvas_edit",
			config: {
				description: "Surgically edit an element by string replace on its JSX. old_string must be unique unless replace_all. Applies to the element as it is now; if old_string is not found, someone changed it — canvas_read and retry.",
				inputSchema: {
					element_id: require_dist$2.string(),
					old_string: require_dist$2.string(),
					new_string: require_dist$2.string(),
					replace_all: require_dist$2.boolean().optional()
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = String(args.element_id);
				const data = await host.editElement({
					elementId,
					oldString: String(args.old_string),
					newString: String(args.new_string),
					replaceAll: args.replace_all === true
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				const s = data.summary;
				return commandResult("editElement", data, `Edited element ${elementId} (${data.replacements} replacement(s)). Change summary: preserved=${s.nodesPreserved}, added=${s.nodesAdded}, removed=${s.nodesRemoved}${data.added}`);
			}
		},
		{
			name: "canvas_patch",
			config: {
				description: "Change text, inline style, className or props on existing elements by id, in one batch. No read and no string matching needed: ids come from canvas_add / canvas_insert results, canvas_grep or canvas_read. Use this instead of canvas_edit for copy changes, colour, spacing, size and class tweaks. `style` and `props` merge into what is there; a null value removes that key. `text` on an element with a single text run sets that run. Each entry reports its own error; the rest still apply.",
				inputSchema: { updates: require_dist$2.array(require_dist$2.object({
					element_id: require_dist$2.string(),
					text: require_dist$2.string().optional().describe("New text content"),
					style: require_dist$2.record(require_dist$2.string(), require_dist$2.unknown()).optional().describe("Inline style keys to set (camelCase, like React style). null removes a key."),
					className: require_dist$2.string().optional().describe("Replaces the whole className"),
					props: require_dist$2.record(require_dist$2.string(), require_dist$2.unknown()).optional().describe("Component props or attributes to set. null removes a key.")
				})).min(1) }
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const updates = args.updates;
				const data = await host.patchElements({ updates }, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				const summary = `Patched ${data.applied.length} of ${updates.length} element(s).`;
				const text = data.errors.length > 0 ? `${summary}\nErrors:\n${data.errors.map((error) => `- ${error}`).join("\n")}` : summary;
				return data.applied.length === 0 ? errorResult(text) : commandResult("patchElements", data, text);
			}
		},
		{
			name: "canvas_insert",
			config: {
				description: "Insert new JSX as a sibling or child without rewriting the parent. Provide exactly one of before_id, after_id, or parent_id. Cannot insert at the canvas root — use canvas_add.",
				inputSchema: {
					jsx: require_dist$2.string(),
					before_id: require_dist$2.string().optional(),
					after_id: require_dist$2.string().optional(),
					parent_id: require_dist$2.string().optional(),
					index: require_dist$2.number().optional()
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const data = await host.insertElement({
					jsx: String(args.jsx),
					...typeof args.before_id === "string" ? { beforeId: args.before_id } : {},
					...typeof args.after_id === "string" ? { afterId: args.after_id } : {},
					...typeof args.parent_id === "string" ? { parentId: args.parent_id } : {},
					...typeof args.index === "number" ? { index: args.index } : {}
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				return commandResult("insertElement", data, `Inserted ${data.elementIds.length} element(s) at index ${data.index} under ${data.parentId}:\n${data.outline}`);
			}
		},
		{
			name: "canvas_duplicate",
			config: {
				description: "Copy an existing canvas element (with its whole subtree) without re-sending its JSX. USE THIS FOR VARIATIONS: when the user asks for another version of a screen, section, card or row that already exists, duplicate it and edit the copy — never redraw it from scratch, and never canvas_read a large tree just to paste it back through canvas_add (big trees come back truncated). The copy gets fresh ids at every node.\n\nPlacement: by default the copy lands next to its source — a top-level frame is parked beside the existing frames, a child becomes the next sibling. Pass before_id / after_id / parent_id (+ optional index) to put it somewhere else.\n\nREPEATED ITEMS: for rows, cards, tiers, list items or nav links, build the first one, then make the rest in one call with `copies` — one entry per copy, each mapping a node in the source (its id, or its name) to canvas_patch fields: copies: [{ \"<title-id>\": { text: \"Pro\" }, \"<price-id>\": { text: \"$19\" } }, …]. An empty entry {} is a plain copy. Copies land in order and the result lists every new id, so later changes go through canvas_patch with no read.",
				inputSchema: {
					element_id: require_dist$2.string().describe("Element to copy (its whole subtree comes with it)"),
					after_id: require_dist$2.string().optional().describe("Optional: place the copy directly after this element"),
					before_id: require_dist$2.string().optional().describe("Optional: place the copy directly before this element"),
					parent_id: require_dist$2.string().optional().describe("Optional: place the copy inside this element"),
					index: require_dist$2.number().optional().describe("Optional child index when using parent_id (default: append)"),
					copies: require_dist$2.array(require_dist$2.record(require_dist$2.string(), require_dist$2.record(require_dist$2.string(), require_dist$2.unknown()))).optional().describe("Optional: make one copy per entry (max 50). Each entry maps a node in the source subtree, by id or name, to the fields to change on that copy: text, style, className, props (same as canvas_patch). Omit for a single plain copy.")
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = String(args.element_id);
				const copies = args.copies;
				if (copies && copies.length === 0) return errorResult("copies must be a non-empty array of entries; omit it for one plain copy");
				const data = await host.duplicateElement({
					elementId,
					...typeof args.before_id === "string" ? { beforeId: args.before_id } : {},
					...typeof args.after_id === "string" ? { afterId: args.after_id } : {},
					...typeof args.parent_id === "string" ? { parentId: args.parent_id } : {},
					...typeof args.index === "number" ? { index: args.index } : {},
					...copies ? { copies } : {}
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				const count = data.elementIds.length;
				const where = data.parentId ? `inside ${data.parentId} from index ${data.index}` : count === 1 ? "as a new top-level frame" : "as new top-level frames";
				const errorText = data.errors.length > 0 ? `\nErrors:\n${data.errors.map((error) => `- ${error}`).join("\n")}` : "";
				return commandResult("duplicateElement", data, `Duplicated ${elementId} ${count === 1 ? "once" : `${count} times`} ${where}. New elements:\n${data.outline}${errorText}`);
			}
		},
		{
			name: "canvas_delete",
			config: {
				description: "Delete an element from the canvas. Refused if the element changed since you last read it: canvas_read it again and retry.",
				inputSchema: { element_id: require_dist$2.string() }
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = String(args.element_id);
				const expectedHash = readHashFor(session, elementId);
				if (!expectedHash) return errorResult(notReadMessage(elementId));
				const data = await host.deleteElement({
					elementId,
					expectedHash
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				return commandResult("deleteElement", data, `Deleted element ${elementId}`);
			}
		},
		{
			name: "canvas_rename",
			config: {
				description: "Set the display name of an element, shown as its row in the Layers panel. Markup is untouched, so no screenshot is needed. Pass an empty name to fall back to the tag or component name.",
				inputSchema: {
					element_id: require_dist$2.string().describe("Element ID to rename"),
					name: require_dist$2.string().describe("New display name. Empty clears the custom name.")
				}
			},
			async execute(args, extra) {
				const { session, host } = getToolContext();
				const elementId = String(args.element_id);
				const name = String(args.name).trim();
				const data = await host.renameElement({
					elementId,
					name
				}, signalFromExtra(extra));
				session.recordCanvasWrite(data);
				return commandResult("renameElement", data, name ? `Renamed ${elementId} to "${name}"` : `Cleared the custom name of ${elementId}`);
			}
		},
		{
			name: "canvas_grep",
			config: {
				description: "Search canvas element JSX for a regex pattern. Returns matching element ids with short snippets. Use after a screenshot to find anchors without reading a huge tree.",
				inputSchema: {
					pattern: require_dist$2.string(),
					root_id: require_dist$2.string().optional(),
					canvas_id: require_dist$2.string().optional(),
					case_insensitive: require_dist$2.boolean().optional()
				}
			},
			async execute(args, extra) {
				const data = await getToolContext().host.grepCanvas({
					pattern: String(args.pattern),
					...typeof args.root_id === "string" ? { rootId: args.root_id } : {},
					...typeof args.canvas_id === "string" ? { canvasId: args.canvas_id } : {},
					...args.case_insensitive === true ? { caseInsensitive: true } : {}
				}, signalFromExtra(extra));
				return commandResult("grepCanvas", data, data.text);
			}
		},
		{
			name: "canvas_query",
			config: {
				description: "Find canvas elements by simple tag/component selector (descendant combinator). Examples: \"table\", \"tbody tr\", \"Button\". Returns matching element ids.",
				inputSchema: {
					selector: require_dist$2.string(),
					root_id: require_dist$2.string().optional(),
					canvas_id: require_dist$2.string().optional()
				}
			},
			async execute(args, extra) {
				const data = await getToolContext().host.queryCanvas({
					selector: String(args.selector),
					...typeof args.root_id === "string" ? { rootId: args.root_id } : {},
					...typeof args.canvas_id === "string" ? { canvasId: args.canvas_id } : {}
				}, signalFromExtra(extra));
				return commandResult("queryCanvas", data, data.text);
			}
		},
		{
			name: "search_icons",
			config: {
				description: "Search the project icon library for icons matching a query. Returns icon names. Pass every icon you need as `queries` in one call.",
				inputSchema: {
					query: require_dist$2.string().optional().describe("Search query (e.g. \"calendar\", \"email\", \"settings\")"),
					queries: require_dist$2.array(require_dist$2.string()).optional().describe("Several searches in one call, e.g. [\"calendar\", \"mail\", \"settings\"]")
				}
			},
			async execute(args, extra) {
				const queries = [...typeof args.query === "string" && args.query ? [args.query] : [], ...Array.isArray(args.queries) ? args.queries.filter((query) => typeof query === "string" && !!query) : []];
				if (queries.length === 0) return errorResult("query or queries is required");
				const { host } = getToolContext();
				const signal = signalFromExtra(extra);
				const describe = (query, icons) => icons.length > 0 ? icons.join(", ") : `No icons matching "${query}"`;
				if (queries.length === 1) {
					const data = await host.searchIcons({ query: queries[0] }, signal);
					return commandResult("searchIcons", data, describe(queries[0], data.icons));
				}
				const results = await Promise.allSettled(queries.map((query) => host.searchIcons({ query }, signal)));
				const lines = results.map((result, i) => `${queries[i]}: ${result.status === "fulfilled" ? describe(queries[i], result.value.icons) : result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
				if (results.every((result) => result.status === "rejected")) return errorResult(lines.join("\n"));
				return commandResult("searchIcons", { icons: results.flatMap((result) => result.status === "fulfilled" ? result.value.icons : []) }, lines.join("\n"));
			}
		},
		defineTool({
			name: "take_screenshot",
			config: {
				description: "Capture a screenshot of a canvas element. Returns the image as base64 PNG. The screenshot is also displayed to the user in chat. Images in the element that failed to load are listed by id and src, so no extra screenshot is needed to find them.",
				inputSchema: { element_id: require_dist$2.string().describe("Element to capture") }
			},
			async execute(args) {
				const data = await getToolContext().host.takeScreenshot(args);
				return commandResult("takeScreenshot", data, data.text || "Screenshot captured");
			}
		}),
		{
			name: "canvas_create_import_scaffold",
			config: {
				description: "Create the design-system import reference page in one call: a root holding a design-system column (header + colour, typography, spacing, icon and component sections, in that order) beside an empty page-recreation column. Returns every element id as JSON. Use this instead of hand-building the layout with canvas_add — it fixes the column widths and section order so imports stay comparable.",
				inputSchema: {
					title: require_dist$2.string().describe("Source project name, used as the page heading"),
					tagline: require_dist$2.string().optional().describe("Optional one-line description of the design system")
				}
			},
			async execute(args) {
				const title = typeof args.title === "string" && args.title.trim() ? args.title.trim() : null;
				if (!title) return errorResult("title is required (the source project name)");
				const tagline = typeof args.tagline === "string" ? args.tagline.trim() : "";
				try {
					const rootId = await addScaffoldElement("<div className=\"flex gap-16 p-12 bg-background text-foreground\"></div>", void 0);
					const designColumnId = await addScaffoldElement("<div data-section=\"design-system\" className=\"flex flex-col gap-12 w-[1200px] min-h-[3200px]\"></div>", rootId);
					const pageColumnId = await addScaffoldElement("<div data-section=\"page-recreation\" className=\"flex flex-col gap-8 w-[1400px] min-h-[3200px]\"></div>", rootId);
					const headerJsx = tagline ? `<header className="flex flex-col gap-2"><h1 className="text-4xl font-semibold">${escapeJsxText$1(title)}</h1><p className="text-base opacity-70">${escapeJsxText$1(tagline)}</p></header>` : `<header className="flex flex-col gap-2"><h1 className="text-4xl font-semibold">${escapeJsxText$1(title)}</h1></header>`;
					await addScaffoldElement(headerJsx, designColumnId);
					const sections = {};
					for (const section of IMPORT_SCAFFOLD_SECTIONS$1) sections[section.key] = await addScaffoldElement(`<section data-section="${section.key}" className="flex flex-col gap-4"><h2 className="text-2xl font-semibold">${escapeJsxText$1(section.heading)}</h2></section>`, designColumnId);
					const fillOrder = IMPORT_SCAFFOLD_SECTIONS$1.map((section) => `  ${section.key} (${sections[section.key]}) — ${section.note}`).join("\n");
					return textResult([
						"Import scaffold created. Add into these ids with canvas_add(parent_id);",
						"do not add another root element and do not position sections with margins.",
						"",
						JSON.stringify({
							root_id: rootId,
							design_system_column_id: designColumnId,
							page_column_id: pageColumnId,
							sections
						}, null, 2),
						"",
						"Fill the design-system column in this order, one canvas_add per section:",
						fillOrder,
						"",
						`Then recreate one real source page inside ${pageColumnId}.`
					].join("\n"));
				} catch (err) {
					return errorResult(`Failed to create import scaffold: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
		}
	];
}

export { createCanvasTools };
