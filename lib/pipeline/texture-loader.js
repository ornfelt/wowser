'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loader = new _three2.default.TextureLoader();

class TextureLoader {

  static load(rawPath, wrapS = _three2.default.RepeatWrapping, wrapT = _three2.default.RepeatWrapping, flipY = true) {
    var path = rawPath.toUpperCase();

    // Ensure we cache based on texture settings. Some textures are reused with different settings.
    var textureKey = `${path};ws:${wrapS.toString()};wt:${wrapT.toString()};fy:${flipY}}`;

    // Prevent unintended unloading.
    if (this.pendingUnload.has(textureKey)) {
      this.pendingUnload.delete(textureKey);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    var refCount = this.references.get(textureKey) || 0;
    ++refCount;
    this.references.set(textureKey, refCount);

    var encodedPath = encodeURI(`pipeline/${path}.png`);

    if (!this.cache.has(textureKey)) {
      // TODO: Promisify THREE's TextureLoader callbacks
      this.cache.set(textureKey, loader.load(encodedPath, function (texture) {
        texture.sourceFile = path;
        texture.textureKey = textureKey;

        texture.wrapS = wrapS;
        texture.wrapT = wrapT;
        texture.flipY = flipY;

        texture.needsUpdate = true;
      }));
    }

    return this.cache.get(textureKey);
  }

  static unload(texture) {
    var textureKey = texture.textureKey;

    var refCount = this.references.get(textureKey) || 1;
    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(textureKey);
    } else {
      this.references.set(textureKey, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach(textureKey => {
      if (this.cache.has(textureKey)) {
        this.cache.get(textureKey).dispose();
      }

      this.cache.delete(textureKey);
      this.references.delete(textureKey);
      this.pendingUnload.delete(textureKey);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

TextureLoader.cache = new Map();
TextureLoader.references = new Map();
TextureLoader.pendingUnload = new Set();
TextureLoader.unloaderRunning = false;
TextureLoader.UNLOAD_INTERVAL = 15000;
exports.default = TextureLoader;
module.exports = exports['default'];