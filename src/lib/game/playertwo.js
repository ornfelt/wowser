import Unit from './unit';

class PlayerTwo extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayID = 24101; // Proto drake
    //this.displayID = 21137; // Illidan
    //this.displayID = 11121; // Ragnaros
    //this.displayID = 8570; // Onyxia
    //this.displayID = 11380; // Nefarian
    //this.displayID = 24949; // Arthas regular
    //this.displayID = 22234; // lich king
    //this.displayID = 22235; // lich king no helmet
    //this.displayID = 24213; // lich king large
    //this.displayID = 24191; // lich king larger
    //this.displayID = 25488; // Sindragosa

    //this.displayID = 23747; // NetherDragonPurple
    //this.displayID = 19272; // Nether drake
    //this.displayID = 24794; // Mounted DK
    //this.displayID = 18945; // Al'ar
    //this.displayID = 17890; // Ashes of Al'ar

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
