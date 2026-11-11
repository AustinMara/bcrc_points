// GET /api/favorites: the logged-in instructor's starred students, sorted by name.
// This is all the instructor home page loads, instead of the whole Students table.

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return query<Student>(
    `SELECT ${STUDENT_COLUMNS} FROM Students
     WHERE id IN (SELECT student_id FROM Favorites WHERE instructor_id = ?)
     ORDER BY last_name, first_name`,
    [user.id],
  )
})
