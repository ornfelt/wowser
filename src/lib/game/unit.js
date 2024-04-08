import THREE from 'three';

import DBC from '../pipeline/dbc';
import Entity from './entity';
import M2Blueprint from '../pipeline/m2/blueprint';

import Loader from '../net/loader';

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
    this.loader = new Loader();

    this.wanderNodes = [
      { x: -10559, y: -1189, z: 28 },
      { x: -10529.99003498406, y: -1159.5994375462617, z: 34.841029113612024 },
      { x: -10501.042025497547, y: -1185.1095881134734, z: 28.13749926004446 },
      { x: -10367.94, y: -1112.29, z: 21.92 },
      { x: -10473.45439806149, y: -1230.4467712665764, z: 33.73749926004446 },
      { x: -10521.560939540097, y: -1274.5943062483786, z: 39.89749926004446},
    ];
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
        //m2.animations.playAnimation(0); // swim/fly or restless idle?
        //m2.animations.playAnimation(1); // swim/fly
        //m2.animations.playAnimation(2); // jump
        //m2.animations.playAnimation(3); // jump
        //m2.animations.playAnimation(4); // idle
        if (this._displayID === 24978) {
          m2.animations.playAnimation(5); // Restless idle 1
          this.currentAnimation = 5;
        } else {
          //m2.animations.playAnimation(36); // Swim
          m2.animations.playAnimation(2); // Idle?
          this.currentAnimation = 2;
        }

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
    if (this._model && this.currentAnimation !== index) {
      //if (this.currentAnimation) {
        this._model.animations.stopAnimation(this.currentAnimation);
      //}
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
    }
  }

  playIdleAnimation() {
    var index;
    if (this._displayID === 999999) {
      index = 0
    } else if (this._displayID === 24978) {
      index = 4;
    } else {
      index = 2;
    }
    if (this.currentAnimation !== index) {
      this._model.animations.stopAnimation(this.currentAnimation);
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
    }
  }

  playMoveForwardAnimation() {
    var index;
    if (this._displayID === 999999) {
      index = 0
    } else if (this._displayID === 24978) {
      index = 11;
    } else {
      index = 0;
    }
    if (this.currentAnimation !== index) {
      this._model.animations.stopAnimation(this.currentAnimation);
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
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
    //this.printPositionInfo(delta);
    this.view.translateX(this.moveSpeed * delta);
    this.emit('position:change', this);
    //this.moveForwardIfPathExists(delta);
  }

  printPositionInfo(delta) {
    console.log("x: " + this.position.x + ", y: " + this.position.y + ", z: " + this.position.z);
    const forwardDistance = this.moveSpeed * delta;
    const forwardPosition = {
      x: this.position.x + forwardDistance,
      y: this.position.y, // Assuming movement along the X axis only for simplicity
      z: this.position.z
    };
    console.log("x: " + forwardPosition.x + ", y: " + forwardPosition.y + ", z: " + forwardPosition.z);
  }

  startWandering() {
    if (this.isMovingInPath) return;

    // Find the closest wander node
    const closestNode = this.wanderNodes.reduce((prev, curr) => {
      const prevDistance = this.position.distanceTo(new THREE.Vector3(prev.x, prev.y, prev.z));
      const currDistance = this.position.distanceTo(new THREE.Vector3(curr.x, curr.y, curr.z));
      return (prevDistance < currDistance) ? prev : curr;
    });

    // Start moving towards the closest node
    this.currentWanderIndex = this.wanderNodes.indexOf(closestNode);
    this.moveInPath(closestNode);
  }

  moveInPath(targetNode) {
    if (this.isMovingInPath) {
      return;
    }

    //const query = `calculatePath?startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&endX=${encodeURIComponent(this.targetunit.position.x)}&endY=${encodeURIComponent(this.targetunit.position.y)}&endZ=${encodeURIComponent(this.targetunit.position.z)}&mapId=${encodeURIComponent(this.mapId)}&straightPath=false`;
    const query = `calculatePath?startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&endX=${encodeURIComponent(targetNode.x)}&endY=${encodeURIComponent(targetNode.y)}&endZ=${encodeURIComponent(targetNode.z)}&mapId=${encodeURIComponent(this.mapId)}&straightPath=false`;
    this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("GOT NULL PATH!");
          this.moveInPathRequested = false;
          return;
        }
        const pathString = new TextDecoder().decode(response);
        //console.log("GOT PATHSTRING: " + pathString);
        //const pathPoints = pathString.split(";").map(point => {
        //  const [X, Y, Z] = point.split(",").map(Number);
        //  return { X, Y, Z };
        //});
        // Create position object
        const pathPoints = pathString.split(";").map(point => {
          const [x, y, z] = point.split(",").map(Number);
          return { x, y, z }; // Use lowercase property names
        });

        const epsilon = 0.1; // Tolerance for floating-point comparison
        if (pathPoints.length > 0) {
          const lastPoint = pathPoints[pathPoints.length - 1];
          if (Math.abs(lastPoint.x - targetNode.x) > epsilon ||
            Math.abs(lastPoint.y - targetNode.y) > epsilon ||
            Math.abs(lastPoint.z - targetNode.z) > epsilon) {
            console.log("Failed to find path to destination...");
            this.moveInPathRequested = false;
            return;
          }
        } else {
          console.log("Path points are empty.");
          this.moveInPathRequested = false;
          return;
        }

        this.currentPath = pathPoints;
        this.currentPathIndex = 0;
        this.isMovingInPath = true;
        this.moveInPathRequested = false;
        this.playMoveForwardAnimation();
      })
      .catch(error => {
        console.error("Failed to load navigation path:", error);
        this.moveInPathRequested = false;
      });
  }

  updatePositionInPath(delta) {
    if (!this.isMovingInPath || this.currentPathIndex >= this.currentPath.length) {
      this.isMovingInPath = false;
      return;
    }

    const nextPoint = this.currentPath[this.currentPathIndex];
    const nextPointVec = new THREE.Vector3(nextPoint.x, nextPoint.y, nextPoint.z);
    //console.log("nextPoint x: " + nextPoint.x);
    // Calculate direction to target
    var direction = new THREE.Vector3().subVectors(nextPoint, this.position);
    var distance = direction.length();
    //console.log("DIST: " + distance);

    if (distance < 2) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.currentPath.length) {
        this.isMovingInPath = false;
        this.playIdleAnimation();
        //console.log("Reached destination point!");

        if (this.isWandering) {
          this.currentWanderIndex = (this.currentWanderIndex + 1) % this.wanderNodes.length;
          //console.log("new wander node selected: " + this.currentWanderIndex);
          const nextNode = this.wanderNodes[this.currentWanderIndex];
          this.moveInPath(nextNode);
        }

        return;
      }
      const newPoint = this.currentPath[this.currentPathIndex];
      //console.log("newpoint x: " + newPoint.x);
      direction = new THREE.Vector3().subVectors(newPoint, this.position);
      distance = direction.length();
    }

    // Normalize direction and move towards target
    direction.normalize();
    if (this.currentPathIndex < this.currentPath.length-1) {
      //this.view.lookAt(nextPointVec);
      const angle = Math.atan2(direction.y, direction.x);
      this.view.rotation.z = angle;
    }
    //this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    //this.view.position.copy(this.position);
    this.view.position.add(direction.multiplyScalar((this.moveSpeed/4) * delta));
    //this.view.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    this.emit('position:change', this);
  }

  moveForwardIfPathExists(delta) {
    const forwardDistance = this.moveSpeed * delta;
    const forwardPosition = {
      x: this.position.x + forwardDistance,
      y: this.position.y, // Assuming movement along the X axis only for simplicity
      z: this.position.z
    };

    const query = `calculatePath?startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&endX=${encodeURIComponent(forwardPosition.x)}&endY=${encodeURIComponent(forwardPosition.y)}&endZ=${encodeURIComponent(forwardPosition.z)}&mapId=${encodeURIComponent(this.mapId)}&straightPath=false`;
    this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("GOT NULL PATH!");
          return;
        }
        const pathString = new TextDecoder().decode(response);
        //console.log("GOT PATHSTRING: " + pathString);
        if (pathString.length < 2) {
          console.log("Failed to find path to destination...");
          return;
        } else {
          //console.log('Valid path!');
          const pathPoints = pathString.split(";").map(point => {
            const [x, y, z] = point.split(",").map(Number);
            return { x, y, z }; // Use lowercase property names
          });

          //this.view.translateX(forwardDistance);

          const nextPoint = pathPoints[1];
          //console.log("nextPoint x: " + nextPoint.x);
          // Calculate direction to target
          var direction = new THREE.Vector3().subVectors(nextPoint, this.position);
          var distance = direction.length();
          //console.log("DIST: " + distance);

          if (distance < 2) {
            // ...
          }

          // Normalize direction and move towards target
          direction.normalize();
          //this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
          //this.view.position.copy(this.position);
          //this.view.position.add(direction.multiplyScalar((this.moveSpeed/4) * delta));
          this.view.position.add(direction.multiplyScalar(this.moveSpeed/10 * delta));

          this.emit('position:change', this);
        }
      })
      .catch(error => {
        console.error("Failed to load navigation path:", error);
      });
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

  //updatePositionInPath(delta) {
  //  if (!this.isMovingInPath || this.currentPathIndex >= this.currentPath.length) {
  //    this.isMovingInPath = false;
  //    return;
  //  }

  //  const nextPoint = this.currentPath[this.currentPathIndex];
  //  this.position.set(nextPoint.X, nextPoint.Y, nextPoint.Z);
  //  this.view.position.copy(this.position);
  //  this.currentPathIndex++;
  //  //console.log("nextPoint x: " + nextPoint.X);
  //  this.emit('position:change', this);
  //}

  //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  //moveForwardIfPathExists(delta) {
  //  const forwardDistance = this.moveSpeed * delta;
  //  const forwardPosition = {
  //    x: this.position.x + forwardDistance,
  //    y: this.position.y, // Assuming movement along the X axis only for simplicity
  //    z: this.position.z
  //  };
  //  const requestData = {
  //    mapId: 0,
  //    origin: { x: this.position.x, y: this.position.y, z: this.position.z },
  //    end: { x: forwardPosition.x, y: forwardPosition.y, z: forwardPosition.z },
  //    flags: 0
  //  };
  //
  //  fetch('http://192.168.1.176:5000/pathfinding/GetPath', {
  //    method: 'POST',
  //    headers: { 'Content-Type': 'application/json' },
  //    body: JSON.stringify(requestData)
  //  })
  //  .then(response => {
  //    if (!response.ok) {
  //      throw new Error(`An error has occurred: ${response.status}`);
  //    }
  //    return response.json();
  //  })
  //  .then(path => {
  //    if (path && path.length > 0) {
  //      console.log('Path received:', path);
  //      this.view.translateX(forwardDistance);
  //      this.emit('position:change', this);
  //    } else {
  //      console.log('No valid path received. Character does not move.');
  //    }
  //  })
  //  .catch(error => {
  //    console.error('Fetch error:', error);
  //  });
  //}

}

export default Unit;
