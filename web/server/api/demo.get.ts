// GET /api/demo: tells the login page whether the app is running on the temporary
// demo database (no Turso, no local file), and if so, the demo login to show.

export default defineEventHandler((): { demo: boolean; username?: string; password?: string } => {
  return isDemoDatabase() ? { demo: true, ...DEMO_LOGIN } : { demo: false }
})
