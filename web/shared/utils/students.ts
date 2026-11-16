// Small helpers used by both the browser (app/) and the API (server/). Nuxt auto-imports these.
//
// SEARCH_LIMIT                most students one instructor search returns
// PUBLIC_SEARCH_MIN_LETTERS   letters needed before the public site searches
// fullName(student)           "Ben Smith"
// byName(a, b)                sort by last name, then first name
// signed(points)              50 -> "+50", -3 -> "-3"
// formatDate(created_at)      "2026-11-16 02:30:00" (UTC) -> "Nov 15, 2026" (club time)

/** Most students one server search returns. */
export const SEARCH_LIMIT = 25

/** The public search needs at least this many letters, so it can't list every student. */
export const PUBLIC_SEARCH_MIN_LETTERS = 2

export function fullName(student: Student | PublicStudent): string {
  return `${student.first_name} ${student.last_name}`
}

/** Sort comparator: last name, then first name. */
export function byName(a: Student, b: Student): number {
  return a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
}

/** 50 -> "+50", -3 -> "-3" */
export function signed(points: number): string {
  return points > 0 ? `+${points}` : String(points)
}

/** Dates show in the club's time zone, so the server and the browser print the same day. */
const clubDate = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** "2026-11-16 02:30:00" (UTC, as the database stores it) -> "Nov 15, 2026" */
export function formatDate(createdAt: string): string {
  return clubDate.format(new Date(createdAt.replace(' ', 'T') + 'Z'))
}
