// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/model/matrix.ts

var EPSILON = 1e-6;
function isNearly(value, target) {
	return Math.abs(value - target) < EPSILON;
}
function matrixOf(transform) {
	return {
		m00: transform?.m00 ?? 1,
		m01: transform?.m01 ?? 0,
		m02: transform?.m02 ?? 0,
		m10: transform?.m10 ?? 0,
		m11: transform?.m11 ?? 1,
		m12: transform?.m12 ?? 0
	};
}
function isAxisAligned(m) {
	return isNearly(m.m01, 0) && isNearly(m.m10, 0);
}
function hasIdentityLinearPart(m) {
	return isAxisAligned(m) && isNearly(m.m00, 1) && isNearly(m.m11, 1);
}
function isIdentity(m) {
	return hasIdentityLinearPart(m) && isNearly(m.m02, 0) && isNearly(m.m12, 0);
}
function isRotatedOrSkewed(m) {
	return !hasIdentityLinearPart(m) && !isAxisAligned(m);
}
function flipKindOf(m) {
	if (hasIdentityLinearPart(m) || !isAxisAligned(m)) return null;
	if (m.m00 < 0 && m.m11 > 0) return "horizontal";
	if (m.m11 < 0 && m.m00 > 0) return "vertical";
	if (m.m00 < 0 && m.m11 < 0) return "both";
	return null;
}
function applyMatrix(m, x, y) {
	return [m.m00 * x + m.m01 * y + m.m02, m.m10 * x + m.m11 * y + m.m12];
}
function linearBounds(m, width, height) {
	const linear = {
		...m,
		m02: 0,
		m12: 0
	};
	const corners = [
		applyMatrix(linear, 0, 0),
		applyMatrix(linear, width, 0),
		applyMatrix(linear, width, height),
		applyMatrix(linear, 0, height)
	];
	return {
		minX: Math.min(...corners.map(([x]) => x)),
		minY: Math.min(...corners.map(([, y]) => y)),
		maxX: Math.max(...corners.map(([x]) => x)),
		maxY: Math.max(...corners.map(([, y]) => y))
	};
}

export { applyMatrix, flipKindOf, hasIdentityLinearPart, isAxisAligned, isIdentity, isNearly, isRotatedOrSkewed, linearBounds, matrixOf };
