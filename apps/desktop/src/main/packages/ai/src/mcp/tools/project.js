// Reconstructed from index.js — original module: packages/ai/src/mcp/tools/project.ts
import { require_dist$2 } from "../../../../../__bundle__/_preamble.js";
import { defineTool, getToolContext, textResult } from "./utils.js";

/**
* Project MCP tools.
*
* File tools that operate on the Petal project the user has open
* (`project_*`), plus the project-level context tools (`get_theme`,
* `get_design_context`) and the local-codebase pre-pass for imports
* (`scan_project`). Every tool forwards its arguments to the host through
* the call context's `host`. `get_design_context` composes `getTheme`,
* `searchComponents`, and `listPages` so the canvas summary rides the same
* command transport as `canvas_list` instead of a separate host method.
*/
/** The project tool catalog; each tool drives the call context's `host`. */
function createProjectTools() {
	return [
		defineTool({
			name: "project_read",
			config: {
				description: "Read a file from the project with line numbers. Supports offset/limit for reading specific sections of large files. Always read before editing.",
				inputSchema: {
					file_path: require_dist$2.string().describe("Relative file path (e.g. components/Button.tsx)"),
					offset: require_dist$2.number().optional().describe("Start reading from this line number (1-based). Default: 1"),
					limit: require_dist$2.number().optional().describe("Number of lines to read. Default: 2000. Use smaller values for large files.")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectRead(args));
			}
		}),
		defineTool({
			name: "project_glob",
			config: {
				description: "Find files matching a glob pattern. Returns matching file paths.",
				inputSchema: { pattern: require_dist$2.string().describe("Glob pattern (e.g. **/*.tsx, components/*)") }
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectGlob(args));
			}
		}),
		defineTool({
			name: "project_grep",
			config: {
				description: "Search file contents for a regex pattern. Returns matching lines with file paths and line numbers. Supports context lines around matches.",
				inputSchema: {
					pattern: require_dist$2.string().describe("Regex pattern to search for"),
					glob: require_dist$2.string().optional().describe("Optional glob to filter which files to search"),
					case_insensitive: require_dist$2.boolean().optional().describe("Case insensitive search"),
					output_mode: require_dist$2._enum([
						"content",
						"files_with_matches",
						"count"
					]).optional().describe("Output mode: \"content\" shows matching lines (default), \"files_with_matches\" shows only file paths, \"count\" shows match counts per file"),
					context: require_dist$2.number().optional().describe("Number of lines to show before AND after each match"),
					context_before: require_dist$2.number().optional().describe("Number of lines to show before each match"),
					context_after: require_dist$2.number().optional().describe("Number of lines to show after each match"),
					head_limit: require_dist$2.number().optional().describe("Limit output to first N lines/entries. Default: 250")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectGrep(args));
			}
		}),
		defineTool({
			name: "project_write",
			config: {
				description: "Write content to a file. Creates the file if it does not exist, or overwrites if it does. Use this for normal file creation and updates, including ordinary two-file changes. project_write_batch is reserved for bulk import workflows that create many new files at once.",
				inputSchema: {
					file_path: require_dist$2.string().describe("Relative file path"),
					content: require_dist$2.string().describe("Full file content to write")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectWrite(args));
			}
		}),
		defineTool({
			name: "project_write_batch",
			config: {
				description: "Bulk import helper for creating many NEW files in one call. Use this for Petal import workflows/codebase imports, not ordinary small edits or two-file component copies. Up to 500 files per call. Files must NOT already exist (this tool only creates, does not overwrite — use project_write or project_edit for updates).",
				inputSchema: { files: require_dist$2.array(require_dist$2.object({
					file_path: require_dist$2.string().describe("Relative file path (e.g. components/Button.tsx)"),
					content: require_dist$2.string().describe("Full file content")
				})).describe("Array of files to create") }
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectWriteBatch(args));
			}
		}),
		defineTool({
			name: "project_edit",
			config: {
				description: "Edit a file by replacing a specific string. The old_string must be unique in the file (or use replace_all). ALWAYS read the file first before editing to get the exact text.",
				inputSchema: {
					file_path: require_dist$2.string().describe("Relative file path"),
					old_string: require_dist$2.string().describe("Exact text to find and replace (must match exactly including whitespace/indentation)"),
					new_string: require_dist$2.string().describe("Text to replace it with (must be different from old_string)"),
					replace_all: require_dist$2.boolean().optional().describe("Replace all occurrences instead of requiring uniqueness. Default: false")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectEdit(args));
			}
		}),
		defineTool({
			name: "project_delete",
			config: {
				description: "Delete a file from the project.",
				inputSchema: { file_path: require_dist$2.string().describe("Relative file path to delete") }
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectDelete(args));
			}
		}),
		defineTool({
			name: "project_copy_asset",
			config: {
				description: `Copy a binary asset (image, font, icon, video) from the user's local filesystem into the project's asset storage so JSX can reference it. Use this whenever recreated canvas JSX references a local asset — <img src="/hero.jpg">, <Image src="/logo.svg">, CSS background-image: url('/bg.webp'), etc. — BEFORE writing the canvas_add that references it. Without this call, the JSX renders with a broken image (the path 404s).

Typical flow: Read the source page in a user-added folder, identify each <img>/Image/url() reference, resolve the path relative to the project's public/ or assets/ folder, then call this tool with the absolute local path and the project-relative destination. Keep the project_path consistent with what the JSX expects (e.g. JSX src="/hero.jpg" → project_path "public/hero.jpg" so the same URL resolves).

Supported formats: png, jpg, jpeg, gif, webp, avif, svg, ico, woff, woff2, ttf, otf, mp4, webm. Max 10MB per asset — compress or scale large hero images before copying.`,
				inputSchema: {
					local_path: require_dist$2.string().describe("Absolute path to the source file on the user's filesystem (must be within allowed paths)"),
					project_path: require_dist$2.string().describe("Relative path in the project where the asset should land (e.g. \"public/hero.jpg\"). Match the path the JSX expects.")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectCopyAsset(args));
			}
		}),
		defineTool({
			name: "project_copy_file",
			config: {
				description: `Copy a local text file (or several) into the Petal project without sending the file through the model. Use this when the user wants a local .ts/.tsx/.css/.json file in the project as-is — "copy this component", "port these files", "bring LiquidMenu over". Do NOT Read a local file and project_write the same bytes; that is slow. After the copy, project_edit only the lines that must change (imports, mocks). Images/fonts/video still use project_copy_asset.

Pass local_path + project_path for one file, or files[] (up to 50) for a batch. local_path is absolute and must be in an allowed directory. project_path is project-relative (e.g. components/LiquidMenu.tsx). Overwrites if the destination already exists.`,
				inputSchema: {
					local_path: require_dist$2.string().optional().describe("Absolute path of the source text file on the user's machine"),
					project_path: require_dist$2.string().optional().describe("Relative destination in the Petal project, e.g. components/LiquidMenu.tsx"),
					files: require_dist$2.array(require_dist$2.object({
						local_path: require_dist$2.string().describe("Absolute source path"),
						project_path: require_dist$2.string().describe("Relative project destination")
					})).optional().describe("Batch of copies. Prefer this over many single calls when porting a small module graph.")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.projectCopyFile(args));
			}
		}),
		defineTool({
			name: "get_theme",
			config: {
				description: "Return the project theme summary extracted from globals.css (CSS variables for colors, radius, etc.). Call this when deriving the visual language — prefer theme Tailwind classes (bg-primary, text-muted-foreground) over hardcoded colors.",
				inputSchema: {}
			},
			async execute() {
				return textResult(await getToolContext().host.getTheme({}));
			}
		}),
		defineTool({
			name: "scan_project",
			config: {
				description: "Run a deterministic pre-pass on a local React codebase to extract a structured project map: stack (framework + Tailwind/styling system), tier routing (tailwind/translated), tokens (CSS vars + color scales), fonts, icon pack, candidate components ranked by import frequency, and provider stack. Returns compact JSON (top components per category truncated, totalCounts retained). Use this BEFORE importing components — one cheap call (~50-300ms even on huge monorepos) replaces minutes of grepping.",
				inputSchema: {
					root_path: require_dist$2.string().describe("Absolute path to the user's project root (the folder they want to import from)"),
					top_n: require_dist$2.number().optional().describe("Max components per category (primitives/composites/pages) to include. Default 25. Increase if you need to see more candidates.")
				}
			},
			async execute(args) {
				return textResult(await getToolContext().host.scanProject(args));
			}
		}),
		defineTool({
			name: "get_design_context",
			config: {
				description: "Gather the project theme, registered component catalog, and active canvas-page summary in one call. Use once at the start of a design task instead of separate get_theme, unfiltered search_components, and canvas_list calls.",
				inputSchema: {}
			},
			async execute() {
				const { host } = getToolContext();
				const asText = (error) => error instanceof Error ? error.message : String(error);
				const [theme, components, canvas] = await Promise.all([
					host.getTheme({}).catch(asText),
					host.searchComponents({}).catch(asText),
					host.listPages({}).then((data) => `${data.note}\n${JSON.stringify(data.pages, null, 2)}`, asText)
				]);
				return textResult([
					`THEME\n${theme}`,
					`COMPONENTS\n${components}`,
					`CANVAS\n${canvas}`
				].join("\n\n"));
			}
		})
	];
}

export { createProjectTools };
