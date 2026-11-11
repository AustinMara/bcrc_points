// POST /api/students: add a student (login required).
// Body: { first_name, last_name }. The new student is starred for the instructor who
// added them, so they show up on that instructor's home page right away.

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { first_name, last_name } = await readBody<{ first_name?: string; last_name?: string }>(event)
  if (!first_name?.trim() || !last_name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'First and last name are required' })
  }

  const [student] = await query<Student>(
    `INSERT INTO Students (first_name, last_name, points) VALUES (?, ?, 0) RETURNING ${STUDENT_COLUMNS}`,
    [first_name.trim(), last_name.trim()],
  )
  await query('INSERT INTO Favorites (instructor_id, student_id) VALUES (?, ?)', [user.id, student!.id])
  return student
})
