export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username?: string; password?: string }>(event)
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  const [instructor] = await query<{ id: number; username: string; name: string | null; hashed_password: string }>(
    'SELECT id, username, name, hashed_password FROM Instructors WHERE username = ?',
    [username],
  )
  if (!instructor || !checkPassword(password, instructor.hashed_password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  await setUserSession(event, {
    user: { id: instructor.id, username: instructor.username, name: instructor.name },
  })
  return { ok: true }
})
