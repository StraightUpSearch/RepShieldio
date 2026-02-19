# RepShield.io - Claude Code Project Context

## Project Overview
RepShield is a SaaS web app for Reddit reputation management — content monitoring, removal requests, and brand scanning. Built as a full-stack TypeScript application.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, wouter (routing), TanStack React Query
- **Backend**: Express.js + TypeScript, Passport.js (local auth), SQLite (dev) / PostgreSQL (prod)
- **Testing**: Playwright (E2E tests in `tests/mvp-smoke.spec.ts`)
- **Payments**: Stripe (optional, graceful fallback when not configured)
- **Email**: SendGrid (optional, logs in dev)

## Architecture
```
client/src/         → React frontend
  pages/            → Route pages (auth-page, my-account, dashboard, scan, etc.)
  components/       → Reusable components (header, footer, ticket-status, etc.)
  hooks/useAuth.ts  → Auth hook — extracts user from {authenticated, user} response
  lib/queryClient.ts→ TanStack Query config + apiRequest helper
server/             → Express backend
  routes.ts         → All API endpoints
  simple-auth.ts    → Passport local strategy, session management
  storage.ts        → Database abstraction layer
  db-init.ts        → Table creation
shared/schema.ts    → Shared types/schemas (Zod)
```

## Key Patterns

### Authentication Flow
- `/api/auth/user` returns `{ authenticated: boolean, user: {...} }` — the `useAuth` hook extracts `data.user`
- Login: `POST /api/auth/login` → sets session cookie → invalidates query cache → redirects to `/my-account`
- Register: `POST /api/register` → auto-login via the login mutation
- Logout: `POST /api/logout` → `queryClient.clear()` → router navigate to `/`

### Navigation
- Use wouter's `useLocation` / `setLocation` for navigation — NEVER use `window.location.href` (causes full page reloads)
- Protected pages redirect to `/login` via `useEffect`, not conditional returns before hooks

### React Hooks Rules
- All hooks (useState, useQuery, useMutation, etc.) MUST be called before any conditional returns
- Use `enabled: !!user` on queries that need auth, not conditional hook calls

### API Response Handling
- `apiRequest()` throws on non-200 responses
- Default queryFn throws on 401 — use custom queryFn for endpoints that should gracefully handle 401

## Dev Commands
```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npx playwright test  # Run all E2E tests
npx playwright test tests/mvp-smoke.spec.ts --project=chromium  # Chromium only
```

## Testing
- 58 Playwright tests (29 chromium + 29 mobile-chrome)
- Tests cover: navigation, auth flow (register/login/logout), public pages, protected page redirects, mobile menu, API health
- Always run tests after changes: `npx playwright test --reporter=list`

## Git
- Repo: github.com/StraightUpSearch/RepShieldio
- Main branch: `main`
- Always include: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`
