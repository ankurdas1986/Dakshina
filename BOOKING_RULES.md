# Dakshina Booking Rules

## Purpose

This document defines the operational booking rules for the MVP so admin, priest, user, and engineering workflows stay aligned from the start.

## Authentication Rules

- All MVP authentication must use Supabase Email OTP or Magic Links.
- Third-party SMS gateways are out of scope for the MVP.
- OTP used for ritual completion is a booking completion control, not a login mechanism.

## Booking Lifecycle

The booking lifecycle for MVP is:

1. `draft`
2. `pending_priest_confirmation`
3. `awaiting_advance_payment`
4. `confirmed`
5. `contact_window_locked`
6. `contact_window_open`
7. `in_progress`
8. `completed`

Terminal or exception states:

- `cancelled_by_user`
- `cancelled_by_priest`
- `cancelled_by_admin`
- `replacement_in_progress`
- `expired`

## Status Definitions

### `draft`

- Booking request exists but is not yet actionable.
- No priest commitment exists.
- No contact information is visible.

### `pending_priest_confirmation`

- Priest has been tentatively matched or selected.
- Priest acceptance is pending.
- No contact information is visible.

### `awaiting_advance_payment`

- Priest is ready or admin has moved the booking forward.
- User must pay the advance amount before booking confirmation.
- No contact information is visible.

### `confirmed`

- Advance payment is confirmed.
- Booking is commercially confirmed.
- Fard snapshot is locked onto the booking at this point.
- Phone numbers still remain hidden if the ritual is outside the allowed reveal window.

### `contact_window_locked`

- Booking is confirmed.
- Advance payment is confirmed.
- Booking exists outside the configured 48 to 72 hour reveal window.
- Phone numbers remain hidden.

### `contact_window_open`

- Booking is confirmed.
- Current time is within the configured 48 to 72 hour pre-ritual window.
- Phone numbers may be revealed to the relevant parties.

### `in_progress`

- Ritual has started or is actively being fulfilled.
- Replacement is still possible only through admin intervention if absolutely required.

### `completed`

- Ritual completion OTP is successfully verified.
- Booking is treated as fully completed.
- Review becomes eligible.
- Referrer reward, if applicable, becomes eligible for credit.

## Allowed Status Transitions

- `draft` -> `pending_priest_confirmation`
- `pending_priest_confirmation` -> `awaiting_advance_payment`
- `awaiting_advance_payment` -> `confirmed`
- `confirmed` -> `contact_window_locked`
- `confirmed` -> `contact_window_open`
- `contact_window_locked` -> `contact_window_open`
- `contact_window_open` -> `in_progress`
- `in_progress` -> `completed`

Exception transitions:

- `draft` -> `expired`
- `pending_priest_confirmation` -> `cancelled_by_priest`
- `awaiting_advance_payment` -> `expired`
- `awaiting_advance_payment` -> `cancelled_by_user`
- `confirmed` -> `cancelled_by_user`
- `confirmed` -> `cancelled_by_priest`
- `contact_window_locked` -> `cancelled_by_user`
- `contact_window_locked` -> `cancelled_by_priest`
- `contact_window_open` -> `cancelled_by_user`
- `contact_window_open` -> `cancelled_by_priest`
- `confirmed` -> `replacement_in_progress`
- `contact_window_locked` -> `replacement_in_progress`
- `contact_window_open` -> `replacement_in_progress`
- `replacement_in_progress` -> `pending_priest_confirmation`
- `replacement_in_progress` -> `cancelled_by_admin`

## Contact Reveal Rules

- Contact details remain hidden until the advance payment is confirmed.
- Even after advance payment confirmation, phone numbers remain hidden until the booking enters the configured 48 to 72 hour window before the scheduled ritual start time.
- Contact reveal timing must be configurable through admin settings.
- The booking record must persist the reveal timing used at confirmation so later settings changes do not retroactively alter the booking contract.

## Fard Rules

- Every ritual may have a structured JSON-based Fard template managed by admin.
- When a booking is confirmed, the current ritual Fard must be copied into the booking as an immutable snapshot.
- Users must be able to view this Fard in the UI after confirmation.
- Users should also be able to download the Fard as a PDF in a later implementation step.
- If the ritual template changes after confirmation, existing bookings must continue using the original snapshot.

## Payment Rules

- Advance payment is required before a booking becomes confirmed.
- Contact visibility is impossible before advance payment confirmation.
- Final payment and payout flows may be implemented in phases, but booking completion must still be controlled through the OTP process.

## Completion OTP Rules

- Completion OTP is generated for a confirmed booking.
- The user provides the OTP to the priest only after the ritual is actually completed.
- The priest enters the OTP to mark the job as completed.
- A booking can move to `completed` only after OTP verification succeeds.
- Referral rewards depend on this completion event.

## Referral Rules

- A referee is a new user who arrives via an active referral code.
- The referee receives the first-booking discount according to platform settings.
- The referrer receives reward credit only after the referee's referred ritual is marked `completed`.
- If the referred booking is cancelled or never completed, the referrer reward must not be credited.
- Referral crediting must be auditable from admin.

## Replacement Rules

- Replacement is triggered when an assigned priest cancels or becomes unavailable for a confirmed booking.
- MVP replacement starts as admin-assisted, not fully automated.
- Nearby verified priests should be evaluated using PostGIS radius search based on booking location and priest service radius.
- Every replacement attempt must be logged for audit and operational learning.

## Commission Rules

- A global default commission percentage must exist.
- Admin may override the commission percentage for specific districts or regions.
- The booking should store the commission value used at the time of confirmation.
- Later settings changes must not retroactively change historical booking economics.

## Review Rules

- Reviews become available only after `completed`.
- Each booking may produce only one review.
- Ratings should include a star score and may include punctuality input.

## Admin Override Rules

- Admin can cancel a booking in exceptional cases.
- Admin can move a booking into replacement flow.
- Admin can manually intervene in contact visibility only through auditable system actions.
- Admin actions affecting money, verification, or booking state should be audit logged.
