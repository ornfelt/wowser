'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _bigNum = require('./big-num');

var _bigNum2 = _interopRequireDefault(_bigNum);

var _sha = require('./hash/sha1');

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Secure Remote Password
// http://tools.ietf.org/html/rfc2945
class SRP {

  // Creates new SRP instance with given constant prime and generator
  constructor(N, g) {

    // Constant prime (N)
    this._N = _bigNum2.default.fromArray(N);

    // Generator (g)
    this._g = _bigNum2.default.fromArray(g);

    // Client salt (provided by server)
    this._s = null;

    // Salted authentication hash
    this._x = null;

    // Random scrambling parameter
    this._u = null;

    // Derived key
    this._k = new _bigNum2.default(3);

    // Server's public ephemeral value (provided by server)
    this._B = null;

    // Password verifier
    this._v = null;

    // Client-side session key
    this._S = null;

    // Shared session key
    this._K = null;

    // Client proof hash
    this._M1 = null;

    // Expected server proof hash
    this._M2 = null;

    while (true) {

      // Client's private ephemeral value (random)
      this._a = _bigNum2.default.fromRand(19);

      // Client's public ephemeral value based on the above
      // A = g ^ a mod N
      this._A = this._g.modPow(this._a, this._N);

      if (!this._A.mod(this._N).equals(_bigNum2.default.ZERO)) {
        break;
      }
    }
  }

  // Retrieves client's public ephemeral value
  get A() {
    return this._A;
  }

  // Retrieves the session key
  get K() {
    return this._K;
  }

  // Retrieves the client proof hash
  get M1() {
    return this._M1;
  }

  // Feeds salt, server's public ephemeral value, account and password strings
  feed(s, B, I, P) {

    // Generated salt (s) and server's public ephemeral value (B)
    this._s = _bigNum2.default.fromArray(s);
    this._B = _bigNum2.default.fromArray(B);

    // Authentication hash consisting of user's account (I), a colon and user's password (P)
    // auth = H(I : P)
    var auth = new _sha2.default();
    auth.feed(I);
    auth.feed(':');
    auth.feed(P).finalize();

    // Salted authentication hash consisting of the salt and the authentication hash
    // x = H(s | auth)
    var x = new _sha2.default();
    x.feed(this._s.toArray());
    x.feed(auth.digest);
    this._x = _bigNum2.default.fromArray(x.digest);

    // Password verifier
    // v = g ^ x mod N
    this._v = this._g.modPow(this._x, this._N);

    // Random scrambling parameter consisting of the public ephemeral values
    // u = H(A | B)
    var u = new _sha2.default();
    u.feed(this._A.toArray());
    u.feed(this._B.toArray());
    this._u = _bigNum2.default.fromArray(u.digest);

    // Client-side session key
    // S = (B - (kg^x)) ^ (a + ux)
    var kgx = this._k.multiply(this._g.modPow(this._x, this._N));
    var aux = this._a.add(this._u.multiply(this._x));
    this._S = this._B.subtract(kgx).modPow(aux, this._N);

    // Store odd and even bytes in separate byte-arrays
    var S = this._S.toArray();
    var S1 = [];
    var S2 = [];
    for (var i = 0; i < 16; ++i) {
      S1[i] = S[i * 2];
      S2[i] = S[i * 2 + 1];
    }

    // Hash these byte-arrays
    var S1h = new _sha2.default();
    var S2h = new _sha2.default();
    S1h.feed(S1).finalize();
    S2h.feed(S2).finalize();

    // Shared session key generation by interleaving the previously generated hashes
    this._K = [];
    for (var _i = 0; _i < 20; ++_i) {
      this._K[_i * 2] = S1h.digest[_i];
      this._K[_i * 2 + 1] = S2h.digest[_i];
    }

    // Generate username hash
    var userh = new _sha2.default();
    userh.feed(I).finalize();

    // Hash both prime and generator
    var Nh = new _sha2.default();
    var gh = new _sha2.default();
    Nh.feed(this._N.toArray()).finalize();
    gh.feed(this._g.toArray()).finalize();

    // XOR N-prime and generator
    var Ngh = [];
    for (var _i2 = 0; _i2 < 20; ++_i2) {
      Ngh[_i2] = Nh.digest[_i2] ^ gh.digest[_i2];
    }

    // Calculate M1 (client proof)
    // M1 = H( (H(N) ^ H(G)) | H(I) | s | A | B | K )
    this._M1 = new _sha2.default();
    this._M1.feed(Ngh);
    this._M1.feed(userh.digest);
    this._M1.feed(this._s.toArray());
    this._M1.feed(this._A.toArray());
    this._M1.feed(this._B.toArray());
    this._M1.feed(this._K);
    this._M1.finalize();

    // Pre-calculate M2 (expected server proof)
    // M2 = H( A | M1 | K )
    this._M2 = new _sha2.default();
    this._M2.feed(this._A.toArray());
    this._M2.feed(this._M1.digest);
    this._M2.feed(this._K);
    this._M2.finalize();
  }

  // Validates given M2 with expected M2
  validate(M2) {
    if (!this._M2) {
      return false;
    }
    return (0, _deepEqual2.default)(M2.toArray(), this._M2.digest);
  }

}

exports.default = SRP;
module.exports = exports['default'];