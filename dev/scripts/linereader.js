class MemoryLine {
  constructor(line) {
    // Extracting fields from the line

    const [offset, permissions, buffer] = line.split(" ");
    console.log(Buffer.from(offset.split("-")[0], "hex").reverse());

    this.offset = Buffer.from(offset.split("-")[0], "hex").reverse();
    this.permissions = permissions;
    this.buffer = Buffer.from(buffer, "hex").reverse();
  }

  hexToFloat32Array() {
    // Convert the hexadecimal string to a Buffer
    const buffer = Buffer.from("hex").reverse();

    // Create a Float32Array view on the Buffer
    const float32Array = new Float32Array(buffer.buffer, buffer.byteOffset, 1);
    return float32Array;
  }

  hexToDwordArray() {
    // Convert the hexadecimal string to a Buffer
    const buffer = Buffer.from("hex").reverse();

    // Create a Uint32Array view on the Buffer
    const dwordArray = new Uint32Array(buffer.buffer, buffer.byteOffset, 1);
    return dwordArray;
  }
}

// Example usage:
const line = "7ffff7ff8000-7ffff7fff000 rw-p 12345678";
const parser = new MemoryLine(line);

console.log(`Offset: ${parser.offset}`);
console.log(`Permissions: ${parser.permissions}`);
console.log(`Buffer: ${parser.buffer.toString("hex")}`);
console.log(`DWORD: ${parser.bufferToDword()}`);
console.log(`Float: ${parser.bufferToFloat()}`);

module.exports = {
  MemoryLine,
};
