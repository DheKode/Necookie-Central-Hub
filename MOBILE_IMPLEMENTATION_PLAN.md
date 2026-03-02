# Mobile Implementation Plan

## Goal

Create a mobile version of Necookie Central Hub without turning the current web client into a fragile cross-platform codebase.

The right approach is to build a separate mobile client that reuses shared business logic, data models, and backend services where possible.

## Recommended Stack

- React Native with Expo
- Supabase for auth and data access
- Expo Router or React Navigation
- A mobile-native component system, not a direct Tailwind class port

## Why This Should Be a Separate Client

The current app is web-first and tightly coupled to browser UI patterns:

- `react-router-dom` is used for navigation
- Tailwind utility classes are embedded directly in the JSX
- Recharts is used for finance visualizations
- Some flows depend on `window.confirm` and `prompt`
- Layout assumes desktop sidebar behavior and browser scrolling

Trying to force the current client into mobile would create more rework than starting a proper Expo app.

## Current Codebase Constraints

Before starting mobile, these realities matter:

- Most CRUD goes directly from the client to Supabase
- The Express server is currently only used for AI summary generation
- Data access and UI logic are mixed together in several feature pages
- Some security-sensitive behavior is still client-trusting
- The vault PIN is frontend-only and should not be reused as a security model

## Phased Plan

### Phase 1: Extract shared logic from the web app

Move reusable logic out of page components and into shared modules:

- Centralize Supabase queries into domain services
- Separate data transforms from rendering logic
- Define shared types or schemas for tasks, journal entries, finance records, sleep logs, and activity logs
- Remove browser-only prompts and confirmations from core workflows

Target structure:

- `client/` remains the current web app
- `mobile/` becomes the new Expo app
- `shared/` or `packages/core/` holds reusable domain logic

### Phase 2: Create the mobile app foundation

- Scaffold an Expo app
- Add Supabase auth with secure session persistence
- Set up navigation
- Define mobile theme tokens and shared design primitives
- Configure environment handling for Supabase and API URLs

### Phase 3: Build the first mobile feature set

Start with the most valuable and easiest-to-port features:

1. Authentication
2. Todo
3. Journal
4. Finance transactions
5. History feed
6. Dashboard summary

This order works because those features already have relatively clear data models in the current codebase.

### Phase 4: Replace web-specific dependencies

Expected swaps:

- Recharts -> mobile chart library
- `react-router-dom` -> Expo Router or React Navigation
- browser dialogs -> mobile sheets, alerts, and action menus
- desktop-heavy layouts -> stacked mobile-first screens

### Phase 5: Backend hardening for mobile

The mobile app raises the cost of weak trust boundaries, so backend cleanup should follow early:

- Verify Supabase JWTs on the server
- Stop trusting raw `userId` in AI requests
- Move sensitive or privileged flows behind authenticated endpoints
- Redesign vault security before shipping it on mobile

## Feature Notes

### Todo

- Good first candidate for mobile
- Benefits from swipe actions, bottom sheets, and quick-add flows
- Subtasks and project filtering map cleanly to native patterns

### Journal

- Strong mobile fit
- Optimize for fast entry creation, mood selection, and search

### Finance

- Focus on quick transaction entry, history, and monthly summaries first
- Keep advanced analytics secondary until the core flows feel native

### Dashboard

- Should be simplified for mobile
- Prioritize summary cards and shortcuts instead of mirroring the full desktop density

### Vault

- Do not port the current frontend PIN approach as-is
- Treat this as a later security redesign

## Risks

- Reusing too much JSX-level code will slow down mobile development
- Current page components are large and should be decomposed before reuse
- Direct client-to-Supabase patterns may need review for long-term mobile security
- Visual parity with the web app should not be the goal; usability should

## Suggested Execution Order

1. Extract shared services and data models from the current web app
2. Scaffold the Expo app
3. Implement auth and navigation
4. Ship Todo and Journal
5. Add Finance and History
6. Add Dashboard summaries and AI integration
7. Harden backend auth and sensitive workflows
