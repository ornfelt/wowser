'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loader = new _three2.default.TextureLoader();

class Material extends _three2.default.MeshBasicMaterial {

  constructor(params = {}) {
    params.wireframe = true;
    super(params);
  }

  set texture(path) {
    loader.load(encodeURI(`pipeline/${path}.png`), texture => {
      texture.flipY = false;
      texture.wrapS = _three2.default.RepeatWrapping;
      texture.wrapT = _three2.default.RepeatWrapping;
      this.wireframe = false;
      this.map = texture;
      this.needsUpdate = true;
    });
  }

}

exports.default = Material;
module.exports = exports['default'];