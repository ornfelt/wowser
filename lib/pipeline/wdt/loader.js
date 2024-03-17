'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path) {
  return loader.load(path).then(raw => {
    var buffer = new Buffer(new Uint8Array(raw));
    var stream = new _restructure.DecodeStream(buffer);
    var data = _wdt2.default.decode(stream);
    return data;
  });
};

var _restructure = require('blizzardry/lib/restructure');

var _wdt = require('blizzardry/lib/wdt');

var _wdt2 = _interopRequireDefault(_wdt);

var _loader = require('../../net/loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loader = new _loader2.default();

module.exports = exports['default'];