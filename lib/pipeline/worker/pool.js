'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkerPool = undefined;

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var _thread = require('./thread');

var _thread2 = _interopRequireDefault(_thread);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class WorkerPool {

  constructor(concurrency = this.defaultConcurrency) {
    this.concurrency = concurrency;
    this.queue = [];
    this.threads = [];

    this.next = this.next.bind(this);
  }

  get defaultConcurrency() {
    return navigator.hardwareConcurrency || 4;
  }

  get thread() {
    var thread = this.threads.find(current => current.idle);
    if (thread) {
      return thread;
    }

    if (this.threads.length < this.concurrency) {
      thread = new _thread2.default();
      this.threads.push(thread);
      return thread;
    }
  }

  enqueue(...args) {
    var task = new _task2.default(...args);
    this.queue.push(task);
    this.next();
    return task.promise;
  }

  next() {
    if (this.queue.length) {
      var thread = this.thread;
      if (thread) {
        var task = this.queue.shift();
        thread.execute(task).then(this.next).catch(this.next);
      }
    }
  }

}

exports.WorkerPool = WorkerPool;
exports.default = new WorkerPool();