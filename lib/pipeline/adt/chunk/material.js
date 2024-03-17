'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _textureLoader = require('../../texture-loader');

var _textureLoader2 = _interopRequireDefault(_textureLoader);

var _shader = require('./shader.frag');

var _shader2 = _interopRequireDefault(_shader);

var _shader3 = require('./shader.vert');

var _shader4 = _interopRequireDefault(_shader3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Material extends _three2.default.ShaderMaterial {

  constructor(data, textureNames) {
    super();

    this.layers = data.MCLY.layers;
    this.rawAlphaMaps = data.MCAL.alphaMaps;
    this.textureNames = textureNames;

    this.vertexShader = _shader4.default;
    this.fragmentShader = _shader2.default;

    this.side = _three2.default.BackSide;

    this.layerCount = 0;
    this.textures = [];
    this.alphaMaps = [];

    this.loadLayers();

    this.uniforms = {
      layerCount: { type: 'i', value: this.layerCount },
      alphaMaps: { type: 'tv', value: this.alphaMaps },
      textures: { type: 'tv', value: this.textures },

      // Managed by light manager
      lightModifier: { type: 'f', value: '1.0' },
      ambientLight: { type: 'c', value: new _three2.default.Color(0.5, 0.5, 0.5) },
      diffuseLight: { type: 'c', value: new _three2.default.Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { type: 'f', value: '1.0' },
      fogColor: { type: 'c', value: new _three2.default.Color(0.25, 0.5, 1.0) },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 }
    };
  }

  loadLayers() {
    this.layerCount = this.layers.length;

    this.loadAlphaMaps();
    this.loadTextures();
  }

  loadAlphaMaps() {
    var alphaMaps = [];

    this.rawAlphaMaps.forEach(raw => {
      var texture = new _three2.default.DataTexture(raw, 64, 64);
      texture.format = _three2.default.LuminanceFormat;
      texture.minFilter = texture.magFilter = _three2.default.LinearFilter;
      texture.needsUpdate = true;

      alphaMaps.push(texture);
    });

    // Texture array uniforms must have at least one value present to be considered valid.
    if (alphaMaps.length === 0) {
      alphaMaps.push(new _three2.default.Texture());
    }

    this.alphaMaps = alphaMaps;
  }

  loadTextures() {
    var textures = [];

    this.layers.forEach(layer => {
      var filename = this.textureNames[layer.textureID];
      var texture = _textureLoader2.default.load(filename);

      textures.push(texture);
    });

    this.textures = textures;
  }

  dispose() {
    super.dispose();

    this.textures.forEach(texture => {
      _textureLoader2.default.unload(texture);
    });

    this.alphaMaps.forEach(alphaMap => {
      alphaMap.dispose();
    });
  }
}

exports.default = Material;
module.exports = exports['default'];