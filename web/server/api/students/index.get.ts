// Search students by name. Returns at most SEARCH_LIMIT matches so the page never loads the whole table.
export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const text = String(getQuery(event).q ?? '').trim()
  if (!text) return []

  return query<Student>(
    `SELECT ${STUDENT_COLUMNS} FROM Students
     WHERE first_name || ' ' || last_name LIKE ?
     ORDER BY last_name, first_name
     LIMIT ${SEARCH_LIMIT}`,
    [`%${text}%`],
  )
})
