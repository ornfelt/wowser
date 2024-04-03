import Unit from './unit';

class Spell extends Unit {

  constructor() {
    super();

    this.name = 'Spell';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayID = 999999;
    //this.displayID = null;
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

export default Spell;
