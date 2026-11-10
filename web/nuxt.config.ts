export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['nuxt-auth-utils'],
  devtools: { enabled: true },
  app: {
    head: {
      title: 'BCRC Points',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Lexend: designed for reading ease, including for dyslexic readers.
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700&display=swap' },
      ],
    },
  },
})
