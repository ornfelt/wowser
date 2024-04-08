import Promise from 'bluebird';

class Loader {

  constructor() {
    this.prefix = this.prefix || '/pipeline/';
    this.responseType = this.responseType || 'arraybuffer';
  }

  load(path) {
    return new Promise((resolve, _reject) => {
      const uri = `${this.prefix}${path}`;

      const xhr = new XMLHttpRequest();
      xhr.open('GET', encodeURI(uri), true);

      xhr.onload = function(_event) {
        // TODO: Handle failure
        if (this.status >= 200 && this.status < 400) {
          resolve(this.response);
        }
      };

      xhr.responseType = this.responseType;
      xhr.send();
    });
  }

  // Not used
  post(path, body) {
    return new Promise((resolve, reject) => {
      const uri = `${this.prefix}${path}`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', encodeURI(uri), true);
      xhr.responseType = this.responseType;
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          resolve(this.response);
        } else {
          reject(new Error('Request failed: ' + this.statusText));
        }
      };

      xhr.onerror = function() {
        reject(new Error('Request failed'));
      };

      xhr.send(JSON.stringify(body));
    });
  }

}

export default Loader;
