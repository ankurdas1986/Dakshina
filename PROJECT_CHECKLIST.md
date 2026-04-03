# Dakshina Delivery Checklist

This file is the execution checklist for the full marketplace build. It is the operational source of truth for what is done, what is under active development, and what remains pending.

Legend:

- `[x]` completed and verified
- `[~]` in progress
- `[ ]` pending

## 1. Product Foundation

- `[x]` PRD documented and aligned with the current marketplace scope
- `[x]` project plan documented with admin-first execution strategy
- `[x]` booking lifecycle and anti-leakage rules documented
- `[x]` database schema drafted with PostGIS and Fard JSON support
- `[x]` multi-user and multi-priest registration is supported at the schema level
- `[x]` project-wide execution checklist maintained and updated per module
- `[ ]` open product decisions resolved for payments, pricing ownership, trust score, and launch geo granularity

## 2. Repository and Architecture

- `[x]` monorepo scaffolded with `apps/admin`, `packages/config`, `packages/db`, and shared packages
- `[x]` stable package versions pinned for the current admin build
- `[x]` local git repository initialized and connected to the project GitHub remote
- `[x]` branding asset added to the admin app
- `[ ]` CI checks configured for lint, typecheck, and build
- `[ ]` Supabase project configuration captured as reproducible setup

## 3. Admin Platform

### 3.1 Access and Shell

- `[x]` admin auth baseline implemented
- `[x]` dev fallback login flow implemented for local review
- `[x]` direct login on `/`
- `[x]` responsive admin shell with fixed header and left navigation
- `[x]` sidebar toggle and header controls cleaned up for real interaction
- `[x]` left panel vertical scroll behavior implemented
- `[x]` long cards constrained with internal scroll
- `[x]` top-right notification entry added to the admin header
- `[x]` admin inbox now includes new priest and user registration notifications
- `[x]` sub-navigation support added for module pages that need denser workflows

### 3.2 Global Settings

- `[x]` read-only overview for commissions, privacy timing, service tiers, and controls
- `[x]` editable settings forms with local persistence for UAT
- `[x]` notification settings controls added to Module 1
- `[x]` registration alert toggle added for new priest and user registrations
- `[x]` local audit log for settings changes
- `[ ]` Supabase-backed settings persistence

### 3.3 Priest Management

- `[x]` module route and responsive shell page
- `[x]` editable KYC review workflow with local persistence
- `[x]` verified/unverified status control and admin notes
- `[x]` KYC document preview cards for admin review
- `[x]` KYC document large preview modal with front/back slots for identity and address proof
- `[x]` cascading category and ritual selection flow
- `[x]` priest list index and dedicated detail route
- `[x]` priest table with search/filter
- `[x]` district/radius operations summary with queue drill-down

### 3.4 Rituals and Fard

- `[x]` module route and responsive shell page
- `[x]` hierarchical ritual category CRUD
- `[x]` ritual CRUD
- `[x]` 4-tier service model management
- `[x]` JSON-based Fard editor
- `[x]` Fard snapshot preview rules

### 3.5 Booking Operations

- `[x]` module route and responsive shell page
- `[x]` booking list with status filters
- `[x]` booking detail route with dedicated workspace
- `[x]` booking queue with table-first operating view
- `[x]` reassignment and replacement controls
- `[x]` contact reveal timing enforcement UI
- `[x]` OTP completion oversight
- `[x]` booking-side Fard snapshot preview

### 3.6 Payout Management

- `[x]` module route and responsive shell page
- `[x]` payout queue with search/filter
- `[x]` payout detail route with manual settlement workspace
- `[x]` UPI payout details and mark-as-paid controls

### 3.7 Trust and Referral

- `[x]` module route and responsive shell page
- `[x]` review moderation UI
- `[x]` referral ledger actions
- `[x]` completion-gated reward release workflow
- `[x]` trust score operations panel

### 3.8 Super Admin Completion Status

- `[x]` super-admin module surface is complete across settings, priests, rituals, bookings, payouts, and trust
- `[x]` responsive list/detail workflow is implemented for the high-density operational modules
- `[x]` admin notification inbox covers new priest and user registration visibility
- `[ ]` Supabase persistence replacement for local JSON admin stores
- `[ ]` global cross-module search results experience beyond per-module filtering
- `[ ]` middleware/Supabase Edge runtime warning cleanup

## 4. Priest App

- `[ ]` app scaffold
- `[ ]` priest auth integration
- `[ ]` priest self-registration flow wired to Supabase and `app.profiles` / `app.priest_profiles`
- `[ ]` priest onboarding form
- `[ ]` KYC upload
- `[ ]` service selection and radius setup
- `[ ]` booking inbox
- `[ ]` completion OTP flow

## 5. User App

- `[ ]` app scaffold
- `[ ]` user auth integration
- `[ ]` user self-registration flow wired to Supabase and `app.profiles`
- `[ ]` locality-aware discovery
- `[ ]` ritual search and priest matching
- `[ ]` booking creation
- `[ ]` advance payment flow
- `[ ]` delayed contact reveal logic
- `[ ]` Fard view and PDF download
- `[ ]` review submission

## 6. Maps, Search, and Geography

- `[ ]` district and locality data model finalized
- `[ ]` PostGIS search wired to the application layer
- `[ ]` priest home pin and service radius mapping
- `[ ]` booking location capture
- `[ ]` admin service coverage management

## 7. Quality, UAT, and Release

- `[~]` self-verification after each implemented task
- `[x]` formal UAT checklist per module created
- `[x]` lint and typecheck run clean locally
- `[ ]` lint and typecheck run clean in CI
- `[ ]` staging deployment verification
- `[ ]` MVP release checklist

## Current Focus

- `[x]` Module 1: Global Settings editable super-admin workflow
- `[x]` Module 2: Priest Management with search-driven queue and detail route
- `[x]` Module 3: Rituals and Fard management
- `[x]` Module 4: Booking operations with queue and case detail routes
- `[x]` Module 5: Payout management workflow
- `[x]` Module 6: Trust and Referral admin workflows
- `[~]` Platform hardening after super-admin completion
