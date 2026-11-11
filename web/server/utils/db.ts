import { existsSync } from 'node:fs'
import { createClient, type Client, type InArgs } from '@libsql/client'
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

let client: Client | undefined
let ready: Promise<void> | undefined

/** Shared database client. The first call also sets up the demo database if one is needed. */
export async function useDb(): Promise<Client> {
  if (!client) {
    if (process.env.TURSO_DATABASE_URL) {
      client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
    } else if (!isDemoDatabase()) {
      client = createClient({ url: `file:${LOCAL_DB_FILE}` })
    } else {
      client = createClient({ url: ':memory:' })
      ready = fillDemoDatabase(client)
    }
  }
  await ready
  return client
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
