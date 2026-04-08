# COMMAND.OS Current Progress

This document captures the current implementation state of the project as of **April 6, 2026**.

## 1. Project Summary

`COMMAND.OS` is a tactical life-tracking dashboard built as a React single-page application. The project already has a strong UI shell, authentication flow, local persistence, configurable widget dashboards, and several interactive feature modules. The codebase is organized to support a larger "life operating system" vision across productivity, habits, fitness, language learning, market tracking, and notifications.

## 2. Tech Stack and Core Setup

The app is currently built with:

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand for client state and persisted dashboard configuration
- Supabase for authentication and optional data sync
- React Router for SPA navigation
- Framer Motion for motion and transitions
- Vite PWA plugin for installable app support
- React Query provider already set up at the app root

Current infra/config already in place:

- Environment-based Supabase configuration using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Vercel SPA rewrite config in `vercel.json`
- PWA manifest and service worker assets
- Lazy loading for major routes/widgets
- Manual Vite chunk splitting for React, motion, Supabase, React Query, charts, and icons

## 3. What Is Already Working

### 3.1 App Shell and Routing

The main app shell is implemented in `src/app/App.tsx`, `src/layouts/MainLayout.tsx`, `src/layouts/Sidebar.tsx`, and `src/layouts/DashboardLayout.tsx`.

Working pieces include:

- Auth-gated entry flow
- Configuration screen when Supabase env vars are missing
- Route-based navigation for:
  - `/`
  - `/market`
  - `/physical`
  - `/english`
  - `/habits`
  - `/focus`
  - `/goals`
  - `/journal`
  - `/settings`
  - `/notifications`
- Collapsible sidebar navigation
- Focus mode / "Dark Zone" overlay
- Emergency modal trigger
- Toast notification UI in the main layout
- Lazy-loaded widgets per dashboard tab

### 3.2 Authentication

The auth experience in `src/features/auth/Auth.tsx` is implemented against Supabase and supports:

- Login with email and password
- Signup with email and password
- Auth session detection on app load
- Logout from the sidebar
- Error display for failed auth attempts

### 3.3 Persistent State

Two persisted Zustand stores are implemented:

- `src/store/useAppStore.ts`
  - XP tracking
  - mission/task progress
  - habit matrix state
  - focus mode state
  - authentication flag
  - portfolio holding storage
- `src/store/useWidgetStore.ts`
  - dashboard tab definitions
  - per-widget visibility
  - widget size updates
  - widget rename behavior
  - persisted layout preferences

The app also includes:

- `src/utils/exportData.ts` for exporting local browser data
- `src/hooks/useLocalStorage.ts` for local persistence utilities
- `src/hooks/useSupabaseSync.ts` for local-first plus Supabase-backed sync logic

### 3.4 Implemented Feature Modules

These modules currently render meaningful UI and contain working interaction logic:

- `WarRoom`
  - dashboard landing / command center
  - sector cards for major parts of the system
  - XP surfaced from the app store

- `HabitMatrix`
  - full-year calendar-style discipline tracker
  - daily completion toggles
  - streak calculation
  - annual and monthly progress display

- `MarketCommand`
  - TradingView advanced chart embed
  - tactical watchlist panel
  - P&L snapshot UI
  - risk panel UI

- `PhysicalOps`
  - interactive workout checklist
  - progress percentage calculation
  - weekly workout split display
  - quick workout support cards

- `LanguageLab`
  - word-of-the-day rotation
  - browser speech synthesis pronunciation
  - save/bookmark toggle in UI
  - sentence-of-the-day panel

- `Notifications`
  - browser notification permission flow
  - configurable reminder list
  - add, edit, toggle, and delete reminder items
  - scheduling trigger for daily alerts

- `OSControl`
  - widget visibility management per tab
  - control center for current dashboard modules

### 3.5 Widget System

The widget system is a strong part of the current implementation.

Implemented behavior:

