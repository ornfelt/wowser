import Promise from 'bluebird';

Promise.config({
  warnings: false
});

class Task {

  constructor(...args) {
    this.args = args;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

}

export default Task;
