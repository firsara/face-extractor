import { spawn } from 'child_process';

const defaultOptions = {
  retryCount: 5,
  killTimeout: 30000,
  sleepTimeout: 1000,
  onStdOut: (data) => null,
  onStdErr: (data) => null,
};

export default async function retrySpawn(cmd, args, options = defaultOptions) {
  const opts = Object.assign(defaultOptions, options);

  return new Promise((resolve, reject) => {
    function runProcess(retryCount) {
      if (retryCount > opts.retryCount) {
        reject(`${cmd} timed out after ${retryCount} tries`);
        return;
      }

      if (retryCount > 0) {
        console.log(`retry ${cmd} #${retryCount}`);
      }

      const proc = spawn(cmd, args);
      let killed = false;

      const retryTimeout = setTimeout(() => {
        killed = true;
        proc.kill();

        setTimeout(() => {
          runProcess(retryCount + 1);
        }, opts.sleepTimeout);
      }, opts.killTimeout);

      proc.stdout.on('data', (data) => {
        opts.onStdOut(data);
      });

      proc.stderr.on('data', (data) => {
        opts.onStdErr(data);
      });

      proc.on('close', (code) => {
        if (retryTimeout) {
          clearTimeout(retryTimeout);
        }

        if (killed) {
          return;
        }

        if (code === 0) {
          resolve(code);
        } else {
          reject(`${cmd} exited with code ${code}`);
        }
      });
    }

    runProcess(0);
  });
}
