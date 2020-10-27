const { exec } = require('child_process');
const { promisify } = require('util');

function execute(cmd) {
  console.log();
  console.log();
  console.log(`> ${cmd}`);
  console.log();

  return exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(stderr);
      throw new Error(err);
      return;
    }

    console.log(stdout);
  });
}

module.exports = execute;
module.exports.asyncExecute = promisify(execute);
