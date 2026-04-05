# Dakshina Product Requirements Document

## 1. Product Overview

Dakshina is a hyper-local marketplace for Hindu ritual services. The product is now defined as a multicultural operating system for ritual booking, priest discovery, governance, and trust across multiple traditions.

The marketplace must support at least these launch cultures:

- Bengali
- North Indian (UP/Bihar)
- Marwadi
- Odia
- Gujarati

The platform remains admin-first, but every major domain object must now be culture-aware so supply, rituals, booking rules, calendars, and pricing can expand without schema rewrites.

## 2. Problem Statement

Ritual booking is fragmented across regions and traditions. The current market suffers from:

- informal discovery and manual calling,
- poor matching between family tradition and priest specialization,
- no structured cultural segregation in service catalogs,
- weak priest verification,
- inconsistent pricing and travel fee handling,
- no reliable availability locking,
- poor handling of auspicious dates and muhurta windows,
- no trusted payout and review accountability layer.

Dakshina must solve these problems without increasing early operating cost.

## 3. Product Vision

Dakshina should become the trusted hyper-local standard for booking culture-specific Hindu ritual services.

The product must combine:

- cultural correctness,
- hyper-local priest matching,
- operational reliability,
- transparent pricing,
- controlled booking governance,
- strict privacy timing,
- admin-grade oversight,
- zero-cost-friendly infrastructure.

## 4. Product Goals

### Primary Goals

- Match users with priests by culture, geography, and availability.
- Let admins govern booking windows, blackout dates, and exception overrides.
- Let priests self-manage registration, KYC, culture tags, languages, services, and availability.
- Let users discover top rituals by culture and book with confidence.
- Prevent double booking through slot auto-blocking.
- Preserve privacy until advance payment and reveal window conditions are satisfied.
- Keep auth and baseline infrastructure near zero recurring cost.

### MVP Success Goals

- Admin can manage ritual catalogs, pricing, governance, and verification without engineering help.
- Priests can register across multiple cultures and languages without data collisions.
- Users can search rituals by culture and location.
- Confirmed bookings automatically block priest availability.
- Reviews are accepted only for completed bookings.
- Manual payout operations work cleanly while staying ready for later automation.

## 5. Non-Goals for the Current Cut

These remain out of scope unless explicitly pulled forward:

- native iOS app,
- native Android app,
- marketplace auto-payout compliance flows,
- AI priest matching,
- multilingual marketing content automation,
- temple ERP / trust accounting.

## Incremental Update: Refunds, Subscriptions, User Governance, Wallet, and Notifications

This update is additive. It does not replace the existing multicultural hierarchy, booking governance, delayed contact reveal logic, or priest availability model.

### A. Policy Snapshotting and Refund Intelligence

- Every booking must persist a `policy_snapshot` JSON contract at the moment the booking is confirmed.
- The snapshot must include the refund policy that was active when the booking was accepted.
- Refund calculations must use the booking snapshot, not the latest platform policy.
- Admin must be able to trigger a manual refund workflow from booking operations with clear Razorpay-manual instructions and a visible `pending_refund_amount`.

### B. Institutional Subscription Contracts

- Dakshina must support recurring institutional contracts for:
  - temples
  - offices
  - factories
- Contracts must support:
  - daily
  - weekly
  - monthly
  recurrence.
- Contract durations must support:
  - 3 months
  - 6 months
  - 12 months
- Subscription generation must create booking records ahead of time so priest calendars are pre-blocked and dispatch remains operationally visible in admin.

### C. Full User Governance in Super Admin

- Super Admin must have a dedicated `User Management` module.
- Admin must be able to:
  - view and edit user profile details,
  - inspect booking history,
  - inspect wallet / transaction history,
  - block, deactivate, or reactivate accounts,
  - filter by name, phone, area, location, and tradition preference.
- User governance must be treated as first-class admin capability, not a secondary reporting view.

### D. Internal Wallet and Credit Ledger

- Users must support internal wallet balance tracking for wallet-assisted advance payments.
- Priests must support `pending_payout` tracking while payout remains manual.
- All wallet and credit movement must be journaled in `wallet_transactions`.
- Admin must be able to confirm manual priest payout after UPI transfer.

### E. Dual Notification Model

- In-app notifications should be designed around Supabase Realtime channels for production.
- During development, the same event model should remain visible through the admin inbox.
- WhatsApp communication should use `wa.me` deep links with prefilled templates for:
  - admin
  - user
  - priest
