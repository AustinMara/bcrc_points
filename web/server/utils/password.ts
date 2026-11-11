// password.ts: password hashing, in the same format bcrc.py writes:
// pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>
//
// makePasswordHash(password)      hash a password (only the demo login needs this; the CLI
//                                 creates real instructor accounts)
// checkPassword(password, stored) true if the password matches the stored hash

import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto'

const ITERATIONS = 600_000

/** Hash a password. The CLI normally does this; the web app only needs it for the demo login. */
export function makePasswordHash(password: string): string {
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256')
  return `pbkdf2_sha256$${ITERATIONS}$${salt.toString('hex')}$${hash.toString('hex')}`
}

/** Check a password against a stored hash. */
export function checkPassword(password: string, stored: string): boolean {
  const [algorithm, iterations, saltHex, hashHex] = stored.split('$')
  if (algorithm !== 'pbkdf2_sha256' || !iterations || !saltHex || !hashHex) return false

  const expected = Buffer.from(hashHex, 'hex')
  const actual = pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), Number(iterations), expected.length, 'sha256')
  return timingSafeEqual(actual, expected) // constant-time compare, so timing doesn't leak how close a guess was
}
