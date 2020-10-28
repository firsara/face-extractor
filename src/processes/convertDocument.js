import retrySpawn from '../utils/retry-spawn';

export default async function convertDocument(src, target) {
  const cmd = 'unoconv';
  const args = ['--output', target, '-f', 'pdf', src];

  console.log(`\n> ${cmd} ${args.join(' ')}`);

  await retrySpawn(cmd, args, {
    retryCount: 5,
    killTimeout: 60000,
    sleepTimeout: 1000,
    onStdOut: (data) => console.log(data.toString()),
    onStdErr: (data) => console.error(data.toString()),
  });

  return target;
}
