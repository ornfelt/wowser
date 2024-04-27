import Unit from './unit';

class Player extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayIdsList = [
      7550, // Skeleton
      24978, // Penguin
      21137 // Illidan
      //5812, // Defias drone
      //2605, // High inquisitor fairbanks
    ];

    this.currentDisplayIndex = 0;
    this.currentTargetIndex = 0;
    this.displayID = this.displayIdsList[this.currentDisplayIndex]; // Skeleton
    this.mapID = null;
  }

  worldport(mapID, x, y, z) {
    if (!this.mapID || this.mapID !== mapID) {
      this.mapID = mapID;
      this.emit('map:change', mapID);
    }

    this.position.set(x, y, z);
    this.emit('position:change', this);
  }

}

export default Player;
