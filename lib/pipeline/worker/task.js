'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Task {

  constructor(...args) {
    this.args = args;
    this.promise = new _bluebird2.default((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

}

exports.default = Task;
module.exports = exports['default'];