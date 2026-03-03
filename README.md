# Necookie Central Hub

Necookie Central Hub is a personal life dashboard with two active clients in this repository:

- `client/` for the existing web app
- `mobile/` for the Expo-based mobile app

The codebase uses Supabase for auth and most data access, plus a small Express server used for AI summary generation.

This README reflects the code that exists in the repository today, not the original product vision.

## Current Status

- `client/` is the primary application and contains the implemented product experience.
- `mobile/` is an active Expo app with authenticated navigation and core feature coverage for dashboard, todo, journal, finance, and history.
- `server/` is a lightweight API with one AI endpoint at `/api/ai/summary`.
- Most feature CRUD is handled directly from the clients with `@supabase/supabase-js`.
- Shared business/data access logic is starting to live under `shared/`.
- There are no root workspace scripts yet. Install and run each app separately.

## Implemented Web App Areas

### Authentication and App Shell

- Landing page with a modal-based login/sign-up flow
- Supabase session handling in the client
- Protected routes for the main app
- Desktop sidebar and mobile slide-out navigation
- Theme selector integrated into the app shell

### Dashboard

- Multi-card dashboard layout
- Health and activity widgets
- Task and recent activity widgets
- AI daily recap card

### Finance

- Finance dashboard with summary cards and charts
- Calendar view for transactions
- Savings/vault-style goal area
- Transaction history table
- Add/delete transaction flow

### Todo

- Projects
- Tasks with priorities, tags, due dates, and notes
- Subtasks
- Task create/edit modal

### Journal and History

- Journal entries stored in Supabase
- Mood tracking
- Search, filter, and grid/list views
- Unified activity feed view

### Vault

- Private vault screen backed by Supabase data
- Client-side PIN gate before loading data

## Implemented Mobile App Areas

### Mobile Foundation

- Expo 55 app in `mobile/`
- Expo Router route structure with auth and tab groups
- Shared Supabase-backed data service via `shared/`
- AsyncStorage-backed Supabase session persistence
- Typed TypeScript mobile app with custom theme primitives and reusable UI components

### Mobile Auth and App Shell

- Login and signup screens
- Auth-gated root layout and tab navigation
- Sign-out flow from the dashboard
- Splash/font loading and protected-route redirects

### Mobile Feature Coverage

- Dashboard with recent activity, next-task summary, and shortcuts
- Todo list with status filters and completion toggles
- Journal list plus entry creation modal
- Finance hub with dashboard, calendar, vault, and transaction tabs
- Finance create/delete flows, savings funds/goals, and transfer actions
- History timeline screen

### Mobile Release Readiness

- `mobile/app.json` is configured for `com.necookie.centralhub` on both iOS and Android
- `mobile/eas.json` includes an internal Android build profile
- `mobile/package.json` includes `typecheck`, Android export, and internal Android EAS build scripts
- Android export validation has been exercised successfully with Expo export

## Architecture

### Frontend

- React 19
- Vite 7
- React Router DOM 7
- Tailwind CSS 3
- TanStack Query
- Supabase JS client
- Recharts
- Lucide React

### Backend

- Node.js
- Express
- OpenAI SDK
- Supabase JS client
- `pg` and `sequelize` are installed, but the current server code does not expose general CRUD endpoints

### Data Flow

- The client talks directly to Supabase for most reads/writes
- The Express server is currently used for AI summary generation only
- The AI flow is:
  - client gathers the user's same-day history from Supabase
  - client posts a prompt to `/api/ai/summary`
  - server calls OpenAI
  - client saves the generated summary back to Supabase

## Repository Structure

```text
Necookie-Central-Hub/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |-- constants/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- api.js
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- supabaseClient.js
|   |-- public/
|   |-- package.json
|   `-- vite.config.js
|-- mobile/
|   |-- app/
|   |-- assets/
|   |-- components/
|   |-- src/
|   |-- app.config.js
|   |-- app.json
|   |-- eas.json
|   `-- package.json
|-- server/
|   |-- controllers/
|   |-- routes/
|   |-- index.js
|   |-- package.json
|   `-- todo_migrations.sql
|-- shared/
|   `-- services/
|-- package.json
`-- README.md
```

## Environment Variables

### Client

Create `client/.env` with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Mobile

The mobile app reads Supabase values from Expo public env vars or the repository root `.env`.

Supported keys:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server

Create `server/.env` with:

```env
PORT=5000
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

`SUPABASE_SERVICE_ROLE_KEY` is preferable on the server. The controller currently falls back to the anon key if the service role key is missing.

## Local Development

### 1. Install dependencies

```bash
cd client
npm install
```

In another terminal:

```bash
cd server
npm install
```

For mobile:

```bash
cd mobile
npm install
```

### 2. Start the server

```bash
cd server
npm run dev
```

### 3. Start the client

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

### 4. Start the mobile app

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

## Database Notes

The code expects Supabase tables/views beyond what is defined in `server/todo_migrations.sql`.

From the current client services, the app references at least:

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

`server/todo_migrations.sql` only covers part of the todo schema, so a full Supabase schema/export is still needed if you want this repository to be reproducible from scratch.

## Known Gaps and Risks

- The server currently exposes only AI summary functionality.
- Most business logic and data access still live in the clients, not behind a backend API.
- The AI endpoint trusts `userId` from the client and does not verify auth server-side yet.
- The vault PIN is hardcoded in the frontend and should not be treated as real security.
- There are no automated tests in this repository yet.
- The top-level `package.json` does not currently provide workspace scripts.
- Mobile still needs broader device QA, especially around keyboard-heavy flows and long-content screens.

## Related Docs

- `MOBILE_IMPLEMENTATION_PLAN.md` for the current mobile status and next implementation steps
