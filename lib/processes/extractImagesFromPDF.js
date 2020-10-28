'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ComponentsPerPixelOf;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _pngjs = require('pngjs');

var _pako = require('pako');

var _pako2 = _interopRequireDefault(_pako);

var _pdfLib = require('pdf-lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var PngColorTypes = {
  Grayscale: 0,
  Rgb: 2,
  GrayscaleAlpha: 4,
  RgbAlpha: 6
};

var ComponentsPerPixelOfColorType = (_ComponentsPerPixelOf = {}, _defineProperty(_ComponentsPerPixelOf, PngColorTypes.Rgb, 3), _defineProperty(_ComponentsPerPixelOf, PngColorTypes.Grayscale, 1), _defineProperty(_ComponentsPerPixelOf, PngColorTypes.RgbAlpha, 4), _defineProperty(_ComponentsPerPixelOf, PngColorTypes.GrayscaleAlpha, 2), _ComponentsPerPixelOf);

function savePng(image) {
  return new Promise(function (resolve, reject) {
    var isGrayscale = image.colorSpace === _pdfLib.PDFName.from('DeviceGray');
    var colorPixels = _pako2.default.inflate(image.data);
    var alphaPixels = image.alphaLayer ? _pako2.default.inflate(image.alphaLayer.data) : undefined;

    var colorType = isGrayscale && alphaPixels ? PngColorTypes.GrayscaleAlpha : !isGrayscale && alphaPixels ? PngColorTypes.RgbAlpha : isGrayscale ? PngColorTypes.Grayscale : PngColorTypes.Rgb;

    var colorByteSize = 1;
    var width = image.width * colorByteSize;
    var height = image.height * colorByteSize;
    var inputHasAlpha = [PngColorTypes.RgbAlpha, PngColorTypes.GrayscaleAlpha].includes(colorType);

    var png = new _pngjs.PNG({
      width: width,
      height: height,
      colorType: colorType,
      inputColorType: colorType,
      inputHasAlpha: inputHasAlpha
    });

    var componentsPerPixel = ComponentsPerPixelOfColorType[colorType];
    png.data = new Uint8Array(width * height * componentsPerPixel);

    var colorPixelIdx = 0;
    var pixelIdx = 0;

    while (pixelIdx < png.data.length) {
      if (colorType === PngColorTypes.Rgb) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
      } else if (colorType === PngColorTypes.RgbAlpha) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        // NOTE: normalize to 100% transparent or 100% opaque, no half-transparencies allowed
        png.data[pixelIdx++] = alphaPixels[colorPixelIdx - 1] > 0 ? 255 : 0;
      } else if (colorType === PngColorTypes.Grayscale) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
      } else if (colorType === PngColorTypes.GrayscaleAlpha) {
        png.data[pixelIdx++] = colorPixels[colorPixelIdx++];
        // NOTE: normalize to 100% transparent or 100% opaque, no half-transparencies allowed
        png.data[pixelIdx++] = alphaPixels[colorPixelIdx - 1] > 0 ? 255 : 0;
      } else {
        throw new Error('Unknown colorType=' + colorType);
      }
    }

    var buffer = [];
    png.pack().on('data', function (data) {
      return buffer.push.apply(buffer, _toConsumableArray(data));
    }).on('end', function () {
      return resolve(Buffer.from(buffer));
    }).on('error', function (err) {
      return reject(err);
    });
  });
}

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(file, outputDirectory) {
    var pdfDoc, imagesInDoc, objectIdx, page, idx, extractedImages, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, img, imageData, outputFile;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pdfDoc = _pdfLib.PDFDocumentFactory.load(_fs2.default.readFileSync(file));

            // Define some variables we'll use in a moment

            imagesInDoc = [];
            objectIdx = 0;

            // (1) Find all the image objects in the PDF
            // (2) Extract useful info from them
            // (3) Push this info object to `imageInDoc` array

            pdfDoc.index.index.forEach(function (pdfObject, ref) {
              objectIdx += 1;

              if (!(pdfObject instanceof _pdfLib.PDFRawStream)) return;

              var lookupMaybe = pdfDoc.index.lookupMaybe;
              var dict = pdfObject.dictionary;


              var smaskRef = dict.getMaybe('SMask');
              var colorSpace = lookupMaybe(dict.getMaybe('ColorSpace'));
              var subtype = lookupMaybe(dict.getMaybe('Subtype'));
              var width = lookupMaybe(dict.getMaybe('Width'));
              var height = lookupMaybe(dict.getMaybe('Height'));
              var name = lookupMaybe(dict.getMaybe('Name'));
              var bitsPerComponent = lookupMaybe(dict.getMaybe('BitsPerComponent'));
              var filter = lookupMaybe(dict.getMaybe('Filter'));

              if (subtype === _pdfLib.PDFName.from('Image')) {
                imagesInDoc.push({
                  ref: ref,
                  smaskRef: smaskRef,
                  colorSpace: colorSpace,
                  name: name ? name.key : 'Object' + objectIdx,
                  width: width.number,
                  height: height.number,
                  bitsPerComponent: bitsPerComponent.number,
                  data: pdfObject.content,
                  type: filter === _pdfLib.PDFName.from('DCTDecode') ? 'jpg' : 'png'
                });
              }
            });

            // Find and mark SMasks as alpha layers
            imagesInDoc.forEach(function (image) {
              if (image.type === 'png' && image.smaskRef) {
                var smaskImg = imagesInDoc.find(function (_ref2) {
                  var ref = _ref2.ref;
                  return ref === image.smaskRef;
                });
                smaskImg.isAlphaLayer = true;
                image.alphaLayer = image;
              }
            });

            // Create a new page
            page = pdfDoc.createPage([700, 700]);

            // Add images to the page

            imagesInDoc.forEach(function (image) {
              page.addImageObject(image.name, image.ref);
            });

            // Log info about the images we found in the PDF
            console.log('\n===== Images in PDF =====');
            imagesInDoc.forEach(function (image) {
              console.log('\nName:', image.name, '\nType:', image.type, '\nColor Space:', image.colorSpace.toString(), '\nHas Alpha Layer?', image.alphaLayer ? true : false, '\nIs Alpha Layer?', image.isAlphaLayer || false, '\nWidth:', image.width, '\nHeight:', image.height, '\nBits Per Component:', image.bitsPerComponent, '\nData:', 'Uint8Array(' + image.data.length + ')', '\nRef:', image.ref.toString());
            });

            if (!_fs2.default.existsSync(outputDirectory)) {
              _fs2.default.mkdirSync(outputDirectory);
            }

            _rimraf2.default.sync('./' + outputDirectory + '/*.{jpg,png}');

            idx = 0;
            extractedImages = [];


            console.log();

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 17;
            _iterator = imagesInDoc[Symbol.iterator]();

          case 19:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 38;
              break;
            }

            img = _step.value;

            if (img.isAlphaLayer) {
              _context.next = 35;
              break;
            }

            if (!(img.type === 'jpg')) {
              _context.next = 26;
              break;
            }

            _context.t0 = img.data;
            _context.next = 29;
            break;

          case 26:
            _context.next = 28;
            return savePng(img);

          case 28:
            _context.t0 = _context.sent;

          case 29:
            imageData = _context.t0;
            outputFile = outputDirectory + '/out' + (idx + 1) + '.png';

            console.log('extracting image: ' + outputFile);
            _fs2.default.writeFileSync(outputFile, imageData);
            idx += 1;

            extractedImages.push(outputFile);

          case 35:
            _iteratorNormalCompletion = true;
            _context.next = 19;
            break;

          case 38:
            _context.next = 44;
            break;

          case 40:
            _context.prev = 40;
            _context.t1 = _context['catch'](17);
            _didIteratorError = true;
            _iteratorError = _context.t1;

          case 44:
            _context.prev = 44;
            _context.prev = 45;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 47:
            _context.prev = 47;

            if (!_didIteratorError) {
              _context.next = 50;
              break;
            }

            throw _iteratorError;

          case 50:
            return _context.finish(47);

          case 51:
            return _context.finish(44);

          case 52:

            console.log();
            console.log('Images written to "' + outputDirectory + '"');
            console.log();

            return _context.abrupt('return', extractedImages);

          case 56:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[17, 40, 44, 52], [45,, 47, 51]]);
  }));

  function extractImagesFromPDF(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return extractImagesFromPDF;
}();