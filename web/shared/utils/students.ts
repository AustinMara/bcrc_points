// Small helpers used by both the browser (app/) and the API (server/). Nuxt auto-imports these.

/** Most students one server search returns. */
export const SEARCH_LIMIT = 25

export function fullName(student: Student): string {
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
