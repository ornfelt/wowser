import Unit from './unit';

class Player extends Unit {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayIdsList = [
      { id: 7550, name: "Skeleton" },
      { id: 24978, name: "Penguin" },
      { id: 21137, name: "Illidan" },
      //{ id: 5812, name: "Defias drone" },
      //{ id: 2605, name: "High inquisitor fairbanks" },
    ];

    this.currentDisplayIndex = 0;
    this.currentTargetIndex = 0;
    this.displayID = this.displayIdsList[this.currentDisplayIndex].id;
    this.name = this.displayIdsList[this.currentDisplayIndex].name;
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
