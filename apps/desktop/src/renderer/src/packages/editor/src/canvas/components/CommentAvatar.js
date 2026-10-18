// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/components/CommentAvatar.tsx
import { import_jsx_runtime, import_react } from "../../../../../vendor/@tanstack/react-query.js";
import { import_compiler_runtime } from "../../../../cloud/src/hooks/useSession.js";
import { RippleLoader } from "../../../../ui/src/components/RippleLoader.js";
import { PetalLogo } from "../../assets/PetalLogo.js";

function CommentAvatar(t0) {
	const $ = (0, import_compiler_runtime.c)(7);
	const { author, working: t1 } = t0;
	const working = t1 === void 0 ? false : t1;
	const [failedImage, setFailedImage] = (0, import_react.useState)(null);
	const t2 = `ed-comment-avatar${working ? " ed-comment-avatar-working" : ""}`;
	let t3;
	if ($[0] !== author || $[1] !== failedImage || $[2] !== working) {
		t3 = working ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RippleLoader, {
			size: 24,
			grid: 11,
			variant: "default"
		}) : author.isAgent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PetalLogo, {
			width: 16,
			height: 16
		}) : author.image && author.image !== failedImage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: author.image,
			alt: "",
			draggable: false,
			onError: () => setFailedImage(author.image)
		}) : (author.name || "?").charAt(0).toUpperCase();
		$[0] = author;
		$[1] = failedImage;
		$[2] = working;
		$[3] = t3;
	} else t3 = $[3];
	let t4;
	if ($[4] !== t2 || $[5] !== t3) {
		t4 = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: t2,
			"aria-hidden": "true",
			children: t3
		});
		$[4] = t2;
		$[5] = t3;
		$[6] = t4;
	} else t4 = $[6];
	return t4;
}

export { CommentAvatar };
