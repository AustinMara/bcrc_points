// Small helpers used by both the browser (app/) and the API (server/). Nuxt auto-imports these.
//
// SEARCH_LIMIT                most students one instructor search returns
// PUBLIC_SEARCH_MIN_LETTERS   letters needed before the public site searches
// fullName(student)           "Ben Smith"
// publicName(student)         "Ben S." for the public site
// byName(a, b)                sort by last name, then first name
// signed(points)              50 -> "+50", -3 -> "-3"

/** Most students one server search returns. */
export const SEARCH_LIMIT = 25

/** The public search needs at least this many letters, so it can't list every student. */
export const PUBLIC_SEARCH_MIN_LETTERS = 2

export function fullName(student: Student): string {
  return `${student.first_name} ${student.last_name}`
}

/** "Ben S." for the public site */
export function publicName(student: PublicStudent): string {
  return `${student.first_name} ${student.last_initial}.`
}

/** Sort comparator: last name, then first name. */
export function byName(a: Student, b: Student): number {
  return a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)
}

/** 50 -> "+50", -3 -> "-3" */
export function signed(points: number): string {
  return points > 0 ? `+${points}` : String(points)
}
