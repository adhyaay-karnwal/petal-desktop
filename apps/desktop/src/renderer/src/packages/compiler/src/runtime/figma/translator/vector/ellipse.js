// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/ellipse.ts

var FULL_TURN = Math.PI * 2;
var ANGLE_TOLERANCE = 1e-4;
function isFullTurn(sweep) {
	return Math.abs(sweep - FULL_TURN) < ANGLE_TOLERANCE;
}
function normalizedSweep(startingAngle, endingAngle) {
	let sweep = endingAngle - startingAngle;
	if (Math.abs(sweep) >= FULL_TURN - ANGLE_TOLERANCE) sweep = FULL_TURN;
	while (sweep <= 0) sweep += FULL_TURN;
	while (sweep > FULL_TURN) sweep -= FULL_TURN;
	return sweep;
}
function figmaEllipseArcPathD(width, height, fromAngle, toAngle, innerRadius) {
	const [startingAngle, endingAngle] = toAngle < fromAngle ? [toAngle, fromAngle] : [fromAngle, toAngle];
	const cx = width / 2;
	const cy = height / 2;
	const rx = Math.max(width / 2, 0);
	const ry = Math.max(height / 2, 0);
	if (rx === 0 || ry === 0) return "";
	const sweep = normalizedSweep(startingAngle, endingAngle);
	const fullCircle = isFullTurn(sweep);
	const large = sweep > Math.PI ? 1 : 0;
	const inner = Math.min(Math.max(innerRadius, 0), 1);
	const at = (angle, scale) => ({
		x: cx + rx * scale * Math.cos(angle),
		y: cy + ry * scale * Math.sin(angle)
	});
	const arc = (to, scale, largeArc, clockwise) => `A ${rx * scale} ${ry * scale} 0 ${largeArc} ${clockwise} ${to.x} ${to.y}`;
	if (inner <= 1e-6) {
		if (fullCircle) {
			const p0 = at(0, 1);
			const p1 = at(Math.PI, 1);
			return `M ${p0.x} ${p0.y} ${arc(p1, 1, 1, 1)} ${arc(p0, 1, 1, 1)} Z`;
		}
		const start = at(startingAngle, 1);
		return `M ${cx} ${cy} L ${start.x} ${start.y} ${arc(at(endingAngle, 1), 1, large, 1)} Z`;
	}
	if (fullCircle) {
		const outerStart = at(0, 1);
		const innerStart = at(0, inner);
		return [
			`M ${outerStart.x} ${outerStart.y}`,
			arc(at(Math.PI, 1), 1, 1, 1),
			arc(outerStart, 1, 1, 1),
			`M ${innerStart.x} ${innerStart.y}`,
			arc(at(Math.PI, inner), inner, 1, 0),
			arc(innerStart, inner, 1, 0),
			"Z"
		].join(" ");
	}
	const outerStart = at(startingAngle, 1);
	return [
		`M ${outerStart.x} ${outerStart.y}`,
		arc(at(endingAngle, 1), 1, large, 1),
		`L ${at(endingAngle, inner).x} ${at(endingAngle, inner).y}`,
		arc(at(startingAngle, inner), inner, large, 0),
		"Z"
	].join(" ");
}
function ellipseNodePathD(node) {
	const width = node.size?.x ?? 0;
	const height = node.size?.y ?? 0;
	if (width <= 0 || height <= 0) return "";
	const arc = node.arcData;
	return figmaEllipseArcPathD(width, height, arc?.startingAngle ?? 0, arc?.endingAngle ?? FULL_TURN, arc?.innerRadius ?? 0);
}
function isRing(node) {
	return (node.arcData?.innerRadius ?? 0) > 1e-6;
}

export { ellipseNodePathD, isRing };
