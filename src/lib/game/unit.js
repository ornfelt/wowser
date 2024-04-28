import THREE from 'three';

import DBC from '../pipeline/dbc';
import Entity from './entity';
import M2Blueprint from '../pipeline/m2/blueprint';

import Loader from '../net/loader';

class Unit extends Entity {

  constructor() {
    super();

    this.name = '<unknown>';
    //this.level = '?';
    this.level = '5';
    this.target = null;

    this.maxHp = 100;
    this.hp = 100;

    this.maxMp = 100;
    this.mp = 100;

    this.rotateSpeed = 2;
    this.moveSpeed = 10;
    //this.gravity = -9.81; // m/s^2
    this.gravity = -25.0;
    this.jumpSpeed = 10;
    this.jumpPeak = 4;
    this.originalZ = 0.0;
    this.currentJumpVelocity = 0;

    this._view = new THREE.Group();

    this._displayID = 0;
    this._model = null;

    this.isJumping = false;
    this.isMoving = false;
    this.isInBetweenMovement = false;
    this.restTime = 0;
    this.inRest = false;

    this.isCasting = false;
    this.castTick = 0;
    this.loader = new Loader();
    this.usePhysics = true;

    this.wanderNodes = [
      { x: -10559, y: -1189, z: 28 },
      { x: -10529.99003498406, y: -1159.5994375462617, z: 34.841029113612024 },
      { x: -10501.042025497547, y: -1185.1095881134734, z: 28.13749926004446 },
      { x: -10367.94, y: -1112.29, z: 21.92 },
      { x: -10473.45439806149, y: -1230.4467712665764, z: 33.73749926004446 },
      { x: -10521.560939540097, y: -1274.5943062483786, z: 39.89749926004446},
    ];

    //this.wanderNodes = [
    //  { x: -10559, y: -1189, z: 28 },
    //  { x: -14354.0, y: 518.0, z: 22.0 }, // Booty bay
    //  { x: -4651.0, y: -3316.0, z: 296.0 }, // Stonewrought Dom
    //];
  }

  get position() {
    return this._view.position;
  }

