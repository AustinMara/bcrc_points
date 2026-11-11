// The data shapes shared by the browser (app/) and the API (server/). Nuxt auto-imports these.
//
// Student               a student as instructors see them
// PublicStudent         what the public site sees: id, first name, last initial, points
// PointsEntry           one line of a student's points history
// StudentDetail         a student plus their history (instructor student page)
// PublicStudentDetail   the same for the public ledger page

export interface Student {
  id: number
  first_name: string
  last_name: string
  points: number
}

/** What the public student-facing site sees: never the full last name. */
export interface PublicStudent {
  id: number
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

export interface PublicStudentDetail {
  student: PublicStudent
  history: PointsEntry[]
}
