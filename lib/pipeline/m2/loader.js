'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (path) {
  return loader.load(path).then(raw => {
    var buffer = new Buffer(new Uint8Array(raw));
    var stream = new _restructure.DecodeStream(buffer);
    var data = _m2.default.decode(stream);

    // TODO: Allow configuring quality
    var quality = data.viewCount - 1;
    var skinPath = path.replace(/\.m2/i, `0${quality}.skin`);

    return loader.load(skinPath).then(rawSkin => {
      buffer = new Buffer(new Uint8Array(rawSkin));
      stream = new _restructure.DecodeStream(buffer);
      var skinData = _skin2.default.decode(stream);
      return [data, skinData];
    });
  });
};

var _restructure = require('blizzardry/lib/restructure');

var _m = require('blizzardry/lib/m2');

var _m2 = _interopRequireDefault(_m);

var _skin = require('blizzardry/lib/m2/skin');

var _skin2 = _interopRequireDefault(_skin);

var _loader = require('../../net/loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loader = new _loader2.default();

module.exports = exports['default'];