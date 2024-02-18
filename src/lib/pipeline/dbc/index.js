import WorkerPool from '../worker/pool';

class DBC {

  static cache = {};

  constructor(data) {
    this.data = data;
    this.records = data.records;
    this.index();
  }

  index() {
    this.records.forEach(function(record) {
      if (record.id === undefined) {
        return;
      }
      this[record.id] = record;
    }.bind(this));
  }

  static load(name, id) {
    if (!(name in this.cache)) {
      this.cache[name] = WorkerPool.enqueue('DBC', name).then((args) => {
        const [data] = args;
        return new this(data);
      });
    }

    if (id !== undefined) {
      return this.cache[name].then(function(dbc) {
        // idk why this is needed really
        const specialMapIds = [29, 30, 33, 36, 37, 47, 169, 209, 289, 309, 469, 489, 509, 530, 531, 543, 559, 560, 562, 564, 566, 568, 572, 574, 575, 578, 580, 585, 595, 599, 600, 601, 602, 603, 604, 607, 608, 615, 616, 617, 618, 619, 624, 628, 631, 632, 649, 650, 658, 723, 724];
        if (specialMapIds.includes(id)) {
          id = 0;
        }
        return dbc[id];
      });
    }

    return this.cache[name];
  }

}

export default DBC;
