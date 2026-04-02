# Dakshina Monorepo Baseline

## Current Scaffold

This repository is scaffolded as an admin-first Turborepo workspace with these top-level areas:

- `apps/admin` for the first production surface
- `packages/config` for shared configuration
- `packages/db` for shared domain types and database-facing contracts
- `packages/ui` for reusable interface primitives
- `packages/utils` for low-level shared helpers

## Current Constraints

- Node.js and package managers are not available in the current environment, so this scaffold is file-based and not install-verified yet.
- Package manifests intentionally stay conservative and use stable release lines rather than canary or experimental channels.
- Supabase Email OTP or Magic Link auth is the only MVP authentication direction reflected in the scaffold.

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
