'use strict';

var _loader = require('../adt/loader');

var _loader2 = _interopRequireDefault(_loader);

var _loader3 = require('../dbc/loader');

var _loader4 = _interopRequireDefault(_loader3);

var _loader5 = require('../m2/loader');

var _loader6 = _interopRequireDefault(_loader5);

var _loader7 = require('../wdt/loader');

var _loader8 = _interopRequireDefault(_loader7);

var _loader9 = require('../wmo/loader');

var _loader10 = _interopRequireDefault(_loader9);

var _loader11 = require('../wmo/group/loader');

var _loader12 = _interopRequireDefault(_loader11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var worker = self;

var loaders = {
  ADT: _loader2.default,
  DBC: _loader4.default,
  M2: _loader6.default,
  WDT: _loader8.default,
  WMO: _loader10.default,
  WMOGroup: _loader12.default
};

var fulfill = function (type, result) {
  worker.postMessage([type].concat(result));
};

var resolve = function (value) {
  fulfill(true, value);
};

var reject = function (error) {
  fulfill(false, error.toString());
};

worker.addEventListener('message', event => {
  var [loader, ...args] = event.data;
  if (loader in loaders) {
    loaders[loader](...args).then(function (result) {
      resolve(result);
    }).catch(error => {
      reject(error);
    });
  } else {
    reject(new Error(`Invalid loader: ${loader}`));
  }
});