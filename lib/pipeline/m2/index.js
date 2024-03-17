'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _submesh = require('./submesh');

var _submesh2 = _interopRequireDefault(_submesh);

var _material = require('./material');

var _material2 = _interopRequireDefault(_material);

var _animationManager = require('./animation-manager');

var _animationManager2 = _interopRequireDefault(_animationManager);

var _batchManager = require('./batch-manager');

var _batchManager2 = _interopRequireDefault(_batchManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class M2 extends _three2.default.Group {

  constructor(path, data, skinData, instance = null) {
    super();

    this.matrixAutoUpdate = false;

    this.eventListeners = [];

    this.name = path.split('\\').slice(-1).pop();

    this.path = path;
    this.data = data;
    this.skinData = skinData;

    this.batchManager = new _batchManager2.default();

    // Instanceable M2s share geometry, texture units, and animations.
    this.canInstance = data.canInstance;

    this.animated = data.animated;

    this.billboards = [];

    // Keep track of whether or not to use skinning. If the M2 has bone animations, useSkinning is
    // set to true, and all meshes and materials used in the M2 will be skinning enabled. Otherwise,
    // skinning will not be enabled. Skinning has a very significant impact on the render loop in
    // three.js.
    this.useSkinning = false;

    this.mesh = null;
    this.submeshes = [];
    this.parts = new Map();

    this.geometry = null;
    this.submeshGeometries = new Map();

    this.skeleton = null;
    this.bones = [];
    this.rootBones = [];

    if (instance) {
      this.animations = instance.animations;

      // To prevent over-updating animation timelines, instanced M2s shouldn't receive animation
      // time deltas. Instead, only the original M2 should receive time deltas.
      this.receivesAnimationUpdates = false;
    } else {
      this.animations = new _animationManager2.default(this, data.animations, data.sequences);

      if (this.animated) {
        this.receivesAnimationUpdates = true;
      } else {
        this.receivesAnimationUpdates = false;
      }
    }

    this.createSkeleton(data.bones);

    // Instanced M2s can share geometries and texture units.
    if (instance) {
      this.batches = instance.batches;
      this.geometry = instance.geometry;
      this.submeshGeometries = instance.submeshGeometries;
    } else {
      this.createTextureAnimations(data);
      this.createBatches(data, skinData);
      this.createGeometry(data.vertices);
    }

    this.createMesh(this.geometry, this.skeleton, this.rootBones);
    this.createSubmeshes(data, skinData);
  }

  createSkeleton(boneDefs) {
    var _this = this;

    var rootBones = [];
    var bones = [];
    var billboards = [];

    var _loop = function (boneIndex, len) {
      var boneDef = boneDefs[boneIndex];
      var bone = new _three2.default.Bone();

      bones.push(bone);

      // M2 bone positioning seems to be inverted on X and Y
      var { pivotPoint } = boneDef;
      var correctedPosition = new _three2.default.Vector3(-pivotPoint[0], -pivotPoint[1], pivotPoint[2]);
      bone.position.copy(correctedPosition);

      if (boneDef.parentID > -1) {
        var parent = bones[boneDef.parentID];
        parent.add(bone);

        // Correct bone positioning relative to parent
        var up = bone;
        while (up = up.parent) {
          bone.position.sub(up.position);
        }
      } else {
        bone.userData.isRoot = true;
        rootBones.push(bone);
      }

      // Enable skinning support on this M2 if we have bone animations.
      if (boneDef.animated) {
        _this.useSkinning = true;
      }

      // Flag billboarded bones
      if (boneDef.billboarded) {
        bone.userData.billboarded = true;
        bone.userData.billboardType = boneDef.billboardType;

        billboards.push(bone);
      }

      // Bone translation animation block
      if (boneDef.translation.animated) {
        _this.animations.registerTrack({
          target: bone,
          property: 'position',
          animationBlock: boneDef.translation,
          trackType: 'VectorKeyframeTrack',

          valueTransform: function (value) {
            return [bone.position.x + -value[0], bone.position.y + -value[1], bone.position.z + value[2]];
          }
        });
      }

      // Bone rotation animation block
      if (boneDef.rotation.animated) {
        _this.animations.registerTrack({
          target: bone,
          property: 'quaternion',
          animationBlock: boneDef.rotation,
          trackType: 'QuaternionKeyframeTrack',

          valueTransform: function (value) {
            return [value[0], value[1], -value[2], -value[3]];
          }
        });
      }

      // Bone scaling animation block
      if (boneDef.scaling.animated) {
        _this.animations.registerTrack({
          target: bone,
          property: 'scale',
          animationBlock: boneDef.scaling,
          trackType: 'VectorKeyframeTrack'
        });
      }
    };

    for (var boneIndex = 0, len = boneDefs.length; boneIndex < len; ++boneIndex) {
      _loop(boneIndex, len);
    }

    // Preserve the bones
    this.bones = bones;
    this.rootBones = rootBones;
    this.billboards = billboards;

    // Assemble the skeleton
    this.skeleton = new _three2.default.Skeleton(bones);

    this.skeleton.matrixAutoUpdate = this.matrixAutoUpdate;
  }

  // Returns a map of M2Materials indexed by submesh. Each material represents a batch,
  // to be rendered in the order of appearance in the map's entry for the submesh index.
  createBatches(data, skinData) {
    var batches = new Map();

    var batchDefs = this.batchManager.createDefs(data, skinData);

    var batchLen = batchDefs.length;
    for (var batchIndex = 0; batchIndex < batchLen; ++batchIndex) {
      var batchDef = batchDefs[batchIndex];

      var { submeshIndex } = batchDef;

      if (!batches.has(submeshIndex)) {
        batches.set(submeshIndex, []);
      }

      // Array that will contain materials matching each batch.
      var submeshBatches = batches.get(submeshIndex);

      // Observe the M2's skinning flag in the M2Material.
      batchDef.useSkinning = this.useSkinning;

      var batchMaterial = new _material2.default(this, batchDef);

      submeshBatches.unshift(batchMaterial);
    }

    this.batches = batches;
  }

  createGeometry(vertices) {
    var geometry = new _three2.default.Geometry();

    for (var vertexIndex = 0, len = vertices.length; vertexIndex < len; ++vertexIndex) {
      var vertex = vertices[vertexIndex];

      var { position } = vertex;

      geometry.vertices.push(
      // Provided as (X, Z, -Y)
      new _three2.default.Vector3(position[0], position[2], -position[1]));

      geometry.skinIndices.push(new _three2.default.Vector4(...vertex.boneIndices));

      geometry.skinWeights.push(new _three2.default.Vector4(...vertex.boneWeights));
    }

    // Mirror geometry over X and Y axes and rotate
    var matrix = new _three2.default.Matrix4();
    matrix.makeScale(-1, -1, 1);
    geometry.applyMatrix(matrix);
    geometry.rotateX(-Math.PI / 2);

    // Preserve the geometry
    this.geometry = geometry;
  }

  createMesh(geometry, skeleton, rootBones) {
    var mesh = void 0;

    if (this.useSkinning) {
      mesh = new _three2.default.SkinnedMesh(geometry);

      // Assign root bones to mesh
      rootBones.forEach(bone => {
        mesh.add(bone);
        bone.skin = mesh;
      });

      // Bind mesh to skeleton
      mesh.bind(skeleton);
    } else {
      mesh = new _three2.default.Mesh(geometry);
    }

    mesh.matrixAutoUpdate = this.matrixAutoUpdate;

    // Never display the mesh
    // TODO: We shouldn't really even have this mesh in the first place, should we?
    mesh.visible = false;

    // Add mesh to the group
    this.add(mesh);

    // Assign as root mesh
    this.mesh = mesh;
  }

  createSubmeshes(data, skinData) {
    var { vertices } = data;
    var { submeshes, indices, triangles } = skinData;

    var subLen = submeshes.length;

    for (var submeshIndex = 0; submeshIndex < subLen; ++submeshIndex) {
      var submeshDef = submeshes[submeshIndex];

      // Bring up relevant batches and geometry.
      var submeshBatches = this.batches.get(submeshIndex);
      var submeshGeometry = this.submeshGeometries.get(submeshIndex) || this.createSubmeshGeometry(submeshDef, indices, triangles, vertices);

      var submesh = this.createSubmesh(submeshDef, submeshGeometry, submeshBatches);

      this.parts.set(submesh.userData.partID, submesh);
      this.submeshes.push(submesh);

      this.submeshGeometries.set(submeshIndex, submeshGeometry);

      this.add(submesh);
    }
  }

  createSubmeshGeometry(submeshDef, indices, triangles, vertices) {
    var geometry = this.geometry.clone();

    // TODO: Figure out why this isn't cloned by the line above
    geometry.skinIndices = Array.from(this.geometry.skinIndices);
    geometry.skinWeights = Array.from(this.geometry.skinWeights);

    var uvs = [];

    var { startTriangle: start, triangleCount: count } = submeshDef;
    for (var i = start, faceIndex = 0; i < start + count; i += 3, ++faceIndex) {
      var vindices = [indices[triangles[i]], indices[triangles[i + 1]], indices[triangles[i + 2]]];

      var face = new _three2.default.Face3(vindices[0], vindices[1], vindices[2]);

      geometry.faces.push(face);

      uvs[faceIndex] = [];
      for (var vinIndex = 0, vinLen = vindices.length; vinIndex < vinLen; ++vinIndex) {
        var index = vindices[vinIndex];

        var { textureCoords, normal } = vertices[index];

        uvs[faceIndex].push(new _three2.default.Vector2(textureCoords[0][0], textureCoords[0][1]));

        face.vertexNormals.push(new _three2.default.Vector3(normal[0], normal[1], normal[2]));
      }
    }

    geometry.faceVertexUvs = [uvs];

    var bufferGeometry = new _three2.default.BufferGeometry().fromGeometry(geometry);

    return bufferGeometry;
  }

  createSubmesh(submeshDef, geometry, batches) {
    var rootBone = this.bones[submeshDef.rootBone];

    var opts = {
      skeleton: this.skeleton,
      geometry: geometry,
      rootBone: rootBone,
      useSkinning: this.useSkinning,
      matrixAutoUpdate: this.matrixAutoUpdate
    };

    var submesh = new _submesh2.default(opts);

    submesh.applyBatches(batches);

    submesh.userData.partID = submeshDef.partID;

    return submesh;
  }

  createTextureAnimations(data) {
    this.textureAnimations = new _three2.default.Object3D();
    this.uvAnimationValues = [];
    this.transparencyAnimationValues = [];
    this.vertexColorAnimationValues = [];

    var { uvAnimations, transparencyAnimations, vertexColorAnimations } = data;

    this.createUVAnimations(uvAnimations);
    this.createTransparencyAnimations(transparencyAnimations);
    this.createVertexColorAnimations(vertexColorAnimations);
  }

  // TODO: Add support for rotation and scaling in UV animations.
  createUVAnimations(uvAnimationDefs) {
    if (uvAnimationDefs.length === 0) {
      return;
    }

    uvAnimationDefs.forEach((uvAnimationDef, index) => {
      // Default value
      this.uvAnimationValues[index] = {
        translation: [1.0, 1.0, 1.0],
        rotation: [0.0, 0.0, 0.0, 1.0],
        scaling: [1.0, 1.0, 1.0],
        matrix: new _three2.default.Matrix4()
      };

      var { translation } = uvAnimationDef;

      this.animations.registerTrack({
        target: this,
        property: 'uvAnimationValues[' + index + '].translation',
        animationBlock: translation,
        trackType: 'VectorKeyframeTrack'
      });

      // Set up event subscription to produce matrix from translation, rotation, and scaling
      // values.
      var updater = () => {
        var animationValue = this.uvAnimationValues[index];

        // Set up matrix for use in uv transform in vertex shader.
        animationValue.matrix = new _three2.default.Matrix4().compose(new _three2.default.Vector3(...animationValue.translation), new _three2.default.Quaternion(...animationValue.rotation), new _three2.default.Vector3(...animationValue.scaling));
      };

      this.animations.on('update', updater);

      this.eventListeners.push([this.animations, 'update', updater]);
    });
  }

  createTransparencyAnimations(transparencyAnimationDefs) {
    if (transparencyAnimationDefs.length === 0) {
      return;
    }

    transparencyAnimationDefs.forEach((transparencyAnimationDef, index) => {
      // Default value
      this.transparencyAnimationValues[index] = 1.0;

      this.animations.registerTrack({
        target: this,
        property: 'transparencyAnimationValues[' + index + ']',
        animationBlock: transparencyAnimationDef,
        trackType: 'NumberKeyframeTrack',

        valueTransform: function (value) {
          return [value];
        }
      });
    });
  }

  createVertexColorAnimations(vertexColorAnimationDefs) {
    if (vertexColorAnimationDefs.length === 0) {
      return;
    }

    vertexColorAnimationDefs.forEach((vertexColorAnimationDef, index) => {
      // Default value
      this.vertexColorAnimationValues[index] = {
        color: [1.0, 1.0, 1.0],
        alpha: 1.0
      };

      var { color, alpha } = vertexColorAnimationDef;

      this.animations.registerTrack({
        target: this,
        property: 'vertexColorAnimationValues[' + index + '].color',
        animationBlock: color,
        trackType: 'VectorKeyframeTrack'
      });

      this.animations.registerTrack({
        target: this,
        property: 'vertexColorAnimationValues[' + index + '].alpha',
        animationBlock: alpha,
        trackType: 'NumberKeyframeTrack',

        valueTransform: function (value) {
          return [value];
        }
      });
    });
  }

  applyBillboards(camera) {
    for (var i = 0, len = this.billboards.length; i < len; ++i) {
      var _bone = this.billboards[i];

      switch (_bone.userData.billboardType) {
        case 0:
          this.applySphericalBillboard(camera, _bone);
          break;
        case 3:
          this.applyCylindricalZBillboard(camera, _bone);
          break;
        default:
          break;
      }
    }
  }

  applySphericalBillboard(camera, bone) {
    var boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    var camPos = this.worldToLocal(camera.position.clone());

    var modelForward = new _three2.default.Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    var modelVmEl = boneRoot.modelViewMatrix.elements;
    var modelRight = new _three2.default.Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);
    modelRight.multiplyScalar(-1);

    var modelUp = new _three2.default.Vector3();
    modelUp.crossVectors(modelForward, modelRight);
    modelUp.normalize();

    var rotateMatrix = new _three2.default.Matrix4();

    rotateMatrix.set(modelForward.x, modelRight.x, modelUp.x, 0, modelForward.y, modelRight.y, modelUp.y, 0, modelForward.z, modelRight.z, modelUp.z, 0, 0, 0, 0, 1);

    bone.rotation.setFromRotationMatrix(rotateMatrix);
  }

  applyCylindricalZBillboard(camera, bone) {
    var boneRoot = bone.skin;

    if (!boneRoot) {
      return;
    }

    var camPos = this.worldToLocal(camera.position.clone());

    var modelForward = new _three2.default.Vector3(camPos.x, camPos.y, camPos.z);
    modelForward.normalize();

    var modelVmEl = boneRoot.modelViewMatrix.elements;
    var modelRight = new _three2.default.Vector3(modelVmEl[0], modelVmEl[4], modelVmEl[8]);

    var modelUp = new _three2.default.Vector3(0, 0, 1);

    var rotateMatrix = new _three2.default.Matrix4();

    rotateMatrix.set(modelForward.x, modelRight.x, modelUp.x, 0, modelForward.y, modelRight.y, modelUp.y, 0, modelForward.z, modelRight.z, modelUp.z, 0, 0, 0, 0, 1);

    bone.rotation.setFromRotationMatrix(rotateMatrix);
  }

  set displayInfo(displayInfo) {
    for (var i = 0, len = this.submeshes.length; i < len; ++i) {
      this.submeshes[i].displayInfo = displayInfo;
    }
  }

  detachEventListeners() {
    this.eventListeners.forEach(entry => {
      var [target, event, listener] = entry;
      target.removeListener(event, listener);
    });
  }

  dispose() {
    this.detachEventListeners();
    this.eventListeners = [];

    this.geometry.dispose();
    this.mesh.geometry.dispose();

    this.submeshes.forEach(submesh => {
      submesh.dispose();
    });
  }

  clone() {
    var instance = {};

    if (this.canInstance) {
      instance.animations = this.animations;
      instance.geometry = this.geometry;
      instance.submeshGeometries = this.submeshGeometries;
      instance.batches = this.batches;
    } else {
      instance = null;
    }

    return new this.constructor(this.path, this.data, this.skinData, instance);
  }

}

M2.cache = {};
exports.default = M2;
module.exports = exports['default'];
