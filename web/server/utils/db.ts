import { existsSync } from 'node:fs'
import { createClient as createTursoClient, type Client, type InArgs } from '@libsql/client/web'
import schema from '../database/schema.sql' // Nitro imports .sql files as plain text

const LOCAL_DB_FILE = '../bcrcpoints.db'
export const DEMO_LOGIN = { username: 'demo', password: 'demo' }

/**
 * Which database to use:
 *   1. Turso, when TURSO_DATABASE_URL is set (production).
 *   2. The local ../bcrcpoints.db, when it exists (development).
 *   3. Otherwise a temporary in-memory demo database, so a fresh deploy still works.
 *      Its data is lost whenever the server restarts.
 */
export function isDemoDatabase(): boolean {
  return !process.env.TURSO_DATABASE_URL && !existsSync(LOCAL_DB_FILE)
}

let connection: Promise<Client> | undefined

/** Shared database client, connected on first use. */
export function useDb(): Promise<Client> {
  connection ??= connect()
  return connection
}

async function connect(): Promise<Client> {
  if (process.env.TURSO_DATABASE_URL) {
    // Pure-JavaScript HTTP client: no native code, so it runs anywhere (including Vercel).
    return createTursoClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  }

  // The local file and the demo database need SQLite itself, a native module, so load it only here.
  const { createClient } = await import('@libsql/client')
  if (!isDemoDatabase()) return createClient({ url: `file:${LOCAL_DB_FILE}` })

  const demo = createClient({ url: ':memory:' })
  await fillDemoDatabase(demo)
  return demo
}

/** Run one SQL statement and return its rows as plain objects. */
export async function query<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const result = await (await useDb()).execute({ sql, args })
  return result.rows.map((row) => Object.fromEntries(result.columns.map((column, i) => [column, row[i]])) as T)
}

/** "?, ?, ?" for an IN (...) list of the given length. */
export function placeholders(count: number): string {
  return Array(count).fill('?').join(', ')
}

/** Create the tables, a demo instructor, and a few starred students to try things with. */
async function fillDemoDatabase(db: Client) {
  await db.executeMultiple(schema)
  await db.execute({
    sql: 'INSERT INTO Instructors (id, username, name, hashed_password) VALUES (1, ?, ?, ?)',
    args: [DEMO_LOGIN.username, 'Demo Instructor', makePasswordHash(DEMO_LOGIN.password)],
  })
  const names = [['Ava', 'Chen'], ['Ben', 'Garcia'], ['Chloe', 'Kim'], ['Diego', 'Lopez'], ['Ella', 'Patel'], ['Finn', 'Reed']]
  for (const [first, last] of names) {
    await db.execute({ sql: 'INSERT INTO Students (first_name, last_name, points) VALUES (?, ?, 0)', args: [first!, last!] })
  }
  await db.execute('INSERT INTO Favorites (instructor_id, student_id) SELECT 1, id FROM Students')
}
