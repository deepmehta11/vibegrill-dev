# VibeGrill

Practice platform for **AI-assisted coding interviews**. Engineers pick a realistic Python task, solve it alongside an advice-only AI assistant, run everything in the browser, then get scored on how well they drove the AI — not just whether the tests passed.

Phase 1 (this repo) ships one mode end-to-end: realistic Python tasks + advice chat, scored by a hidden pytest suite plus an AI rubric judge.

## Stack

- **Next.js 16** (App Router, TypeScript) — one codebase, API routes as the backend
- **Neon Postgres** — users/sessions/messages/reports; **Neon Auth** (Better Auth) for accounts
- **Pyodide** (self-hosted, `public/pyodide/`) — Python + pytest run entirely in the browser, zero server execution
- **Monaco** editor + **Claude Sonnet** (Anthropic Messages API) for the assistant and the judge
- **Cloudflare Workers** via the OpenNext adapter

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

`predev`/`prebuild` regenerate two gitignored artifacts: `lib/content.generated.ts` (task bundle) and `public/pyodide/` (runtime, copied from the `pyodide` npm package).

### Environment variables (`.env.local`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `NEON_AUTH_BASE_URL` | Neon Auth server URL (from the Neon Console) |
| `NEON_AUTH_COOKIE_SECRET` | 32+ char secret for signing session cookies (`openssl rand -base64 32`) |
| `ANTHROPIC_API_KEY` | **Required for the chat + judge.** Get one at console.anthropic.com. Until set, those features degrade gracefully (chat shows an error, the judge is skipped and only test scores show). |

## Deploy (Cloudflare Workers)

```bash
npm run deploy     # opennextjs-cloudflare build && deploy
```

Set the same variables as **Worker secrets** (never committed):

```bash
npx wrangler secret bulk secrets.json      # DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET
npx wrangler secret put ANTHROPIC_API_KEY  # paste the key
```

Each deployment domain must be added as a Neon Auth **trusted origin** (Console → Branch → Auth, or the `configure_neon_auth` MCP tool) so sign-in redirects work.

## Authoring tasks

Each task is a folder under `content/tasks/<slug>/`:

```
task.json          # slug, title, difficulty, estimatedMinutes, summary, entry, tags
prompt.md          # description shown to the candidate
rubric.md          # per-task grading guidance for the judge
starter/           # editable starter files (with the planted bug / missing feature)
tests_visible/     # tests the candidate can run
tests_hidden/      # tests used only at grading time (never shipped to the client until submit)
solution/          # reference solution — used ONLY by scripts/verify-tasks.mjs, never shipped
```

Verify every task actually works (starter fails, reference solution passes all tests) using Pyodide — the same runtime the browser uses:

```bash
node scripts/verify-tasks.mjs          # all tasks
node scripts/verify-tasks.mjs <slug>   # one task
```

## Key paths

- `app/workspace/` — the in-browser IDE: Monaco, the Pyodide worker (`public/pyodide-worker.js` + `use-python.ts`), output/test panels, chat
- `app/api/chat`, `app/api/grade/[sessionId]` — streaming assistant + judge
- `lib/` — `db`, `auth`, `sessions`, `tasks` (loader), `judge`, `anthropic`
- `scripts/` — `build-content.mjs`, `copy-pyodide.mjs`, `verify-tasks.mjs`
