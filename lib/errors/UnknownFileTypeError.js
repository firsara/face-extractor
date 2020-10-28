"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var UnknownFileTypeError = function (_Error) {
  _inherits(UnknownFileTypeError, _Error);

  function UnknownFileTypeError(file, fileType, fileExtension) {
    _classCallCheck(this, UnknownFileTypeError);

    return _possibleConstructorReturn(this, (UnknownFileTypeError.__proto__ || Object.getPrototypeOf(UnknownFileTypeError)).call(this, "file type not supported:\nfile: \"" + file + "\"\next: \"" + fileType.ext + "\"\nmimeType: \"" + fileType.mime + "\"\nextension: \"" + fileExtension + "\""));
  }

  return UnknownFileTypeError;
}(Error);

exports.default = UnknownFileTypeError;