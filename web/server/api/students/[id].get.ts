export default defineEventHandler(async (event): Promise<StudentDetail> => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const [student] = await getStudentsByIds([id])
  if (!student) throw createError({ statusCode: 404, statusMessage: 'Student not found' })

  const history = await query<PointsEntry>(
    'SELECT id, points_value, points_reason FROM Points WHERE student_id = ? ORDER BY id DESC',
    [id],
  )
  return { student, history }
})
