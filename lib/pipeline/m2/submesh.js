'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Submesh extends _three2.default.Group {

  constructor(opts) {
    super();

    this.matrixAutoUpdate = opts.matrixAutoUpdate;

    this.useSkinning = opts.useSkinning;

    this.rootBone = null;
    this.billboarded = false;

    if (this.useSkinning) {
      // Preserve the rootBone for the submesh such that its skin property can be assigned to the
      // first child batch mesh.
      this.rootBone = opts.rootBone;
      this.billboarded = opts.rootBone.userData.billboarded;

      // Preserve the skeleton for use in applying batches.
      this.skeleton = opts.skeleton;
    }

    // Preserve the geometry for use in applying batches.
    this.geometry = opts.geometry;
  }

  // Submeshes get one mesh per batch, which allows them to effectively simulate multiple
  // render passes. Batch mesh rendering order should be handled properly by the three.js
  // renderer.
  applyBatches(batches) {
    this.clearBatches();

    var batchLen = batches.length;
    for (var batchIndex = 0; batchIndex < batchLen; ++batchIndex) {
      var batchMaterial = batches[batchIndex];

      // If the submesh is billboarded, flag the material as billboarded.
      if (this.billboarded) {
        batchMaterial.enableBillboarding();
      }

      var batchMesh = void 0;

      // Only use a skinned mesh if the submesh uses skinning.
      if (this.useSkinning) {
        batchMesh = new _three2.default.SkinnedMesh(this.geometry, batchMaterial);
        batchMesh.bind(this.skeleton);
      } else {
        batchMesh = new _three2.default.Mesh(this.geometry, batchMaterial);
      }

      batchMesh.matrixAutoUpdate = this.matrixAutoUpdate;

      this.add(batchMesh);
    }

    if (this.useSkinning) {
      this.rootBone.skin = this.children[0];
    }
  }

  // Remove any existing child batch meshes.
  clearBatches() {
    var childrenLength = this.children.length;
    for (var childIndex = 0; childIndex < childrenLength; ++childIndex) {
      var child = this.children[childIndex];
      this.remove(child);
    }

    if (this.useSkinning) {
      // If all batch meshes are cleared, there is no longer a skin to associate with the
      // root bone.
      this.rootBone.skin = null;
    }
  }

  // Update all existing batch mesh materials to point to the new skins (textures).
  set displayInfo(displayInfo) {
    var { path } = displayInfo.modelData;

    var skin1 = `${path}${displayInfo.skin1}.blp`;
    var skin2 = `${path}${displayInfo.skin2}.blp`;
    var skin3 = `${path}${displayInfo.skin3}.blp`;

    var childrenLength = this.children.length;
    for (var childIndex = 0; childIndex < childrenLength; ++childIndex) {
      var child = this.children[childIndex];
      child.material.updateSkinTextures(skin1, skin2, skin3);
    }
  }

  dispose() {
    this.geometry.dispose();

    this.children.forEach(child => {
      child.geometry.dispose();
      child.material.dispose();
    });
  }

}

exports.default = Submesh;
module.exports = exports['default'];