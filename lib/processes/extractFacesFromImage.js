'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var detectFacesFromImage = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(imagePath) {
    var imageData, img, canvas, ctx, faces;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            imageData = _fs2.default.readFileSync(imagePath);
            img = new Image(); // Create a new Image

            img.src = imageData;

            // Initialiaze a new Canvas with the same dimensions
            // as the image, and get a 2D drawing context for it.
            canvas = new Canvas(img.width, img.height);
            ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0, img.width, img.height);

            _context.next = 8;
            return faceapi.nets.ssdMobilenetv1.loadFromDisk(_path2.default.join(__dirname, '..', '..', 'models'));

          case 8:
            _context.next = 10;
            return faceapi.detectAllFaces(canvas, new faceapi.SsdMobilenetv1Options());

          case 10:
            faces = _context.sent;
            return _context.abrupt('return', faces);

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function detectFacesFromImage(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getFaceFromImage = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(imagePath, face, opts) {
    var imageDimensions, x, y, width, height, longestSide, pad, horizontalSize, verticalSize, startX, startY, targetLeft, targetTop, targetWidth, targetHeight, actualLeft, actualTop, actualWidth, actualHeight, extendLeft, extendTop, extendRight, extendBottom;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return asyncSizeOf(imagePath);

          case 2:
            imageDimensions = _context2.sent;
            x = Math.floor(face.box.x);
            y = Math.floor(face.box.y);
            width = Math.ceil(face.box.width);
            height = Math.ceil(face.box.height);
            longestSide = Math.max(width, height);
            pad = Math.ceil(longestSide / 100 * opts.pad);
            horizontalSize = opts.square ? longestSide : width;
            verticalSize = opts.square ? longestSide : height;
            startX = x - Math.round((horizontalSize - width) / 2);
            startY = y - Math.round((verticalSize - height) / 2);
            targetLeft = startX - pad;
            targetTop = startY - pad;
            targetWidth = horizontalSize + pad * 2;
            targetHeight = verticalSize + pad * 2;
            actualLeft = Math.max(0, targetLeft);
            actualTop = Math.max(0, targetTop);
            actualWidth = actualLeft + targetWidth > imageDimensions.width ? imageDimensions.width - actualLeft : targetWidth;
            actualHeight = actualTop + targetHeight > imageDimensions.height ? imageDimensions.height - actualTop : targetHeight;
            extendLeft = Math.abs(targetLeft - actualLeft);
            extendTop = Math.abs(targetTop - actualTop);
            extendRight = Math.abs(targetWidth - actualWidth - extendLeft);
            extendBottom = Math.abs(targetHeight - actualHeight - extendTop);


            console.log('\ngetting face from image ' + imagePath + ':\n\nscore: ' + face.score + '\nx: ' + x + '\ny: ' + y + '\nwidth: ' + width + '\nheight: ' + height + '\n\nsquare: ' + (opts.square ? 'true' : 'false') + '\npad: ' + pad + '\nbackground: ' + JSON.stringify(opts.background) + '\n');

            _context2.next = 28;
            return (0, _sharp2.default)(imagePath).extract({
              left: actualLeft,
              top: actualTop,
              width: actualWidth,
              height: actualHeight
            }).extend({
              left: extendLeft,
              top: extendTop,
              right: extendRight,
              bottom: extendBottom,
              background: opts.background
            }).png().toBuffer();

          case 28:
            return _context2.abrupt('return', _context2.sent);

          case 29:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function getFaceFromImage(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _sharp = require('sharp');

var _sharp2 = _interopRequireDefault(_sharp);

var _imageSize = require('image-size');

var _imageSize2 = _interopRequireDefault(_imageSize);

var _canvas = require('canvas');

var _canvas2 = _interopRequireDefault(_canvas);

var _faceApi = require('face-api.js');

var faceapi = _interopRequireWildcard(_faceApi);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// TODO: install and get to work
// import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData


// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
var Canvas = _canvas2.default.Canvas,
    Image = _canvas2.default.Image,
    ImageData = _canvas2.default.ImageData;

faceapi.env.monkeyPatch({ Canvas: Canvas, Image: Image, ImageData: ImageData });

var asyncSizeOf = (0, _util.promisify)(_imageSize2.default);

var defaultOptions = {
  square: false,
  pad: 20, // NOTE: pad is a percentage value from 0 to 100
  background: { r: 0, g: 0, b: 0, alpha: 0 }
};

exports.default = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(imagePath) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions;
    var opts, faces;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            opts = Object.assign(defaultOptions, options);
            _context3.next = 3;
            return detectFacesFromImage(imagePath);

          case 3:
            faces = _context3.sent;
            _context3.next = 6;
            return Promise.all(faces.map(function (face) {
              return getFaceFromImage(imagePath, face, opts);
            }));

          case 6:
            return _context3.abrupt('return', _context3.sent);

          case 7:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  function extractFacesFromImage(_x6) {
    return _ref3.apply(this, arguments);
  }

  return extractFacesFromImage;
}();