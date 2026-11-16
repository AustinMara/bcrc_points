// students.ts: student queries shared by several API routes.
//
// STUDENT_COLUMNS          the columns instructor queries return, matching the Student type
// PUBLIC_STUDENT_COLUMNS   the columns public queries return, matching PublicStudent
//                          (the random public code instead of the id)
// getStudentsByIds(ids)    load several students by id in one query
// getPointsHistory(id)     one student's points history, newest first

export const STUDENT_COLUMNS = 'id, first_name, last_name, COALESCE(points, 0) AS points'

export const PUBLIC_STUDENT_COLUMNS =
  'public_code AS code, first_name, last_name, COALESCE(points, 0) AS points'

export function getStudentsByIds(ids: number[]): Promise<Student[]> {
  return query<Student>(`SELECT ${STUDENT_COLUMNS} FROM Students WHERE id IN (${placeholders(ids.length)})`, ids)
}

export function getPointsHistory(studentId: number): Promise<PointsEntry[]> {
  return query<PointsEntry>(
    'SELECT id, points_value, points_reason, created_at FROM Points WHERE student_id = ? ORDER BY id DESC',
    [studentId],
  )
}
