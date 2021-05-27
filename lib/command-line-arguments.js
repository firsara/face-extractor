'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _colorRgba = require('color-rgba');

var _colorRgba2 = _interopRequireDefault(_colorRgba);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileType = function FileType(filepath) {
  _classCallCheck(this, FileType);

  this.path = _path2.default.resolve(filepath);
  this.exists = _fs2.default.existsSync(this.path);
};

var FolderType = function FolderType(filepath) {
  _classCallCheck(this, FolderType);

  this.path = _path2.default.resolve(filepath);
  this.exists = _fs2.default.existsSync(this.path) && _fs2.default.lstatSync(this.path).isDirectory();
};

var BackgroundType = function BackgroundType(color) {
  _classCallCheck(this, BackgroundType);

  this.color = color;

  var parsed = (0, _colorRgba2.default)(this.color);

  if (parsed && parsed.length === 4) {
    this.rgba = {
      r: parsed[0],
      g: parsed[1],
      b: parsed[2],
      alpha: parsed[3]
    };
  } else {
    this.rgba = { r: 0, g: 0, b: 0, alpha: 0 };
  }
};

var options = (0, _commandLineArgs2.default)([{
  name: 'input',
  alias: 'i',
  defaultOption: true,
  type: function type(filename) {
    return new FileType(filename);
  }
}, {
  name: 'output',
  alias: 'o',
  type: function type(filename) {
    return new FolderType(filename);
  }
}, {
  name: 'square',
  alias: 's',
  type: Boolean,
  defaultValue: false
}, {
  name: 'pad',
  alias: 'p',
  type: Number,
  defaultValue: 25
}, {
  name: 'background',
  type: function type(color) {
    return new BackgroundType(color);
  },
  defaultValue: new BackgroundType('#fff')
}, {
  name: 'tensorflow',
  type: Boolean,
  defaultValue: false
}]);

if (!(options.input && !!options.input.path)) {
  console.error('\ninput file must be specified!');
  console.error('\n> face-extractor cv.doc\n');
  process.exit(2);
}

if (!options.input.exists) {
  console.error('file "' + options.input.path + '" does not exist');
  process.exit(2);
}

if (!(options.output && !!options.output.path)) {
  console.error('\noutput directory must be specified!');
  console.error('\n> face-extractor cv.doc --output ~/output/directory\n');
  process.exit(2);
}

if (!options.output.exists) {
  console.error('output directory "' + options.output.path + '" does not exist');
  process.exit(2);
}

exports.default = options;