- These links are operational triggers, not automated message delivery.

## 6. User Types

### 6.1 Super Admin

Controls platform policy, catalog structure, KYC, booking governance, payouts, and operational interventions.

### 6.2 Priest

Registers as a service provider, uploads KYC, selects cultures, languages, rituals, availability, and receives bookings.

### 6.3 User

Searches rituals by culture and area, chooses a priest, pays advance, receives reminders, and reviews after completion.

## 7. Core Marketplace Model

Dakshina is no longer only a priest directory. It is a culturally segmented booking marketplace.

Core marketplace dimensions:

- culture,
- geography,
- ritual taxonomy,
- pricing breakdown,
- availability locking,
- trust and KYC,
- payout settlement,
- privacy timing.

Every major workflow must honor all of those dimensions.

## 8. Deep Cultural Segregation

This is the core architectural change.

### 8.1 Supported Cultures

The system must support at least these culture types:

- Bengali
- North Indian
- Marwadi
- Odia
- Gujarati

### 8.2 Category Hierarchy

The ritual catalog must follow a culture-aware hierarchy:

- Tradition
- Service Type
- Specific Ritual

Example:

- Odia -> Marriage -> Hastagranthi

Admin must manage this as a nested category tree.

### 8.3 Priest Tagging

Priests must support multi-select tagging for:

- cultures served,
- languages spoken,
- rituals performed.

The priest experience must never assume one priest serves only one tradition.

## 9. Authentication and Roles

### 9.1 Auth Policy

All roles must use Supabase Email OTP or Magic Links only:

- Admin
- Priest
- User

Third-party SMS gateways are out of scope for MVP.

### 9.2 Role Handling

- role-aware route protection remains mandatory,
- priest and user self-registration must create distinct profile rows,
- admin notification rules must include new registrations.

## 10. Admin Platform Scope

The super-admin remains the operating backbone.

### Required Capabilities

- role-protected access,
- multicultural category tree management,
- ritual and Fard management,
- smart Panjika import by tradition,
- KYC dashboard,
- priest verification and live-state control,
- booking governance configuration,
- blackout date configuration,
- dynamic pricing and festival multiplier control,
- payout management,
- trust / review moderation,
- WhatsApp confirmation triggers,
- admin override for forced bookings.

### Booking Governance Controls

Admin must control:

- `min_booking_gap` between priest bookings,
- `max_booking_window` in days,
- `festival_rush_blocking` / blackout dates,
- manual forced-booking override,
- privacy reveal timing,
- advance payment percentage,
- district and zone fee rules.

## 11. Priest Platform Scope

The priest side must support:

- self-registration,
- profile creation,
- KYC upload,
- culture and language tagging,
- cascading ritual selection,
- availability management,
- off-day configuration,
- working hours management,
- booking inbox,
- OTP completion,
- payout-readiness data such as UPI details.

## 12. User Platform Scope

The user side must support:

- culture-first ritual discovery,
- top rituals per culture on the homepage,
- location-aware priest search,
- shubha muhurta aware booking intent,
- advance payment,
- Fard view / download after confirmation,
- delayed phone reveal,
- verified review submission after completion.

## 13. Multi-Panjika Smart Import

The Panjika import flow must support multiple sources.

Supported input families:

- Bengali Panjika
- North Indian Panchang
- Odia Kohinoor
- Gujarati Janmabhoomi

### Admin Logic

- Admin must first choose the target tradition.
- Raw pasted text must be parsed within the context of that tradition.
- Parsed output must retain:
  - tithi,
  - shubha muhurta,
  - source,
  - culture type,
  - raw text snapshot,
  - parsed structured payload.

This is necessary because date logic and auspicious windows vary by tradition.

## 14. Booking Governance and Availability

### 14.1 Booking Rules

The marketplace must support governance rules for:

- minimum gap between bookings,
- maximum advance booking window,
- festival blackout periods,
- manual admin override.

### 14.2 Auto-Blocking

When a booking is confirmed, the priest slot must be blocked automatically across the system.

This is mandatory to prevent double booking.

### 14.3 Priest Availability

Priests must manage:

- working hours,
- off-days,
- temporary time off,
- future availability changes.

Search and booking must respect those rules.

## 15. Pricing and Commercial Logic

Pricing must support dynamic structure, not a flat quoted amount only.

### Required Split

