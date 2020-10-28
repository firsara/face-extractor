'use strict';

var proc = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(temporaryDirectory) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _extract2.default)(_commandLineArguments2.default, temporaryDirectory);

          case 3:
            _context.next = 9;
            break;

          case 5:
            _context.prev = 5;
            _context.t0 = _context['catch'](0);

            console.error(_context.t0);
            process.exit(2);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 5]]);
  }));

  return function proc(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _commandLineArguments = require('./command-line-arguments');

var _commandLineArguments2 = _interopRequireDefault(_commandLineArguments);

var _extract = require('./extract');

var _extract2 = _interopRequireDefault(_extract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function cleanup(eventType, temporaryDirectory) {
  if (_fs2.default.existsSync(temporaryDirectory)) {
    console.log('removing temporary directory "' + temporaryDirectory + '"');
    _rimraf2.default.sync(temporaryDirectory);
  }
}

var _tmp$dirSync = _tmp2.default.dirSync(),
    temporaryDirectory = _tmp$dirSync.name;

console.log('creating temporary directory: "' + temporaryDirectory + '"');

// NOTE: cleanup temporary directory on process exit
// see https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(function (eventType) {
  process.on(eventType, cleanup.bind(null, eventType, temporaryDirectory));
});

proc(temporaryDirectory);