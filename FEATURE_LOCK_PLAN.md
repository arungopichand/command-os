# COMMAND.OS Feature Lock Plan

Last updated: April 7, 2026

## Purpose

The project already has a strong shell and many feature surfaces. The next move is not adding more modules. The next move is locking the product around one clear daily loop and finishing that loop well.

For v1, `COMMAND.OS` should help one authenticated user:

1. Plan the day
2. Execute focused work
3. Track habits and goals
4. Review the day
5. Get reminded to return to the plan

## Product Thesis

`COMMAND.OS` v1 is a personal operating dashboard, not a giant everything app.

The first stable release should optimize for:

- daily repeat usage
- low-friction tracking
- honest state over flashy placeholders
- local-first reliability
- a small number of complete workflows

## Locked V1 Scope

These are the features that count as the first real product release.

### 1. Auth and startup

Keep:

- Supabase-backed login and signup
- session restore on app load
- missing-config screen
- logout flow

Definition of done:

- app always lands in a valid auth or config state
- no broken state between refreshes

### 2. Command Center

Keep:

- War Room / Command Center as the landing page
- live summary cards that reflect real app data
- navigation into the main workflows

Definition of done:

- landing page shows derived values, not fake KPIs
- each card leads into a usable workflow

### 3. Goals

Keep:

- create goal
- edit goal
- update status and progress
- list and summarize goals
- Supabase persistence

Definition of done:

- a signed-in user can manage goals end to end
- loading, empty, and error states are clear

### 4. Habits

Keep:

- habit matrix tracking
- streak and completion summaries
- daily checklist

Definition of done:

- habit actions save reliably
- stats shown in habits widgets come from real local state

### 5. Focus workflow

Keep:

- focus timer
- distraction log
- focus mode toggle

Definition of done:

- timer state survives refresh
- distraction notes auto-save
- focus mode has a visible effect on the shell

### 6. Daily review

Keep:

- journal / daily log
- quick review notes for the day
- export of local data

Definition of done:

- user can write and revisit today's notes
- export includes the core local tracking data

### 7. Notifications

Keep:

- browser permission flow
- alert list create, edit, enable, disable, delete
- daily notification scheduling

Definition of done:

- notification setup is understandable
- service worker registration is active in the real app flow

### 8. Dashboard control

Keep:

- widget visibility toggles
- rename and resize behavior
- stable tab configuration

Definition of done:

- users can tailor the dashboard without breaking layouts
- hidden widgets behave consistently in edit mode and normal mode

## V1 Non-Goals

These are explicitly not part of the locked v1 release.

- real brokerage or market API integrations
- advanced portfolio math beyond the current local snapshot
- voice commands
- meals, manifestation, project-360, learning, portfolio, sandbox, and other unlinked modules
- full Supabase sync for every local feature
- multi-user collaboration
- complex automation rules

## Secondary Modules

These modules can stay in the repo, but they should not control the release plan:

- Market Command
- Physical Ops
- Language Lab

Rule:

If these modules stay visible in v1, they should be framed as bonus modules and not block release. If they create confusion, hide them from primary navigation until the core loop is complete.

## Requirements Gathering Summary

Based on the current codebase, the product already implies these requirements:

- primary user is a single signed-in person managing personal routines
- app should work as a desktop-first SPA and remain usable on mobile
- auth is cloud-backed, but most day-to-day state is still local-first
- the most important data entities are goals, habits, focus sessions, notes, reminders, widget settings, and XP
- trust is more important than breadth, so fake metrics should be replaced or labeled

## Open Decisions To Lock Soon

These decisions should be made before more feature work:

1. Which data stays local-only in v1, and which data must sync to Supabase
2. Whether Market, Physical, and English stay in the main nav for v1
3. Whether XP is a cosmetic metric or a real part of the product loop
4. Whether journal data should stay browser-local or become synced user data
5. What the minimum mobile experience must support

## Build Order

### Phase 1. Stabilize the truth

- remove or replace hardcoded KPIs on the Command Center
- document the data model for goals and future user data
- register the service worker in the active app startup flow
- decide feature visibility for non-core modules

### Phase 2. Finish the core loop

- polish Goals
- polish Habits
- polish Focus + Journal
- ensure widgets show real values from stores or Supabase

### Phase 3. Release polish

- tighten empty states and copy
- test refresh, logout, and reinstall flows
- validate notification setup on supported browsers
- run a final pass on desktop and mobile layouts

## Immediate Backlog

The highest-value next tickets are:

1. Register the service worker so notifications can actually function in the shipped app.
2. Replace fake summary metrics in the War Room with derived values from local state and goals data.
3. Decide whether non-core modules remain visible or move behind an experimental label.
4. Write the Supabase schema and usage notes for goals and future synced user data.
5. Audit every widget labeled as a summary and make sure it reflects real state.

## Release Check

`COMMAND.OS` v1 is ready when a user can:

1. Sign in
2. Create and manage goals
3. Track habits
4. Run a focus session
5. Write a daily review
6. Configure reminders
7. See honest summaries on the dashboard

Anything beyond that is expansion, not the release gate.
