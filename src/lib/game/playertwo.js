import Unit from './unit';

class PlayerTwo extends Unit {

  //constructor() {
  constructor(displayID = 19272) {
    super();

    this.name = 'Player2';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;
    this.displayID = displayID;
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

export default PlayerTwo;
