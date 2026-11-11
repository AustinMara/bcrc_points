// db.ts: the database connection. Nitro auto-imports these into every server file.
//
// isDemoDatabase()     true when DEMO_MODE=true, or when there's no Turso URL and no local
//                      file, so the app runs on a temporary in-memory demo database
// useDb()              the shared database client, connected on first use
// query(sql, args)     run one SQL statement, get the rows back as plain objects
// placeholders(n)      "?, ?, ?" for an IN (...) list of n values
// fillDemoDatabase()   (private) create the tables plus a demo instructor and students

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
  if (process.env.DEMO_MODE === 'true') return true // forced, e.g. `npm run dev:demo`
  return !process.env.TURSO_DATABASE_URL && !existsSync(LOCAL_DB_FILE)
}

let connection: Promise<Client> | undefined

/** Shared database client, connected on first use. */
export function useDb(): Promise<Client> {
  connection ??= connect()
  return connection
}

async function connect(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL
  if (url && !url.startsWith('file:') && !isDemoDatabase()) {
    // Pure-JavaScript HTTP client: no native code, so it runs anywhere (including Vercel).
    return createTursoClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  }

  // Local files and the demo database need SQLite itself, a native module, so load it only here.
  const { createClient } = await import('@libsql/client')
  if (isDemoDatabase()) {
    const demo = createClient({ url: ':memory:' })
    await fillDemoDatabase(demo)
    return demo
  }
  // A file: URL (e.g. a test copy of the database), or the local bcrcpoints.db.
  return createClient({ url: url ?? `file:${LOCAL_DB_FILE}` })
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
