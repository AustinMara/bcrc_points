// students.ts: student queries shared by several API routes.
//
// STUDENT_COLUMNS        the columns every student query returns, matching the Student type
// getStudentsByIds(ids)  load several students by id in one query

/** The columns every student query returns, matching the Student type. */
export const STUDENT_COLUMNS = 'id, first_name, last_name, COALESCE(points, 0) AS points'

export function getStudentsByIds(ids: number[]): Promise<Student[]> {
  return query<Student>(`SELECT ${STUDENT_COLUMNS} FROM Students WHERE id IN (${placeholders(ids.length)})`, ids)
}
