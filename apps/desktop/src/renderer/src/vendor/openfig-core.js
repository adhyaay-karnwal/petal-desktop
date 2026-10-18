// Reconstructed from index-C74mRL57.js — original module: vendor/openfig-core

function nodeId(node) {
	if (!node?.guid) return null;
	return `${node.guid.sessionID}:${node.guid.localID}`;
}
var IDENTITY_TRANSFORM = {
	m00: 1,
	m01: 0,
	m02: 0,
	m10: 0,
	m11: 1,
	m12: 0
};
function cloneTransform(transform) {
	if (!transform) return { ...IDENTITY_TRANSFORM };
	return {
		m00: transform.m00,
		m01: transform.m01,
		m02: transform.m02,
		m10: transform.m10,
		m11: transform.m11,
		m12: transform.m12
	};
}
function isRenderableGradientPaint(paint) {
	return !!paint && paint.visible !== false && (paint.type === "GRADIENT_LINEAR" || paint.type === "GRADIENT_RADIAL") && Array.isArray(paint.stops) && paint.stops.length > 0;
}
function extractRenderableGradientFill(paints) {
	const paint = paints?.find((entry) => isRenderableGradientPaint(entry));
	if (!paint) return null;
	return {
		type: paint.type === "GRADIENT_LINEAR" ? "linear" : "radial",
		opacity: paint.opacity ?? 1,
		transform: cloneTransform(paint.transform),
		stops: [...paint.stops].sort((a, b) => a.position - b.position).map((stop) => ({
			position: stop.position,
			color: { ...stop.color },
			colorVar: stop.colorVar
		}))
	};
}
function resolveGradientGeometry(fill, width, height) {
	if (width <= 0 || height <= 0) return null;
	const { m00, m01, m02, m10, m11, m12 } = fill.transform ?? IDENTITY_TRANSFORM;
	const det = m00 * m11 - m10 * m01;
	if (Math.abs(det) < 1e-12) return null;
	const ia = m11 / det;
	const ic = -m01 / det;
	const ie = (m01 * m12 - m11 * m02) / det;
	const ib = -m10 / det;
	const iid = m00 / det;
	const iif = (m10 * m02 - m00 * m12) / det;
	const point = (gx, gy) => ({
		x: (ia * gx + ic * gy + ie) * width,
		y: (ib * gx + iid * gy + iif) * height
	});
	if (fill.type === "linear") return {
		type: "linear",
		start: point(0, .5),
		end: point(1, .5)
	};
	const center = point(.5, .5);
	const xAxisPoint = point(1, .5);
	const yAxisPoint = point(.5, 1);
	return {
		type: "radial",
		center,
		radiusX: Math.hypot(xAxisPoint.x - center.x, xAxisPoint.y - center.y),
		radiusY: Math.hypot(yAxisPoint.x - center.x, yAxisPoint.y - center.y),
		angle: Math.atan2(xAxisPoint.y - center.y, xAxisPoint.x - center.x)
	};
}
var CMD_CLOSE = 0;
var CMD_MOVE_TO = 1;
var CMD_LINE_TO = 2;
var CMD_CUBIC_TO = 4;
function quadraticToCubic(x0, y0, qx, qy, x, y) {
	return {
		type: "C",
		c1x: x0 + 2 / 3 * (qx - x0),
		c1y: y0 + 2 / 3 * (qy - y0),
		c2x: x + 2 / 3 * (qx - x),
		c2y: y + 2 / 3 * (qy - y),
		x,
		y
	};
}
function roundPathNumber(n, decimals = 2) {
	const factor = 10 ** decimals;
	return Math.round(n * factor) / factor;
}
function getBlobBytes(doc, blobIndex) {
	if (blobIndex == null || blobIndex < 0) return null;
	const blob = doc.message?.blobs?.[blobIndex];
	if (!blob) return null;
	if (blob instanceof Uint8Array) return blob;
	if (blob.bytes instanceof Uint8Array) return blob.bytes;
	if (Array.isArray(blob.bytes)) return Uint8Array.from(blob.bytes);
	if (blob.bytes && typeof blob.bytes === "object") {
		const values = Object.values(blob.bytes);
		if (values.every((value) => typeof value === "number")) return Uint8Array.from(values);
	}
	return null;
}
function geometryBlobToSVGPath(blob) {
	if (!blob.length) return "";
	const view = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
	let offset = 0;
	const parts = [];
	const canRead = (byteLength) => offset + byteLength <= blob.length;
	while (offset < blob.length) switch (blob[offset++]) {
		case CMD_CLOSE:
			parts.push("Z");
			break;
		case CMD_MOVE_TO: {
			if (!canRead(8)) return parts.join("");
			const x = roundPathNumber(view.getFloat32(offset, true));
			const y = roundPathNumber(view.getFloat32(offset + 4, true));
			offset += 8;
			parts.push(`M${x} ${y}`);
			break;
		}
		case CMD_LINE_TO: {
			if (!canRead(8)) return parts.join("");
			const x = roundPathNumber(view.getFloat32(offset, true));
			const y = roundPathNumber(view.getFloat32(offset + 4, true));
			offset += 8;
			parts.push(`L${x} ${y}`);
			break;
		}
		case CMD_CUBIC_TO: {
			if (!canRead(24)) return parts.join("");
			const x1 = roundPathNumber(view.getFloat32(offset, true));
			const y1 = roundPathNumber(view.getFloat32(offset + 4, true));
			const x2 = roundPathNumber(view.getFloat32(offset + 8, true));
			const y2 = roundPathNumber(view.getFloat32(offset + 12, true));
			const x = roundPathNumber(view.getFloat32(offset + 16, true));
			const y = roundPathNumber(view.getFloat32(offset + 20, true));
			offset += 24;
			parts.push(`C${x1} ${y1} ${x2} ${y2} ${x} ${y}`);
			break;
		}
		default: return parts.join("");
	}
	return parts.join("");
}
function parseSVGPathData(svgPath) {
	const tokens = [];
	const re = /([MmLlCcSsQqTtHhVvZz])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
	let match;
	while ((match = re.exec(svgPath)) !== null) if (match[1]) tokens.push(match[1]);
	else tokens.push(Number.parseFloat(match[2]));
	const commands = [];
	let i = 0;
	let cx = 0;
	let cy = 0;
	let startX = 0;
	let startY = 0;
	let prevC2x = 0;
	let prevC2y = 0;
	let prevQuadraticX = 0;
	let prevQuadraticY = 0;
	let cmd = "";
	const num = () => {
		const value = tokens[i++];
		if (typeof value !== "number" || Number.isNaN(value)) throw new Error(`Invalid SVG path data near token index ${i - 1}`);
		return value;
	};
	while (i < tokens.length) {
		if (typeof tokens[i] === "string") cmd = tokens[i++];
		switch (cmd) {
			case "M":
				cx = num();
				cy = num();
				startX = cx;
				startY = cy;
				commands.push({
					type: "M",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				cmd = "L";
				break;
			case "m":
				cx += num();
				cy += num();
				startX = cx;
				startY = cy;
				commands.push({
					type: "M",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				cmd = "l";
				break;
			case "L":
				cx = num();
				cy = num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "l":
				cx += num();
				cy += num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "H":
				cx = num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "h":
				cx += num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "V":
				cy = num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "v":
				cy += num();
				commands.push({
					type: "L",
					x: cx,
					y: cy
				});
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "C": {
				const c1x = num();
				const c1y = num();
				const c2x = num();
				const c2y = num();
				cx = num();
				cy = num();
				prevC2x = c2x;
				prevC2y = c2y;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				commands.push({
					type: "C",
					c1x,
					c1y,
					c2x,
					c2y,
					x: cx,
					y: cy
				});
				break;
			}
			case "c": {
				const c1x = cx + num();
				const c1y = cy + num();
				const c2x = cx + num();
				const c2y = cy + num();
				cx += num();
				cy += num();
				prevC2x = c2x;
				prevC2y = c2y;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				commands.push({
					type: "C",
					c1x,
					c1y,
					c2x,
					c2y,
					x: cx,
					y: cy
				});
				break;
			}
			case "S": {
				const c1x = 2 * cx - prevC2x;
				const c1y = 2 * cy - prevC2y;
				const c2x = num();
				const c2y = num();
				cx = num();
				cy = num();
				prevC2x = c2x;
				prevC2y = c2y;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				commands.push({
					type: "C",
					c1x,
					c1y,
					c2x,
					c2y,
					x: cx,
					y: cy
				});
				break;
			}
			case "s": {
				const c1x = 2 * cx - prevC2x;
				const c1y = 2 * cy - prevC2y;
				const c2x = cx + num();
				const c2y = cy + num();
				cx += num();
				cy += num();
				prevC2x = c2x;
				prevC2y = c2y;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				commands.push({
					type: "C",
					c1x,
					c1y,
					c2x,
					c2y,
					x: cx,
					y: cy
				});
				break;
			}
			case "Q": {
				const qx = num();
				const qy = num();
				const x = num();
				const y = num();
				const cubic = quadraticToCubic(cx, cy, qx, qy, x, y);
				commands.push(cubic);
				prevQuadraticX = qx;
				prevQuadraticY = qy;
				prevC2x = cubic.c2x;
				prevC2y = cubic.c2y;
				cx = x;
				cy = y;
				break;
			}
			case "q": {
				const qx = cx + num();
				const qy = cy + num();
				const x = cx + num();
				const y = cy + num();
				const cubic = quadraticToCubic(cx, cy, qx, qy, x, y);
				commands.push(cubic);
				prevQuadraticX = qx;
				prevQuadraticY = qy;
				prevC2x = cubic.c2x;
				prevC2y = cubic.c2y;
				cx = x;
				cy = y;
				break;
			}
			case "T": {
				const qx = 2 * cx - prevQuadraticX;
				const qy = 2 * cy - prevQuadraticY;
				const x = num();
				const y = num();
				const cubic = quadraticToCubic(cx, cy, qx, qy, x, y);
				commands.push(cubic);
				prevQuadraticX = qx;
				prevQuadraticY = qy;
				prevC2x = cubic.c2x;
				prevC2y = cubic.c2y;
				cx = x;
				cy = y;
				break;
			}
			case "t": {
				const qx = 2 * cx - prevQuadraticX;
				const qy = 2 * cy - prevQuadraticY;
				const x = cx + num();
				const y = cy + num();
				const cubic = quadraticToCubic(cx, cy, qx, qy, x, y);
				commands.push(cubic);
				prevQuadraticX = qx;
				prevQuadraticY = qy;
				prevC2x = cubic.c2x;
				prevC2y = cubic.c2y;
				cx = x;
				cy = y;
				break;
			}
			case "Z":
			case "z":
				commands.push({ type: "Z" });
				cx = startX;
				cy = startY;
				prevC2x = cx;
				prevC2y = cy;
				prevQuadraticX = cx;
				prevQuadraticY = cy;
				break;
			case "":
				i++;
				break;
			default: throw new Error(`Unsupported SVG path command: ${cmd}`);
		}
	}
	return commands;
}
function getStyleOverrideTable(node) {
	const table = node.vectorData?.styleOverrideTable;
	return Array.isArray(table) ? table : [];
}
function resolveFillPaints(node, styleID) {
	if (!styleID) return node.fillPaints;
	const override = getStyleOverrideTable(node).find((entry) => entry?.styleID === styleID);
	if (!override || !("fillPaints" in override)) return node.fillPaints;
	return override.fillPaints;
}
function resolveGeometry(doc, node, geometry, kind) {
	if (!Array.isArray(geometry) || geometry.length === 0) return [];
	return geometry.map((entry) => {
		if (typeof entry?.commandsBlob !== "number") return null;
		const bytes = getBlobBytes(doc, entry.commandsBlob);
		if (!bytes) return null;
		const svgPath = geometryBlobToSVGPath(bytes);
		if (!svgPath) return null;
		return {
			blobIndex: entry.commandsBlob,
			commandsBlob: bytes,
			svgPath,
			windingRule: entry.windingRule,
			styleID: entry.styleID || 0,
			paints: kind === "fill" ? resolveFillPaints(node, entry.styleID || 0) : node.strokePaints
		};
	}).filter((entry) => entry !== null);
}
function resolveVectorNodePaths(doc, node) {
	return {
		fill: resolveGeometry(doc, node, node.fillGeometry, "fill"),
		stroke: resolveGeometry(doc, node, node.strokeGeometry, "stroke")
	};
}
function serializeSvgPathData(commands) {
	return commands.map((command) => {
		switch (command.type) {
			case "M": return `M${command.x} ${command.y}`;
			case "L": return `L${command.x} ${command.y}`;
			case "C": return `C${command.c1x} ${command.c1y} ${command.c2x} ${command.c2y} ${command.x} ${command.y}`;
			case "Z": return "Z";
		}
	}).join(" ");
}
function transformSvgPathData(svgPath, { scaleX = 1, scaleY = 1, translateX = 0, translateY = 0 }) {
	return serializeSvgPathData(parseSVGPathData(svgPath).map((command) => {
		switch (command.type) {
			case "M":
			case "L": return {
				...command,
				x: command.x * scaleX + translateX,
				y: command.y * scaleY + translateY
			};
			case "C": return {
				...command,
				c1x: command.c1x * scaleX + translateX,
				c1y: command.c1y * scaleY + translateY,
				c2x: command.c2x * scaleX + translateX,
				c2y: command.c2y * scaleY + translateY,
				x: command.x * scaleX + translateX,
				y: command.y * scaleY + translateY
			};
			case "Z": return command;
		}
	}));
}

export { extractRenderableGradientFill, getBlobBytes, nodeId, resolveGradientGeometry, resolveVectorNodePaths, transformSvgPathData };
