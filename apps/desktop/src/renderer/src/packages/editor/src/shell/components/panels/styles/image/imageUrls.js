// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shell/components/panels/styles/image/imageUrls.ts
import { IMAGE_ADJUST_PROP } from "../../../../../../../compiler/src/store/sanitize.js";
import { VIDEO_FILL_PROP, parseVideoFill, serializeVideoFill } from "../../../../../../../compiler/src/store/videoFill.js";
import { nextAdjustRecord, parseAdjustRecord } from "../../../../../shared/imageAdjust/adjustRecord.js";

/** Locating and swapping image URLs on an element, for the adjustment commit. */
var BACKGROUND_KEYS = ["backgroundImage", "background"];
var URL_PATTERN = /url\(\s*(["']?)(.*?)\1\s*\)/g;
function imageUrlsIn(styles, props) {
	const urls = [];
	for (const key of BACKGROUND_KEYS) {
		const value = styles[key];
		if (typeof value === "string") for (const match of value.matchAll(URL_PATTERN)) urls.push(match[2]);
	}
	if (typeof props.src === "string") urls.push(props.src);
	const video = parseVideoFill(props[VIDEO_FILL_PROP]);
	if (video) urls.push(video.src);
	return urls;
}
/** Updater that swaps `fromUrl` for `toUrl` (an <img>/<video> src, background layer or video fill) and records `entry`. */
function swapImageUrl(fromUrl, toUrl, entry) {
	return ({ styles, props }) => {
		const nextStyles = {};
		for (const key of BACKGROUND_KEYS) {
			const value = styles[key];
			if (typeof value === "string" && value.includes(fromUrl)) nextStyles[key] = value.split(fromUrl).join(toUrl);
		}
		const nextProps = {};
		if (props.src === fromUrl) nextProps.src = toUrl;
		const video = parseVideoFill(props[VIDEO_FILL_PROP]);
		if (video?.src === fromUrl) nextProps[VIDEO_FILL_PROP] = serializeVideoFill({
			...video,
			src: toUrl
		});
		if (!Object.keys(nextStyles).length && !Object.keys(nextProps).length) return null;
		nextProps[IMAGE_ADJUST_PROP] = nextAdjustRecord(parseAdjustRecord(props[IMAGE_ADJUST_PROP]), toUrl, entry, imageUrlsIn({
			...styles,
			...nextStyles
		}, {
			...props,
			...nextProps
		}));
		return {
			styles: Object.keys(nextStyles).length ? nextStyles : void 0,
			props: nextProps
		};
	};
}

export { swapImageUrl };
