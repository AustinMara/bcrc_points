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

## How it stays fast

- The home page loads only the instructor's **starred students** (`Favorites` table), not the whole
  database. Anyone else is found with a server-side name search capped at 25 results.
- `app/composables/useRoster.ts` caches students in the browser by id. Lists only hold ids, so
  after awarding points the one cached student is updated and every list showing them re-renders.
  Moving between pages doesn't refetch.
- Awarding points to N selected students is two SQL statements in one transaction
  (`server/api/points.post.ts`), and the response is just the updated students.

## Layout

- `shared/types/`: `Student`, `PointsEntry`, `StudentDetail`, used by both browser and server
- `app/composables/useRoster.ts`: the student cache and every API call that changes students
- `app/pages/`: `index.vue` (search, multi-select, +50 bar), `students/[id].vue` (history), `login.vue`
- `server/api/`: `auth/login`, `favorites` (list/star/unstar), `students` (search/add/detail), `points`
- `server/utils/`: `db.ts` (`query()` helper), `students.ts` (shared student columns), `password.ts`

After pulling schema changes, run `python bcrc.py init` against Turso to create new tables.
