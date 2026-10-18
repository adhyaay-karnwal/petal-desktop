// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/CommentBody.tsx
import { import_jsx_runtime } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";

function CommentBody(t0) {
	const $ = (0, import_compiler_runtime.c)(6);
	const { body, mentions: t1 } = t0;
	let t2;
	if ($[0] !== body || $[1] !== t1) {
		const mentions = t1 === void 0 ? [] : t1;
		const parts = [];
		let offset = 0;
		for (const mention of mentions ?? []) {
			if (mention.start < offset || body.slice(mention.start, mention.end) !== `@${mention.label}`) continue;
			parts.push(body.slice(offset, mention.start));
			parts.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ed-comment-mention",
				children: body.slice(mention.start, mention.end)
			}, `${mention.id}-${mention.start}`));
			offset = mention.end;
		}
		let t3;
		if ($[3] !== body || $[4] !== offset) {
			t3 = body.slice(offset);
			$[3] = body;
			$[4] = offset;
			$[5] = t3;
		} else t3 = $[5];
		parts.push(t3);
		t2 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: parts });
		$[0] = body;
		$[1] = t1;
		$[2] = t2;
	} else t2 = $[2];
	return t2;
}

export { CommentBody };
