// Reconstructed from index.js — original module: app/src/main/localPathAccess.ts
import { fs_promises, path } from "../../../__bundle__/_preamble.js";

/** True when `child` is `parent` or inside it. `relative` handles `\\`, drive letters and Windows case-insensitivity. */
function isPathInside(child, parent) {
	const rel = (0, path.relative)(parent, child);
	return rel === "" || rel !== ".." && !rel.startsWith(`..${path.sep}`) && !(0, path.isAbsolute)(rel);
}
/** Validate a lexical path before touching disk. Realpath checks below handle symlink escapes. */
function isPathLexicallyAllowed(filePath, allowed) {
	return allowed.some((dir) => isPathInside(filePath, dir));
}
/** Resolve an absolute glob pattern to (searchRoots, relativePattern). */
function resolveGlobScope(pattern, allowed) {
	if ((0, path.isAbsolute)(pattern)) for (const dir of allowed) {
		const resolvedDir = (0, path.resolve)(dir);
		if (isPathInside(pattern, resolvedDir)) return {
			roots: [resolvedDir],
			pattern: (0, path.relative)(resolvedDir, pattern).split(path.sep).join("/") || "**/*"
		};
	}
	return {
		roots: allowed,
		pattern
	};
}
async function getAllowedRealRoots(allowed) {
	const roots = [];
	for (const dir of allowed) try {
		roots.push(await (0, fs_promises.realpath)(dir));
	} catch {}
	return roots;
}
function isWithinRealRoots(realPath, roots) {
	return roots.some((root) => isPathInside(realPath, root));
}
/** Realpath of the path, or of the nearest existing ancestor. */
async function realpathNearestExisting(filePath) {
	let probe = (0, path.resolve)(filePath);
	for (;;) try {
		return await (0, fs_promises.realpath)(probe);
	} catch {
		const parent = (0, path.dirname)(probe);
		if (parent === probe) return null;
		probe = parent;
	}
}
/**
* Lexical check plus realpath of the path or its nearest existing ancestor.
* A symlink in the existing prefix cannot smuggle the target out of a shared folder.
* Missing intermediate directories are allowed so callers can mkdir -p.
*/
async function isPathOrAncestorAllowed(filePath, allowed) {
	if (!isPathLexicallyAllowed(filePath, allowed)) return false;
	const roots = await getAllowedRealRoots(allowed);
	const existing = await realpathNearestExisting(filePath);
	return existing !== null && isWithinRealRoots(existing, roots);
}
/** Validate an existing path after resolving symlinks. Missing paths are denied. */
async function isExistingDestinationAllowed(filePath, allowed) {
	if (!isPathLexicallyAllowed(filePath, allowed)) return false;
	try {
		const [target, roots] = await Promise.all([(0, fs_promises.realpath)(filePath), getAllowedRealRoots(allowed)]);
		return isWithinRealRoots(target, roots);
	} catch {
		return false;
	}
}
/** Files that run code on install or decide where packages come from. Compared lowercased. */
var SENSITIVE_FILE_NAMES = /* @__PURE__ */ new Set([
	"package.json",
	"package-lock.json",
	"npm-shrinkwrap.json",
	"pnpm-lock.yaml",
	"pnpm-workspace.yaml",
	"yarn.lock",
	"bun.lock",
	"bun.lockb",
	"makefile"
]);
/**
* True for a path, relative to its project folder, that can run code outside the
* app: any dot segment (`.git` hooks, `.github` CI, `.husky`, `.vscode` tasks,
* `.env`, `.envrc`, `.npmrc`) or a package manifest or lockfile.
*/
function isSensitiveRelativePath(rel) {
	const segments = rel.split(/[\\/]/).filter(Boolean);
	const name = segments.at(-1)?.toLowerCase();
	return segments.some((segment) => segment.startsWith(".")) || !!name && SENSITIVE_FILE_NAMES.has(name);
}
/**
* Resolve symlinks in the existing part of the path and keep the missing tail.
* A dangling link is followed to where it points, since writing through it
* creates its target.
*/
async function realpathKeepingTail(filePath) {
	let probe = (0, path.resolve)(filePath);
	const tail = [];
	for (let hops = 0; hops <= 40;) try {
		return (0, path.join)(await (0, fs_promises.realpath)(probe), ...tail);
	} catch {
		const link = await (0, fs_promises.readlink)(probe).catch(() => null);
		if (link !== null) {
			probe = (0, path.resolve)((0, path.dirname)(probe), link);
			hops++;
			continue;
		}
		const parent = (0, path.dirname)(probe);
		if (parent === probe) break;
		tail.unshift((0, path.basename)(probe));
		probe = parent;
	}
	return (0, path.resolve)(filePath);
}
/**
* Whether a write to `filePath` lands on a sensitive path. Judged after symlinks,
* so a link cannot hide `.git`, and relative to the outermost allowed folder that
* contains it, so a dot folder above the project (`~/.config/app`) doesn't count
* but a nested grant (`repo/.github` next to `repo`) can't excuse its contents.
* An allowed folder that is itself a dot folder (`.git`) makes every write in it
* sensitive. Outside every allowed folder the whole path is judged.
*/
async function isSensitiveWriteTarget(filePath, allowed) {
	const [target, roots] = await Promise.all([realpathKeepingTail(filePath), getAllowedRealRoots(allowed)]);
	const root = roots.filter((r) => isPathInside(target, r)).sort((a, b) => a.length - b.length)[0];
	if (!root) return isSensitiveRelativePath(target);
	return (0, path.basename)(root).startsWith(".") || isSensitiveRelativePath((0, path.relative)(root, target));
}

export { isExistingDestinationAllowed, isPathOrAncestorAllowed, isSensitiveWriteTarget, resolveGlobScope };
