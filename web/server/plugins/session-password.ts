// Runs once when the server starts.
//
// The login cookie is encrypted with NUXT_SESSION_PASSWORD. On a fresh deploy with no
// settings, demo mode falls back to a fixed password so `demo` / `demo` still works.
// That password is public (it's right here), which is fine for throwaway demo data and
// never for real data, so with a real database a missing password is reported instead.

export default defineNitroPlugin(() => {
  if (process.env.NUXT_SESSION_PASSWORD) return

  if (isDemoDatabase()) {
    process.env.NUXT_SESSION_PASSWORD = 'bcrc-demo-mode-only-this-is-not-a-secret'
  } else {
    console.error('NUXT_SESSION_PASSWORD is not set, so nobody can log in. Set it to 32+ random characters.')
  }
})
