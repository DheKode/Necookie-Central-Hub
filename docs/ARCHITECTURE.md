# Architecture

This document describes how the pieces of Necookie Central Hub fit
together. See [README.md](../README.md) for setup instructions and a
feature list.

## Overview

Necookie Central Hub is a personal life-management dashboard (tasks,
journal, finance, activity history) with three runnable applications
sharing one Supabase backend:

```text
                     ┌───────────────────────┐
                     │   Supabase (Postgres)  │
                     │  auth + database + RLS │
                     └───────────▲────────────┘
                                 │ @supabase/supabase-js
              ┌──────────────────┼──────────────────┐
              │                  │                   │
    ┌─────────▼────────┐  ┌──────▼───────┐   ┌───────▼────────┐
    │   client/ (web)   │  │ mobile/ (RN) │   │ server/ (API)  │
    │ React 19 + Vite   │  │ Expo Router  │   │ Express        │
    └─────────┬─────────┘  └──────┬───────┘   └───────┬────────┘
              │                   │                    │
              └─────────┬─────────┘                    │
                         │ shared/                      │
                         │ Supabase data-access funcs    │
                         └───────────────────────────────┘
                                                         │
                                                  OpenAI API
                                              (AI summary only)
```

Both clients talk to Supabase **directly** for almost all reads and
writes (auth, CRUD for tasks, journal, finance, etc.), using the
functions in `shared/services/`. The Express server in `server/` is not a
general-purpose backend — it exists solely to call the OpenAI API for the
AI daily-recap/summary feature, because the OpenAI key must not be
exposed in client code.

## Apps

### `client/` — web app

- React 19, built with Vite 7.
- Routing via React Router DOM 7; data fetching/caching via TanStack
  Query.
- Styling with Tailwind CSS 3.
- Charts via Recharts, icons via Lucide React.
- `src/supabaseClient.js` creates the Supabase client using
  `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `src/services/dataService.js` and `src/services/aiService.js` wrap
  Supabase calls and the `/api/ai/summary` call respectively.
- Structure: `src/pages` (routed screens), `src/components` (shared and
  feature UI, e.g. `components/finance`, `components/todo`,
  `components/dashboard`), `src/hooks`, `src/constants`.
- Deployed as a static build (`vercel.json` rewrites all non-`/api`
  routes to `index.html` for client-side routing on Vercel).

### `mobile/` — Expo app

- Expo ~55 with Expo Router (file-based routing under `app/`), React
  Native 0.83, TypeScript.
- Route groups: `app/(auth)` (login/signup) and `app/(tabs)` (dashboard,
  todo, journal, finance, history).
- `src/lib/supabase.ts` creates the Supabase client, backed by
  AsyncStorage for session persistence, reading config from
  `Constants.expoConfig.extra` (populated by `app.config.js`) or
  `EXPO_PUBLIC_*` env vars.
- `app.config.js` also falls back to reading `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` from the **repo-root** `.env` file, so a
  single root `.env` can satisfy both `client/` and `mobile/` in local
  development.
- `src/services/dataService.ts` and `src/hooks/useAuth.ts` provide the
  same data/auth surface as the web client, on top of the same
  `shared/` functions where practical.
- Reusable UI primitives live in `components/ui` (Button, Card, Modal,
  FormField, etc.); feature-specific screens/logic live under
  `src/features`.
- App identifier `com.necookie.centralhub`; `eas.json` defines an
  `internal` Android APK build profile and a `production` profile.

### `server/` — API

- Node.js + Express, single route group mounted at `/api`
  (`routes/index.js` → `routes/ai.routes.js` →
  `controllers/ai.controller.js`).
- One endpoint: `POST /api/ai/summary`. It accepts `{ prompt, userId }`,
  calls OpenAI's chat completions API (`gpt-3.5-turbo`), and returns the
  generated text. The client is responsible for gathering the day's data
  from Supabase beforehand and saving the returned summary back to
  Supabase afterward — the server does not touch the database for this
  flow beyond initializing a Supabase client for potential future use.
- `pg` and `sequelize` are installed dependencies but are not currently
  wired up to any route — there is no general CRUD API here.
- `todo_migrations.sql` contains an incremental migration (projects,
  subtasks, RLS policies) rather than a full schema dump; see "Database"
  in the README for the full list of tables the apps expect.

### `shared/`

- `shared/services/dataService.js` and `shared/services/data-service/*`
  hold Supabase queries for each domain (finance, journal, activity,
  meals, todo, history), intended to be reused by both `client/` and
  `mobile/` instead of duplicating query logic per platform. This is a
  gradual migration — some client-specific logic still lives directly in
  `client/src/services` / `mobile/src/services`.

## Data flow: AI daily summary

1. The client (web or mobile) queries Supabase for the current user's
   same-day activity/history.
2. The client builds a prompt and calls `POST /api/ai/summary` on the
   Express server with `{ prompt, userId }`.
3. The server calls OpenAI and returns the generated text.
4. The client saves the returned summary back into Supabase (e.g. the
   `daily_summaries` table) and renders it.

Note: the server currently trusts the client-supplied `userId` as-is and
does not verify a Supabase auth token server-side — see "Known
Limitations" in the README.

## Why a separate server exists at all

Everything except the OpenAI call could, in principle, be done directly
from the client against Supabase (and mostly is). The Express server
exists only because the `OPENAI_API_KEY` must stay server-side; it is
intentionally minimal rather than a full backend-for-frontend.
