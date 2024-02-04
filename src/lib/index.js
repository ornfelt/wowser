import EventEmitter from 'events';

import Config from './config';
import GameHandler from './game/handler';
import Player from './game/player';
import WorldHandler from './game/world/handler';

class Client extends EventEmitter {

  constructor(config) {
    super();

    this.config = config || new Config();
    this.game = new GameHandler(this);
    this.player = new Player();
    this.world = new WorldHandler(this);
  }

}

export default Client;
