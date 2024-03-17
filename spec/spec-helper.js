"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.expect = void 0;
Object.defineProperty(exports, "sinon", {
  enumerable: true,
  get: function get() {
    return _sinon["default"];
  }
});
var _sinonChai = _interopRequireDefault(require("sinon-chai"));
var _chai = _interopRequireDefault(require("chai"));
var _sinon = _interopRequireDefault(require("sinon"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
_chai["default"].use(_sinonChai["default"]);
beforeEach(function () {
  this.sandbox = _sinon["default"].sandbox.create();
});
afterEach(function () {
  this.sandbox.restore();
});
var expect = exports.expect = _chai["default"].expect;