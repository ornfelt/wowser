'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _worker = require('worker!./');

var _worker2 = _interopRequireDefault(_worker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Thread {

  constructor() {
    this._onMessage = this._onMessage.bind(this);

    this.worker = new _worker2.default();
    this.worker.addEventListener('message', this._onMessage);
  }

  get busy() {
    return !!this.task;
  }

  get idle() {
    return !this.busy;
  }

  execute(task) {
    this.task = task;
    this.worker.postMessage(task.args);
    return this.task.promise;
  }

  _onMessage(event) {
    var [success, ...args] = event.data;
    if (success) {
      this.task.resolve(args);
    } else {
      this.task.reject(args);
    }
    this.task = null;
  }

}

exports.default = Thread;
module.exports = exports['default'];