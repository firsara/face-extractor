import fs from 'fs';
import tmp, { setGracefulCleanup } from 'tmp';
import rimraf from 'rimraf';

import commandLineArguments from './command-line-arguments';
import extract from './extract';

function cleanup(eventType, temporaryDirectory) {
  if (fs.existsSync(temporaryDirectory)) {
    console.log(`removing temporary directory "${temporaryDirectory}"`);
    rimraf.sync(temporaryDirectory);
  }
}

async function proc(temporaryDirectory) {
  try {
    await extract(commandLineArguments, temporaryDirectory);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
}

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
if (commandLineArguments.tensorflow) {
  require('@tensorflow/tfjs-node');
}

const { name: temporaryDirectory } = tmp.dirSync();
console.log(`creating temporary directory: "${temporaryDirectory}"`);

// NOTE: cleanup temporary directory on process exit
// see https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
[
  `exit`,
  `SIGINT`,
  `SIGUSR1`,
  `SIGUSR2`,
  `uncaughtException`,
  `SIGTERM`,
].forEach((eventType) => {
  process.on(eventType, cleanup.bind(null, eventType, temporaryDirectory));
});

proc(temporaryDirectory);
