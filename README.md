# Necookie Central Hub

Necookie Central Hub is a personal life dashboard built as a web app. The current codebase combines a React/Vite frontend with Supabase for auth and most data access, plus a small Express server used for AI summary generation.

This README reflects the code that exists in the repository today, not the original product vision.

## Current Status

- `client/` is the primary application and contains the implemented product experience.
- `server/` is a lightweight API with one AI endpoint at `/api/ai/summary`.
- Most feature CRUD is handled directly from the client with `@supabase/supabase-js`.
- There are no root workspace scripts yet. Install and run the client and server separately.

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
|-- server/
|   |-- controllers/
|   |-- routes/
|   |-- index.js
|   |-- package.json
|   `-- todo_migrations.sql
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
- Most business logic and data access live in the client, not behind a backend API.
- The AI endpoint trusts `userId` from the client and does not verify auth server-side yet.
- The vault PIN is hardcoded in the frontend and should not be treated as real security.
- There are no automated tests in this repository yet.
- The top-level `package.json` does not currently provide workspace scripts.

## Related Docs

- `MOBILE_IMPLEMENTATION_PLAN.md` for the separate mobile roadmap
