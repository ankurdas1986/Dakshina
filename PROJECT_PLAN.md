# Dakshina Project Plan

## Current Understanding

Dakshina is a design-led, hyper-local marketplace for Hindu ritual services. The initial market is suburban West Bengal, especially Howrah, Hooghly, and North 24 Parganas.

The business problem is that priest booking is currently informal, inconsistent, and hard to trust. The product direction is to create a reliable system around:

- verified priests,
- transparent pricing,
- structured booking flow,
- replacement guarantee,
- review and trust signals,
- operational control from an admin-first system.

This is not positioned as a generic content app. It is a service marketplace focused on ritual fulfillment and trust.

## Product Goal

Build Dakshina into the trusted standard for booking Hindu ritual services, starting with a tightly controlled MVP and low operational cost.

## Core Product Principles

1. Trust is the main differentiator.
2. Operations matter more than visual polish in the MVP.
3. Admin control comes first.
4. Infrastructure must stay near zero cost during early stages.
5. Architecture must allow later expansion into user and priest surfaces without rework.
6. Stable, maintainable technology choices are preferred over fast-moving or experimental options.
7. Every completed task must be self-verified before it is reported as done.

## Delivery Rules

These rules govern execution for the project:

- Choose stable and maintained package versions.
- Avoid experimental or weakly supported dependencies unless there is a strong technical reason.
- Keep dependencies minimal.
- Verify each task after implementation before marking it complete.
- Report completion only after verification passes or after clearly stating any remaining gap.

## Dependency and Security Policy

- Prefer mature, widely used libraries with clear maintenance activity.
- Pin versions intentionally where reproducibility matters.
- Avoid unnecessary packages for simple problems.
- Treat authentication, file upload, payment, and admin access as high-risk areas.
- Favor simple, auditable implementations over abstraction-heavy setups.

## MVP Technical Direction

- Frontend hosting: Vercel free tier
- Backend, database, auth, storage: Supabase free tier
- Authentication method: Supabase Email OTP or Magic Links only for MVP
- Payments collection: Razorpay individual account to admin for MVP
- Priest payout release: manual in MVP, automation-ready for later
- Maps and location UI: OpenStreetMap + Leaflet
- Nearby search: PostGIS in Supabase
- Distribution: Progressive Web App
- Repo structure: Turborepo monorepo
- UI system: shadcn/ui
- Theme direction: Saffron (`#FF9933`) and Cream (`#FFFDD0`)
- Branding direction: finalized Saffron/Gold `D` logo with Anjali Mudra and Lotus
- Layout direction: elite and minimalist while staying culturally grounded

## Admin-First Execution Strategy

The project will start from the admin panel because it defines the business rules, trust system, and operating controls needed before priest and user apps can scale.

### Phase 1: Admin Panel

Primary goals:

- define platform settings,
- support global and district-based commission configuration,
- manage priests and KYC verification,
- manage hierarchical service category tree and rituals,
- manage ritual-specific Fard templates as structured JSON,
- control bookings and status transitions,
- manage priest payout operations,
- manage trust and review oversight,
- support referral and replacement operations.

### Phase 2: Priest Portal

Primary goals:

- onboarding,
- profile setup,
- service radius,
- location pinning,
- availability,
- booking acceptance and completion.

### Phase 3: User Portal

Primary goals:

- priest discovery,
- booking,
- payment initiation,
- OTP-based completion,
- ratings and reviews.

## Admin MVP Modules

Recommended implementation order:

1. Authentication and admin role protection
2. Admin layout, dashboard shell, navigation
3. Global settings
4. Priest management
5. KYC review workflow
6. Service catalog and Fard management
7. Payout management
8. Location, district, and service coverage setup
9. Booking management and privacy timing controls
10. Trust and feedback oversight
11. Referral management
12. Replacement guarantee operations

## Initial Business Features

### Trust and Quality

- verified priests,
- star ratings and written reviews after completed bookings,
- priest trust score,
- punctuality tracking,
- replacement guarantee workflow.

### Supply Management

- priest onboarding,
- manual KYC review via uploaded documents,
- service radius control,
- cascading ritual selection from admin-managed category tree,
- base location pinning.

### Demand Experience

- nearby search,
- role-based onboarding,
- advance payment before contact reveal,
- phone reveal only within 48 to 72 hours before the scheduled ritual,
- Fard view or PDF download after booking confirmation,
- booking status visibility,
- OTP completion.

### Admin Control

- global commission percentage control,
- district or region-specific commission overrides,
- referral percentage control,
- hierarchical category tree management,
- ritual-level Fard management,
- payout management for completed bookings and manual priest settlements,
- verification toggle,
- booking oversight,
- escalation and replacement management.

### Service Model

The official 4-tier service model is:

1. Tier 1: Essential Home
2. Tier 2: Grand Event
3. Tier 3: Barwari / Public
4. Tier 4: Monthly Trustee

This tier structure should exist in the service catalog and remain admin-manageable.

The service catalog must also support unlimited nested sub-categories through a parent-child category tree.

## Open Questions

These need confirmation before implementation goes too far:

1. What exact booking statuses should exist in the MVP?
2. Will payments be part of MVP 1, or should payment steps be mocked first?
3. What exact data should be mandatory for priest onboarding?
4. How should trust score be calculated in MVP: simple rating average, or rating plus punctuality weighting?
5. Will service pricing be fixed by ritual, variable by priest, or partially controlled by admin?
6. Should admin manually assign priests in early MVP, or should the system auto-match from day one?
7. What exact PDF/UI format should the user-facing Fard follow after confirmation?

## Working Assumptions

Until confirmed otherwise, the working assumptions are:

- admin panel is the first app to build,
- one shared auth system will be used across all roles,
- authentication will use Supabase Email OTP or Magic Links instead of paid SMS gateways,
- all roles will use zero-cost Supabase email-based auth for MVP,
- priest verification is manual in MVP,
- nearby discovery will use latitude/longitude and PostGIS radius queries,
- contact details stay hidden until advance payment is confirmed,
- phone numbers are revealed only within a configurable 48 to 72 hour pre-ritual window,
- ritual Fards are stored as JSON and snapshotted on confirmed bookings,
- all payments go to admin in MVP using Razorpay individual account settings,
- priest payouts are released manually in MVP and logged for future automation,
- ritual categories support parent-child nesting and priest-side cascading selection,
- global commission can be overridden at district level,
- referrer reward credit is released only after OTP-based booking completion,
- replacement flow may begin as admin-assisted before full automation,
- the first release should favor operational control over automation depth.

## Proposed Monorepo Structure

```text
apps/
  admin/
  web/
  priest/
packages/
  ui/
  db/
  config/
  utils/
```

## Immediate Next Deliverables

1. Finalize PRD and planning updates
2. Design the initial database schema with PostGIS and Fard JSON support
3. Define booking status and privacy timing rules in the data model
4. Scaffold the monorepo and admin app

## Notes

This file is intended to be the persistent planning reference for the project. It should be updated whenever vision, scope, assumptions, or priorities change.
