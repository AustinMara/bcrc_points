// Runs before every page change. Only /instructor pages need a login:
// signed-out visitors go to the login page, and signed-in instructors skip it.

const LOGIN_PAGE = '/instructor/login'

export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/instructor')) return

  const { loggedIn } = useUserSession()
  if (!loggedIn.value && to.path !== LOGIN_PAGE) return navigateTo(LOGIN_PAGE)
  if (loggedIn.value && to.path === LOGIN_PAGE) return navigateTo('/instructor')
})
