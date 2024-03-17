'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Loader {

  constructor() {
    this.prefix = this.prefix || '/pipeline/';
    this.responseType = this.responseType || 'arraybuffer';
  }

  load(path) {
    return new _bluebird2.default((resolve, _reject) => {
      var uri = `${this.prefix}${path}`;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(uri), true);

      xhr.onload = function (_event) {
        // TODO: Handle failure
        if (this.status >= 200 && this.status < 400) {
          resolve(this.response);
        }
      };

      xhr.responseType = this.responseType;
      xhr.send();
    });
  }

}

exports.default = Loader;
module.exports = exports['default'];