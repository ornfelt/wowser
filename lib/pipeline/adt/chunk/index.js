'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _material = require('./material');

var _material2 = _interopRequireDefault(_material);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Chunk extends _three2.default.Mesh {

  constructor(adt, id) {
    super();

    this.matrixAutoUpdate = false;

    var data = this.data = adt.data.MCNKs[id];
    var textureNames = adt.textures;

    var size = this.constructor.SIZE;
    var unitSize = this.constructor.UNIT_SIZE;

    this.position.y = adt.y + -(data.indexX * size);
    this.position.x = adt.x + -(data.indexY * size);

    this.holes = data.holes;

    var vertexCount = data.MCVT.heights.length;

    var positions = new Float32Array(vertexCount * 3);
    var normals = new Float32Array(vertexCount * 3);
    var uvs = new Float32Array(vertexCount * 2);
    var uvsAlpha = new Float32Array(vertexCount * 2);

    // See: http://www.pxr.dk/wowdev/wiki/index.php?title=ADT#MCVT_sub-chunk
    data.MCVT.heights.forEach(function (height, index) {
      var y = Math.floor(index / 17);
      var x = index % 17;

      if (x > 8) {
        y += 0.5;
        x -= 8.5;
      }

      // Mirror geometry over X and Y axes
      positions[index * 3] = -(y * unitSize);
      positions[index * 3 + 1] = -(x * unitSize);
      positions[index * 3 + 2] = data.position.z + height;

      uvs[index * 2] = x;
      uvs[index * 2 + 1] = y;

      uvsAlpha[index * 2] = x / 8;
      uvsAlpha[index * 2 + 1] = y / 8;
    });

    data.MCNR.normals.forEach(function (normal, index) {
      normals[index * 3] = normal.x;
      normals[index * 3 + 1] = normal.z;
      normals[index * 3 + 2] = normal.y;
    });

    var indices = new Uint32Array(8 * 8 * 4 * 3);

    var faceIndex = 0;
    var addFace = (index1, index2, index3) => {
      indices[faceIndex * 3] = index1;
      indices[faceIndex * 3 + 1] = index2;
      indices[faceIndex * 3 + 2] = index3;
      faceIndex++;
    };

    for (var y = 0; y < 8; ++y) {
      for (var x = 0; x < 8; ++x) {
        if (!this.isHole(y, x)) {
          var index = 9 + y * 17 + x;
          addFace(index, index - 9, index - 8);
          addFace(index, index - 8, index + 9);
          addFace(index, index + 9, index + 8);
          addFace(index, index + 8, index - 9);
        }
      }
    }

    var geometry = this.geometry = new _three2.default.BufferGeometry();
    geometry.setIndex(new _three2.default.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new _three2.default.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new _three2.default.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new _three2.default.BufferAttribute(uvs, 2));
    geometry.addAttribute('uvAlpha', new _three2.default.BufferAttribute(uvsAlpha, 2));

    this.material = new _material2.default(data, textureNames);
  }

  get doodadEntries() {
    return this.data.MCRF.doodadEntries;
  }

  get wmoEntries() {
    return this.data.MCRF.wmoEntries;
  }

  isHole(y, x) {
    var column = Math.floor(y / 2);
    var row = Math.floor(x / 2);

    var bit = 1 << column * 4 + row;
    return bit & this.holes;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }

  static chunkFor(position) {
    return 32 * 16 - position / this.SIZE | 0;
  }

  static tileFor(chunk) {
    return chunk / 16 | 0;
  }

  static load(map, chunkX, chunkY) {
    var tileX = this.tileFor(chunkX);
    var tileY = this.tileFor(chunkY);

    var offsetX = chunkX - tileX * 16;
    var offsetY = chunkY - tileY * 16;

    var id = offsetX * 16 + offsetY;

    return _2.default.loadTile(map.internalName, tileX, tileY, map.wdt.data.flags).then(adt => {
      return new this(adt, id);
    });
  }

}

Chunk.SIZE = 33.33333;
Chunk.UNIT_SIZE = 33.33333 / 8;
exports.default = Chunk;
module.exports = exports['default'];