import { createClient, type Client, type InArgs } from '@libsql/client'

let client: Client | undefined

/** Shared Turso client. Falls back to the local ../bcrcpoints.db when TURSO_DATABASE_URL isn't set. */
export function useDb(): Client {
  client ??= createClient(
    process.env.TURSO_DATABASE_URL
      ? { url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN }
      : { url: 'file:../bcrcpoints.db' },
  )
  return client
}

/** Run one SQL statement and return its rows as plain objects. */
export async function query<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const result = await useDb().execute({ sql, args })
  return result.rows.map((row) => Object.fromEntries(result.columns.map((column, i) => [column, row[i]])) as T)
}

/** "?, ?, ?" for an IN (...) list of the given length. */
export function placeholders(count: number): string {
  return Array(count).fill('?').join(', ')
}
