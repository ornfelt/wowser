"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ContentQueue {

  constructor(processor, interval = 1, workFactor = 1, minWork = 1) {
    this.processor = processor;

    this.interval = interval;
    this.workFactor = workFactor;
    this.minWork = minWork;

    this.queue = new Map();

    this.schedule = this.schedule.bind(this);
    this.run = this.run.bind(this);

    this.schedule();
  }

  has(key) {
    return this.queue.has(key);
  }

  add(key, job) {
    if (this.queue.has(key)) {
      return;
    }

    this.queue.set(key, job);
  }

  remove(key) {
    var count = 0;

    if (this.queue.has(key)) {
      this.queue.delete(key);
      count++;
    }

    return count;
  }

  schedule() {
    setTimeout(this.run, this.interval);
  }

  run() {
    var count = 0;
    var max = Math.min(this.queue.size * this.workFactor, this.minWork);

    for (var entry of this.queue) {
      var [key, job] = entry;

      this.processor(job);
      this.queue.delete(key);

      count++;

      if (count > max) {
        break;
      }
    }

    this.schedule();
  }

  clear() {
    this.queue.clear();
  }

}

exports.default = ContentQueue;
module.exports = exports["default"];