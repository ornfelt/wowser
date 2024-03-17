'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _textureLoader = require('../../texture-loader');

var _textureLoader2 = _interopRequireDefault(_textureLoader);

var _shader = require('./shader.vert');

var _shader2 = _interopRequireDefault(_shader);

var _shader3 = require('./shader.frag');

var _shader4 = _interopRequireDefault(_shader3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMOMaterial extends _three2.default.ShaderMaterial {

  constructor(def, textureDefs) {
    super();

    this.textures = [];

    this.uniforms = {
      textures: { type: 'tv', value: [] },
      textureCount: { type: 'i', value: 0 },
      blendingMode: { type: 'i', value: def.blendMode },

      useBaseColor: { type: 'i', value: 0 },
      baseColor: { type: 'c', value: new _three2.default.Color(0, 0, 0) },
      baseAlpha: { type: 'f', value: 0.0 },

      indoor: { type: 'i', value: 0 },

      // Managed by light manager
      lightModifier: { type: 'f', value: 1.0 },
      ambientLight: { type: 'c', value: new _three2.default.Color(0.5, 0.5, 0.5) },
      diffuseLight: { type: 'c', value: new _three2.default.Color(0.25, 0.5, 1.0) },

      // Managed by light manager
      fogModifier: { type: 'f', value: 1.0 },
      fogColor: { type: 'c', value: new _three2.default.Color(0.25, 0.5, 1.0) },
      fogStart: { type: 'f', value: 5.0 },
      fogEnd: { type: 'f', value: 400.0 }
    };

    if (def.useBaseColor) {
      var baseColor = new _three2.default.Color(def.baseColor.r / 255.0, def.baseColor.g / 255.0, def.baseColor.b / 255.0);

      var baseAlpha = def.baseColor.a / 255.0;

      this.uniforms.useBaseColor = { type: 'i', value: 1 };
      this.uniforms.baseColor = { type: 'c', value: baseColor };
      this.uniforms.baseAlpha = { type: 'f', value: baseAlpha };
    }

    // Tag lighting mode (based on group flags)
    if (def.indoor) {
      this.uniforms.indoor = { type: 'i', value: 1 };
    }

    // Flag 0x01 (unlit)
    // TODO: This is really only unlit at night. Needs to integrate with the light manager in
    // some fashion.
    if (def.flags & 0x10) {
      this.uniforms.lightModifier = { type: 'f', value: 0.0 };
    }

    // Transparent blending
    if (def.blendMode === 1) {
      this.transparent = true;
      this.side = _three2.default.DoubleSide;
    }

    // Flag 0x04: no backface culling
    if (def.flags & 0x04) {
      this.side = _three2.default.DoubleSide;
    }

    // Flag 0x40: clamp to edge
    if (def.flags & 0x40) {
      this.wrapping = _three2.default.ClampToEdgeWrapping;
    } else {
      this.wrapping = _three2.default.RepeatWrapping;
    }

    this.vertexShader = _shader2.default;
    this.fragmentShader = _shader4.default;

    this.loadTextures(textureDefs);
  }

  // TODO: Handle texture flags and color.
  loadTextures(textureDefs) {
    var textures = [];

    textureDefs.forEach(textureDef => {
      if (textureDef !== null) {
        var texture = _textureLoader2.default.load(textureDef.path, this.wrapping, this.wrapping, false);
        textures.push(texture);
      }
    });

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { type: 'tv', value: textures };
    this.uniforms.textureCount = { type: 'i', value: textures.length };
  }

  dispose() {
    super.dispose();

    this.textures.forEach(texture => {
      _textureLoader2.default.unload(texture);
    });
  }
}

exports.default = WMOMaterial;
module.exports = exports['default'];