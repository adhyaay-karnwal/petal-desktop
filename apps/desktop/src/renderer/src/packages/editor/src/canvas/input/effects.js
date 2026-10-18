// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/canvas/input/effects.ts

var NO_EFFECTS = {
	camera: () => ({
		scale: 1,
		positionX: 0,
		positionY: 0
	}),
	setCamera() {},
	grabCamera() {},
	releaseCamera() {},
	userCameraGesture() {},
	markWheelZoom() {},
	capturePointer() {},
	releasePointer() {},
	consume() {},
	beginHandle: () => false,
	moveHandle() {},
	handleModifiers() {},
	endHandle() {},
	beginGesture: () => false,
	moveGesture() {},
	gestureModifiers() {},
	endGesture() {},
	zoomToRegion: () => false,
	hover() {},
	click() {},
	placeComment() {},
	pickTool() {},
	pressLabel() {},
	contextMenu() {},
	doubleClick() {},
	takeKey() {},
	beginNudge: () => false,
	moveNudge() {},
	endNudge() {},
	clickSelectedOther: () => false,
	nudgeSpent: () => false,
	setNudgeSpent() {}
};

export { NO_EFFECTS };
