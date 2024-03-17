'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _material = require('../material');

var _material2 = _interopRequireDefault(_material);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMOGroup extends _three2.default.Mesh {

  constructor(wmo, id, data, path) {
    super();

    this.dispose = this.dispose.bind(this);

    this.matrixAutoUpdate = false;

    this.wmo = wmo;
    this.groupID = id;
    this.data = data;
    this.path = path;

    this.indoor = data.indoor;
    this.animated = false;

    var vertexCount = data.MOVT.vertices.length;
    var textureCoords = data.MOTV.textureCoords;

    var positions = new Float32Array(vertexCount * 3);
    var normals = new Float32Array(vertexCount * 3);
    var uvs = new Float32Array(vertexCount * 2);
    var colors = new Float32Array(vertexCount * 3);
    var alphas = new Float32Array(vertexCount);

    data.MOVT.vertices.forEach(function (vertex, index) {
      // Provided as (X, Z, -Y)
      positions[index * 3] = vertex[0];
      positions[index * 3 + 1] = vertex[2];
      positions[index * 3 + 2] = -vertex[1];

      uvs[index * 2] = textureCoords[index][0];
      uvs[index * 2 + 1] = textureCoords[index][1];
    });

    data.MONR.normals.forEach(function (normal, index) {
      normals[index * 3] = normal[0];
      normals[index * 3 + 1] = normal[2];
      normals[index * 3 + 2] = -normal[1];
    });

    if ('MOCV' in data) {
      data.MOCV.colors.forEach(function (color, index) {
        colors[index * 3] = color.r / 255.0;
        colors[index * 3 + 1] = color.g / 255.0;
        colors[index * 3 + 2] = color.b / 255.0;
        alphas[index] = color.a / 255.0;
      });
    } else if (this.indoor) {
      // Default indoor vertex color: rgba(0.5, 0.5, 0.5, 1.0)
      data.MOVT.vertices.forEach(function (_vertex, index) {
        colors[index * 3] = 127.0 / 255.0;
        colors[index * 3 + 1] = 127.0 / 255.0;
        colors[index * 3 + 2] = 127.0 / 255.0;
        alphas[index] = 1.0;
      });
    }

    var indices = new Uint32Array(data.MOVI.triangles);

    var geometry = this.geometry = new _three2.default.BufferGeometry();
    geometry.setIndex(new _three2.default.BufferAttribute(indices, 1));
    geometry.addAttribute('position', new _three2.default.BufferAttribute(positions, 3));
    geometry.addAttribute('normal', new _three2.default.BufferAttribute(normals, 3));
    geometry.addAttribute('uv', new _three2.default.BufferAttribute(uvs, 2));

    // TODO: Perhaps it is possible to directly use a vec4 here? Currently, color + alpha is
    // combined into a vec4 in the material's vertex shader. For some reason, attempting to
    // directly use a BufferAttribute with a length of 4 resulted in incorrect ordering for the
    // values in the shader.
    geometry.addAttribute('color', new _three2.default.BufferAttribute(colors, 3));
    geometry.addAttribute('alpha', new _three2.default.BufferAttribute(alphas, 1));

    // Mirror geometry over X and Y axes and rotate
    var matrix = new _three2.default.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    var materialIDs = [];

    data.MOBA.batches.forEach(function (batch) {
      materialIDs.push(batch.materialID);
      geometry.addGroup(batch.firstIndex, batch.indexCount, batch.materialID);
    });

    var materialDefs = this.wmo.data.MOMT.materials;
    var texturePaths = this.wmo.data.MOTX.filenames;

    this.material = this.createMultiMaterial(materialIDs, materialDefs, texturePaths);
  }

  createMultiMaterial(materialIDs, materialDefs, texturePaths) {
    var multiMaterial = new _three2.default.MultiMaterial();

    materialIDs.forEach(materialID => {
      var materialDef = materialDefs[materialID];

      if (this.indoor) {
        materialDef.indoor = true;
      } else {
        materialDef.indoor = false;
      }

      if (!this.wmo.data.MOHD.skipBaseColor) {
        materialDef.useBaseColor = true;
        materialDef.baseColor = this.wmo.data.MOHD.baseColor;
      } else {
        materialDef.useBaseColor = false;
      }

      var material = this.createMaterial(materialDefs[materialID], texturePaths);

      multiMaterial.materials[materialID] = material;
    });

    return multiMaterial;
  }

  createMaterial(materialDef, texturePaths) {
    var textureDefs = [];

    materialDef.textures.forEach(textureDef => {
      var texturePath = texturePaths[textureDef.offset];

      if (texturePath !== undefined) {
        textureDef.path = texturePath;
        textureDefs.push(textureDef);
      } else {
        textureDefs.push(null);
      }
    });

    var material = new _material2.default(materialDef, textureDefs);

    return material;
  }

  clone() {
    return new this.constructor(this.wmo, this.groupID, this.data, this.path);
  }

  dispose() {
    this.geometry.dispose();

    this.material.materials.forEach(material => {
      material.dispose();
    });
  }

}

WMOGroup.cache = {};
exports.default = WMOGroup;
module.exports = exports['default'];