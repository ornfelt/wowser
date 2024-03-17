'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _blueprint = require('../../pipeline/m2/blueprint');

var _blueprint2 = _interopRequireDefault(_blueprint);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DoodadManager {

  // Minimum number of pending doodads to load or unload in a given tick.
  constructor(map) {
    this.map = map;
    this.chunkRefs = new Map();

    this.doodads = new Map();
    this.animatedDoodads = new Map();

    this.entriesPendingLoad = new Map();
    this.entriesPendingUnload = new Map();

    this.loadChunk = this.loadChunk.bind(this);
    this.unloadChunk = this.unloadChunk.bind(this);
    this.loadDoodads = this.loadDoodads.bind(this);
    this.unloadDoodads = this.unloadDoodads.bind(this);

    // Kick off intervals.
    this.loadDoodads();
    this.unloadDoodads();
  }

  // Process a set of doodad entries for a given chunk index of the world map.


  // Number of milliseconds to wait before loading another portion of doodads.


  // Proportion of pending doodads to load or unload in a given tick.
  loadChunk(index, entries) {
    for (var i = 0, len = entries.length; i < len; ++i) {
      var entry = entries[i];

      var chunkRefs = void 0;

      // Fetch or create chunk references for entry.
      if (this.chunkRefs.has(entry.id)) {
        chunkRefs = this.chunkRefs.get(entry.id);
      } else {
        chunkRefs = new Set();
        this.chunkRefs.set(entry.id, chunkRefs);
      }

      // Add chunk reference to entry.
      chunkRefs.add(index);

      // If the doodad is pending unload, remove the pending unload.
      if (this.entriesPendingUnload.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
      }

      // Add to pending loads. Actual loading is done by interval.
      this.entriesPendingLoad.set(entry.id, entry);
    }
  }

  unloadChunk(index, entries) {
    for (var i = 0, len = entries.length; i < len; ++i) {
      var entry = entries[i];

      var chunkRefs = this.chunkRefs.get(entry.id);

      // Remove chunk reference for entry.
      chunkRefs.delete(index);

      // If at least one chunk reference remains for entry, leave loaded. Typically happens in
      // cases where a doodad is shared across multiple chunks.
      if (chunkRefs.size > 0) {
        continue;
      }

      // No chunk references remain, so we should remove from pending loads if necessary.
      if (this.entriesPendingLoad.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
      }

      // Add to pending unloads. Actual unloading is done by interval.
      this.entriesPendingUnload.set(entry.id, entry);
    }
  }

  // Every tick of the load interval, load a portion of any doodads pending load.
  loadDoodads() {
    var count = 0;

    for (var entry of this.entriesPendingLoad.values()) {
      if (this.doodads.has(entry.id)) {
        this.entriesPendingLoad.delete(entry.id);
        continue;
      }

      this.loadDoodad(entry);

      this.entriesPendingLoad.delete(entry.id);

      ++count;

      var shouldYield = count >= this.constructor.MINIMUM_LOAD_THRESHOLD && count > this.entriesPendingLoad.size * this.constructor.LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.loadDoodads, this.constructor.LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.loadDoodads, this.constructor.LOAD_INTERVAL);
  }

  loadDoodad(entry) {
    _blueprint2.default.load(entry.filename).then(doodad => {
      if (this.entriesPendingUnload.has(entry.id)) {
        return;
      }

      doodad.entryID = entry.id;

      this.doodads.set(entry.id, doodad);

      this.placeDoodad(doodad, entry.position, entry.rotation, entry.scale);

      if (doodad.animated) {
        this.enableDoodadAnimations(entry, doodad);
      }
    });
  }

  enableDoodadAnimations(entry, doodad) {
    // Maintain separate entries for animated doodads to avoid excessive iterations on each
    // call to animate() during the render loop.
    this.animatedDoodads.set(entry.id, doodad);

    // Auto-play animation index 0 in doodad, if animations are present.
    // TODO: Properly manage doodad animations.
    if (doodad.animations.length > 0) {
      doodad.animations.playAnimation(0);
      doodad.animations.playAllSequences();
    }
  }

  // Every tick of the load interval, unload a portion of any doodads pending unload.
  unloadDoodads() {
    var count = 0;

    for (var entry of this.entriesPendingUnload.values()) {
      // If the doodad was already unloaded, remove it from the pending unloads.
      if (!this.doodads.has(entry.id)) {
        this.entriesPendingUnload.delete(entry.id);
        continue;
      }

      this.unloadDoodad(entry);

      this.entriesPendingUnload.delete(entry.id);

      ++count;

      var shouldYield = count >= this.constructor.MINIMUM_LOAD_THRESHOLD && count > this.entriesPendingUnload.size * this.constructor.LOAD_FACTOR;

      if (shouldYield) {
        setTimeout(this.unloadDoodads, this.constructor.LOAD_INTERVAL);
        return;
      }
    }

    setTimeout(this.unloadDoodads, this.constructor.LOAD_INTERVAL);
    return;
  }

  unloadDoodad(entry) {
    var doodad = this.doodads.get(entry.id);
    this.doodads.delete(entry.id);
    this.animatedDoodads.delete(entry.id);
    this.map.remove(doodad);

    _blueprint2.default.unload(doodad);
  }

  // Place a doodad on the world map, adhereing to a provided position, rotation, and scale.
  placeDoodad(doodad, position, rotation, scale) {
    doodad.position.set(-(position.z - this.map.constructor.ZEROPOINT), -(position.x - this.map.constructor.ZEROPOINT), position.y);

    // Provided as (Z, X, -Y)
    doodad.rotation.set(rotation.z * Math.PI / 180, rotation.x * Math.PI / 180, -rotation.y * Math.PI / 180);

    // Adjust doodad rotation to match Wowser's axes.
    var quat = doodad.quaternion;
    quat.set(quat.x, quat.y, quat.z, -quat.w);

    if (scale !== 1024) {
      var scaleFloat = scale / 1024;
      doodad.scale.set(scaleFloat, scaleFloat, scaleFloat);
    }

    // Add doodad to world map.
    this.map.add(doodad);
    doodad.updateMatrix();
  }

  animate(delta, camera, cameraMoved) {
    this.animatedDoodads.forEach(doodad => {
      if (!doodad.visible) {
        return;
      }

      if (doodad.receivesAnimationUpdates && doodad.animations.length > 0) {
        doodad.animations.update(delta);
      }

      if (cameraMoved && doodad.billboards.length > 0) {
        doodad.applyBillboards(camera);
      }

      if (doodad.skeletonHelper) {
        doodad.skeletonHelper.update();
      }
    });
  }

}

DoodadManager.LOAD_FACTOR = 1 / 40;
DoodadManager.MINIMUM_LOAD_THRESHOLD = 2;
DoodadManager.LOAD_INTERVAL = 1;
exports.default = DoodadManager;
module.exports = exports['default'];