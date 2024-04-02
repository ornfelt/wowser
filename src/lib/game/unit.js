import THREE from 'three';

import DBC from '../pipeline/dbc';
import Entity from './entity';
import M2Blueprint from '../pipeline/m2/blueprint';

class Unit extends Entity {

  constructor() {
    super();

    this.name = '<unknown>';
    this.level = '?';
    this.target = null;

    this.maxHp = 0;
    this.hp = 0;

    this.maxMp = 0;
    this.mp = 0;

    this.rotateSpeed = 2;
    this.moveSpeed = 40;

    this._view = new THREE.Group();

    this._displayID = 0;
    this._model = null;

    this.isMoving = false;
    this.isInBetweenMovement = false;
    this.restTime = 0;
    this.inRest = false;
  }

  get position() {
    return this._view.position;
  }

  get displayID() {
    return this._displayID;
  }

  set displayID(displayID) {
    if (!displayID) {
      return;
    }

    DBC.load('CreatureDisplayInfo', displayID).then((displayInfo) => {
      this._displayID = displayID;
      this.displayInfo = displayInfo;
      const { modelID } = displayInfo;

      DBC.load('CreatureModelData', modelID).then((modelData) => {
        this.modelData = modelData;
        this.modelData.path = this.modelData.file.match(/^(.+?)(?:[^\\]+)$/)[1];
        this.displayInfo.modelData = this.modelData;

        M2Blueprint.load(this.modelData.file).then((m2) => {
          m2.displayInfo = this.displayInfo;
          this.model = m2;
        });
      });
    });
  }

  get view() {
    return this._view;
  }

  get model() {
    return this._model;
  }

  set model(m2) {
    // TODO: Should this support multiple models? Mounts?
    if (this._model) {
      this.view.remove(this._model);
    }

    // TODO: Figure out whether this 180 degree rotation is correct
    m2.rotation.z = Math.PI;
    m2.updateMatrix();

    this.view.add(m2);

    // Auto-play animation index 0 in unit model, if present
    // TODO: Properly manage unit animations
    if (m2.animated && m2.animations.length > 0) {
      //m2.animations.playAnimation(0); // swim/fly
      //m2.animations.playAnimation(1); // swim/fly
      //m2.animations.playAnimation(2); // jump
      //m2.animations.playAnimation(3); // jump
      //m2.animations.playAnimation(4); // idle

      m2.animations.playAnimation(5); // Restless idle 1
      //m2.animations.playAnimation(6); // Restless idle 2

      //m2.animations.playAnimation(7); // Walking
      //m2.animations.playAnimation(8); // Dying
      //m2.animations.playAnimation(9); // Dying
      //m2.animations.playAnimation(10); // Dead
      //m2.animations.playAnimation(11); // Running
      //m2.animations.playAnimation(12); // Getting hit
      //m2.animations.playAnimation(13); // Fly 2
      //m2.animations.playAnimation(14); // Fly 3
      //m2.animations.playAnimation(15); // Attack?
      m2.animations.playAllSequences();
    }

    this.emit('model:change', this, this._model, m2);
    this._model = m2;
  }

  playAnimationByIndex(index) {
    if (this.currentAnimation !== index) {
      if (this.currentAnimation) {
        this._model.animations.stopAnimation(this.currentAnimation);
      }
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
    }
  }

  ascend(delta) {
    this.view.translateZ(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  descend(delta) {
    this.view.translateZ(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  moveForward(delta) {
    this.view.translateX(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  moveBackward(delta) {
    this.view.translateX(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  rotateLeft(delta) {
    this.view.rotateZ(this.rotateSpeed * delta);
    this.emit('position:change', this);
  }

  rotateRight(delta) {
    this.view.rotateZ(-this.rotateSpeed * delta);
    this.emit('position:change', this);
  }

  strafeLeft(delta) {
    this.view.translateY(this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  strafeRight(delta) {
    this.view.translateY(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

}

export default Unit;
