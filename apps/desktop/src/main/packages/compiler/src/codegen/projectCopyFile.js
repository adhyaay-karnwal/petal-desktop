// Reconstructed from index.js — original module: packages/compiler/src/codegen/projectCopyFile.ts

/**
* Args + safety checks for project_copy_file. The Electron handler reads the
* local bytes and writes them through the existing project file API so the
* model never has to re-type source.
*/
var MAX_TEXT_COPY_BYTES = 15e5;
var BINARY_COPY_EXTS = /* @__PURE__ */ new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"avif",
	"ico",
	"woff",
	"woff2",
	"ttf",
	"otf",
	"mp4",
	"webm",
	"pdf",
	"zip",
	"gz",
	"wasm"
]);
function isBinaryCopyExt(path) {
	const ext = path.split(".").pop()?.toLowerCase() ?? "";
	return BINARY_COPY_EXTS.has(ext);
}
function looksLikeBinary(bytes) {
	const end = Math.min(bytes.length, 8192);
	for (let i = 0; i < end; i++) if (bytes[i] === 0) return true;
	return false;
}
function inspectLocalCopyBuffer(projectPath, bytes) {
	if (isBinaryCopyExt(projectPath)) return {
		ok: false,
		error: `${projectPath} is a binary asset. Use project_copy_asset instead.`
	};
	if (bytes.length > 15e5) return {
		ok: false,
		error: `${projectPath} is ${bytes.length} bytes (max ${MAX_TEXT_COPY_BYTES}). Split the file or copy it some other way.`
	};
	if (looksLikeBinary(bytes)) return {
		ok: false,
		error: `${projectPath} looks like a binary file. Use project_copy_asset for images, fonts, and video.`
	};
	return {
		ok: true,
		content: new TextDecoder("utf-8").decode(bytes)
	};
}
function isSafeProjectPath(path) {
	if (!path || path.startsWith("/") || path.includes("\\") || path.includes("://")) return false;
	return path.split("/").every((part) => part.length > 0 && part !== "." && part !== "..");
}
function normalizeProjectCopyFileArgs(args) {
	const raw = Array.isArray(args.files) ? args.files : args.local_path !== void 0 || args.project_path !== void 0 ? [{
		local_path: args.local_path,
		project_path: args.project_path
	}] : [];
	if (raw.length === 0) return {
		ok: false,
		error: "Pass local_path + project_path, or files[{ local_path, project_path }]."
	};
	if (raw.length > 50) return {
		ok: false,
		error: `Too many files (${raw.length}). Max 50 per call.`
	};
	const files = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of raw) {
		if (!entry || typeof entry !== "object") return {
			ok: false,
			error: "each files entry needs local_path and project_path"
		};
		const localPath = entry.local_path;
		const projectPath = entry.project_path;
		if (typeof localPath !== "string" || !localPath.trim()) return {
			ok: false,
			error: "each copy needs a non-empty local_path"
		};
		if (typeof projectPath !== "string" || !isSafeProjectPath(projectPath)) return {
			ok: false,
			error: `Invalid project_path "${String(projectPath)}". Use a relative path like components/Button.tsx.`
		};
		if (isBinaryCopyExt(localPath) || isBinaryCopyExt(projectPath)) return {
			ok: false,
			error: `${projectPath} is a binary asset. Use project_copy_asset instead.`
		};
		if (seen.has(projectPath)) return {
			ok: false,
			error: `Duplicate project_path: ${projectPath}`
		};
		seen.add(projectPath);
		files.push({
			local_path: localPath,
			project_path: projectPath
		});
	}
	return {
		ok: true,
		files
	};
}
/**
* Mirror of normalizeProjectCopyFileArgs for the project → local direction, so
* writing a project file to disk costs one tool call instead of the model
* re-typing the whole file into local_write.
*/
function normalizeLocalCopyFileArgs(args) {
	const raw = Array.isArray(args.files) ? args.files : args.project_path !== void 0 || args.local_path !== void 0 ? [{
		project_path: args.project_path,
		local_path: args.local_path
	}] : [];
	if (raw.length === 0) return {
		ok: false,
		error: "Pass project_path + local_path, or files[{ project_path, local_path }]."
	};
	if (raw.length > 50) return {
		ok: false,
		error: `Too many files (${raw.length}). Max 50 per call.`
	};
	const files = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of raw) {
		if (!entry || typeof entry !== "object") return {
			ok: false,
			error: "each files entry needs project_path and local_path"
		};
		const projectPath = entry.project_path;
		const localPath = entry.local_path;
		if (typeof projectPath !== "string" || !isSafeProjectPath(projectPath)) return {
			ok: false,
			error: `Invalid project_path "${String(projectPath)}". Use a relative path like components/Button.tsx.`
		};
		if (typeof localPath !== "string" || !localPath.trim()) return {
			ok: false,
			error: "each copy needs a non-empty local_path"
		};
		if (isBinaryCopyExt(projectPath) || isBinaryCopyExt(localPath)) return {
			ok: false,
			error: `${projectPath} is a binary asset. local_copy_file only handles text files.`
		};
		if (seen.has(localPath)) return {
			ok: false,
			error: `Duplicate local_path: ${localPath}`
		};
		seen.add(localPath);
		files.push({
			project_path: projectPath,
			local_path: localPath
		});
	}
	return {
		ok: true,
		files
	};
}

export { inspectLocalCopyBuffer, normalizeLocalCopyFileArgs, normalizeProjectCopyFileArgs };
