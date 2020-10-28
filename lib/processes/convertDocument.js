'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _retrySpawn = require('../utils/retry-spawn');

var _retrySpawn2 = _interopRequireDefault(_retrySpawn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(src, target) {
    var cmd, args;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cmd = 'unoconv';
            args = ['--output', target, '-f', 'pdf', src];


            console.log('\n> ' + cmd + ' ' + args.join(' '));

            _context.next = 5;
            return (0, _retrySpawn2.default)(cmd, args, {
              retryCount: 5,
              killTimeout: 60000,
              sleepTimeout: 1000,
              onStdOut: function onStdOut(data) {
                return console.log(data.toString());
              },
              onStdErr: function onStdErr(data) {
                return console.error(data.toString());
              }
            });

          case 5:
            return _context.abrupt('return', target);

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function convertDocument(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return convertDocument;
}();