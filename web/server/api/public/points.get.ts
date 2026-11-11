// GET /api/public/points?q=name: public points search for the student-facing site. No login.
//
// To protect kids' privacy it returns only first name + last initial (plus the id, so a
// result can link to its ledger), needs at least PUBLIC_SEARCH_MIN_LETTERS letters, and
// returns at most 10 matches. Vercel's CDN may reuse an answer for 30 seconds, so many
// kids searching at once doesn't mean many database queries.

export default defineEventHandler(async (event): Promise<PublicStudent[]> => {
  const text = String(getQuery(event).q ?? '').trim()
  if (text.length < PUBLIC_SEARCH_MIN_LETTERS) return []

  setHeader(event, 'cache-control', 'public, s-maxage=30, stale-while-revalidate=60')

  return query<PublicStudent>(
    `SELECT ${PUBLIC_STUDENT_COLUMNS}
     FROM Students
     WHERE first_name || ' ' || last_name LIKE ?
     ORDER BY first_name, last_name
     LIMIT 10`,
    [`%${text}%`],
  )
})
