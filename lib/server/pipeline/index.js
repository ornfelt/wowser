'use strict';

// C:\Users\jonas\Code2\Wow\tools\wowser\lib\server\pipeline\index.js

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _blp = require('blizzardry/lib/blp');

var _blp2 = _interopRequireDefault(_blp);

var _entities = require('blizzardry/lib/dbc/entities');

var DBC = _interopRequireWildcard(_entities);

var _restructure = require('blizzardry/lib/restructure');

var _pngjs = require('pngjs');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _arrayFind = require('array-find');

var _arrayFind2 = _interopRequireDefault(_arrayFind);

var _archive = require('./archive');

var _archive2 = _interopRequireDefault(_archive);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

const path = require('path');
const fs = require('fs');

const { Navigation } = require('./navigation');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Pipeline {

  static get DATA_DIR() {
    return _config2.default.db.get('clientData');
  }

  constructor() {
    this.router = (0, _express2.default)();
    this.router.param('resource', this.resource.bind(this));
    this.router.get('/:resource(*.blp).png', this.blp.bind(this));
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc.bind(this));
    this.router.get('/find/:query', this.find.bind(this));
    this.router.get('/:resource', this.serve.bind(this));
    this.router.get('/calculatePath', this.calculatePath.bind(this));
  }

  calculatePath(req, res) {
    try {
      const parameterCount = Object.keys(req.query).length;

      if (parameterCount === 5) {
        // Extract parameters from the query string
        const { mapId, startX, startY, startZ, angle } = req.query;
        const mapIdParsed = parseInt(mapId, 0);
        console.log("startX: " + startX);
        console.log("angle: " + angle);
        const path = Navigation.moveForward(mapIdParsed, parseFloat(startX), parseFloat(startY), parseFloat(startZ), parseFloat(angle));
        const pathString = path.map(p => `${p.X},${p.Y},${p.Z}`).join(";");
        console.log("got path: " + pathString);
        res.header("Content-Type", "text/plain");
        res.send(pathString);
      } else {
        // Extract parameters from the query string
        const { startX, startY, startZ, endX, endY, endZ, mapId, straightPath } = req.query;
        const mapIdParsed = parseInt(mapId, 0);
        const straightPathBool = straightPath === 'true';
        //console.log("startX: " + startX);
        //console.log("endX: " + endX);
        const path = Navigation.calculatePath(parseFloat(startX), parseFloat(startY), parseFloat(startZ), parseFloat(endX), parseFloat(endY), parseFloat(endZ), mapIdParsed, straightPathBool);
        //console.log("got path: " + path);
        // Assuming path is an array of points that can be represented as a string
        const pathString = path.map(p => `${p.X},${p.Y},${p.Z}`).join(";");
        res.header("Content-Type", "text/plain");
        res.send(pathString);
      }
    } catch (error) {
      console.error('Failed to calculate path:', error);
      res.status(500).send('Failed to calculate path');
    }
  }

  get archive() {
    this._archive = this._archive || _archive2.default.build(this.constructor.DATA_DIR);
    return this._archive;
  }

  resource(req, _res, next, path) {
    if (path === 'calculatePath') {
        return this.calculatePath(req, _res);
    }
    req.resourcePath = path;
    req.resource = this.archive.files.get(path);
    if (req.resource) {
      next();

      // Ensure file is closed in StormLib.
      req.resource.close();
    } else {
      var err = new Error('resource not found');
      err.status = 404;
      throw err;
    }
  }

  //blp(req, res) {
  //  _blp2.default.from(req.resource.data, function (blp) {
  //    var mipmap = blp.largest;

  //    var png = new _pngjs.PNG({ width: mipmap.width, height: mipmap.height });
  //    png.data = mipmap.rgba;

  //    res.type('image/png');
  //    png.pack().pipe(res);
  //  });
  //}

  blp(req, res) {
    // Base path for PNG files
    //const basePath = 'D:\\My_files\\mpqeditor_en\\x64\\Work';
    const basePath = 'C:\\Users\\jonas\\Downloads\\mpqeditor_en\\x64\\Work';

    // Construct the path to the .png file based on the original request
    // Replace '.BLP.png' with '.png' in the request URL and prepend the base path
    const pngFilePath = path.join(basePath, req.params.resource.replace('.BLP', '') + '.png');

    // Check if the PNG file exists
    fs.exists(pngFilePath, (exists) => {
      if (exists) {
        res.sendFile(pngFilePath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  dbc(req, res) {
    var name = req.resourcePath.match(/(\w+)\.dbc/)[1];
    var definition = DBC[name];
    if (definition) {
      var dbc = definition.dbc.decode(new _restructure.DecodeStream(req.resource.data));
      var id = req.params.id;
      if (id) {
        var match = (0, _arrayFind2.default)(dbc.records, function (entity) {
          return String(entity.id) === id;
        });
        if (match) {
          res.send(match);
        } else {
          var err = new Error('entity not found');
          err.status = 404;
          throw err;
        }
      } else {
        res.send(dbc.records);
      }
    } else {
      var _err = new Error('entity definition not found');
      _err.status = 404;
      throw _err;
    }
  }

  find(req, res) {
    var results = this.archive.files.find(req.params.query).map(result => {
      var path = `${req.baseUrl}/${encodeURI(result.filename)}`;
      var link = `${req.protocol}://${req.headers.host}${path}`;
      return {
        filename: result.filename,
        name: result.name,
        size: result.fileSize,
        link: link
      };
    });
    res.send(results);
  }

  serve(req, res) {
    res.type(req.resource.name);
    res.send(req.resource.data);
  }

}

exports.default = Pipeline;
module.exports = exports['default'];
