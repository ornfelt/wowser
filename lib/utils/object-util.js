'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class ObjectUtil {

  // Retrieves key for given value (if any) in object
  static keyByValue(object, target) {
    if (!('lookup' in object)) {
      var lookup = {};
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          var value = object[key];
          lookup[value] = key;
        }
      }
      object.lookup = lookup;
    }

    return object.lookup[target];
  }

}

exports.default = ObjectUtil;
module.exports = exports['default'];