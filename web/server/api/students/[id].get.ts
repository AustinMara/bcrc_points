// GET /api/students/:id: one student's full details and points history, newest first
// (login required). 404 if the student doesn't exist.

export default defineEventHandler(async (event): Promise<StudentDetail> => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const [student] = await getStudentsByIds([id])
  if (!student) throw createError({ statusCode: 404, statusMessage: 'Student not found' })

  return { student, history: await getPointsHistory(id) }
})
