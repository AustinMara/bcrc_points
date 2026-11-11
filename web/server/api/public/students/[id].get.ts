// GET /api/public/students/:id: one student's public ledger for the student-facing site. No login.
//
// Returns first name + last initial, total, and every points entry (reason and amount),
// newest first. 404 if the student doesn't exist. Cached by Vercel's CDN for 30 seconds,
// like the public search.

export default defineEventHandler(async (event): Promise<PublicStudentDetail> => {
  const id = Number(getRouterParam(event, 'id'))

  const [student] = await query<PublicStudent>(`SELECT ${PUBLIC_STUDENT_COLUMNS} FROM Students WHERE id = ?`, [id])
  if (!student) throw createError({ statusCode: 404, statusMessage: 'Student not found' })

  setHeader(event, 'cache-control', 'public, s-maxage=30, stale-while-revalidate=60')
  return { student, history: await getPointsHistory(id) }
})
