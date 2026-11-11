// The data shapes shared by the browser (app/) and the API (server/). Nuxt auto-imports these.
//
// Student         a student as instructors see them
// PublicStudent   what the public site sees: no id, no full last name
// PointsEntry     one line of a student's points history
// StudentDetail   a student plus their history (the student page)

export interface Student {
  id: number
  first_name: string
  last_name: string
  points: number
}

/** What the public student-facing site sees: no id, no full last name. */
export interface PublicStudent {
  first_name: string
  last_initial: string
  points: number
}

export interface PointsEntry {
  id: number
  points_value: number
  points_reason: string | null
}

export interface StudentDetail {
  student: Student
  history: PointsEntry[]
}
