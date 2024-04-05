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

    this.isCasting = false;
    this.castTick = 0;
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

    // Spells
    if (displayID === 999999) {
          this._displayID = displayID;
          //M2Blueprint.load("spells\\frostbolt.m2").then((m2) => {
          M2Blueprint.load("spells\\meteor_ball_missile.m2").then((m2) => { // COOL
          //M2Blueprint.load("spells\\pyroblast_missile.m2").then((m2) => {
          //M2Blueprint.load("spells\\blizzard_impact_base.m2").then((m2) => {
          //M2Blueprint.load("spells\\shaman_thunder.m2").then((m2) => {
          //M2Blueprint.load("spells\\chainlightning_fel_impact_chest.m2").then((m2) => {
          //M2Blueprint.load("spells\\chainlightning_impact_chest.m2").then((m2) => {
          //M2Blueprint.load("spells\\ice_missile_high.m2").then((m2) => {
          //M2Blueprint.load("spells\\lightningbolt_missile.m2").then((m2) => {
          //M2Blueprint.load("spells\\missile_wave_arcane.m2").then((m2) => {
          //M2Blueprint.load("spells\\missile_wave_fire.m2").then((m2) => {
          //M2Blueprint.load("spells\\icespike_impact_new.m2").then((m2) => {
          //M2Blueprint.load("spells\\groundspike_impact.m2").then((m2) => {
          //M2Blueprint.load("spells\\rag_firenova_area.m2").then((m2) => {
          //M2Blueprint.load("spells\\arcaneexplosion_base.m2").then((m2) => {
          //M2Blueprint.load("spells\\waterbolt_missile_low.m2").then((m2) => {
          //M2Blueprint.load("spells\\fire_form_precast.m2").then((m2) => {
          //M2Blueprint.load("spells\\fireball_missile_high.m2").then((m2) => {
          //M2Blueprint.load("spells\\fireball_blue_missile_high.m2").then((m2) => {

          //M2Blueprint.load("spells\\fel_fireball_missile_high.m2").then((m2) => {
          //M2Blueprint.load("spells\\fel_firebolt_missile_low.m2").then((m2) => {
          //M2Blueprint.load("spells\\fel_pyroblast_missile.m2").then((m2) => {
          //M2Blueprint.load("spells\\firebolt_missile_low.m2").then((m2) => {
          //M2Blueprint.load("spells\\firebomb_missle.m2").then((m2) => { // LIKE A SUN
          //M2Blueprint.load("spells\\arcanebomb_missle.m2").then((m2) => {
          //M2Blueprint.load("spells\\missile_bomb.m2").then((m2) => { // small...
          //M2Blueprint.load("spells\\firenova_area.m2").then((m2) => {
          //M2Blueprint.load("spells\\ice_nova.m2").then((m2) => { // CRAZY BIG
          //M2Blueprint.load("spells\\lightning_ring_nova.m2").then((m2) => {
          //M2Blueprint.load("spells\\shadow_nova_area.m2").then((m2) => {
          //M2Blueprint.load("spells\\water_nova.m2").then((m2) => {

          this.model = m2;
          this._model.visible = false;
        });
    } else {
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

      if (this._displayID === 999999) {
        m2.animations.playAnimation(0); // Restless idle 1
      } else {
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
      }
      m2.animations.playAllSequences();
    }

    this.emit('model:change', this, this._model, m2);
    this._model = m2;
  }

  playAnimationByIndex(index) {
    if (this._model) {
    if (this.currentAnimation !== index) {
      if (this.currentAnimation) {
        this._model.animations.stopAnimation(this.currentAnimation);
      }
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
    }
    }
  }

  setTargetPositionInFront(distance) {
    //const forward = new THREE.Vector3(0, 0, -1); // Beneath
    const forward = new THREE.Vector3(1, 0, 0);
    forward.transformDirection(this.view.matrixWorld);

    // Scale the forward vector by the desired distance
    forward.multiplyScalar(distance);

    // Add the scaled forward vector to the spell's current position to get the target position
    //const targetPosition = this.spell._model.position.clone().add(forward);
    const targetPosition = this.spell.position.clone().add(forward);

    // Set the target position
    this.spell.targetPosition = targetPosition;
  }

  castSpell() {
      if (this.isCasting) {
        return;
      }
      //this.spell.setVisible(!this.spell.getVisible());
      this.spell.position.copy(this.position);
      this.spell.view.rotation.z = this.view.rotation.z;
      this.spell.setVisible(true);
      //this.spell.targetPosition = new THREE.Vector3(-10559, -1189, 28);
      //this.spell.targetPosition = player2.position; // TODO
      //this.setTargetPositionInFront(25);
      this.spell.targetPosition = this.targetunit.position;
  }

  updateSpellPosition(delta) {
    if (!this.isCasting) return;

    // Calculate direction to target
    let direction = new THREE.Vector3().subVectors(this.spell.targetPosition, this.spell.position);
    let distance = direction.length();

    if (distance < 1) {
      this.isCasting = false;
      this.stopCastSpell();
      return;
    }

    // Normalize direction and move towards target
    direction.normalize();
    this.spell.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    this.emit('position:change', this);
  }

  stopCastSpell() {
      this.spell.setVisible(false);
  }

  setVisible(visibility) {
      //this.view.remove(this._model);
      this._model.visible = visibility;
  }

  getVisible() {
    return this._model ? this._model.visible : false;
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
