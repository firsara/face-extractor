import fs from 'fs';
import tmp, { setGracefulCleanup } from 'tmp';
import rimraf from 'rimraf';

import extract from './extract';

const [, , inputFile] = process.argv;

if (!inputFile) {
  console.error('input file must be specified!');
  console.log('npm run extract cv.doc');
  process.exit(2);
}

if (!fs.existsSync(inputFile)) {
  console.error(`file "${inputFile}" does not exist`);
  process.exit(2);
}

function cleanup(eventType, temporaryDirectory) {
  if (fs.existsSync(temporaryDirectory)) {
    console.log(`removing temporary directory "${temporaryDirectory}"`);
    rimraf.sync(temporaryDirectory);
  }
}

async function proc(temporaryDirectory) {
  try {
    await extract(inputFile, temporaryDirectory);
  } catch (err) {
    console.error(err);
    process.exit(2);
  }
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
