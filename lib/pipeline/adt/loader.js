'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path, wdtFlags) {
  return loader.load(path).then(raw => {
    var buffer = new Buffer(new Uint8Array(raw));
    var stream = new _restructure.DecodeStream(buffer);
    var data = (0, _ADT2.default)(wdtFlags).decode(stream);
    return data;
  });
};

var _ADT = require('blizzardry/lib/ADT');

var _ADT2 = _interopRequireDefault(_ADT);

var _restructure = require('blizzardry/lib/restructure');

var _loader = require('../../net/loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loader = new _loader2.default();

module.exports = exports['default'];