# Vibed Lite Jira

A lightweight Jira-style project tracker built with Next.js, Supabase, and deployed on Vercel.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript, Turbopack)
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, `@supabase/ssr` for cookie-based sessions)
- [Vercel](https://vercel.com) for hosting/deployment

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase project credentials (find them in your Supabase project under Project Settings → API):

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/                  # App Router routes, layouts, pages
  components/ui/        # shadcn/ui components
  lib/
    supabase/
      client.ts         # browser Supabase client
      server.ts         # server-side Supabase client (Server Components/Actions)
      proxy.ts           # session refresh logic used by src/proxy.ts
  proxy.ts               # Next.js 16 "Proxy" (formerly Middleware) — refreshes auth session on every request
```

> **Note:** Next.js 16 renamed Middleware to Proxy. `src/proxy.ts` is the equivalent of what older Next.js docs/guides call `middleware.ts`.

## Supabase usage

- In **Client Components**, import `createClient` from `@/lib/supabase/client`.
- In **Server Components / Route Handlers / Server Actions**, import `createClient` from `@/lib/supabase/server` (it's async — `await` it).
- Auth session refresh is handled centrally in `src/proxy.ts` for every request (except static assets).

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add the same environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy — Vercel auto-detects Next.js.

## Scripts

| Command         | Description              |
| ---------------- | ------------------------ |
| `npm run dev`    | Start the dev server     |
| `npm run build`  | Production build         |
| `npm run start`  | Start the production server |
| `npm run lint`   | Run ESLint               |
