# COMMAND.OS

A tactical life dashboard built with React, TypeScript, Vite, Zustand, and Supabase auth.

Implementation checkpoint: see [CURRENT_PROGRESS.md](./CURRENT_PROGRESS.md) for a detailed summary of what is already built as of April 6, 2026.
Planning checkpoint: see [FEATURE_LOCK_PLAN.md](./FEATURE_LOCK_PLAN.md) for the locked v1 scope, non-goals, and build order.

## What It Includes

- Auth-gated single-page app with Supabase
- Configurable dashboard tabs powered by a widget registry
- Local-first persistence with optional Supabase sync hooks
- PWA setup for installable mobile and desktop usage
- Vercel SPA rewrite config for client-side routing

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example:

```bash
cp .env.example .env.local
```

3. Set these variables in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the app:

```bash
npm run dev
```

## Scripts

- `npm run dev` starts the Vite dev server
- `npm run typecheck` runs the app TypeScript checks
- `npm run lint` runs ESLint
- `npm run build` creates a production build
- `npm run preview` serves the production build locally

## Deployment Notes

- Vercel routing is configured in `vercel.json` to rewrite all routes to `index.html`
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your deployment environment
- Some widgets are still scaffolded placeholders, but they now render explicit pending states instead of blank panels
