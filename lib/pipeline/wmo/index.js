'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMO extends _three2.default.Group {

  constructor(path, data) {
    super();

    this.matrixAutoUpdate = false;

    this.path = path;
    this.data = data;

    this.groupCount = data.MOHD.groupCount;

    this.groups = new Map();
    this.indoorGroupIDs = [];
    this.outdoorGroupIDs = [];

    // Separate group IDs by indoor/outdoor flag. This allows us to queue outdoor groups to
    // load before indoor groups.
    for (var i = 0; i < this.groupCount; ++i) {
      var group = data.MOGI.groups[i];

      if (group.indoor) {
        this.indoorGroupIDs.push(i);
      } else {
        this.outdoorGroupIDs.push(i);
      }
    }
  }

  doodadSet(doodadSet) {
    var set = this.data.MODS.sets[doodadSet];
    var { startIndex: start, doodadCount: count } = set;

    var entries = this.data.MODD.doodads.slice(start, start + count);

    return entries;
  }

  clone() {
    return new this.constructor(this.path, this.data);
  }

}

WMO.cache = {};
exports.default = WMO;
module.exports = exports['default'];