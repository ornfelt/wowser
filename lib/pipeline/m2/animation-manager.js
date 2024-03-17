'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AnimationManager extends _events2.default {

  constructor(root, animationDefs, sequenceDefs) {
    super();

    // Complicated M2s may have far more than 10 (default listener cap) M2Materials subscribed to
    // the same texture animations.
    this.setMaxListeners(150);

    this.animationDefs = animationDefs;
    this.sequenceDefs = sequenceDefs;

    this.animationClips = [];
    this.sequenceClips = [];
    this.loadedAnimations = {};
    this.loadedSequences = {};

    this.mixer = new _three2.default.AnimationMixer(root);

    // M2 animations are keyframed in milliseconds.
    this.mixer.timeScale = 1000.0;

    this.registerAnimationClips(this.animationDefs);
    this.registerSequenceClips(this.sequenceDefs);

    this.length = this.animationClips.length + this.sequenceClips.length;
  }

  update(delta) {
    this.mixer.update(delta);

    this.emit('update');
  }

  loadAnimation(animationIndex) {
    // The animation is already loaded.
    if (typeof this.loadedAnimations[animationIndex] !== 'undefined') {
      return this.loadedAnimations[animationIndex];
    }

    var clip = this.animationClips[animationIndex];
    var action = this.mixer.clipAction(clip);

    this.loadedAnimations[animationIndex] = action;

    return action;
  }

  unloadAnimation(animationIndex) {
    // The animation isn't loaded.
    if (typeof this.loadedAnimations[animationIndex] === 'undefined') {
      return;
    }

    var clip = this.animationClips[animationIndex];
    this.mixer.uncacheClip(clip);

    delete this.loadedAnimations[animationIndex];

    return;
  }

  playAnimation(animationIndex) {
    var action = this.loadAnimation(animationIndex);
    action.play();
  }

  stopAnimation(animationIndex) {
    // The animation isn't loaded.
    if (typeof this.loadedAnimations[animationIndex] === 'undefined') {
      return;
    }

    var action = this.loadAnimation(animationIndex);
    action.stop();
  }

  loadSequence(sequenceIndex) {
    // The sequence is already loaded.
    if (typeof this.loadedSequences[sequenceIndex] !== 'undefined') {
      return this.loadedSequences[sequenceIndex];
    }

    var clip = this.sequenceClips[sequenceIndex];
    var action = this.mixer.clipAction(clip);

    this.loadedSequences[sequenceIndex] = action;

    return action;
  }

  unloadSequence(sequenceIndex) {
    // The sequence isn't loaded.
    if (typeof this.loadedSquences[sequenceIndex] === 'undefined') {
      return;
    }

    var clip = this.sequenceClips[sequenceIndex];
    this.mixer.uncacheClip(clip);
    delete this.loadedSequences[sequenceIndex];

    return;
  }

  playSequence(sequenceIndex) {
    var action = this.loadSequence(sequenceIndex);
    action.play();
  }

  playAllSequences() {
    this.sequenceDefs.forEach((_sequenceDuration, index) => {
      this.playSequence(index);
    });
  }

  stopSequence(sequenceIndex) {
    // The sequence isn't loaded.
    if (typeof this.loadedSequences[sequenceIndex] === 'undefined') {
      return;
    }

    var action = this.loadSequence(sequenceIndex);
    action.stop();
  }

  registerAnimationClips(animationDefs) {
    animationDefs.forEach((animationDef, index) => {
      var clip = new _three2.default.AnimationClip('animation-' + index, animationDef.length, []);
      this.animationClips[index] = clip;
    });
  }

  registerSequenceClips(sequenceDefs) {
    sequenceDefs.forEach((sequenceDuration, index) => {
      var clip = new _three2.default.AnimationClip('sequence-' + index, sequenceDuration, []);
      this.sequenceClips[index] = clip;
    });
  }

  unregisterTrack(trackID) {
    this.animationClips.forEach(clip => {
      clip.tracks = clip.tracks.filter(track => {
        return track.name !== trackID;
      });

      clip.trim();
      clip.optimize();
    });

    this.sequenceClips.forEach(clip => {
      clip.tracks = clip.tracks.filter(track => {
        return track.name !== trackID;
      });

      clip.trim();
      clip.optimize();
    });
  }

  registerTrack(opts) {
    var trackID = void 0;

    if (opts.animationBlock.globalSequenceID > -1) {
      trackID = this.registerSequenceTrack(opts);
    } else {
      trackID = this.registerAnimationTrack(opts);
    }

    return trackID;
  }

  registerAnimationTrack(opts) {
    var trackName = opts.target.uuid + '.' + opts.property;
    var animationBlock = opts.animationBlock;
    var { valueTransform } = opts;

    animationBlock.tracks.forEach((trackDef, animationIndex) => {
      var animationDef = this.animationDefs[animationIndex];

      // Avoid creating tracks for external .anim animations.
      if ((animationDef.flags & 0x130) === 0) {
        return;
      }

      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      var timestamps = trackDef.timestamps;
      var values = [];

      // Transform values before passing in to track.
      trackDef.values.forEach(rawValue => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        } else {
          values.push.apply(values, rawValue);
        }
      });

      var clip = this.animationClips[animationIndex];
      var track = new _three2.default[opts.trackType](trackName, timestamps, values);

      clip.tracks.push(track);

      clip.optimize();
    });

    return trackName;
  }

  registerSequenceTrack(opts) {
    var trackName = opts.target.uuid + '.' + opts.property;
    var animationBlock = opts.animationBlock;
    var { valueTransform } = opts;

    animationBlock.tracks.forEach(trackDef => {
      // Avoid creating empty tracks.
      if (trackDef.timestamps.length === 0) {
        return;
      }

      var timestamps = trackDef.timestamps;
      var values = [];

      // Transform values before passing in to track.
      trackDef.values.forEach(rawValue => {
        if (valueTransform) {
          values.push.apply(values, valueTransform(rawValue));
        } else {
          values.push.apply(values, rawValue);
        }
      });

      var track = new _three2.default[opts.trackType](trackName, timestamps, values);

      var clip = this.sequenceClips[animationBlock.globalSequenceID];
      clip.tracks.push(track);
      clip.optimize();
    });

    return trackName;
  }

}

exports.default = AnimationManager;
module.exports = exports['default'];