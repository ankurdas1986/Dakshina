# Dakshina Project Plan

## Current Direction

Dakshina is now planned as a multicultural hyper-local marketplace for ritual services. The system must serve multiple traditions cleanly rather than treating every ritual as one flat catalog.

Current supported culture families:

- Bengali
- North Indian (UP/Bihar)
- Marwadi
- Odia
- Gujarati

This refactor changes the operating model from a West-Bengal-first priest marketplace into a culture-aware booking platform where discovery, availability, governance, pricing, and reviews all respect tradition-specific logic.

## Core Product Principles

1. Cultural correctness is a first-class system rule.
2. Hyper-local search only matters if ritual and priest matching are also culture-correct.
3. Admin remains the operating spine.
4. Availability locking and booking governance must be enforced at the data layer.
5. Infrastructure stays near zero cost during MVP.
6. Every task must be self-verified before being reported complete.
7. Documentation must remain current because the project will continue across long implementation cycles.

## Technical and Security Constraints

- Use stable package versions.
- Avoid unnecessary dependencies.
- Use Supabase Email OTP / Magic Links only for auth.
- Keep Razorpay in individual-account manual payout mode for MVP.
- Build toward future automation without adding present compliance complexity.
- Treat KYC, pricing, booking locks, and contact privacy as high-risk implementation zones.

## Updated Product Backbone

The marketplace now revolves around these data axes:

- culture
- category hierarchy
- priest tags
- language tags
- Panjika source
- location and zone
- availability and blocked slots
- booking governance rules
- dynamic pricing
- verified review eligibility

Every admin, priest, and user workflow should read from those same contracts.

## Marketplace Hierarchy Model

The catalog must support this shape:

- Tradition
- Service Type
- Specific Ritual

Example:

- Gujarati -> Home Ritual -> Gruha Pravesh
- Odia -> Marriage -> Hastagranthi
- Bengali -> Puja -> Lakshmi Puja

The category tree must remain unlimited-depth, but the operating model is still best understood as culture-rooted hierarchy.

## Admin-First Execution Strategy

The super-admin continues to be built first because the business still depends on:

- KYC verification,
- ritual taxonomy control,
- governance control,
- payout control,
- trust and privacy control,
- communication audit,
- exception handling.

The admin must become the command layer for a multicultural marketplace, not only a booking dashboard.

## Refactored Admin Module Map

### 1. Governance and Settings

This module controls:

- advance payment percentage,
- contact reveal timing,
- `min_booking_gap`,
- `max_booking_window`,
- festival blackout / rush blocking,
- forced-booking override policy,
- registration notifications,
- referral release conditions.

### 2. Cultural Catalog and Fard

This module controls:

- culture-aware category tree,
- ritual CRUD,
- top-ritual ranking metadata per culture,
- ritual duration,
- Fard template management,
- pricing profile attachment.

### 3. Priest Supply and KYC

This module controls:

- priest registration review,
- Aadhaar / Voter KYC verification,
- live-state control,
- culture tags,
- language tags,
- service selection,
- home district and radius,
- payout readiness data.

### 4. Availability and Slot Integrity

This module controls:

- priest working hours,
- off-days,
- temporary leave,
- blocked slots generated from confirmed bookings,
- admin overrides when forced bookings are required.

### 5. Booking Intelligence

This module controls:

- search-ready booking records,
- governance rule validation,
- replacement handling,
- OTP completion,
- Fard snapshot visibility,
- WhatsApp confirmation trigger,
- contact reveal state.

### 6. Payout and Trust

This module controls:

- payout queue,
- manual mark-as-paid operations,
- review moderation,
- verified review linkage,
- referral settlement,
- trust score inputs.

## Multi-Panjika Import Plan

The old single-source Panjika import assumption is no longer valid.

We now need a source-aware import flow:

1. Admin picks a culture / tradition.
2. Admin picks the source family.
3. Admin pastes raw Panjika or Panchang text.
4. Parser stores raw text, parsed payload, tithi, and shubha muhurta.
5. Parsed data becomes auditable and reusable for booking guidance.

Supported source families in MVP contract:

- Bengali Panjika
- North Indian Panchang
- Odia Kohinoor
- Gujarati Janmabhoomi

## Booking Governance Logic

The system must now support hard booking governance, not only status management.

Required controls:

- minimum gap between bookings,
- maximum bookable future window,
- district-aware blackout dates,
- culture-aware festival rush blocks,
- admin forced-booking override.

This logic belongs in shared settings and database validation paths.

## Availability Logic

Priest availability must become a first-class data model.

Required structures:

- recurring weekly availability,
- off-days,
- temporary leave blocks,
- auto-blocked booking slots.

Booking confirmation must create a blocked slot automatically so the same priest cannot be double-booked for overlapping time windows.

## Pricing Logic

The pricing model must now be explicit and decomposed.

Required quote fields:

- `dakshina_amount`
- `samagri_add_ons`
- `zone_wise_travel_fee`
- total amount

Required rule layers:

- ritual base pricing,
- district / zone fee logic,
- peak festival multiplier logic,
- admin override when necessary.

## Privacy and Security Logic

These rules remain non-negotiable:

- phone numbers reveal only after 20% advance payment,
- phone numbers reveal only within 48–72 hours before ritual start,
- referral credits release only after OTP-verified completion,
- only completed bookings can create reviews,
- priests cannot go live before KYC verification.

## Marketplace UX Logic to Support in Backend Contracts

Although UI implementation is not the focus of this refactor, backend contracts must support these experiences:

- homepage top 8 demand-driven rituals per culture,
- search filtered by culture + location + availability + time-slot compatibility,
- availability-safe booking initiation,
- culture-correct ritual browsing,
- admin-triggered communication actions.

## Infrastructure Direction

- Hosting: Vercel
- Backend: Supabase
- Database: PostgreSQL + PostGIS
- Auth: Supabase Email OTP / Magic Links
- Storage: Supabase Storage
- Payments: Razorpay individual account
- Payouts: manual via payout ledger in MVP
- Maps: OpenStreetMap + Leaflet
- Distribution: web + PWA

## Data Layer Refactor Priorities

The next implementation phases should follow this order:

1. Refactor schema to culture-aware and availability-safe model.
2. Replace local JSON stores with Supabase-backed persistence.
3. Update admin data contracts to the new schema.
4. Update priest app to capture culture tags, language tags, KYC, and availability.
5. Build user app on top of culture-aware search and booking contracts.

## Updated Open Decisions

Still pending:

1. exact trust score formula,
2. demand-ranking logic for homepage top rituals,
3. exact WhatsApp delivery mechanism,
4. exact zone granularity below district and locality,
5. timing for auto-payout migration.

## Immediate Work Order

1. Refactor PRD and SQL to the multicultural contract.
2. Align project plan and checklists to the new operating model.
3. Update admin and priest data models to use culture-aware contracts.
4. Build user registration and search on top of the refactored backend model.

