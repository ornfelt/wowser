'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _handler = require('./game/handler');

var _handler2 = _interopRequireDefault(_handler);

var _player = require('./game/player');

var _player2 = _interopRequireDefault(_player);

var _handler3 = require('./game/world/handler');

var _handler4 = _interopRequireDefault(_handler3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Client extends _events2.default {

  constructor(config) {
    super();

    this.config = config || new _config2.default();
    this.game = new _handler2.default(this);
    this.player = new _player2.default();
    this.world = new _handler4.default(this);
  }

}

exports.default = Client;
module.exports = exports['default'];