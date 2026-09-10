# Necookie Central Hub

Necookie Central Hub is a personal life dashboard — tasks/projects, a
journal, a finance tracker, and a unified activity history — built as a
web app (`client/`) and a companion Expo mobile app (`mobile/`), backed by
Supabase.

> ## 🗄️ Archived / Discontinued — September 2026
>
> This project is no longer under active development. It is preserved
> here for reference and for anyone who wants to fork it.
>
> - No new features, fixes, or support will be provided.
> - Issues and pull requests may not receive a response — see
>   [CONTRIBUTING.md](CONTRIBUTING.md).
> - The project should not be treated as production-ready — see
>   [SECURITY.md](SECURITY.md).
> - **External infrastructure this project depends on — namely its
>   [Supabase](https://supabase.com) project (database/auth) and its
>   [OpenAI](https://platform.openai.com) API key — may be decommissioned
>   after archival.** If you fork this repository and want to run it
>   again in the future, expect to need to provision your own Supabase
>   project and OpenAI API key (and reproduce the database schema — see
>   [Database Setup](#database-setup)), since the original hosted
>   instances and credentials may no longer exist or be valid.

This README reflects the code that exists in the repository today, not the
original product vision.

## Implemented Features

### Web app (`client/`)

**Authentication and app shell**
- Landing page with a modal-based login/sign-up flow
- Supabase session handling in the client
- Protected routes for the main app
- Desktop sidebar and mobile slide-out navigation
- Theme selector integrated into the app shell

**Dashboard**
- Multi-card dashboard layout
- Health and activity widgets
- Task and recent activity widgets
- AI daily recap card

**Finance**
- Finance dashboard with summary cards and charts
- Calendar view for transactions
- Savings/vault-style goal area
- Transaction history table
- Add/delete transaction flow

**Todo**
- Projects
- Tasks with priorities, tags, due dates, and notes
- Subtasks
- Task create/edit modal

**Journal and History**
- Journal entries stored in Supabase
- Mood tracking
- Search, filter, and grid/list views
- Unified activity feed view

**Vault**
- Private vault screen backed by Supabase data
- Client-side PIN gate before loading data (UX gate, not real security —
  see [Known Limitations](#known-limitations))

### Mobile app (`mobile/`)

- Expo (~55) app with Expo Router, TypeScript, and a custom theme/design
  system
- Auth-gated navigation: login/signup screens, protected tab layout,
  sign-out flow
- AsyncStorage-backed Supabase session persistence
- Dashboard with recent activity, next-task summary, and shortcuts
- Todo list with status filters and completion toggles
- Journal list plus entry creation modal
- Finance hub: dashboard, calendar, vault, transaction, savings
  funds/goals, and transfer flows (create/delete included)
- History timeline screen
- Release plumbing: `app.json` configured for `com.necookie.centralhub`
  on iOS/Android, `eas.json` with an internal Android build profile, and
  `typecheck` / `export:android` / `build:internal:android` npm scripts

### Server (`server/`)

- One endpoint, `POST /api/ai/summary`, used for AI-generated daily
  recaps. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full
  request flow.

## Tech Stack

**Frontend (`client/`)**
- React 19, Vite 7
- React Router DOM 7
- Tailwind CSS 3
- TanStack Query
- Supabase JS client
- Recharts, Lucide React

**Mobile (`mobile/`)**
- Expo ~55, Expo Router, React Native 0.83, TypeScript
- Supabase JS client, AsyncStorage
- React Navigation

**Backend (`server/`)**
- Node.js, Express
- OpenAI SDK
- Supabase JS client
- `pg` and `sequelize` are installed but not currently wired to any
  route — there is no general CRUD API here

**Data**
- Supabase (Postgres, Auth, Row Level Security)

## Architecture / Project Structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a full walkthrough
of how `client/`, `mobile/`, `server/`, and `shared/` fit together and how
the AI summary flow works end to end.

```text
Necookie-Central-Hub/
|-- client/                 # Web app (React + Vite)
|   |-- src/
|   |   |-- components/     # Shared + feature UI (dashboard, finance, todo)
|   |   |-- constants/
|   |   |-- hooks/
|   |   |-- pages/          # Routed screens
|   |   |-- services/       # Supabase + AI-endpoint wrappers
|   |   |-- api.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- supabaseClient.js
|   |-- public/
|   |-- package.json
|   `-- vite.config.js
|-- mobile/                 # Expo app (React Native + TypeScript)
|   |-- app/                # Expo Router routes ((auth), (tabs))
|   |-- assets/
|   |-- components/         # Reusable UI primitives (components/ui)
|   |-- src/                # Features, hooks, services, Supabase client
|   |-- app.config.js
|   |-- app.json
|   |-- eas.json
|   `-- package.json
|-- server/                 # Express API (AI summary endpoint only)
|   |-- controllers/
|   |-- routes/
|   |-- index.js
|   |-- package.json
|   `-- todo_migrations.sql
|-- shared/                 # Supabase data-access functions shared by
|   `-- services/           # client/ and mobile/
|-- docs/
|   |-- ARCHITECTURE.md
|   `-- brand.md            # Visual/brand system reference
|-- .env.example             # Root-level env template (see below)
|-- package.json
`-- README.md
```

## Prerequisites

- Node.js 18+ and npm (developed/tested against Node 20+)
- A [Supabase](https://supabase.com) project (Postgres + Auth)
- An [OpenAI](https://platform.openai.com) API key (only needed to use the
  AI daily-recap feature)
- For mobile builds: the [Expo](https://docs.expo.dev/) tooling (`npx
  expo`) and, for internal Android builds, an [EAS](https://expo.dev/eas)
  account

## Installation

There are no root workspace scripts — install and run each app
separately.

```bash
# Web client
cd client
npm install

# API server (in another terminal)
cd server
npm install

# Mobile app (optional)
cd mobile
npm install
```

## Environment Setup

Copy the relevant `.env.example` file(s) to `.env` and fill in real
values. Never commit `.env` files.

### Client

Create `client/.env` (see `client/.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server

Create `server/.env` (see `server/.env.example`):

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

`SUPABASE_SERVICE_ROLE_KEY` is preferable on the server. The controller
currently falls back to the anon key if the service role key is missing.

### Mobile

The mobile app reads Supabase values from Expo public env vars, or falls
back to the **repo-root** `.env` file (see the root `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

The code expects Supabase tables/views beyond what is defined in
`server/todo_migrations.sql` (which only covers an incremental part of
the todo schema — projects, subtasks, and their RLS policies). From the
current client services, the apps reference at least:

- `projects`
- `tasks`
- `subtasks`
- `meals`
- `activity_logs`
- `sleep_logs`
- `personal_entries`
- `finance_records`
- `finance_goals`
- `daily_summaries`
- `unified_history`

There is no full schema export in this repository. To run this project
against a fresh Supabase project, you will need to recreate these tables
(with appropriate columns and Row Level Security policies scoped to
`auth.uid()`, following the pattern in `server/todo_migrations.sql`)
yourself.

## Local Development

1. **Start the server**

   ```bash
   cd server
   npm run dev
   ```

2. **Start the client**

   ```bash
   cd client
   npm run dev
   ```

   Open `http://localhost:5173`.

3. **Start the mobile app** (optional)

   ```bash
   cd mobile
   npm start
   ```

   Useful mobile commands:

   ```bash
   npm run typecheck
   npm run export:android
   npm run build:internal:android
   ```

## Build Commands

```bash
# Web client production build
cd client
npm run build      # outputs to client/dist
npm run preview    # preview the production build locally

# Web client lint
npm run lint

# Mobile typecheck
cd mobile
npm run typecheck

# Mobile Android export
cd mobile
npm run export:android
```

The server has no build step (`npm start` runs it directly with Node;
`npm run dev` runs it with nodemon).

## Known Limitations

- The server currently exposes only AI summary functionality — most
  business logic and data access live in the clients, not behind a
  backend API.
- The AI endpoint (`POST /api/ai/summary`) trusts the `userId` provided
  by the client and does not verify auth server-side.
- The vault PIN is a client-side UX gate, not real security, and should
  not be treated as one.
- There are no automated tests in this repository.
- There is no repository-wide formatter (no Prettier config); `client/`
  has ESLint, `mobile/` has TypeScript's `tsc --noEmit`, `server/` has
  neither.
- The top-level `package.json` does not provide workspace scripts —
  each app is installed and run independently.
- Mobile has not had broad device QA, particularly around keyboard-heavy
  flows and long-content screens.
- Since this project is archived, none of the above will be addressed
  going forward — see [SECURITY.md](SECURITY.md) before deploying a
  fork.

## Related Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the apps and data
  flow fit together
- [docs/brand.md](docs/brand.md) — the visual/brand system applied to the
  web app
- [MOBILE_IMPLEMENTATION_PLAN.md](MOBILE_IMPLEMENTATION_PLAN.md) — the
  mobile app's implementation history and status at the time development
  stopped

## Contributing

This project is archived. See [CONTRIBUTING.md](CONTRIBUTING.md) —
forks are welcome under the MIT License, but issues and pull requests
against this repository may not receive a response.

## License

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Dheyn Michael Orlanda.
