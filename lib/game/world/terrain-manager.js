"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class TerrainManager {

  constructor(map) {
    this.map = map;
  }

  loadChunk(_index, terrain) {
    this.map.add(terrain);
    terrain.updateMatrix();
  }

  unloadChunk(_index, terrain) {
    this.map.remove(terrain);
    terrain.dispose();
  }

}

exports.default = TerrainManager;
module.exports = exports["default"];