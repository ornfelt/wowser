'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sha = require('jsbn/lib/sha1');

var _sha2 = _interopRequireDefault(_sha);

var _hash = require('../hash');

var _hash2 = _interopRequireDefault(_hash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// SHA-1 implementation
class SHA1 extends _hash2.default {

  // Finalizes this SHA-1 hash
  finalize() {
    this._digest = _sha2.default.fromArray(this._data.toArray());
  }

}

exports.default = SHA1;
module.exports = exports['default'];