# Dakshina Product Requirements Document

## 1. Product Overview

Dakshina is a hyper-local marketplace for Hindu ritual services. The platform is intended to bring structure, trust, and operational reliability to a service category that is currently managed through informal networks and word-of-mouth.

The first launch market is suburban West Bengal, with initial focus on:

- Howrah
- Hooghly
- North 24 Parganas

The MVP will be built admin-first so the business can control verification, service quality, pricing logic, and booking operations before scaling supply and demand.

## 2. Problem Statement

Priest booking in the target market has several recurring problems:

- no reliable discovery system,
- no trustable verification process,
- inconsistent pricing,
- low accountability around punctuality and commitment,
- weak fallback options when a priest cancels,
- high dependency on local personal networks.

This creates friction for users and limits the ability to build a scalable service business.

## 3. Vision

Dakshina should become the trusted standard for booking Hindu ritual services in its target markets.

The product should combine:

- cultural credibility,
- operational reliability,
- transparent booking mechanics,
- controlled supply quality,
- premium trust-first brand positioning.

## 4. Product Goals

### Primary Goals

- Build trust in ritual service booking.
- Create an admin-controlled operational backbone.
- Onboard and verify priests through a managed process.
- Enable nearby service discovery.
- Prevent leakage outside the platform during booking flow.
- Keep MVP infrastructure cost near zero.

### Success Goals for MVP

- Admin can manage platform settings and priest verification without engineering help.
- Priests can be onboarded in a structured format.
- Users can discover and book priests in supported areas.
- Contact information remains protected until booking commitment.
- Booking completion can be confirmed through OTP.
- Ratings and reviews can be captured only after completion.

## 5. Non-Goals for MVP

The first release should not try to solve everything. These are out of scope unless later confirmed:

- native iOS app,
- native Android app,
- advanced automation for all replacement cases,
- multilingual expansion beyond immediate launch needs,
- complex subscription billing beyond basic groundwork,
- AI recommendations,
- large-scale temple ERP features.

## 6. User Types

### 6.1 Admin

The platform operator who controls verification, settings, oversight, and issue resolution.

Primary needs:

- verify priests,
- manage services and categories,
- control platform commission and booking rules,
- monitor bookings,
- intervene in replacement/escalation scenarios,
- review trust and feedback signals.

### 6.2 Priest / Purohit

The service provider who offers ritual services within a configurable travel radius.

Primary needs:

- create and maintain a profile,
- upload KYC documents,
- set service area,
- receive and manage bookings,
- complete jobs and confirm via OTP,
- build trust score over time.

### 6.3 Devotee / User

The customer booking ritual services for home, family, event, or community use.

Primary needs:

- find reliable priests nearby,
- understand service and pricing structure,
- book with confidence,
- avoid last-minute cancellation risk,
- pay advances safely,
- leave feedback after completion.

## 7. Core Value Proposition

Dakshina differentiates through trust and execution, not just listing density.

Core value pillars:

- verified priests,
- transparent booking process,
- hidden contact details until booking commitment,
- replacement guarantee,
- ratings and trust signals,
- culturally aligned premium presentation.

## 8. Functional Scope

## 8.1 Unified Entry and Authentication

- Single landing page for all users.
- Role selection for admin, priest, and user flows.
- Shared authentication system using Supabase Email OTP or Magic Links.
- Role-based redirection after login.
- Admin-only route protection.
- Third-party SMS gateways such as Twilio are out of scope for the MVP to preserve zero operational cost.

## 8.2 Admin Panel

### Required in MVP

- admin authentication and authorization,
- dashboard shell and navigation,
- settings management,
- global and district-based commission configuration,
- priest listing and detail view,
- manual KYC review,
- verified status toggle,
- service category management,
- ritual/service management,
- dynamic JSON-based Fard management per ritual,
- booking list and detail management,
- booking status oversight,
- trust and review visibility,
- referral settings visibility,
- replacement handling support.

### Likely Settings Needed

- global commission percentage,
- district or region-specific commission overrides,
- advance payment percentage,
- referral percentages,
- contact reveal timing controls within the 48 to 72 hour pre-ritual window,
- serviceable area defaults,
- feature flags for rollout control.

### Ritual and Fard Requirement

- Admin must be able to manage and attach a dynamic JSON-based Item List (Fard) for every ritual.
- The ritual Fard should be stored as structured data so it can be rendered in the UI and exported to PDF.
- Users should be able to view or download the ritual checklist after a booking is confirmed.

## 8.3 Priest Portal

### Required in MVP after admin foundation

- onboarding form,
- profile management,
- KYC document upload,
- home location pinning using OSM,
- travel radius configuration,
- service selection,
- booking acceptance and status updates,
- OTP completion input.

## 8.4 User Portal

### Required in MVP after admin foundation

- location-aware priest discovery,
- filter/search by area and ritual,
- booking initiation,
- advance payment step,
- hidden contact details before payment and delayed phone reveal based on ritual start time,
- booking tracking,
- confirmed-booking Fard view or PDF download,
- review submission after completion.

## 9. Marketplace Service Structure

