import { createHash } from 'crypto';

export function generateHash(params: Record<string, string>): string {
  const concatenatedString = Object.values(params).join('');
  return createHash('sha512').update(concatenatedString).digest('hex');
}