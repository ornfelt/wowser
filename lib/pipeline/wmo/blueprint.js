'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pool = require('../worker/pool');

var _pool2 = _interopRequireDefault(_pool);

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMOBlueprint {

  static load(rawPath) {
    var path = rawPath.toUpperCase();

    // Prevent unintended unloading.
    if (this.pendingUnload.has(path)) {
      this.pendingUnload.delete(path);
    }

    // Background unloader might need to be started.
    if (!this.unloaderRunning) {
      this.unloaderRunning = true;
      this.backgroundUnload();
    }

    // Keep track of references.
    var refCount = this.references.get(path) || 0;
    ++refCount;
    this.references.set(path, refCount);

    if (!this.cache.has(path)) {
      this.cache.set(path, _pool2.default.enqueue('WMO', path).then(args => {
        var [data] = args;

        return new _2.default(path, data);
      }));
    }

    return this.cache.get(path).then(wmo => {
      return wmo.clone();
    });
  }

  static unload(wmo) {
    var path = wmo.path.toUpperCase();

    var refCount = this.references.get(path) || 1;

    --refCount;

    if (refCount === 0) {
      this.pendingUnload.add(path);
    } else {
      this.references.set(path, refCount);
    }
  }

  static backgroundUnload() {
    this.pendingUnload.forEach(path => {
      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

WMOBlueprint.cache = new Map();
WMOBlueprint.references = new Map();
WMOBlueprint.pendingUnload = new Set();
WMOBlueprint.unloaderRunning = false;
WMOBlueprint.UNLOAD_INTERVAL = 15000;
exports.default = WMOBlueprint;
module.exports = exports['default'];