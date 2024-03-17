'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pool = require('../worker/pool');

var _pool2 = _interopRequireDefault(_pool);

var _map_name = require('../../game/map_name');

var _map_name2 = _interopRequireDefault(_map_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ADT {

  constructor(path, data) {
    this.path = path;
    this.data = data;

    var tyx = this.path.match(/(\d+)_(\d+)\.adt$/);
    this.tileX = +tyx[2];
    this.tileY = +tyx[1];
    this.x = this.constructor.positionFor(this.tileX);
    this.y = this.constructor.positionFor(this.tileY);
  }

  get wmos() {
    return this.data.MODF.entries;
  }

  get doodads() {
    return this.data.MDDF.entries;
  }

  get textures() {
    return this.data.MTEX.filenames;
  }

  static positionFor(tile) {
    return (32 - tile) * this.SIZE;
  }

  static tileFor(position) {
    return 32 - position / this.SIZE | 0;
  }

  //static loadTile(map, tileX, tileY, wdtFlags) {
  //  return ADT.load(`World\\Maps\\${map}\\${map}_${tileY}_${tileX}.adt`, wdtFlags);
  //}

  static loadTile(map, tileX, tileY, wdtFlags) {
    var filename = void 0;
    var mapName = _map_name2.default.getMapName();

    // Old
    //filename = 'World\\Maps\\' + map + '\\' + map + '_' + tileY + '_' + tileX + '.adt';
    //console.log("Loading (adt) tile filename:", filename); // Informative print before changing
    //filename = 'World\\Maps\\' + "Azeroth" + '\\' + "Azeroth" + '_' + tileY + '_' + tileX + '.adt';
    //filename = 'World\\Maps\\' + "Kalimdor" + '\\' + "Kalimdor" + '_' + tileY + '_' + tileX + '.adt';
    //filename = 'World\\Maps\\' + "Northrend" + '\\' + "Northrend" + '_' + tileY + '_' + tileX + '.adt';
    //console.log("Loading (adt) tile filename:", filename); // Print final filename

    filename = `World\\Maps\\${mapName}\\${mapName}_${tileY}_${tileX}.adt`;

    return ADT.load(filename, wdtFlags);
  }

  static loadAtCoords(map, x, y, wdtFlags) {
    var tileX = this.tileFor(x);
    var tileY = this.tileFor(y);
    return this.loadTile(map, tileX, tileY, wdtFlags);
  }

  static load(path, wdtFlags) {
    if (!(path in this.cache)) {
      this.cache[path] = _pool2.default.enqueue('ADT', path, wdtFlags).then(args => {
        var [data] = args;
        return new this(path, data);
      });
    }
    return this.cache[path];
  }

}

ADT.SIZE = 533.33333;
ADT.cache = {};
exports.default = ADT;
module.exports = exports['default'];