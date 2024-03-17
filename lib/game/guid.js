'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class GUID {

  // Creates a new GUID
  constructor(buffer) {

    // Holds raw byte representation
    this.raw = buffer;

    // Holds low-part
    this.low = buffer.readUnsignedInt();

    // Holds high-part
    this.high = buffer.readUnsignedInt();
  }

  // Short string representation of this GUID


  // GUID byte-length (64-bit)
  toString() {
    var high = ('0000' + this.high.toString(16)).slice(-4);
    var low = ('0000' + this.low.toString(16)).slice(-4);
    return `[GUID; Hex: 0x${high}${low}]`;
  }

}

GUID.LENGTH = 8;
exports.default = GUID;
module.exports = exports['default'];