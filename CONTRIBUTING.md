# Contributing

**Necookie Central Hub is archived and no longer actively maintained.** See
the status notice in [README.md](README.md) for details.

Forks are welcome under the [MIT License](LICENSE). You're free to clone,
fork, and build on this code for your own purposes. However:

- Issues and pull requests opened against this repository **may not receive
  a response**. There is no active maintainer triaging this project.
- No new features, redesigns, or roadmap work will be accepted here. If you
  want to keep developing NecoFi, do it in your own fork.
- Security reports should still follow [SECURITY.md](SECURITY.md), but
  fixes are not guaranteed.

If you fork the project and continue development independently, you do not
need permission and you do not need to notify anyone — the MIT License
already grants you that right.

## Conventions used in this repository

If you do send a pull request (or are working in your own fork and want to
stay close to the original style), these are the conventions the codebase
already follows:

### Commit messages

Commits generally follow a `type: short description` or
`type(scope): short description` shape, for example:

```text
feat(mobile): add vault transfers, adjustments, and recent transfer history
fix: finance tab keeps refreshing
docs: created brand.md
refactor: break up godfiles across client and shared services
UI: landing page UI adjustment
```

Common types seen in history: `feat`, `fix`, `docs`, `refactor`, `UI`,
`mobile`, `merge`.

### Project layout

- `client/` — the web app (React + Vite). Feature UI lives under
  `src/pages` and `src/components`, with shared hooks in `src/hooks`.
- `mobile/` — the Expo/React Native app. Routes live under `app/` (Expo
  Router), reusable UI under `components/ui`, and feature logic under
  `src/`.
- `server/` — a small Express API used only for AI summary generation.
- `shared/` — Supabase data-access functions used by both `client/` and
  `mobile/`. New CRUD/data logic should generally go here rather than being
  duplicated in one client.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for more detail.

### Code style

- `client/` is linted with ESLint (`npm run lint` in `client/`). Fix lint
  errors before committing changes there.
- `mobile/` is TypeScript; run `npm run typecheck` in `mobile/` before
  committing changes there.
- There is no repository-wide formatter (no Prettier config) and no
  automated test suite. Match the style of the surrounding code by hand.

### Environment and secrets

- Never commit `.env` files or real credentials. Use the `.env.example`
  files as the template for required variables.
- If you add a new environment variable, add it (with a placeholder value)
  to the relevant `.env.example` file and document it in the README.
