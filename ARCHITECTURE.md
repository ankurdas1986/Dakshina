# Dakshina Monorepo Baseline

## Deployment Architecture

- Use separate Vercel projects for each app surface:
  - `dakshina-web` -> `apps/web`
  - `dakshina-admin` -> `apps/admin`
  - `dakshina-priest` -> `apps/priest`
- Use one shared Supabase project for the full Dakshina platform:
  - shared auth
  - shared database
  - shared storage
  - shared realtime/notifications
- Do not split Supabase by app. Admin, priest, and user-facing apps must operate on the same marketplace records.
- If environment separation is needed later, split Supabase by lifecycle, not by app:
  - `dakshina-dev`
  - `dakshina-production`

## Current Scaffold

This repository is scaffolded as an admin-first Turborepo workspace with these top-level areas:

- `apps/admin` for the first production surface
- `apps/priest` for priest self-registration and priest-facing operations
- `packages/config` for shared configuration
- `packages/db` for shared domain types and database-facing contracts
- `packages/ui` for reusable interface primitives
- `packages/utils` for low-level shared helpers

## Current Constraints

- Package manifests intentionally stay conservative and use stable release lines rather than canary or experimental channels.
- Supabase Email OTP or Magic Link auth is the only MVP authentication direction reflected in the scaffold.
- MVP admin persistence still uses local JSON stores for rapid iteration before Supabase-backed data flows are wired.
- The new priest app currently shares the same local data plane as admin for registration visibility before full Supabase persistence is wired.
- Current planning assumption:
  - build product surfaces first with local persistence
  - migrate persistence to Supabase before real production launch
  - keep store/action boundaries clean so the migration does not force UI rewrites

## Current Auth Baseline

- `apps/admin/middleware.ts` refreshes SSR auth state through Supabase cookies.
- `apps/admin/app/sign-in/page.tsx` supports magic link and email OTP sign-in.
- `apps/admin/app/auth/confirm/route.ts` completes magic link verification.
- `apps/admin/app/dashboard/page.tsx` is the first protected admin route.
- `apps/priest/app/page.tsx` supports priest email OTP or magic link sign-in.
- `apps/priest/app/register/page.tsx` creates new priest registration records and admin notifications.
- `apps/priest/app/dashboard/page.tsx` is the first protected priest route.

## First Build Modules

1. admin authentication and role guard
2. admin shell and navigation
3. settings and commission policies
4. priest and KYC management
5. ritual and Fard management
6. booking oversight and replacement workflow

## Admin Information Architecture

The admin now follows a route-based operating model instead of packing review forms into one page:

- `/dashboard` is the super-admin command center
- module index pages are queue/table views for scanning and filtering
- record detail pages are dedicated workspaces for one priest or one booking at a time
- breadcrumbs and back links keep navigation explicit
- this pattern is now active for:
  - `Priests`
  - `Bookings`

Current route pattern:

- `/dashboard/priests` -> searchable queue
- `/dashboard/priests/[id]` -> priest review workspace
- `/dashboard/bookings` -> searchable queue
- `/dashboard/bookings/[id]` -> booking case workspace

This is the default pattern to extend into future admin modules such as payouts and trust operations.

Large singleton modules are now being split into route-based workspaces as well:

- `/dashboard` -> super-admin operations dashboard
- `/dashboard/settings` -> Global Settings entry route
- `/dashboard/settings/culture` -> culture rollout workspace
- `/dashboard/settings/commercial` -> commercial rules workspace
- `/dashboard/settings/governance` -> governance workspace
- `/dashboard/settings/districts` -> district overrides workspace
- `/dashboard/settings/notifications` -> notification workspace
- `/dashboard/rituals` -> Rituals and Fard overview
- `/dashboard/rituals/categories` -> category tree workspace
- `/dashboard/rituals/library` -> ritual template library
- `/dashboard/rituals/panjika` -> Panjika research workspace
- `/dashboard/rituals/fard` -> Fard rules and snapshot workspace

Create actions now live inside the relevant ritual workspaces instead of a detached create page:

- category create + edit + delete live in `Category tree`
- ritual create + edit + delete live in `Ritual library`
- Panjika source create + edit + delete live in `Panjika`
- Fard rule create + edit + delete live in `Fard`

This keeps each page operationally complete without forcing operators to jump to a disconnected create route.

The left navigation now mirrors this split for the densest modules:

- `Dashboard` is the operational landing route after login
- `Global Settings` exposes route-level workspaces under the main nav item
- `Rituals and Fard` exposes route-level workspaces under the main nav item
- the page header still keeps contextual sub-navigation, but the sidebar is now the primary workspace navigator

Notification delivery is split deliberately:

- the admin inbox remains the primary in-app notification stream
- the dashboard landing page surfaces the newest alerts directly
- zero-cost WhatsApp support uses `wa.me` deep links from the dashboard
- provider-based auto-send is deferred until a paid messaging integration is introduced
