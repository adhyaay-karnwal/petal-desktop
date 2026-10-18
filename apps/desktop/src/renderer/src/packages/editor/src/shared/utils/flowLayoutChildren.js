// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/utils/flowLayoutChildren.ts
import { getById, getChildren$2 } from "../../../../compiler/src/store/read.js";
import { applyOperationsToStore, createSetStylesOperation } from "./operations.js";
import { isFlowLayoutDisplay, positionStylesForPlacement } from "../../canvas/utils/absolutePositioning.js";

/**
* When a frame's display changes to flex/grid, move its direct absolute
* children back into flow. Other position modes are intentional and remain
* untouched. Returned operations are appended to the initiating history batch.
*/
function normalizeFlowLayoutChildrenOps(storeAfter, operations) {
	const extra = [];
	let cursor = storeAfter;
	for (const operation of operations) {
		if (operation.type !== "set_styles") continue;
		const oldDisplay = operation.oldStyles?.display;
		const newDisplay = operation.newStyles.display;
		if (oldDisplay === newDisplay || !isFlowLayoutDisplay(String(newDisplay ?? ""))) continue;
		for (const childId of getChildren$2(cursor, operation.elementId)) {
			const child = getById(cursor, childId);
			if (child?.styles?.position !== "absolute") continue;
			const nextStyles = positionStylesForPlacement(child.styles, "flow");
			const styleOperation = createSetStylesOperation(cursor, childId, nextStyles);
			if (!styleOperation) continue;
			extra.push(styleOperation);
			cursor = applyOperationsToStore(cursor, [styleOperation]);
		}
	}
	return extra;
}

export { normalizeFlowLayoutChildrenOps };