- widget registry in `src/config/widgetRegistry.ts`
- reusable widget chrome in `src/components/ui/WidgetContainer.tsx`
- widget resize control
- widget rename control
- widget visibility toggling
- placeholder fallback for unfinished widgets

This means the overall dashboard architecture is already established even where some feature logic is still pending.

## 4. What Is Partially Implemented or Still Mocked

Several parts of the product are visually present but not fully connected to live data or full workflows yet.

### 4.1 Placeholder-backed Widgets

The following widget types are intentionally routed to `PlaceholderWidget` right now:

- `stats`
- `pnl`
- `streak`
- `check`
- `timer`
- `journal`
- `goals`
- `config`

This means the tab structure is ready, but those feature panels still need actual business logic and UI beyond the scaffold.

### 4.2 Static or Demo Data

Some implemented modules currently rely on hardcoded data instead of APIs or Supabase-backed records:

- market watchlist values and P&L figures
- workout exercises and weekly split
- language vocabulary pool and mastery labels
- some command center KPIs and section counters

So the presentation layer is in place, but the data layer is still partly mock/demo.

### 4.3 UI Controls Without Backing Logic Yet

There are several buttons or controls that appear in the UI but currently act as placeholders or visual affordances:

- dashboard refresh icon in `DashboardLayout`
- preset buttons in `OSControl`
- some "advanced" actions in feature modules
- some quick action cards in workout and language modules

## 5. Infrastructure That Exists but Is Not Fully Wired Yet

These pieces are present in the repository but are not fully connected in the active app flow yet:

- `useVoiceCommands` hook exists, but no current screen wires it into the UI
- `useSupabaseSync` exists, but the main feature screens are still mostly using local Zustand/localStorage patterns directly
- React Query is configured globally, but there are no active query-driven data features yet
- notification service helpers exist, but `registerServiceWorker()` is not currently called from the active app shell

That last point is important because scheduled notification behavior depends on the service worker path being fully activated in the browser.

## 6. Extra Feature Files Present in the Repo but Not Connected to Current Navigation

The repository already contains additional feature modules that are not currently exposed through the route/widget setup:

- `src/features/meals/Meals.tsx`
- `src/features/portfolio/Portfolio.tsx`
- `src/features/learning/Learning.tsx`
- `src/features/manifestation/Manifestation.tsx`
- `src/features/project-360/Project360.tsx`
- `src/features/stats/Stats.tsx`
- `src/features/english/EnglishTimer.tsx`
- `src/features/sandbox/CustomSandbox.tsx`

These look like exploratory or future modules that may become part of later dashboard tabs or feature expansions.

## 7. Current Product Shape

At this point, the project can reasonably be described as:

- a working authenticated SPA shell
- a configurable tactical dashboard framework
- a strong visual system with polished motion and branded UI
- a local-first productivity tracker with several interactive modules
- a project that has real architecture in place, but still needs deeper data integration and completion of placeholder widgets

## 8. Recommended Next Steps

The most valuable next steps would be:

1. Replace placeholder widgets with real feature implementations for focus, goals, journal, and stats.
2. Decide which state should stay local in Zustand and which state should move to Supabase sync.
3. Register the service worker in the active app startup flow so notifications work reliably.
4. Connect market, workout, and language modules to real data sources instead of hardcoded arrays.
5. Either wire the unused feature modules into navigation or move them into a clearly labeled experimental area.
6. Add schema documentation for the expected Supabase tables, especially `user_data`.

## 9. Quick Setup Reminder

To run the project locally:

1. Install dependencies with `npm install`
2. Create `.env.local` from `.env.example`
3. Set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Start with `npm run dev`

Useful scripts:

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run preview`

## 10. Short Status Statement

The project is already beyond a basic prototype. The app shell, dashboard architecture, auth flow, persistence layer, and multiple feature screens are built. The main gap now is not structure, but completion: wiring more modules to real data, finishing placeholder widgets, and connecting a few prepared infrastructure pieces into the live experience.
