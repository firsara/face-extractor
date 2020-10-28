'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var defaultOptions = {
  retryCount: 5,
  killTimeout: 30000,
  sleepTimeout: 1000,
  onStdOut: function onStdOut(data) {
    return null;
  },
  onStdErr: function onStdErr(data) {
    return null;
  }
};

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(cmd, args) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultOptions;
    var opts;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            opts = Object.assign(defaultOptions, options);
            return _context.abrupt('return', new Promise(function (resolve, reject) {
              function runProcess(retryCount) {
                if (retryCount > opts.retryCount) {
                  reject(cmd + ' timed out after ' + retryCount + ' tries');
                  return;
                }

                if (retryCount > 0) {
                  console.log('retry ' + cmd + ' #' + retryCount);
                }

                var proc = (0, _child_process.spawn)(cmd, args);
                var killed = false;

                var retryTimeout = setTimeout(function () {
                  killed = true;
                  proc.kill();

                  setTimeout(function () {
                    runProcess(retryCount + 1);
                  }, opts.sleepTimeout);
                }, opts.killTimeout);

                proc.stdout.on('data', function (data) {
                  opts.onStdOut(data);
                });

                proc.stderr.on('data', function (data) {
                  opts.onStdErr(data);
                });

                proc.on('close', function (code) {
                  if (retryTimeout) {
                    clearTimeout(retryTimeout);
                  }

                  if (killed) {
                    return;
                  }

                  if (code === 0) {
                    resolve(code);
                  } else {
                    reject(cmd + ' exited with code ' + code);
                  }
                });
              }

              runProcess(0);
            }));

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function retrySpawn(_x2, _x3) {
    return _ref.apply(this, arguments);
  }

  return retrySpawn;
}();