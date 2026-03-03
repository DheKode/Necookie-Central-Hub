# Mobile Implementation Plan

## Current Status

`mobile/` is no longer a proposal. It is an active Expo app with a working authenticated shell and core feature coverage.

Implemented today:

- Expo 55 app with Expo Router
- Supabase auth with AsyncStorage session persistence
- Auth routing for login, signup, and protected tabs
- Dashboard, Todo, Journal, Finance, and History screens
- Shared data access through `shared/services`
- Internal Android release config via EAS
- TypeScript validation and Android export validation scripts

Recent stabilization work:

- Finance tab refresh loop fixed in `mobile/src/hooks/useRefreshOnFocus.ts`
- Finance vault transfer flow hardened to avoid partial-write inconsistencies
- Shared mobile modal improved for Android keyboard avoidance
- Generated Android export artifacts excluded from source control

## What Exists In Mobile Right Now

### Navigation and Auth

- Route groups for `(auth)` and `(tabs)`
- Login and signup flows backed by Supabase
- Session-based redirect handling in the root layout
- Dashboard sign-out flow

### Feature Coverage

- Dashboard:
  - recent activity
  - next-task summary
  - shortcuts into core modules
- Todo:
  - task list
  - status filtering
  - completion toggling
- Journal:
  - entry list
  - mood selection
  - create-entry modal
- Finance:
  - dashboard summary
  - calendar view
  - transaction history
  - add/delete transaction
  - savings funds/goals
  - transfer and balance adjustment flows
- History:
  - grouped activity timeline

## Release State

Current mobile release configuration:

- iOS bundle identifier: `com.necookie.centralhub`
- Android package: `com.necookie.centralhub`
- Internal Android EAS profile: `internal`
- Internal Android artifact type: `apk`

Current validation commands:

- `npm run typecheck`
- `npm run export:android`
- `npm run build:internal:android`

Most recent local release checks completed successfully for:

- TypeScript compile validation
- Android export generation

## Remaining Work

### Priority 1: Stabilize Current Flows

Focus on quality before widening scope.

- Run device QA across auth, dashboard, todo, journal, finance, and history
- Verify session recovery after app background/foreground transitions
- Exercise finance destructive flows and transfer edge cases with real backend data
- Check small Android screens and tall modal content on physical devices
- Add regression coverage for the focus-refresh hook and finance transfer flow if a test harness is introduced

### Priority 2: Improve Incomplete Product Areas

These areas exist but still read as early implementations.

- Todo:
  - replace placeholder add-task action with a real creation flow
  - add edit/delete coverage if required for parity
- Dashboard:
  - refine loading/error states and shortcuts based on actual mobile usage
- Journal:
  - add edit/delete/search only if they are needed for release scope
- History:
  - confirm the unified feed behavior matches backend data expectations

### Priority 3: Harden Release Process

- Add a repeatable pre-push or CI validation path for mobile
- Decide whether `expo-doctor` should be pinned as a local dependency or run another way
- Define versioning/release-number workflow for `app.json` and EAS production builds
- Confirm store-facing app naming, icon, splash, and metadata before external distribution

### Priority 4: Security and Backend Hardening

The current mobile app inherits existing backend trust boundaries from the web app.

- Stop trusting raw client context for sensitive server operations
- Verify Supabase JWTs server-side where server endpoints are used
- Revisit vault/security-sensitive flows before treating them as secure features
- Review whether any finance or future premium flows should move behind authenticated backend endpoints

## Things That Are Safe To Remove

Based on the current route structure:

- `mobile/app/modal.tsx`
- `mobile/app/(tabs)/two.tsx`

Those placeholder Expo template routes are no longer referenced by the active layout tree.

## Suggested Execution Order

1. Finish device QA on the current mobile feature set.
2. Implement the missing Todo creation flow.
3. Add lightweight release automation for typecheck plus Android export validation.
4. Tighten security-sensitive backend assumptions inherited from the web app.
5. Only then expand mobile scope beyond the current feature set.

## Non-Goals For The Next Pass

- Do not broad-refactor the web app to chase cross-platform reuse.
- Do not expand the mobile feature surface before the current flows are stable.
- Do not assume web parity is required screen-for-screen.

The mobile app is now in a stabilization phase, not an initial scaffolding phase.
