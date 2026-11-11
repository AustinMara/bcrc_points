// Tells the login page whether we're running on the temporary demo database.
export default defineEventHandler((): { demo: boolean; username?: string; password?: string } => {
  return isDemoDatabase() ? { demo: true, ...DEMO_LOGIN } : { demo: false }
})