The official 4-tier service structure is:

1. Tier 1: Essential Home - small, frequent rituals such as Satyanarayan and Lakshmi Puja
2. Tier 2: Grand Event - high-ticket milestones such as Weddings, Sacred Thread, and House-warming
3. Tier 3: Barwari / Public - community events such as Durga Puja and Kali Puja
4. Tier 4: Monthly Trustee - subscription-based recurring priest management

This structure should still be configurable through admin-managed service catalog data rather than hardcoded assumptions.

## 10. Trust and Anti-Leakage System

These features are central to the business model and should be treated as core, not optional.

### Trust Features

- post-completion star ratings,
- written reviews,
- verified priest badge,
- punctuality tracking,
- trust score visibility or ranking logic.

### Anti-Leakage Features

- contact details hidden until advance payment is confirmed,
- phone numbers revealed only within 48 to 72 hours before the scheduled ritual start time,
- OTP-based booking completion,
- referral loop kept inside the platform with completion-based reward release,
- replacement flow to reduce off-platform fallback behavior.

### Referral Workflow

- The referee, meaning the new user, receives a discount on their first completed booking journey.
- The referrer receives reward credit only after the referee's ritual is marked as `completed` through the OTP-based completion flow.
- Referral accounting must be auditable from admin.

## 11. Booking Lifecycle

Initial working lifecycle for MVP:

1. User discovers priest
2. User views details and initiates booking
3. Advance payment is requested
4. Advance payment is confirmed
5. Booking is confirmed and the ritual Fard becomes available in UI or PDF form
6. Contact details remain protected and phone numbers are revealed only within the configured 48 to 72 hour window before the scheduled ritual
7. Ritual is performed
8. Completion OTP is entered
9. Final completion is recorded
10. Review becomes available and referral reward logic can settle

Admin needs full visibility across this lifecycle.

Exact status names should be finalized during schema design.

## 12. Replacement Guarantee

If a priest cancels or becomes unavailable, the platform should support rapid reassignment to a nearby verified priest.

MVP approach:

- start with admin-assisted replacement,
- design data structures so automation can be added later,
- maintain auditability for cancellations and reassignment events.

## 13. Technical Requirements

### Infrastructure

- Hosting: Vercel free tier
- Backend: Supabase
- Database: PostgreSQL with PostGIS
- Auth: Supabase Auth
- Storage: Supabase Storage
- Maps: OpenStreetMap
- Frontend map library: Leaflet
- Distribution: Progressive Web App

### Architecture

- Monorepo managed with Turborepo
- Separate apps for admin, user, and priest experiences
- Shared packages for UI, database types, config, and utilities
- Authentication flow must rely on zero-cost email-based Supabase auth patterns, not paid SMS OTP providers

### UI

- shadcn/ui
- brand colors centered on Saffron (`#FF9933`) and Cream (`#FFFDD0`)
- finalized Dakshina logo uses a Saffron/Gold `D` with Anjali Mudra and Lotus
- layout direction must remain elite, minimalist, and culturally aligned

## 14. SEO and Discoverability

The web experience should support localized SEO for area-specific searches such as:

- best priests in Srirampore
- purohit in Rishra
- priest booking in Uttarpara
- ritual priest in Howrah

SEO should be built into the architecture, not added as an afterthought.

## 15. Operational Constraints

- MVP should target near-zero recurring infrastructure cost.
- Stable package versions should be preferred over fast-moving releases.
- Security-sensitive modules require stricter implementation review.
- Each completed task must be self-verified before being marked done.

## 16. Risks

### Product Risks

- service tier definitions may remain too vague,
- pricing logic may become inconsistent without early rules,
- replacement guarantee may be operationally expensive,
- manual workflows may become bottlenecks if adoption grows quickly.

### Technical Risks

- geospatial search quality depends on clean location data,
- auth and role handling must be strict from day one,
- file upload and KYC storage require careful access control,
- payment integration may complicate otherwise simple MVP flows.

## 17. Open Decisions

These items require product confirmation later:

1. Exact payment provider and payout flow
2. Final booking status model
3. Trust score formula
4. Pricing ownership model: admin-fixed, priest-defined, or hybrid
5. Mandatory KYC fields and documents
6. Exact launch geographies within the first market
7. Whether first release includes direct auto-matching or admin-assisted assignment

## 18. Delivery Plan

### Phase 1: Product and Data Foundation

- finalize PRD,
- define schema,
- define role model,
- define booking statuses,
- define service catalog model.

### Phase 2: Admin MVP

- scaffold monorepo,
- set up admin app,
- implement auth and protection,
- implement settings,
- implement priest management,
- implement KYC review,
- implement service catalog,
- implement booking oversight.

### Phase 3: Priest MVP

- onboarding,
- profile,
- location and radius,
- booking management,
- completion flow.

### Phase 4: User MVP

- discovery,
- booking,
- advance payment,
- completion review flow.

## 19. Immediate Next Steps

1. Create the database schema document
2. Define booking status transitions
3. Scaffold the monorepo and admin app
4. Begin admin authentication and settings module
