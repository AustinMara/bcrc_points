// PUT /api/favorites/:id: star a student for the logged-in instructor.
// Starring twice, or starring a student id that doesn't exist, does nothing.

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const studentId = Number(getRouterParam(event, 'id'))

  // Selecting from Students means a non-existent student id inserts nothing.
  await query(
    'INSERT OR IGNORE INTO Favorites (instructor_id, student_id) SELECT ?, id FROM Students WHERE id = ?',
    [user.id, studentId],
  )
  return { ok: true }
})
