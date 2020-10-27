import { asyncExecute } from '../utils/execute';

export default async function convertDocument(src, target) {
  await asyncExecute(`unoconv --output="${target}" -f pdf ${src}`);
  return target;
}
