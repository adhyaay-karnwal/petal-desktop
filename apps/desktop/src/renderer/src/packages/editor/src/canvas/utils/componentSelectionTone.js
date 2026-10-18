// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/utils/componentSelectionTone.ts
import { getById, getParentId } from "../../../../compiler/src/store/read.js";

/** Component contents keep their owner's purple, including editable slot children. */
function componentSelectionTone(store, id) {
	const element = getById(store, id);
	const ownComponent = element?.type === "component" || !!(element?.type === "html" && element.props?.["data-component"]);
	const isMissingComponent = ownComponent && (element?.type === "html" || !!element?._componentMissing);
	let isComponent = ownComponent;
	for (let parent = getParentId(store, id); !isComponent && parent && parent !== "ROOT"; parent = getParentId(store, parent)) isComponent = getById(store, parent)?.type === "component";
	return {
		isComponent,
		isMissingComponent
	};
}

export { componentSelectionTone };
