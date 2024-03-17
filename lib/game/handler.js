'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _byteBuffer = require('byte-buffer');

var _byteBuffer2 = _interopRequireDefault(_byteBuffer);

var _bigNum = require('../crypto/big-num');

var _bigNum2 = _interopRequireDefault(_bigNum);

var _crypt = require('../crypto/crypt');

var _crypt2 = _interopRequireDefault(_crypt);

var _opcode = require('./opcode');

var _opcode2 = _interopRequireDefault(_opcode);

var _packet = require('./packet');

var _packet2 = _interopRequireDefault(_packet);

var _guid = require('../game/guid');

var _guid2 = _interopRequireDefault(_guid);

var _sha = require('../crypto/hash/sha1');

var _sha2 = _interopRequireDefault(_sha);

var _socket2 = require('../net/socket');

var _socket3 = _interopRequireDefault(_socket2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GameHandler extends _socket3.default {

  // Creates a new game handler
  constructor(session) {
    super();

    // Holds session
    this.session = session;

    // Listen for incoming data
    this.on('data:receive', this.dataReceived.bind(this));

    // Delegate packets
    this.on('packet:receive:SMSG_AUTH_CHALLENGE', this.handleAuthChallenge.bind(this));
    this.on('packet:receive:SMSG_AUTH_RESPONSE', this.handleAuthResponse.bind(this));
    this.on('packet:receive:SMSG_LOGIN_VERIFY_WORLD', this.handleWorldLogin.bind(this));
  }

  // Connects to given host through given port
  connect(host, port) {
    if (!this.connected) {
      super.connect(host, port);
      console.info('connecting to game-server @', this.host, ':', this.port);
    }
    return this;
  }

  // Finalizes and sends given packet
  send(packet) {
    var size = packet.bodySize + _packet2.default.OPCODE_SIZE_OUTGOING;

    packet.front();
    packet.writeShort(size, _byteBuffer2.default.BIG_ENDIAN);
    packet.writeUnsignedInt(packet.opcode);

    // Encrypt header if needed
    if (this._crypt) {
      this._crypt.encrypt(new Uint8Array(packet.buffer, 0, _packet2.default.HEADER_SIZE_OUTGOING));
    }

    return super.send(packet);
  }

  // Attempts to join game with given character
  join(character) {
    if (character) {
      console.info('joining game with', character.toString());

      var gp = new _packet2.default(_opcode2.default.CMSG_PLAYER_LOGIN, _packet2.default.HEADER_SIZE_OUTGOING + _guid2.default.LENGTH);
      gp.writeGUID(character.guid);
      return this.send(gp);
    }

    return false;
  }

  // Data received handler
  dataReceived(_socket) {
    while (true) {
      if (!this.connected) {
        return;
      }

      if (this.remaining === false) {

        if (this.buffer.available < _packet2.default.HEADER_SIZE_INCOMING) {
          return;
        }

        // Decrypt header if needed
        if (this._crypt) {
          this._crypt.decrypt(new Uint8Array(this.buffer.buffer, this.buffer.index, _packet2.default.HEADER_SIZE_INCOMING));
        }

        this.remaining = this.buffer.readUnsignedShort(_byteBuffer2.default.BIG_ENDIAN);
      }

      if (this.remaining > 0 && this.buffer.available >= this.remaining) {
        var size = _packet2.default.OPCODE_SIZE_INCOMING + this.remaining;
        var gp = new _packet2.default(this.buffer.readUnsignedShort(), this.buffer.seek(-_packet2.default.HEADER_SIZE_INCOMING).read(size), false);

        this.remaining = false;

        console.log('⟹', gp.toString());
        // console.debug gp.toHex()
        // console.debug gp.toASCII()

        this.emit('packet:receive', gp);
        if (gp.opcodeName) {
          this.emit(`packet:receive:${gp.opcodeName}`, gp);
        }
      } else if (this.remaining !== 0) {
        return;
      }
    }
  }

  // Auth challenge handler (SMSG_AUTH_CHALLENGE)
  handleAuthChallenge(gp) {
    console.info('handling auth challenge');

    gp.readUnsignedInt(); // (0x01)

    var salt = gp.read(4);

    var seed = _bigNum2.default.fromRand(4);

    var hash = new _sha2.default();
    hash.feed(this.session.auth.account);
    hash.feed([0, 0, 0, 0]);
    hash.feed(seed.toArray());
    hash.feed(salt);
    hash.feed(this.session.auth.key);

    var build = this.session.config.build;
    var account = this.session.auth.account;

    var size = _packet2.default.HEADER_SIZE_OUTGOING + 8 + this.session.auth.account.length + 1 + 4 + 4 + 20 + 20 + 4;

    var app = new _packet2.default(_opcode2.default.CMSG_AUTH_PROOF, size);
    app.writeUnsignedInt(build); // build
    app.writeUnsignedInt(0); // (?)
    app.writeCString(account); // account
    app.writeUnsignedInt(0); // (?)
    app.write(seed.toArray()); // client-seed
    app.writeUnsignedInt(0); // (?)
    app.writeUnsignedInt(0); // (?)
    app.writeUnsignedInt(0); // (?)
    app.writeUnsignedInt(0); // (?)
    app.writeUnsignedInt(0); // (?)
    app.write(hash.digest); // digest
    app.writeUnsignedInt(0); // addon-data

    this.send(app);

    this._crypt = new _crypt2.default();
    this._crypt.key = this.session.auth.key;
  }

  // Auth response handler (SMSG_AUTH_RESPONSE)
  handleAuthResponse(gp) {
    console.info('handling auth response');

    // Handle result byte
    var result = gp.readUnsignedByte();
    if (result === 0x0D) {
      console.warn('server-side auth/realm failure; try again');
      this.emit('reject');
      return;
    }

    if (result === 0x15) {
      console.warn('account in use/invalid; aborting');
      this.emit('reject');
      return;
    }

    // TODO: Ensure the account is flagged as WotLK (expansion //2)

    this.emit('authenticate');
  }

  // World login handler (SMSG_LOGIN_VERIFY_WORLD)
  handleWorldLogin(_gp) {
    this.emit('join');
  }

}

exports.default = GameHandler;
module.exports = exports['default'];