  setNewDisplayID(displayID) {
    this.displayID = displayID;
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
          M2Blueprint.load(this.spellFile).then((m2) => {

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
            if (this.isHideAtStart) {
              this._model.visible = false;
            }
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

  playJumpAnimation() {
    var index;
    if (this._displayID === 999999) {
      index = 0
    } else if (this._displayID === 24978) {
      index = 2;
    } else if (this._displayID === 21137) {
      //index = 12; // Huuge fly jump
      index = 32;
    } else {
      //index = 40; // Cool sword swing spin
      //index = 35; // lol falling
      index = 32;
    }
    if (this._model && this.currentAnimation !== index) {
      this._model.animations.stopAnimation(this.currentAnimation);
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
    } else if (this._displayID === 21137) {
      //index = 4; // Flying idle
      //index = 6; // Cool kneel idle
      index = 13; // Cool kneel idle
    } else {
      index = 2;
    }
    if (this._model && this.currentAnimation !== index) {
      this._model.animations.stopAnimation(this.currentAnimation);
      this._model.animations.playAnimation(index);
      this.currentAnimation = index;
    }
  }

  playMoveForwardAnimation() {
    if (this.isJumping)
      return;
    var index;
    if (this._displayID === 999999) {
      index = 0
    } else if (this._displayID === 24978) {
      index = 11;
    } else if (this._displayID === 21137) {
      index = 15;
    } else {
      index = 0;
    }
    if (this._model && this.currentAnimation !== index) {
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
      //if (this.isCasting || this.targetunit.isCasting) {
      //  return;
      //}
      //this.spell.setVisible(!this.spell.getVisible());
      this.spell.position.copy(this.position);
      this.spell.view.rotation.z = this.view.rotation.z;
      this.spell.setVisible(true);
      //this.setTargetPositionInFront(25); // Old test code for casting spell forward
      this.spell.targetPosition = this.targetunit.position;
  }

  castSpellByIndex(idx) {
    // TODO: should check if casting this specific spell (not any spell)
    //if (this.isCasting || this.targetunit.isCasting) {
    //    return;
    //}

    // Select a random spell from the list
    const chosenSpell = this.spell_list[idx];
    if (chosenSpell.isCasting || !this.target) {
      return;
    }
    this.mp -= 5;
    chosenSpell.isCasting = true;
    this.spell = chosenSpell;

    chosenSpell.position.copy(this.position);
    chosenSpell.view.rotation.z = this.view.rotation.z;
    chosenSpell.setVisible(true);
    chosenSpell.targetPosition = this.targetunit.position;
  }

  castRandomSpell() {
    if (this.isCasting || this.targetunit.isCasting) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * this.spell_list.length);
    const randomSpell = this.spell_list[randomIndex];
    this.spell = randomSpell;

    randomSpell.position.copy(this.position);
    randomSpell.view.rotation.z = this.view.rotation.z;
    randomSpell.setVisible(true);

    randomSpell.targetPosition = this.targetunit.position;
  }

  updateSpellPosition(delta) {
    if (!this.isCasting) return;

    // Calculate direction to target
    let direction = new THREE.Vector3().subVectors(this.spell.targetPosition, this.spell.position);
    let distance = direction.length();

    const angle = Math.atan2(direction.y, direction.x);
    this.spell.view.rotation.z = angle;

    if (distance < 1) {
      //this.isCasting = false;
      this.stopCastSpell();
      this.targetunit.hp -= 5;
      if (this.targetunit.hp < 0) {
        this.targetunit.hp = 0;
      }
      this.spell.isCasting = false;
      return;
    }

    // Normalize direction and move towards target
    direction.normalize();
    //this.spell.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    this.spell.position.add(direction.multiplyScalar(this.moveSpeed*3 * delta));
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
    if (this.usePhysics) {
      if (!this.isJumping) {
        this.isJumping = true;
        this.originalZ = this.view.position.z;
        this.currentJumpVelocity = this.jumpSpeed;
        this.updateJumpPosition(delta);
      }
    } else {
      this.view.translateZ(this.moveSpeed * delta);
      this.emit('position:change', this);
    }
  }

  updateJumpPosition(delta) {
    if (this.isMovingForward) {
      //this.jumpSpeed = 20;
    } else {
      //this.jumpPeak = 3;
      this.gravity = -25.0;
      this.jumpPeak = 4;
      //this.jumpSpeed = 10;
    }
    this.view.position.z += this.currentJumpVelocity * delta;
    this.currentJumpVelocity += this.gravity * delta;

    if (this.currentJumpVelocity <= 0 && this.view.position.z >= this.originalZ + this.jumpPeak) {
      this.currentJumpVelocity = -this.jumpSpeed;
    }

    if (this.view.position.z <= this.originalZ) {
      this.view.position.z = this.originalZ;
      this.isJumping = false;
      this.jumpingForward = false;
      if (this.isMoving) {
        this.playMoveForwardAnimation();
      } else {
        this.playIdleAnimation();
      }
    }

    this.emit('position:change', this);
  }

  descend(delta) {
    this.view.translateZ(-this.moveSpeed * delta);
    this.emit('position:change', this);
  }

  moveForward(delta) {
    //this.printPositionInfo(delta);
    if (this.usePhysics) {
      this.moveForwardIfPathExists(delta);
    } else {
      this.view.translateX(this.moveSpeed * delta);
      this.emit('position:change', this);
    }
  }

  teleportTo(pos) {
    this.view.position.copy(pos);
    this.emit('position:change', this);
  }

  printPositionInfo(delta) {
    console.log("x: " + this.position.x + ", y: " + this.position.y + ", z: " + this.position.z);
    console.log("rotation: " + this.view.rotation.z);
    const forwardDistance = this.moveSpeed * delta;
    const forwardPosition = {
      x: this.position.x + forwardDistance,
      y: this.position.y, // Assuming movement along the X axis only for simplicity
      z: this.position.z
    };
    console.log("x: " + forwardPosition.x + ", y: " + forwardPosition.y + ", z: " + forwardPosition.z);
  }

  startWandering(useSql) {
    if (this.isMovingInPath) return;

    this.useSql = useSql;

    if (!useSql) {
      // Find the closest wander node from static list
      const closestNode = this.wanderNodes.reduce((prev, curr) => {
        const prevDistance = this.position.distanceTo(new THREE.Vector3(prev.x, prev.y, prev.z));
        const currDistance = this.position.distanceTo(new THREE.Vector3(curr.x, curr.y, curr.z));
        return (prevDistance < currDistance) ? prev : curr;
      });

      // Start moving towards the closest node
      this.currentWanderIndex = this.wanderNodes.indexOf(closestNode);
      this.moveInPath(closestNode);
    } else {
      // Use sql instead:
      this.getClosestNode().then(nodePosition => {
        if (nodePosition) {
          console.log('Closest node:', nodePosition);
          this.moveInPath(nodePosition);
        } else {
          console.log('No node was found or there was an error');
        }
      });
    }
  }

  getClosestNode() {
    const query = `getClosestNode?x=${encodeURIComponent(this.position.x)}&y=${encodeURIComponent(this.position.y)}&z=${encodeURIComponent(this.position.z)}`;
    // Return the Promise from this method
    return this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("got null node!");
          return null;
        }
        const nodeData = JSON.parse(new TextDecoder().decode(response));
        if (nodeData) {
          this.nodeIndex = nodeData.id;
          //console.log("Linked node:", {...nodeData});
          return { x: nodeData.x, y: nodeData.y, z: nodeData.z };
        }
        return null;
      })
      .catch(error => {
        console.error("Failed to load closest node:", error);
        return null;
      });
  }

