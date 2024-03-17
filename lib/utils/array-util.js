"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ArrayUtil {

  // Generates array from given hex string
  static fromHex(hex) {
    var array = [];
    for (var i = 0; i < hex.length; i += 2) {
      array.push(parseInt(hex.slice(i, i + 2), 16));
    }
    return array;
  }

}

exports.default = ArrayUtil;
module.exports = exports["default"];