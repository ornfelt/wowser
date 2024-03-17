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

class M2Material extends _three2.default.ShaderMaterial {

  constructor(m2, def) {
    if (def.useSkinning) {
      super({ skinning: true });
    } else {
      super({ skinning: false });
    }

    this.m2 = m2;

    this.eventListeners = [];

    var vertexShaderMode = this.vertexShaderModeFromID(def.shaderID, def.opCount);
    var fragmentShaderMode = this.fragmentShaderModeFromID(def.shaderID, def.opCount);

    this.uniforms = {
      textureCount: { type: 'i', value: 0 },
      textures: { type: 'tv', value: [] },

      blendingMode: { type: 'i', value: 0 },
      vertexShaderMode: { type: 'i', value: vertexShaderMode },
      fragmentShaderMode: { type: 'i', value: fragmentShaderMode },

      billboarded: { type: 'f', value: 0.0 },

      // Animated vertex colors
      animatedVertexColorRGB: { type: 'v3', value: new _three2.default.Vector3(1.0, 1.0, 1.0) },
      animatedVertexColorAlpha: { type: 'f', value: 1.0 },

      // Animated transparency
      animatedTransparency: { type: 'f', value: 1.0 },

      // Animated texture coordinate transform matrices
      animatedUVs: {
        type: 'm4v',
        value: [new _three2.default.Matrix4(), new _three2.default.Matrix4(), new _three2.default.Matrix4(), new _three2.default.Matrix4()]
      },

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

    this.vertexShader = _shader2.default;
    this.fragmentShader = _shader4.default;

    this.applyRenderFlags(def.renderFlags);
    this.applyBlendingMode(def.blendingMode);

    // Shader ID is a masked int that determines mode for vertex and fragment shader.
    this.shaderID = def.shaderID;

    // Loaded by calling updateSkinTextures()
    this.skins = {};
    this.skins.skin1 = null;
    this.skins.skin2 = null;
    this.skins.skin3 = null;

    this.textures = [];
    this.textureDefs = def.textures;
    this.loadTextures();

    this.registerAnimations(def);
  }

  // TODO: Fully expand these lookups.
  vertexShaderModeFromID(shaderID, opCount) {
    if (opCount === 1) {
      return 0;
    }

    if (shaderID === 0) {
      return 1;
    }

    return -1;
  }

  // TODO: Fully expand these lookups.
  fragmentShaderModeFromID(shaderID, opCount) {
    if (opCount === 1) {
      // fragCombinersWrath1Pass
      return 0;
    }

    if (shaderID === 0) {
      // fragCombinersWrath2Pass
      return 1;
    }

    // Unknown / unhandled
    return -1;
  }

  enableBillboarding() {
    // TODO: Make billboarding happen in the vertex shader.
    this.uniforms.billboarded = { type: 'f', value: '1.0' };

    // TODO: Shouldn't this be FrontSide? Billboarding logic currently seems to flips the mesh
    // backward.
    this.side = _three2.default.BackSide;
  }

  applyRenderFlags(renderFlags) {
    // Flag 0x01 (unlit)
    if (renderFlags & 0x01) {
      this.uniforms.lightModifier = { type: 'f', value: '0.0' };
    }

    // Flag 0x02 (unfogged)
    if (renderFlags & 0x02) {
      this.uniforms.fogModifier = { type: 'f', value: '0.0' };
    }

    // Flag 0x04 (no backface culling)
    if (renderFlags & 0x04) {
      this.side = _three2.default.DoubleSide;
      this.transparent = true;
    }

    // Flag 0x10 (no z-buffer write)
    if (renderFlags & 0x10) {
      this.depthWrite = false;
    }
  }

  applyBlendingMode(blendingMode) {
    this.uniforms.blendingMode.value = blendingMode;

    if (blendingMode === 1) {
      this.uniforms.alphaKey = { type: 'f', value: 1.0 };
    } else {
      this.uniforms.alphaKey = { type: 'f', value: 0.0 };
    }

    if (blendingMode >= 1) {
      this.transparent = true;
      this.blending = _three2.default.CustomBlending;
    }

    switch (blendingMode) {
      case 0:
        this.blending = _three2.default.NoBlending;
        this.blendSrc = _three2.default.OneFactor;
        this.blendDst = _three2.default.ZeroFactor;
        break;

      case 1:
        this.alphaTest = 0.5;
        this.side = _three2.default.DoubleSide;

        this.blendSrc = _three2.default.OneFactor;
        this.blendDst = _three2.default.ZeroFactor;
        this.blendSrcAlpha = _three2.default.OneFactor;
        this.blendDstAlpha = _three2.default.ZeroFactor;
        break;

      case 2:
        this.blendSrc = _three2.default.SrcAlphaFactor;
        this.blendDst = _three2.default.OneMinusSrcAlphaFactor;
        this.blendSrcAlpha = _three2.default.SrcAlphaFactor;
        this.blendDstAlpha = _three2.default.OneMinusSrcAlphaFactor;
        break;

      case 3:
        this.blendSrc = _three2.default.SrcColorFactor;
        this.blendDst = _three2.default.DstColorFactor;
        this.blendSrcAlpha = _three2.default.SrcAlphaFactor;
        this.blendDstAlpha = _three2.default.DstAlphaFactor;
        break;

      case 4:
        this.blendSrc = _three2.default.SrcAlphaFactor;
        this.blendDst = _three2.default.OneFactor;
        this.blendSrcAlpha = _three2.default.SrcAlphaFactor;
        this.blendDstAlpha = _three2.default.OneFactor;
        break;

      case 5:
        this.blendSrc = _three2.default.DstColorFactor;
        this.blendDst = _three2.default.ZeroFactor;
        this.blendSrcAlpha = _three2.default.DstAlphaFactor;
        this.blendDstAlpha = _three2.default.ZeroFactor;
        break;

      case 6:
        this.blendSrc = _three2.default.DstColorFactor;
        this.blendDst = _three2.default.SrcColorFactor;
        this.blendSrcAlpha = _three2.default.DstAlphaFactor;
        this.blendDstAlpha = _three2.default.SrcAlphaFactor;
        break;

      default:
        break;
    }
  }

  loadTextures() {
    var textureDefs = this.textureDefs;

    var textures = [];

    textureDefs.forEach(textureDef => {
      textures.push(this.loadTexture(textureDef));
    });

    this.textures = textures;

    // Update shader uniforms to reflect loaded textures.
    this.uniforms.textures = { type: 'tv', value: textures };
    this.uniforms.textureCount = { type: 'i', value: textures.length };
  }

  loadTexture(textureDef) {
    var wrapS = _three2.default.RepeatWrapping;
    var wrapT = _three2.default.RepeatWrapping;
    var flipY = false;

    var path = null;

    switch (textureDef.type) {
      case 0:
        // Hardcoded texture
        path = textureDef.filename;
        break;

      case 11:
        if (this.skins.skin1) {
          path = this.skins.skin1;
        }
        break;

      case 12:
        if (this.skins.skin2) {
          path = this.skins.skin2;
        }
        break;

      case 13:
        if (this.skins.skin3) {
          path = this.skins.skin3;
        }
        break;

      default:
        break;
    }

    if (path) {
      return _textureLoader2.default.load(path, wrapS, wrapT, flipY);
    } else {
      return null;
    }
  }

  registerAnimations(def) {
    var { uvAnimationIndices, transparencyAnimationIndex, vertexColorAnimationIndex } = def;

    this.registerUVAnimations(uvAnimationIndices);
    this.registerTransparencyAnimation(transparencyAnimationIndex);
    this.registerVertexColorAnimation(vertexColorAnimationIndex);
  }

  registerUVAnimations(uvAnimationIndices) {
    if (uvAnimationIndices.length === 0) {
      return;
    }

    var { animations, uvAnimationValues } = this.m2;

    var updater = () => {
      uvAnimationIndices.forEach((uvAnimationIndex, opIndex) => {
        var target = this.uniforms.animatedUVs;
        var source = uvAnimationValues[uvAnimationIndex];

        target.value[opIndex] = source.matrix;
      });
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  registerTransparencyAnimation(transparencyAnimationIndex) {
    if (transparencyAnimationIndex === null || transparencyAnimationIndex === -1) {
      return;
    }

    var { animations, transparencyAnimationValues } = this.m2;

    var target = this.uniforms.animatedTransparency;
    var source = transparencyAnimationValues;
    var valueIndex = transparencyAnimationIndex;

    var updater = () => {
      target.value = source[valueIndex];
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  registerVertexColorAnimation(vertexColorAnimationIndex) {
    if (vertexColorAnimationIndex === null || vertexColorAnimationIndex === -1) {
      return;
    }

    var { animations, vertexColorAnimationValues } = this.m2;

    var targetRGB = this.uniforms.animatedVertexColorRGB;
    var targetAlpha = this.uniforms.animatedVertexColorAlpha;
    var source = vertexColorAnimationValues;
    var valueIndex = vertexColorAnimationIndex;

    var updater = () => {
      targetRGB.value = source[valueIndex].color;
      targetAlpha.value = source[valueIndex].alpha;
    };

    animations.on('update', updater);

    this.eventListeners.push([animations, 'update', updater]);
  }

  detachEventListeners() {
    this.eventListeners.forEach(entry => {
      var [target, event, listener] = entry;
      target.removeListener(event, listener);
    });
  }

  updateSkinTextures(skin1, skin2, skin3) {
    this.skins.skin1 = skin1;
    this.skins.skin2 = skin2;
    this.skins.skin3 = skin3;

    this.loadTextures();
  }

  dispose() {
    super.dispose();

    this.detachEventListeners();
    this.eventListeners = [];

    this.textures.forEach(texture => {
      _textureLoader2.default.unload(texture);
    });
  }
}

exports.default = M2Material;
module.exports = exports['default'];