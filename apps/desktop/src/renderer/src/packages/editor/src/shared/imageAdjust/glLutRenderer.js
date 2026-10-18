// Reconstructed from index-C74mRL57.js — original module: packages/editor/src/shared/imageAdjust/glLutRenderer.ts

var VERTEX = `#version 300 es
in vec2 position;
out vec2 uv;
void main() {
  uv = vec2(position.x + 1.0, 1.0 - position.y) * 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;
var FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler3D;
uniform sampler2D frame;
uniform sampler3D lut;
uniform float size;
in vec2 uv;
out vec4 color;
void main() {
  vec4 source = texture(frame, uv);
  // Table index is ((r * n + g) * n + b), so b runs along the texture's x axis.
  vec3 coord = source.bgr * ((size - 1.0) / size) + 0.5 / size;
  color = vec4(texture(lut, coord).rgb, source.a);
}`;
function compile(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed");
	return shader;
}
var GlLutRenderer = class {
	constructor(canvas) {
		this.canvas = canvas;
		const gl = canvas.getContext("webgl2", {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true
		});
		if (!gl) throw new Error("WebGL2 is not available");
		this.gl = gl;
		const program = gl.createProgram();
		gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
		gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Link failed");
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			1,
			1
		]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(program, "position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		this.frameTexture = this.texture(gl.TEXTURE0, gl.TEXTURE_2D);
		this.lutTexture = this.texture(gl.TEXTURE1, gl.TEXTURE_3D);
		gl.uniform1i(gl.getUniformLocation(program, "frame"), 0);
		gl.uniform1i(gl.getUniformLocation(program, "lut"), 1);
		this.sizeUniform = gl.getUniformLocation(program, "size");
	}
	texture(unit, target) {
		const gl = this.gl;
		const texture = gl.createTexture();
		gl.activeTexture(unit);
		gl.bindTexture(target, texture);
		gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		if (target === gl.TEXTURE_3D) gl.texParameteri(target, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
		return texture;
	}
	/** Uploads a table from buildAdjustLut (an n^3 RGB grid). */
	setLut(lut) {
		const gl = this.gl;
		const size = Math.round(Math.cbrt(lut.length / 3));
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_3D, this.lutTexture);
		gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGB16F, size, size, size, 0, gl.RGB, gl.FLOAT, lut);
		gl.uniform1f(this.sizeUniform, size);
	}
	/** Draws `source` through the table into `rect` of the canvas (default: all of it). */
	draw(source, rect) {
		const gl = this.gl;
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.frameTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		const r = rect ?? {
			x: 0,
			y: 0,
			width: this.canvas.width,
			height: this.canvas.height
		};
		gl.viewport(r.x, this.canvas.height - r.y - r.height, r.width, r.height);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	dispose() {
		this.gl.getExtension("WEBGL_lose_context")?.loseContext();
	}
};

export { GlLutRenderer };
