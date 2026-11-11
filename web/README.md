# BCRC Points (Nuxt)

## Local development

    npm install
    npm run dev          # http://localhost:3000

With no `TURSO_DATABASE_URL` set, the app uses `../bcrcpoints.db`. To use Turso,
copy `.env.example` to `.env` and fill it in.

Create instructor logins with the CLI in the parent folder (passwords use the same hash format):

    ../.venv/bin/python ../bcrc.py add-instructor <username> --name "<Name>"

## Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. Set **Root Directory** to `web`. Vercel detects Nuxt automatically.
3. Add environment variables: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`,
   `NUXT_SESSION_PASSWORD` (32+ random characters, e.g. `openssl rand -hex 32`).

**Demo mode:** if `TURSO_DATABASE_URL` isn't set and there's no `../bcrcpoints.db` (e.g. a fresh
Vercel deploy), the app runs on a temporary in-memory database. Log in with `demo` / `demo`.
Changes there are lost whenever the server restarts.

To try demo mode locally (where `bcrcpoints.db` exists), run `npm run dev:demo`, or set
`DEMO_MODE=true`. That forces the demo database even if Turso or the local file is available.

## How it stays fast

- The home page loads only the instructor's **starred students** (`Favorites` table), not the whole
  database. Anyone else is found with a server-side name search capped at 25 results.
- `app/composables/useRoster.ts` caches students in the browser by id. Lists only hold ids, so
  after awarding points the one cached student is updated and every list showing them re-renders.
  Moving between pages doesn't refetch.
- Awarding points to N selected students is two SQL statements in one transaction
  (`server/api/points.post.ts`), and the response is just the updated students.

## Layout

Every source file starts with a comment explaining what it does and what each function in it does.

**Pages (routes)**
- `/`: `app/pages/index.vue`, the public student site: big search box, type your name, see your points. No login.
  The search is kept in the address (`/?q=ben`) so Back from a ledger returns to the results.
- `/students/:id`: a student's public ledger (first name + last initial, total, every award)
- `/instructor`: `app/pages/instructor/index.vue`: search, multi-select, +50 bar, add student (+)
- `/instructor/students/:id`: one student's total and history
- `/instructor/login`: instructor login (shows the demo login in demo mode)

**Browser code**
- `app/assets/css/main.css`: Tailwind theme (club colors, Lexend) and the 90s `btn` / `field` styles
- `app/components/`: `SearchBar`, `ListHeader`, `PointsForm`, shared by both sites
- `app/composables/useRoster.ts`: the instructor's student cache and every API call that changes students
- `app/composables/useDebounced.ts`: waits for typing to pause before searching

**Server code**
- `server/api/public/points.get.ts`: public lookup (first name + last initial only)
- `server/api/`: `auth/login`, `favorites` (list/star/unstar), `students` (search/add/detail), `points`, `demo`
- `server/utils/`: `db.ts` (connection + `query()`), `students.ts`, `password.ts`
- `server/database/schema.sql`: the table definitions, shared with `bcrc.py init`
- `shared/`: types and small helpers used by both browser and server

**Note:** `node .output/server/index.mjs` (or `nuxt preview`) currently can't serve the page's
JavaScript files, because of a bug in the build tool (Nitro 2.13). Use `npm run dev` locally;
Vercel is not affected because its CDN serves those files.

After pulling schema changes, run `python bcrc.py init` against Turso to create new tables.
