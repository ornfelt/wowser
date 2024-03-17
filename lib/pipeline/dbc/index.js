'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pool = require('../worker/pool');

var _pool2 = _interopRequireDefault(_pool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DBC {

  constructor(data) {
    this.data = data;
    this.records = data.records;
    this.index();
  }

  index() {
    this.records.forEach(function (record) {
      if (record.id === undefined) {
        return;
      }
      this[record.id] = record;
    }.bind(this));
  }

  static load(name, id) {
    if (!(name in this.cache)) {
      this.cache[name] = _pool2.default.enqueue('DBC', name).then(args => {
        var [data] = args;
        return new this(data);
      });
    }

    if (id !== undefined) {
      return this.cache[name].then(function (dbc) {
        // idk why this is needed really
        var specialMapIds = [29, 30, 33, 36, 37, 47, 169, 209, 289, 309, 469, 489, 509, 529, 530, 531, 543, 559, 560, 562, 564, 566, 568, 572, 574, 575, 578, 580, 585, 595, 599, 600, 601, 602, 603, 604, 607, 608, 615, 616, 617, 618, 619, 624, 628, 631, 632, 649, 650, 658, 723, 724];
        if (specialMapIds.includes(id)) {
          id = 0;
        }
        return dbc[id];
      });
    }

    return this.cache[name];
  }

}

DBC.cache = {};
exports.default = DBC;
module.exports = exports['default'];