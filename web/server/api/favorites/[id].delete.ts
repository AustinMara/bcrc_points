export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const studentId = Number(getRouterParam(event, 'id'))

  await query('DELETE FROM Favorites WHERE instructor_id = ? AND student_id = ?', [user.id, studentId])
  return { ok: true }
})
