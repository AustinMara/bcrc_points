import { existsSync, readdirSync } from 'node:fs'

// libsql loads its native SQLite binary (e.g. @libsql/linux-x64-gnu) with a dynamic require()
// that the bundler can't follow, so list whichever one is installed. Only the local file and
// demo database need it; Turso uses a pure-JavaScript client.
const LIBSQL_DIR = 'node_modules/@libsql'
const libsqlNativeBinaries = existsSync(LIBSQL_DIR)
  ? readdirSync(LIBSQL_DIR)
      .filter((name) => /^(linux|darwin|win32)-/.test(name))
      .map((name) => `${LIBSQL_DIR}/${name}/index.node`)
  : []

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
  nitro: {
    externals: { traceInclude: libsqlNativeBinaries },
    // Lets server/database/schema.d.sql.ts give schema.sql a type.
    typescript: { tsConfig: { compilerOptions: { allowArbitraryExtensions: true } } },
  },
})
