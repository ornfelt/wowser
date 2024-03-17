'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _unit = require('./unit');

var _unit2 = _interopRequireDefault(_unit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Player extends _unit2.default {

  constructor() {
    super();

    this.name = 'Player';
    this.hp = this.hp;
    this.mp = this.mp;

    this.target = null;

    this.displayID = 24978;
    //this.displayID = 7550;
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

exports.default = Player;
module.exports = exports['default'];