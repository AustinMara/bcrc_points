// POST /api/points: give (or take away) the same number of points to one or more students.
//
// Body: { student_ids: number[], value: number, reason?: string }
// Validates the input, then runs two SQL statements in one transaction no matter how
// many students: log every award in Points, then bump every total in Students.
// Returns the updated students so the browser can refresh its cache without reloading.

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const body = await readBody<{ student_ids?: number[]; value?: number; reason?: string }>(event)
  const reason = body.reason ?? ''
  const value = body.value

  if (!Array.isArray(body.student_ids) || !body.student_ids.length || !body.student_ids.every(Number.isInteger)) {
    throw createError({ statusCode: 400, statusMessage: 'Select at least one student' })
  }
  if (!Number.isInteger(value) || value === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Points must be a non-zero whole number' })
  }
  if (reason.length > 64) {
    throw createError({ statusCode: 400, statusMessage: 'Reason must be 64 characters or fewer' })
  }

  const ids = [...new Set(body.student_ids)] // never award the same student twice in one click
  if (ids.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'Too many students at once (max 200)' })
  }
  if ((await getStudentsByIds(ids)).length !== ids.length) {
    throw createError({ statusCode: 404, statusMessage: 'One or more students no longer exist' })
  }

  // Two statements no matter how many students: log every award, then bump every total.
  // batch(..., 'write') runs them as one transaction, so either both happen or neither does.
  await (await useDb()).batch(
    [
      {
        sql: `INSERT INTO Points (student_id, points_reason, points_value) VALUES ${ids.map(() => '(?, ?, ?)').join(', ')}`,
        args: ids.flatMap((id) => [id, reason, value!]),
      },
      {
        sql: `UPDATE Students SET points = COALESCE(points, 0) + ? WHERE id IN (${placeholders(ids.length)})`,
        args: [value!, ...ids],
      },
    ],
    'write',
  )

  return getStudentsByIds(ids)
})
