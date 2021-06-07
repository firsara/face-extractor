'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var extractFromDocument = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file, options, temporaryDirectory) {
    var target, documentFile;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            target = _path2.default.join(temporaryDirectory, 'converted-document.pdf');


            console.log('\nconverting document "' + file + '" to pdf "' + target + '"');

            _context.next = 4;
            return (0, _convertDocument2.default)(file, target);

          case 4:
            documentFile = _context.sent;
            _context.next = 7;
            return extractFromPDF(documentFile, options, temporaryDirectory);

          case 7:
            return _context.abrupt('return', _context.sent);

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function extractFromDocument(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var extractFromPDF = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(file, options, temporaryDirectory) {
    var target, images;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            target = _path2.default.join(temporaryDirectory, 'pdf-images');


            console.log('\nextracting images from pdf "' + file + '" to directory ' + target);

            _context2.next = 4;
            return (0, _extractImagesFromPDF2.default)(file, target);

          case 4:
            images = _context2.sent;
            _context2.next = 7;
            return Promise.all(images.map(function (image, index) {
              return extractFromImage(image, options, temporaryDirectory, index);
            }));

          case 7:
            return _context2.abrupt('return', _context2.sent);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function extractFromPDF(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var extractFromImage = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(file, options, temporaryDirectory) {
    var prefix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    var filesize, _ref4, width, height, faces;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            filesize = _fs2.default.statSync(file).size;
            _context3.next = 3;
            return asyncSizeOf(file);

          case 3:
            _ref4 = _context3.sent;
            width = _ref4.width;
            height = _ref4.height;

            if (!(filesize < options.detectMinFilesize || width < options.detectMinImageWidth || height < options.detectMinImageHeight)) {
              _context3.next = 11;
              break;
            }

            console.log('\nskipping face extraction from image "' + file + '"');
            console.log('filesize: ' + Math.round(filesize / 1024 * 100) / 100 + 'kb');
            console.log('image size: ' + width + 'x' + height + 'px');
            return _context3.abrupt('return');

          case 11:

            console.log('\nextracting faces from image "' + file + '"');
            console.log('filesize: ' + Math.round(filesize / 1024 * 100) / 100 + 'kb');
            console.log('image size: ' + width + 'x' + height + 'px');

            _context3.next = 16;
            return (0, _extractFacesFromImage2.default)(file, {
              square: options.square,
              pad: options.pad,
              background: options.background.rgba
            });

          case 16:
            faces = _context3.sent;


            console.log('\n');

            faces.forEach(function (face, index) {
              var outputFile = _path2.default.join(options.output.path, 'face-' + prefix + '-' + index + '.png');

              console.log('writing face to "' + outputFile + '"');

              _fs2.default.writeFileSync(outputFile, face);
            });

          case 19:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function extractFromImage(_x8, _x9, _x10) {
    return _ref3.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fileType = require('file-type');

var _fileType2 = _interopRequireDefault(_fileType);

var _util = require('util');

var _imageSize = require('image-size');

var _imageSize2 = _interopRequireDefault(_imageSize);

var _UnknownFileTypeError = require('./errors/UnknownFileTypeError');

var _UnknownFileTypeError2 = _interopRequireDefault(_UnknownFileTypeError);

var _convertDocument = require('./processes/convertDocument');

var _convertDocument2 = _interopRequireDefault(_convertDocument);

var _extractImagesFromPDF = require('./processes/extractImagesFromPDF');

var _extractImagesFromPDF2 = _interopRequireDefault(_extractImagesFromPDF);

var _extractFacesFromImage = require('./processes/extractFacesFromImage');

var _extractFacesFromImage2 = _interopRequireDefault(_extractFacesFromImage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var asyncSizeOf = (0, _util.promisify)(_imageSize2.default);

exports.default = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(options, temporaryDirectory) {
    var fileExtension, fileType;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            fileExtension = _path2.default.extname(options.input.path).toLowerCase();
            _context4.next = 3;
            return _fileType2.default.fromFile(options.input.path);

          case 3:
            fileType = _context4.sent;
            _context4.t0 = fileType.ext;
            _context4.next = _context4.t0 === 'cfb' ? 7 : _context4.t0 === 'docx' ? 10 : _context4.t0 === 'odt' ? 10 : _context4.t0 === 'pdf' ? 11 : _context4.t0 === 'jpg' ? 12 : _context4.t0 === 'png' ? 12 : 13;
            break;

          case 7:
            if (!(fileExtension !== '.doc')) {
              _context4.next = 9;
              break;
            }

            throw new _UnknownFileTypeError2.default(options.input.path, fileType, fileExtension);

          case 9:
            return _context4.abrupt('return', extractFromDocument(options.input.path, options, temporaryDirectory));

          case 10:
            return _context4.abrupt('return', extractFromDocument(options.input.path, options, temporaryDirectory));

          case 11:
            return _context4.abrupt('return', extractFromPDF(options.input.path, options, temporaryDirectory));

          case 12:
            return _context4.abrupt('return', extractFromImage(options.input.path, options, temporaryDirectory));

          case 13:
            throw new _UnknownFileTypeError2.default(options.input.path, fileType, fileExtension);

          case 14:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  function extract(_x11, _x12) {
    return _ref5.apply(this, arguments);
  }

  return extract;
}();