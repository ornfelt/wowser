'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pool = require('../worker/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WDT {

  constructor(data) {
    this.data = data;
  }

  static load(path) {
    if (!(path in this.cache)) {
      this.cache[path] = _pool2.default.enqueue('WDT', path).then(args => {
        var [data] = args;
        return new this(data);
      });
    }

    return this.cache[path];
  }

}

WDT.cache = {};
exports.default = WDT;
module.exports = exports['default'];