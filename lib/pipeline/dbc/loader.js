'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name) {
  var path = `DBFilesClient\\${name}.dbc`;
  var entity = DBC[name];

  return loader.load(path).then(raw => {
    var buffer = new Buffer(new Uint8Array(raw));
    var stream = new _restructure.DecodeStream(buffer);
    var data = entity.dbc.decode(stream);

    // TODO: This property breaks web worker communication for some reason!
    delete data.entity;

    return data;
  });
};

var _entities = require('blizzardry/lib/dbc/entities');

var DBC = _interopRequireWildcard(_entities);

var _restructure = require('blizzardry/lib/restructure');

var _loader = require('../../net/loader');

var _loader2 = _interopRequireDefault(_loader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var loader = new _loader2.default();

module.exports = exports['default'];