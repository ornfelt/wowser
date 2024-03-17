'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _contentQueue = require('../content-queue');

var _contentQueue2 = _interopRequireDefault(_contentQueue);

var _wmoHandler = require('./wmo-handler');

var _wmoHandler2 = _interopRequireDefault(_wmoHandler);

var _blueprint = require('../../../pipeline/wmo/blueprint');

var _blueprint2 = _interopRequireDefault(_blueprint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WMOManager {

  constructor(map) {
    this.map = map;

    this.chunkRefs = new Map();

    this.counters = {
      loadingEntries: 0,
      loadedEntries: 0,
      loadingGroups: 0,
      loadedGroups: 0,
      loadingDoodads: 0,
      loadedDoodads: 0,
      animatedDoodads: 0
    };

    this.entries = new Map();

    this.queues = {
      loadEntry: new _contentQueue2.default(this.processLoadEntry.bind(this), this.constructor.LOAD_ENTRY_INTERVAL, this.constructor.LOAD_ENTRY_WORK_FACTOR, this.constructor.LOAD_ENTRY_WORK_MIN)
    };
  }

  loadChunk(chunkIndex, wmoEntries) {
    for (var i = 0, len = wmoEntries.length; i < len; ++i) {
      var wmoEntry = wmoEntries[i];

      this.addChunkRef(chunkIndex, wmoEntry);

      this.cancelUnloadEntry(wmoEntry);
      this.enqueueLoadEntry(wmoEntry);
    }
  }

  unloadChunk(chunkIndex, wmoEntries) {
    for (var i = 0, len = wmoEntries.length; i < len; ++i) {
      var wmoEntry = wmoEntries[i];

      var refCount = this.removeChunkRef(chunkIndex, wmoEntry);

      // Still has a chunk reference; don't queue for unload.
      if (refCount > 0) {
        continue;
      }

      this.dequeueLoadEntry(wmoEntry);
      this.scheduleUnloadEntry(wmoEntry);
    }
  }

  addChunkRef(chunkIndex, wmoEntry) {
    var chunkRefs = void 0;

    // Fetch or create chunk references for entry.
    if (this.chunkRefs.has(wmoEntry.id)) {
      chunkRefs = this.chunkRefs.get(wmoEntry.id);
    } else {
      chunkRefs = new Set();
      this.chunkRefs.set(wmoEntry.id, chunkRefs);
    }

    // Add chunk reference to entry.
    chunkRefs.add(chunkIndex);

    var refCount = chunkRefs.size;

    return refCount;
  }

  removeChunkRef(chunkIndex, wmoEntry) {
    var chunkRefs = this.chunkRefs.get(wmoEntry.id);

    // Remove chunk reference for entry.
    chunkRefs.delete(chunkIndex);

    var refCount = chunkRefs.size;

    if (chunkRefs.size === 0) {
      this.chunkRefs.delete(wmoEntry.id);
    }

    return refCount;
  }

  enqueueLoadEntry(wmoEntry) {
    var key = wmoEntry.id;

    // Already loading or loaded.
    if (this.queues.loadEntry.has(key) || this.entries.has(key)) {
      return;
    }

    this.queues.loadEntry.add(key, wmoEntry);

    this.counters.loadingEntries++;
  }

  dequeueLoadEntry(wmoEntry) {
    var key = wmoEntry.key;

    // Not loading.
    if (!this.queues.loadEntry.has(key)) {
      return;
    }

    this.queues.loadEntry.remove(key);

    this.counters.loadingEntries--;
  }

  scheduleUnloadEntry(wmoEntry) {
    var wmoHandler = this.entries.get(wmoEntry.id);

    if (!wmoHandler) {
      return;
    }

    wmoHandler.scheduleUnload(this.constructor.UNLOAD_DELAY_INTERVAL);
  }

  cancelUnloadEntry(wmoEntry) {
    var wmoHandler = this.entries.get(wmoEntry.id);

    if (!wmoHandler) {
      return;
    }

    wmoHandler.cancelUnload();
  }

  processLoadEntry(wmoEntry) {
    var wmoHandler = new _wmoHandler2.default(this, wmoEntry);
    this.entries.set(wmoEntry.id, wmoHandler);

    _blueprint2.default.load(wmoEntry.filename).then(wmoRoot => {
      wmoHandler.load(wmoRoot);

      this.counters.loadingEntries--;
      this.counters.loadedEntries++;
    });
  }

  animate(delta, camera, cameraMoved) {
    this.entries.forEach(wmoHandler => {
      wmoHandler.animate(delta, camera, cameraMoved);
    });
  }

}

WMOManager.LOAD_ENTRY_INTERVAL = 1;
WMOManager.LOAD_ENTRY_WORK_FACTOR = 1 / 10;
WMOManager.LOAD_ENTRY_WORK_MIN = 2;
WMOManager.UNLOAD_DELAY_INTERVAL = 30000;
exports.default = WMOManager;
module.exports = exports['default'];