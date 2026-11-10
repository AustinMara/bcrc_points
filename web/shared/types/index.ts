// Shapes shared by the browser (app/) and the API (server/). Nuxt auto-imports these.

export interface Student {
  id: number
  first_name: string
  last_name: string
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