- `dakshina_amount`
- `samagri_add_ons`
- `zone_wise_travel_fee`

### Dynamic Pricing Requirements

- festival / peak multipliers,
- district-aware or zone-aware travel fees,
- culture-aware ritual pricing,
- admin override when required.

MVP still routes all customer payments into the admin-controlled Razorpay individual account.

## 16. Privacy and Security Rules

These rules remain hard requirements.

### Contact Reveal

Phone numbers must be revealed only when both conditions are true:

1. at least 20% advance payment is confirmed,
2. current time is within the 48 to 72 hour pre-ritual reveal window.

### Referral Credit Release

Referral credits must be released only after ritual completion through OTP verification.

## 17. Operational Tools

### 17.1 KYC Dashboard

Admin must verify priest KYC before a priest goes live.

Core document types:

- Aadhaar
- Voter ID
- supporting address or identity proof when required

### 17.2 WhatsApp Confirmation Trigger

Admin booking details must provide a manual `Send WhatsApp Confirmation` trigger.

The system must store communication audit state even if message sending remains manual or semi-manual in MVP.

## 18. Reputation and Review Logic

Reviews must be verified reviews.

Rules:

- only a user with a completed booking can submit a rating/review,
- one completed booking maps to one review record,
- review rows must remain tied to the original booking, priest, and user.

## 19. Fard Logic

The Fard model remains critical.

Requirements:

- rituals store a structured `fard_template`,
- admin manages it per ritual,
- the exact Fard is snapshotted into the booking upon confirmation,
- the booking copy must remain immutable for that booking,
- users must be able to view or download that locked checklist.

## 20. Search and Discovery

Search results must combine:

- location proximity using PostGIS,
- culture filtering,
- ritual matching,
- active priest availability,
- requested time-slot compatibility,
- live / verified priest state.

Homepage logic must feature the top 8 demand-driven rituals per culture.

## 21. Technical Architecture

### Infrastructure

- Hosting: Vercel
- Backend: Supabase
- Database: PostgreSQL + PostGIS
- Auth: Supabase Email OTP / Magic Links
- Storage: Supabase Storage
- Maps: OpenStreetMap + Leaflet
- Payments: Razorpay individual account
- Payout mode: manual in MVP, automation-ready through payout logs

### Architectural Rules

- all culture-aware logic belongs in first-class schema fields,
- booking locks must be enforceable in the database layer,
- availability must be queryable for search,
- payouts must remain manual-first but future-route-ready,
- local JSON stores are only interim scaffolding and not the production target.

## 22. Risks

### Product Risks

- ritual taxonomy may become messy without strict cultural segregation,
- pricing may drift without strong admin controls,
- festival demand spikes may overload supply.

### Technical Risks

- Panjika parsing quality may vary by source formatting,
- availability locking must not allow race conditions,
- privacy timing must not leak contact data early,
- local-store scaffolding must be replaced before production.

## 23. Open Decisions

Remaining decisions still requiring product confirmation:

1. exact payout automation migration timing,
2. trust score formula,
3. geo granularity below district level,
4. final WhatsApp sending mechanism,
5. exact homepage demand-ranking formula.

Resolved architectural decisions:

- multicultural support is first-class, not additive,
- category tree is culture-aware,
- priest tagging is multi-culture and multi-language,
- auth is email-only Supabase OTP / Magic Link,
- payments flow to admin in MVP,
- manual payout logs are the MVP settlement model,
- reviews require completed booking,
- confirmed bookings auto-block priest slots.

## 24. Delivery Sequence

### Phase 1: Documentation and Schema Refactor

- rewrite PRD,
- rewrite project plan,
- refactor SQL schema for multicultural marketplace logic.

### Phase 2: Production Data Layer Refactor

- replace local JSON stores with Supabase-backed persistence,
- wire culture-aware category and pricing models,
- wire slot blocking and availability rules.

### Phase 3: Priest and User Flows

- priest self-registration,
- user self-registration,
- culture-first search,
- booking and payment flow.

### Phase 4: Operational Hardening

- KYC enforcement,
- payout operations,
- communication audit,
- release readiness.

## 25. Immediate Next Steps

1. Refactor the SQL schema to reflect all multicultural marketplace rules.
2. Replace interim local data contracts with Supabase-backed contracts.
3. Update admin data models to honor culture, pricing, availability, and governance.
4. Continue priest and user module implementation on top of the new contract.

