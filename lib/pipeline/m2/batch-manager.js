"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class BatchManager {

  constructor() {}

  createDefs(data, skinData) {
    var defs = [];

    skinData.batches.forEach(batchData => {
      var def = this.createDef(data, batchData);
      defs.push(def);
    });

    return defs;
  }

  createDef(data, batchData) {
    var def = this.stubDef();

    var { textures } = data;
    var { vertexColorAnimations, transparencyAnimations, uvAnimations } = data;

    if (!batchData.textureIndices) {
      this.resolveTextureIndices(data, batchData);
    }

    if (!batchData.uvAnimationIndices) {
      this.resolveUVAnimationIndices(data, batchData);
    }

    var { opCount } = batchData;
    var { textureMappingIndex, materialIndex } = batchData;
    var { vertexColorAnimationIndex, transparencyAnimationLookup } = batchData;
    var { textureIndices, uvAnimationIndices } = batchData;

    // Batch flags
    def.flags = batchData.flags;

    // Submesh index and batch layer
    def.submeshIndex = batchData.submeshIndex;
    def.layer = batchData.layer;

    // Op count and shader ID
    def.opCount = batchData.opCount;
    def.shaderID = batchData.shaderID;

    // Texture mapping
    // -1 => Env; 0 => T1; 1 => T2
    if (textureMappingIndex >= 0) {
      var textureMapping = data.textureMappings[textureMappingIndex];
      def.textureMapping = textureMapping;
    }

    // Material (render flags and blending mode)
    var material = data.materials[materialIndex];
    def.renderFlags = material.renderFlags;
    def.blendingMode = material.blendingMode;

    // Vertex color animation block
    if (vertexColorAnimationIndex > -1 && vertexColorAnimations[vertexColorAnimationIndex]) {
      var vertexColorAnimation = vertexColorAnimations[vertexColorAnimationIndex];
      def.vertexColorAnimation = vertexColorAnimation;
      def.vertexColorAnimationIndex = vertexColorAnimationIndex;
    }

    // Transparency animation block
    // TODO: Do we load multiple values based on opCount?
    var transparencyAnimationIndex = data.transparencyAnimationLookups[transparencyAnimationLookup];
    if (transparencyAnimationIndex > -1 && transparencyAnimations[transparencyAnimationIndex]) {
      var transparencyAnimation = transparencyAnimations[transparencyAnimationIndex];
      def.transparencyAnimation = transparencyAnimation;
      def.transparencyAnimationIndex = transparencyAnimationIndex;
    }

    for (var opIndex = 0; opIndex < def.opCount; ++opIndex) {
      // Texture
      var textureIndex = textureIndices[opIndex];
      var texture = textures[textureIndex];
      if (texture) {
        def.textures[opIndex] = texture;
        def.textureIndices[opIndex] = textureIndex;
      }

      // UV animation block
      var uvAnimationIndex = uvAnimationIndices[opIndex];
      var uvAnimation = uvAnimations[uvAnimationIndex];
      if (uvAnimation) {
        def.uvAnimations[opIndex] = uvAnimation;
        def.uvAnimationIndices[opIndex] = uvAnimationIndex;
      }
    }

    return def;
  }

  resolveTextureIndices(data, batchData) {
    batchData.textureIndices = [];

    for (var opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      var textureIndex = data.textureLookups[batchData.textureLookup + opIndex];
      batchData.textureIndices.push(textureIndex);
    }
  }

  resolveUVAnimationIndices(data, batchData) {
    batchData.uvAnimationIndices = [];

    for (var opIndex = 0; opIndex < batchData.opCount; opIndex++) {
      var uvAnimationIndex = data.uvAnimationLookups[batchData.uvAnimationLookup + opIndex];
      batchData.uvAnimationIndices.push(uvAnimationIndex);
    }
  }

  stubDef() {
    var def = {
      flags: null,
      shaderID: null,
      opCount: null,
      textureMapping: null,
      renderFlags: null,
      blendingMode: null,
      textures: [],
      textureIndices: [],
      uvAnimations: [],
      uvAnimationIndices: [],
      transparencyAnimation: null,
      transparencyAnimationIndex: null,
      vertexColorAnimation: null,
      vertexColorAnimationIndex: null
    };

    return def;
  }

}

exports.default = BatchManager;
module.exports = exports["default"];