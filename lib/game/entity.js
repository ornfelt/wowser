'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Entity extends _events2.default {

  constructor() {
    super();
    this.guid = Math.random() * 1000000 | 0;
  }

}

exports.default = Entity;
module.exports = exports['default'];