  getNewNode() {
    const query = `getClosestNode?node_id=${encodeURIComponent(this.nodeIndex)}`;
    return this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("GOT NULL NODE!");
          return null;
        }
        //const pathString = new TextDecoder().decode(response);
        //console.log("Linked node: " + pathString);
        const nodeData = JSON.parse(new TextDecoder().decode(response));
        //console.log("Linked node: " + JSON.stringify(nodeData, null, 2));
        //console.log("Linked node:", nodeData);
        //console.log("Linked node:", {...nodeData});
        //const { id, mapid, x, y, z, links } = nodeData;
        //console.log(`Linked node: id=${id}, mapid=${mapid}, x=${x}, y=${y}, z=${z}, links=${links}`);
        this.nodeIndex = nodeData.id;
        if (nodeData) {
          this.nodeIndex = nodeData.id;
          return { x: nodeData.x, y: nodeData.y, z: nodeData.z };
        }
        return null;
      })
      .catch(error => {
        //console.error("Failed to load closest node: "+ error);
        return null;
      });
  }

  moveInPath(targetNode, forceDest=false) {
    if (this.isMovingInPath) {
      return;
    }

    const straightPathValue = forceDest ? "true" : "false";
    const query = `calculatePath?startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&endX=${encodeURIComponent(targetNode.x)}&endY=${encodeURIComponent(targetNode.y)}&endZ=${encodeURIComponent(targetNode.z)}&mapId=${encodeURIComponent(this.mapId)}&straightPath=${straightPathValue}&hoverHeight=${encodeURIComponent(0.0)}&objectSize=${encodeURIComponent(3.0)}&collisionHeight=${encodeURIComponent(5.0)}&dist=${encodeURIComponent(1.0)}`;
    this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("GOT NULL PATH!");
          this.moveInPathRequested = false;
          return;
        }
        const pathString = new TextDecoder().decode(response);
        //console.log("Got pathString: " + pathString);
        //const pathPoints = pathString.split(";").map(point => {
        //  const [X, Y, Z] = point.split(",").map(Number);
        //  return { X, Y, Z };
        //});
        // Create position object
        const pathPoints = pathString.split(";").map(point => {
          const [x, y, z] = point.split(",").map(Number);
          return { x, y, z }; // Use lowercase property names
        });
        console.log("Path length: " + pathPoints.length);

        //const epsilon = 0.1; // Tolerance for floating-point comparison
        const epsilon = 30.0; // Tolerance for floating-point comparison
        var direction;
        var distance;
        if (pathPoints.length > 2) {
          const lastPoint = pathPoints[pathPoints.length - 1];
          direction = new THREE.Vector3().subVectors(lastPoint, this.position);
          distance = direction.length();
          //console.log("Distance to next node: " + distance);

          //if (Math.abs(lastPoint.x - targetNode.x) > epsilon ||
          //  // Less strict validation of Z in case of model height and when
          //  // wrong map is used z might be -500...
          //  Math.abs(lastPoint.y - targetNode.y) > epsilon ||
          //  Math.abs(lastPoint.z - targetNode.z) > 30.0) {
          //  console.log("Failed to find path to destination...");
          //  console.log("lastPoint: " + lastPoint.x + ", " + lastPoint.y + ", " + lastPoint.z);
          //  console.log("targetNode: " + targetNode.x + ", " + targetNode.y + ", " + targetNode.z);
          //  this.moveInPathRequested = false;
          //  return;
          //}
        } else {
          console.log("Path points are empty / too short: " + pathPoints.length);
          this.moveInPathRequested = false;
          this.isMovingInPath = false;
          this.playIdleAnimation();
          if (this.useSql) {
            const lastPoint = pathPoints[pathPoints.length - 1];
            direction = new THREE.Vector3().subVectors(lastPoint, this.position);
            distance = direction.length();
            console.log("Distance to next node would've been: " + distance);
            this.getNewNode().then(nodePosition => {
              if (nodePosition) {
                this.moveInPath(nodePosition);
              } else {
                console.log('No node was found or there was an error');
              }
            });
          }
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
          if (this.useSql) {
            this.getNewNode().then(nodePosition => {
              if (nodePosition) {
                this.moveInPath(nodePosition);
              } else {
                console.log('No node was found or there was an error');
              }
            });
          } else {
            this.currentWanderIndex = (this.currentWanderIndex + 1) % this.wanderNodes.length;
            //console.log("new wander node selected: " + this.currentWanderIndex);
            const nextNode = this.wanderNodes[this.currentWanderIndex];
            this.moveInPath(nextNode);
          }
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
    //this.view.position.add(direction.multiplyScalar((this.moveSpeed/4) * delta));
    this.view.position.add(direction.multiplyScalar(this.moveSpeed * delta));
    this.emit('position:change', this);
  }

  moveForwardIfPathExists(delta) {
    const angle = this.view.rotation.z;
    //const forwardDistance = 10.0;
    //const forwardPosition = {
    //  x: this.position.x + forwardDistance * Math.cos(angle),
    //  y: this.position.y + forwardDistance * Math.sin(angle),
    //  z: this.position.z
    //};

    //const query = `calculatePath?startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&endX=${encodeURIComponent(forwardPosition.x)}&endY=${encodeURIComponent(forwardPosition.y)}&endZ=${encodeURIComponent(forwardPosition.z)}&mapId=${encodeURIComponent(this.mapId)}&straightPath=false`;
    var travelDist = 0.5;
    //var travelDist = 1;
    //if (this.isJumping)
    //  travelDist = 3;
    const query = `calculatePath?mapId=${encodeURIComponent(this.mapId)}&startX=${encodeURIComponent(this.position.x)}&startY=${encodeURIComponent(this.position.y)}&startZ=${encodeURIComponent(this.position.z)}&angle=${encodeURIComponent(angle)}&hoverHeight=${encodeURIComponent(0.0)}&objectSize=${encodeURIComponent(5.0)}&collisionHeight=${encodeURIComponent(5.0)}&dist=${encodeURIComponent(travelDist)}`;
    this.loader.load(query)
      .then(response => {
        if (!response) {
          console.log("GOT NULL PATH!");
          return;
        }
        const pathString = new TextDecoder().decode(response);
        //console.log("Got pathString: " + pathString);
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
          //const nextPoint = pathPoints[1]; // This is useful if using calculatePath (with the commented query above)
          const nextPoint = pathPoints[0];
          //console.log("nextPoint x: " + nextPoint.x);

          // Calculate direction to target
          //var direction = new THREE.Vector3().subVectors(nextPoint, this.position);
          var direction = new THREE.Vector3().subVectors(nextPoint, this.view.position);
          var distance = direction.length();
          if (distance < 0.01) {
            // Got same position...
            //console.log("CAN'T MOVE FORWARD: " + distance + ", angle: " + angle);
            //console.log("curr pos x: " + this.position.x + ", y: " + this.position.y + ", z: " + this.position.z);
            //console.log("NEXTPOINT x: " + nextPoint.x + ", y: " + nextPoint.y + ", z: " + nextPoint.z);
            return;
          }

          // Normalize direction and move towards target
          direction.normalize();
          //this.position.add(direction.multiplyScalar(this.moveSpeed * delta));
          //this.view.position.copy(nextPoint);
          this.view.position.add(direction.multiplyScalar(this.moveSpeed * delta));
          if (this.isJumping) {
            this.originalZ = nextPoint.z;
            this.view.position.z += this.currentJumpVelocity * delta;
          }

          if (!this.isJumping) {
            this.emit('position:change', this);
          }
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
