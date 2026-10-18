// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/translator/vector/svgPath.ts
import { transformSvgPathData } from "../../../../../../../vendor/openfig-core.js";
import { applyMatrix, isIdentity, isNearly, matrixOf } from "../model/matrix.js";

var PATH_TOKENS = /[MmLlHhVvCcSsQqTtAaZz]|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g;
var COMMAND = /^[MmLlHhVvCcSsQqTtAaZz]$/;
var ARGUMENT_COUNT = {
	M: 2,
	L: 2,
	H: 1,
	V: 1,
	C: 6,
	S: 4,
	Q: 4,
	T: 2,
	A: 7,
	Z: 0
};
function formatNumber(value) {
	return value.toFixed(4).replace(/\.?0+$/, "");
}
function formatPoint(m, { x, y }) {
	const [tx, ty] = applyMatrix(m, x, y);
	return `${formatNumber(tx)} ${formatNumber(ty)}`;
}
function parseCommands(d) {
	const tokens = d.match(PATH_TOKENS);
	if (!tokens) return null;
	const commands = [];
	for (const token of tokens) if (COMMAND.test(token)) commands.push({
		command: token,
		args: []
	});
	else commands[commands.length - 1]?.args.push(parseFloat(token));
	return commands;
}
function reflect(control, about) {
	return {
		x: 2 * about.x - control.x,
		y: 2 * about.y - control.y
	};
}
function vectorAngle(ux, uy, vx, vy) {
	return Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
}
function arcToCubics(from, [rxIn, ryIn, rotationDeg, largeArc, sweep], to) {
	if (isNearly(from.x, to.x) && isNearly(from.y, to.y)) return [];
	let rx = Math.abs(rxIn);
	let ry = Math.abs(ryIn);
	if (rx === 0 || ry === 0) return [[
		from,
		to,
		to
	]];
	const phi = rotationDeg * Math.PI / 180;
	const cos = Math.cos(phi);
	const sin = Math.sin(phi);
	const dx = (from.x - to.x) / 2;
	const dy = (from.y - to.y) / 2;
	const x1 = cos * dx + sin * dy;
	const y1 = -sin * dx + cos * dy;
	const radiiScale = Math.sqrt(x1 * x1 / (rx * rx) + y1 * y1 / (ry * ry));
	if (radiiScale > 1) {
		rx *= radiiScale;
		ry *= radiiScale;
	}
	const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
	const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1;
	const coefficient = (!!largeArc === !!sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / denominator));
	const cxPrime = coefficient * rx * y1 / ry;
	const cyPrime = -coefficient * ry * x1 / rx;
	const cx = cos * cxPrime - sin * cyPrime + (from.x + to.x) / 2;
	const cy = sin * cxPrime + cos * cyPrime + (from.y + to.y) / 2;
	const startAngle = vectorAngle(1, 0, (x1 - cxPrime) / rx, (y1 - cyPrime) / ry);
	let sweepAngle = vectorAngle((x1 - cxPrime) / rx, (y1 - cyPrime) / ry, (-x1 - cxPrime) / rx, (-y1 - cyPrime) / ry);
	if (!sweep && sweepAngle > 0) sweepAngle -= Math.PI * 2;
	if (sweep && sweepAngle < 0) sweepAngle += Math.PI * 2;
	const at = (angle) => ({
		x: cx + rx * Math.cos(angle) * cos - ry * Math.sin(angle) * sin,
		y: cy + rx * Math.cos(angle) * sin + ry * Math.sin(angle) * cos
	});
	const tangent = (angle) => ({
		x: -rx * Math.sin(angle) * cos - ry * Math.cos(angle) * sin,
		y: -rx * Math.sin(angle) * sin + ry * Math.cos(angle) * cos
	});
	const count = Math.max(1, Math.ceil(Math.abs(sweepAngle) / (Math.PI / 2)));
	const step = sweepAngle / count;
	const handle = 4 / 3 * Math.tan(step / 4);
	return Array.from({ length: count }, (_, i) => {
		const a1 = startAngle + i * step;
		const a2 = a1 + step;
		const p1 = at(a1);
		const p2 = i === count - 1 ? to : at(a2);
		const t1 = tangent(a1);
		const t2 = tangent(a2);
		return [
			{
				x: p1.x + handle * t1.x,
				y: p1.y + handle * t1.y
			},
			{
				x: p2.x - handle * t2.x,
				y: p2.y - handle * t2.y
			},
			p2
		];
	});
}
function absoluteSegments(commands) {
	const segments = [];
	let current = {
		x: 0,
		y: 0
	};
	let subpathStart = current;
	let lastCubicControl = null;
	let lastQuadControl = null;
	for (const { command, args } of commands) {
		const upper = command.toUpperCase();
		const relative = command !== upper;
		const size = ARGUMENT_COUNT[upper];
		if (size === void 0) continue;
		if (upper === "Z") {
			segments.push({
				command: "Z",
				points: []
			});
			current = subpathStart;
			lastCubicControl = lastQuadControl = null;
			continue;
		}
		for (let i = 0; i + size <= args.length; i += size) {
			const a = args.slice(i, i + size);
			const pt = (x, y) => relative ? {
				x: current.x + x,
				y: current.y + y
			} : {
				x,
				y
			};
			let cubicControl = null;
			let quadControl = null;
			if (upper === "M" || upper === "L" || upper === "H" || upper === "V") {
				const end = upper === "H" ? {
					x: relative ? current.x + a[0] : a[0],
					y: current.y
				} : upper === "V" ? {
					x: current.x,
					y: relative ? current.y + a[0] : a[0]
				} : pt(a[0], a[1]);
				const isMove = upper === "M" && i === 0;
				segments.push({
					command: isMove ? "M" : "L",
					points: [end]
				});
				if (isMove) subpathStart = end;
				current = end;
			} else if (upper === "C" || upper === "S") {
				const c1 = upper === "C" ? pt(a[0], a[1]) : lastCubicControl ? reflect(lastCubicControl, current) : current;
				const offset = upper === "C" ? 2 : 0;
				const c2 = pt(a[offset], a[offset + 1]);
				const end = pt(a[offset + 2], a[offset + 3]);
				segments.push({
					command: "C",
					points: [
						c1,
						c2,
						end
					]
				});
				cubicControl = c2;
				current = end;
			} else if (upper === "Q" || upper === "T") {
				const control = upper === "Q" ? pt(a[0], a[1]) : lastQuadControl ? reflect(lastQuadControl, current) : current;
				const end = upper === "Q" ? pt(a[2], a[3]) : pt(a[0], a[1]);
				segments.push({
					command: "Q",
					points: [control, end]
				});
				quadControl = control;
				current = end;
			} else {
				const end = pt(a[5], a[6]);
				for (const points of arcToCubics(current, a, end)) segments.push({
					command: "C",
					points
				});
				current = end;
			}
			lastCubicControl = cubicControl;
			lastQuadControl = quadControl;
		}
	}
	return segments;
}
function formatSegment(m, segment) {
	if (segment.command === "Z") return "Z";
	return `${segment.command} ${segment.points.map((p) => formatPoint(m, p)).join(" ")}`;
}
function applyFigTransformToSvgPath(d, transform) {
	const m = matrixOf(transform);
	if (isIdentity(m)) return d;
	const commands = parseCommands(d);
	if (!commands) return d;
	return absoluteSegments(commands).map((segment) => formatSegment(m, segment)).join(" ");
}
function translateSvgPath(d, x, y) {
	if (x === 0 && y === 0) return d;
	return transformSvgPathData(d, {
		translateX: x,
		translateY: y
	});
}
function scaleSvgPath(d, scale) {
	if (!scale || isNearly(scale.x, 1) && isNearly(scale.y, 1)) return d;
	return transformSvgPathData(d, {
		scaleX: scale.x,
		scaleY: scale.y
	});
}

export { applyFigTransformToSvgPath, scaleSvgPath, translateSvgPath };
