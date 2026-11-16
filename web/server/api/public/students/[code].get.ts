// GET /api/public/students/:code: one student's public ledger for the student-facing site. No login.
//
// Looks the student up by their random public code (see schema.sql), and returns their
// name, total, and every points entry (reason and amount), newest first. 404 if no student
// has that code. Cached by Vercel's CDN for 30 seconds, like the public search.

export default defineEventHandler(async (event): Promise<PublicStudentDetail> => {
  const code = getRouterParam(event, 'code') ?? ''

  const [row] = await query<PublicStudent & { id: number }>(
    `SELECT id, ${PUBLIC_STUDENT_COLUMNS} FROM Students WHERE public_code = ?`,
    [code],
  )
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Student not found' })

  const { id, ...student } = row // the id is only used here, never sent to the browser
  setHeader(event, 'cache-control', 'public, s-maxage=30, stale-while-revalidate=60')
  return { student, history: await getPointsHistory(id) }
})
