# Dakshina Monorepo Baseline

## Current Scaffold

This repository is scaffolded as an admin-first Turborepo workspace with these top-level areas:

- `apps/admin` for the first production surface
- `packages/config` for shared configuration
- `packages/db` for shared domain types and database-facing contracts
- `packages/ui` for reusable interface primitives
- `packages/utils` for low-level shared helpers

## Current Constraints

- Package manifests intentionally stay conservative and use stable release lines rather than canary or experimental channels.
- Supabase Email OTP or Magic Link auth is the only MVP authentication direction reflected in the scaffold.
- MVP admin persistence still uses local JSON stores for rapid iteration before Supabase-backed data flows are wired.

## Current Auth Baseline

- `apps/admin/middleware.ts` refreshes SSR auth state through Supabase cookies.
- `apps/admin/app/sign-in/page.tsx` supports magic link and email OTP sign-in.
- `apps/admin/app/auth/confirm/route.ts` completes magic link verification.
- `apps/admin/app/dashboard/page.tsx` is the first protected admin route.

## First Build Modules

1. admin authentication and role guard
2. admin shell and navigation
3. settings and commission policies
4. priest and KYC management
5. ritual and Fard management
6. booking oversight and replacement workflow

## Admin Information Architecture

The admin now follows a route-based operating model instead of packing review forms into one page:

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
