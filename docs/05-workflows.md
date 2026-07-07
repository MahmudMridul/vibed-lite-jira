# Workflows

## Branching strategy

- `main` — the main branch (per the repo's default branch convention).
- `dev` — active development branch; feature work is merged into `dev` via
  pull requests, then presumably promoted to `main` (based on observed
  history: `feat: add db schema` → PR #1 merged to `dev` → PR #2 merged to
  `dev`).
- No formal branch-per-feature naming convention has been established yet
  (repo history so far is small — 8 commits total).

## Commit conventions

This repo uses **Conventional Commits**, lowercase, imperative/present
tense, no scopes used so far:

```
feat: create backlogs UI
feat: implement swimlanes with drag feature
feat: add db schema
feat: update menu items
feat: implement landing page, only dark mode and menu
chore: setup project
```

Stick to `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` prefixes as
appropriate for new commits.

## PR process

- Observed pattern: push to `dev`, open a PR from `dev` (e.g. PR #1, #2),
  merge via GitHub's merge commit (not squash — see `Merge pull request #2
  from MahmudMridul/dev` in history).
- No CI checks, PR templates, or required reviewers are currently
  configured in the repo (no `.github/workflows/` directory present).

## Running tests, lint, build

| Command | Purpose |
|---|---|
| `npm run lint` | Run ESLint (flat config extending `next/core-web-vitals` + `next/typescript`) |
| `npm run build` | Production build via Next.js/Turbopack; also the primary correctness check since there is no test suite |
| `npm run dev` | Local dev server with hot reload |
| `npm run start` | Serve a production build locally |

**There is currently no test framework configured** (no Jest/Vitest/Playwright,
no `test` script, zero test files in the repo). Verification today relies on
`npm run build` succeeding, ESLint passing, and manual UI testing in the
browser. See [`AGENTS.md`](../AGENTS.md) at the repo root for the mandatory
rule: **build after every implementation change** (but don't run the dev
server as part of that check).

## The Next.js 16 "Proxy" rename

Next.js 16 renamed **Middleware** to **Proxy**. If you're used to
`middleware.ts`, the equivalent file here is [`src/proxy.ts`](../src/proxy.ts),
which delegates to `updateSession()` in `src/lib/supabase/proxy.ts`. Because
most existing Next.js tutorials/training data still refer to "middleware,"
this is called out explicitly in the README and in
[`AGENTS.md`](../AGENTS.md), which also instructs reading
`node_modules/next/dist/docs/` before writing Next.js code, since this
version may have other breaking changes vs. older conventions.

## Deployment process

Hosted on **Vercel**, deployed via git integration:

1. Push the repo to GitHub (already the case: `github.com:MahmudMridul/vibed-lite-jira`).
2. Import the project into [Vercel](https://vercel.com/new) (one-time setup).
3. Set the same two environment variables in the Vercel project settings:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Vercel auto-detects Next.js and builds/deploys on every push (no custom
   CI/CD pipeline beyond Vercel's built-in git integration — pushes to the
   production branch deploy to production, other branches get preview
   deployments).

There is no separate staging environment beyond Vercel's automatic preview
deployments per branch/PR.
