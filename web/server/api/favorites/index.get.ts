// The logged-in instructor's starred students. This is what the home page loads
// instead of the whole Students table.
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  return query<Student>(
    `SELECT ${STUDENT_COLUMNS} FROM Students
     WHERE id IN (SELECT student_id FROM Favorites WHERE instructor_id = ?)
     ORDER BY last_name, first_name`,
    [user.id],
  )
})
