import Unit from './unit';

class Player extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    //this.displayID = 24978; // Penguin
    this.displayID = 7550; // Skeleton
    //this.displayID = 5812; // Defias drone
    //this.displayID = 2605; // High inquisitor fairbanks
    //this.displayID = 21137; // Illidan
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
