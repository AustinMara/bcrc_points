export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username?: string; password?: string }>(event)
  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  type InstructorRow = { id: number; username: string; name: string | null; hashed_password: string }
  let instructor: InstructorRow | undefined
  try {
    ;[instructor] = await query<InstructorRow>(
      'SELECT id, username, name, hashed_password FROM Instructors WHERE username = ?',
      [username],
    )
  } catch (error) {
    console.error('Login database error:', error) // shows up in Vercel's function logs
    throw createError({ statusCode: 503, statusMessage: 'Could not reach the database. Check the Turso settings.' })
  }

  if (!instructor || !checkPassword(password, instructor.hashed_password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  if (!process.env.NUXT_SESSION_PASSWORD) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_SESSION_PASSWORD is not set on the server' })
  }
  await setUserSession(event, {
    user: { id: instructor.id, username: instructor.username, name: instructor.name },
  })
  return { ok: true }
})
