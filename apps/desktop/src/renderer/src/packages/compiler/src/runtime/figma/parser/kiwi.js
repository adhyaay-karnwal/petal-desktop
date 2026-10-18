// Reconstructed from index-C74mRL57.js — original module: packages/compiler/src/runtime/figma/parser/kiwi.ts

var FIG_KIWI_PRELUDE = "fig-kiwi";
var FigmaArchiveParser = class {
	constructor(buffer) {
		this.offset = 0;
		this.buffer = buffer;
		this.data = new DataView(buffer.buffer);
	}
	readUint32() {
		const n = this.data.getUint32(this.offset, true);
		this.offset += 4;
		return n;
	}
	read(bytes) {
		if (this.offset + bytes <= this.buffer.length) {
			const d = this.buffer.slice(this.offset, this.offset + bytes);
			this.offset += bytes;
			return d;
		}
		throw new Error(`read(${bytes}) is past end of data`);
	}
	readHeader() {
		const preludeData = this.read(8);
		const prelude = String.fromCharCode(...preludeData);
		if (prelude !== FIG_KIWI_PRELUDE) throw new Error(`Unexpected prelude: "${prelude}"`);
		return {
			prelude,
			version: this.readUint32()
		};
	}
	readData(size) {
		return this.read(size);
	}
	readAll() {
		const header = this.readHeader();
		const files = [];
		while (this.offset + 4 < this.buffer.length) {
			const size = this.readUint32();
			const data = this.readData(size);
			files.push(data);
		}
		return {
			header,
			files
		};
	}
};
function parseFigmaArchive(data) {
	return new FigmaArchiveParser(data).readAll();
}

export { parseFigmaArchive };
