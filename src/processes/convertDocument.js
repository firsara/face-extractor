import { exec } from 'node-exec-promise';

export default async function convertDocument(src, target) {
  const out = await exec(`unoconv --output="${target}" -f pdf ${src}`);

  console.log(out.stdout, out.stderr);

  return target;
}
