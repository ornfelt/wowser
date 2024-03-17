'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _adt = require('../../pipeline/adt');

var _adt2 = _interopRequireDefault(_adt);

var _chunk2 = require('../../pipeline/adt/chunk');

var _chunk3 = _interopRequireDefault(_chunk2);

var _dbc = require('../../pipeline/dbc');

var _dbc2 = _interopRequireDefault(_dbc);

var _wdt = require('../../pipeline/wdt');

var _wdt2 = _interopRequireDefault(_wdt);

var _doodadManager = require('./doodad-manager');

var _doodadManager2 = _interopRequireDefault(_doodadManager);

var _wmoManager = require('./wmo-manager');

var _wmoManager2 = _interopRequireDefault(_wmoManager);

var _terrainManager = require('./terrain-manager');

var _terrainManager2 = _interopRequireDefault(_terrainManager);

var _map_name = require('../map_name');

var _map_name2 = _interopRequireDefault(_map_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WorldMap extends _three2.default.Group {

  constructor(data, wdt) {
    super();

    this.matrixAutoUpdate = false;

    this.terrainManager = new _terrainManager2.default(this);
    this.doodadManager = new _doodadManager2.default(this);
    this.wmoManager = new _wmoManager2.default(this);

    this.data = data;
    this.wdt = wdt;

    this.mapID = this.data.id;
    this.chunkX = null;
    this.chunkY = null;

    this.queuedChunks = new Map();
    this.chunks = new Map();
  }

  // Controls when ADT chunks are loaded and unloaded from the map.


  get internalName() {
    return this.data.internalName;
  }

  render(x, y) {
    var chunkX = _chunk3.default.chunkFor(x);
    var chunkY = _chunk3.default.chunkFor(y);

    if (this.chunkX === chunkX && this.chunkY === chunkY) {
      return;
    }

    this.chunkX = chunkX;
    this.chunkY = chunkY;

    var radius = this.constructor.CHUNK_RENDER_RADIUS;
    var indices = this.chunkIndicesAround(chunkX, chunkY, radius);

    indices.forEach(index => {
      this.loadChunkByIndex(index);
    });

    this.chunks.forEach((_chunk, index) => {
      if (indices.indexOf(index) === -1) {
        this.unloadChunkByIndex(index);
      }
    });
  }

  chunkIndicesAround(chunkX, chunkY, radius) {
    var perRow = this.constructor.CHUNKS_PER_ROW;

    var base = this.indexFor(chunkX, chunkY);
    var indices = [];

    for (var y = -radius; y <= radius; ++y) {
      for (var x = -radius; x <= radius; ++x) {
        indices.push(base + y * perRow + x);
      }
    }

    return indices;
  }

  loadChunkByIndex(index) {
    if (this.queuedChunks.has(index)) {
      return;
    }

    var perRow = this.constructor.CHUNKS_PER_ROW;
    var chunkX = index / perRow | 0;
    var chunkY = index % perRow;

    this.queuedChunks.set(index, _chunk3.default.load(this, chunkX, chunkY).then(chunk => {
      this.chunks.set(index, chunk);

      this.terrainManager.loadChunk(index, chunk);
      this.doodadManager.loadChunk(index, chunk.doodadEntries);
      this.wmoManager.loadChunk(index, chunk.wmoEntries);
    }));
  }

  unloadChunkByIndex(index) {
    var chunk = this.chunks.get(index);
    if (!chunk) {
      return;
    }

    this.terrainManager.unloadChunk(index, chunk);
    this.doodadManager.unloadChunk(index, chunk.doodadEntries);
    this.wmoManager.unloadChunk(index, chunk.wmoEntries);

    this.queuedChunks.delete(index);
    this.chunks.delete(index);
  }

  indexFor(chunkX, chunkY) {
    return chunkX * 64 * 16 + chunkY;
  }

  animate(delta, camera, cameraMoved) {
    this.doodadManager.animate(delta, camera, cameraMoved);
    this.wmoManager.animate(delta, camera, cameraMoved);
  }

  //static load(id) {
  //  return DBC.load('Map', id).then((data) => {
  //    const { internalName: name } = data;
  //    return WDT.load(`World\\Maps\\${name}\\${name}.wdt`).then((wdt) => {
  //      return new this(data, wdt);
  //    });
  //  });
  //}

  static load(id) {
    return _dbc2.default.load('Map', id).then(data => {
      var { internalName: name } = data;
      var filename = void 0;
      var mapName = _map_name2.default.getMapName();
      console.log(`Loading (wdt) Map: ${mapName} (${id})`);

      // Old
      //filename = 'World\\Maps\\' + name + '\\' + name + '.wdt';
      //console.log("2Loading filename:", filename); // Informative print before changing
      //filename = 'World\\Maps\\Azeroth\\Azeroth.wdt';
      //filename = 'World\\Maps\\Kalimdor\\Kalimdor.wdt';
      //filename = 'World\\Maps\\Northrend\\Northrend.wdt';
      //console.log("Loading (wdt) filename:", filename); // Print final filename

      filename = `World\\Maps\\${mapName}\\${mapName}.wdt`;

      return _wdt2.default.load(filename).then(wdt => {
        return new this(data, wdt);
      });
    });
  }

}

WorldMap.ZEROPOINT = _adt2.default.SIZE * 32;
WorldMap.CHUNKS_PER_ROW = 64 * 16;
WorldMap.CHUNK_RENDER_RADIUS = 12;
exports.default = WorldMap;
module.exports = exports['default'];