import { pbkdf2Sync, timingSafeEqual } from 'node:crypto'

/**
 * Check a password against a hash made by bcrc.py (the CLI creates instructor accounts).
 * Stored format: pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>
 */
export function checkPassword(password: string, stored: string): boolean {
  const [algorithm, iterations, saltHex, hashHex] = stored.split('$')
  if (algorithm !== 'pbkdf2_sha256' || !iterations || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const actual = pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), Number(iterations), expected.length, 'sha256')
  return timingSafeEqual(actual, expected) // constant-time compare, so timing doesn't leak how close a guess was
}
