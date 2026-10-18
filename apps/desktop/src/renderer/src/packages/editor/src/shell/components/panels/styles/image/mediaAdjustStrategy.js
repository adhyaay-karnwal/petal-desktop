// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/mediaAdjustStrategy.ts
import { bakeAndUpload } from "../../../../../shared/imageAdjust/bake.js";
import { bakeVideoAndUpload } from "../../../../../shared/imageAdjust/bakeVideo.js";
import { ImagePreviewSession } from "./imagePreviewSession.js";
import { VideoPreviewSession } from "./videoPreviewSession.js";

var imageStrategy = (target) => ({
	createSession: (key, elementId, shownUrl, sourceUrl, callbacks) => new ImagePreviewSession(key, elementId, target, shownUrl, sourceUrl, callbacks),
	bake: (sourceUrl, adjust, { backend, resolveAsset, signal }) => bakeAndUpload(sourceUrl, adjust, backend, resolveAsset, signal)
});
var STRATEGIES = {
	img: imageStrategy("img"),
	background: imageStrategy("background"),
	video: {
		createSession: (key, elementId, _shownUrl, sourceUrl, callbacks) => new VideoPreviewSession(key, elementId, sourceUrl, callbacks),
		bake: (sourceUrl, adjust, { backend, signal, onProgress }) => bakeVideoAndUpload(sourceUrl, adjust, backend, signal, onProgress)
	}
};
var strategyFor = (target) => STRATEGIES[target];

export { strategyFor };
