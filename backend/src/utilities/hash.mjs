import crypto from 'crypto';

export function stableStringify(obj) {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => `${key}:${stableStringify(obj[key])}`);
  return `{${pairs.join(',')}}`;
}

export const createHash = (...args) => {
  return crypto
    .createHash('sha256')
    .update(args.map((arg) => stableStringify(arg)).join(' '))
    .digest('hex');
};