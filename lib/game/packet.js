'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _packet = require('../net/packet');

var _packet2 = _interopRequireDefault(_packet);

var _opcode = require('./opcode');

var _opcode2 = _interopRequireDefault(_opcode);

var _guid = require('./guid');

var _guid2 = _interopRequireDefault(_guid);

var _objectUtil = require('../utils/object-util');

var _objectUtil2 = _interopRequireDefault(_objectUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GamePacket extends _packet2.default {

  // Opcode sizes in bytes for both incoming and outgoing packets


  // Header sizes in bytes for both incoming and outgoing packets
  constructor(opcode, source, outgoing = true) {
    if (!source) {
      source = outgoing ? GamePacket.HEADER_SIZE_OUTGOING : GamePacket.HEADER_SIZE_INCOMING;
    }
    super(opcode, source, outgoing);
  }

  // Retrieves the name of the opcode for this packet (if available)
  get opcodeName() {
    return _objectUtil2.default.keyByValue(_opcode2.default, this.opcode);
  }

  // Header size in bytes (dependent on packet origin)
  get headerSize() {
    if (this.outgoing) {
      return this.constructor.HEADER_SIZE_OUTGOING;
    }
    return this.constructor.HEADER_SIZE_INCOMING;
  }

  // Reads GUID from this packet
  readGUID() {
    return new _guid2.default(this.read(_guid2.default.LENGTH));
  }

  // Writes given GUID to this packet
  writeGUID(guid) {
    this.write(guid.raw);
    return this;
  }

  // // Reads packed GUID from this packet
  // // TODO: Implementation
  // readPackedGUID: ->
  //   return null

  // // Writes given GUID to this packet in packed form
  // // TODO: Implementation
  // writePackedGUID: (guid) ->
  //   return this

}

GamePacket.HEADER_SIZE_INCOMING = 4;
GamePacket.HEADER_SIZE_OUTGOING = 6;
GamePacket.OPCODE_SIZE_INCOMING = 2;
GamePacket.OPCODE_SIZE_OUTGOING = 4;
exports.default = GamePacket;
module.exports = exports['default'];