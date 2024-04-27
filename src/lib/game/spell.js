import Unit from './unit';

class Spell extends Unit {

  //constructor() {
  constructor(spellFile = "spells\\meteor_ball_missile.m2") {
    super();

    this.name = 'Spell';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    //this.spellId = spellId;
    this.spellFile = spellFile;
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
