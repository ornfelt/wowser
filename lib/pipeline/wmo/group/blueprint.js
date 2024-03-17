'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pool = require('../../worker/pool');

var _pool2 = _interopRequireDefault(_pool);

var _ = require('./');

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMOGroupBlueprint {

  static load(wmo, id, rawPath) {
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
      this.cache.set(path, _pool2.default.enqueue('WMOGroup', path).then(args => {
        var [data] = args;

        return new _2.default(wmo, id, data, path);
      }));
    }

    return this.cache.get(path).then(wmoGroup => {
      return wmoGroup.clone();
    });
  }

  static loadWithID(wmo, id) {
    var suffix = `000${id}`.slice(-3);
    var groupPath = wmo.path.replace(/\.wmo/i, `_${suffix}.wmo`);

    return this.load(wmo, id, groupPath);
  }

  static unload(wmoGroup) {
    wmoGroup.dispose();

    var path = wmoGroup.path.toUpperCase();

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
      if (this.cache.has(path)) {
        this.cache.get(path).then(wmoGroup => {
          wmoGroup.dispose();
        });
      }

      this.cache.delete(path);
      this.references.delete(path);
      this.pendingUnload.delete(path);
    });

    setTimeout(this.backgroundUnload.bind(this), this.UNLOAD_INTERVAL);
  }

}

WMOGroupBlueprint.cache = new Map();
WMOGroupBlueprint.references = new Map();
WMOGroupBlueprint.pendingUnload = new Set();
WMOGroupBlueprint.unloaderRunning = false;
WMOGroupBlueprint.UNLOAD_INTERVAL = 15000;
exports.default = WMOGroupBlueprint;
module.exports = exports['default'];