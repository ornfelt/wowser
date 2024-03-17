'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sha = require('jsbn/lib/sha1');

var _rc = require('jsbn/lib/rc4');

var _rc2 = _interopRequireDefault(_rc);

var _arrayUtil = require('../utils/array-util');

var _arrayUtil2 = _interopRequireDefault(_arrayUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Crypt {

  // Creates crypt
  constructor() {

    // RC4's for encryption and decryption
    this._encrypt = null;
    this._decrypt = null;
  }

  // Encrypts given data through RC4
  encrypt(data) {
    if (this._encrypt) {
      this._encrypt.encrypt(data);
    }
    return this;
  }

  // Decrypts given data through RC4
  decrypt(data) {
    if (this._decrypt) {
      this._decrypt.decrypt(data);
    }
    return this;
  }

  // Sets session key and initializes this crypt
  set key(key) {
    console.info('initializing crypt');

    // Fresh RC4's
    this._encrypt = new _rc2.default();
    this._decrypt = new _rc2.default();

    // Calculate the encryption hash (through the server decryption key)
    var enckey = _arrayUtil2.default.fromHex('C2B3723CC6AED9B5343C53EE2F4367CE');
    var enchash = _sha.HMAC.fromArrays(enckey, key);

    // Calculate the decryption hash (through the client decryption key)
    var deckey = _arrayUtil2.default.fromHex('CC98AE04E897EACA12DDC09342915357');
    var dechash = _sha.HMAC.fromArrays(deckey, key);

    // Seed RC4's with the computed hashes
    this._encrypt.init(enchash);
    this._decrypt.init(dechash);

    // Ensure the buffer is synchronized
    for (var i = 0; i < 1024; ++i) {
      this._encrypt.next();
      this._decrypt.next();
    }
  }

}

exports.default = Crypt;
module.exports = exports['default'];