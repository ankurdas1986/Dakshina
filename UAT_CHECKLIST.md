# Dakshina UAT Checklist

This file records user acceptance checks for each module. A module should not be marked complete until its UAT checks pass.

Legend:

- `[x]` passed
- `[~]` ready for user testing
- `[ ]` pending

## Module 1: Global Settings

- `[~]` Login reaches the admin dashboard from `/`
- `[~]` Global Settings page renders without build errors
- `[~]` Saving commercial settings updates the dashboard metrics and values after refresh
- `[~]` Saving district overrides updates district cards after refresh
- `[~]` Saving policy controls updates enabled states after refresh
- `[~]` Saving notification settings updates the header badge and persisted values after refresh
- `[x]` Settings audit log records admin changes
- `[~]` Changes persist in `apps/admin/data/global-settings.json`
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[ ]` Production persistence moved from local file to Supabase

## Module 2: Priest Management

- `[~]` Priest listing renders from persisted data
- `[~]` Priest queue supports list-first review with dedicated detail page
- `[~]` KYC review actions update status, verification, radius, and notes
- `[x]` KYC document previews render with large modal view and front/back slots
- `[~]` Cascading category selection maps priests to leaf categories and ritual checklists
- `[~]` Changes persist in `apps/admin/data/priests.json`
- `[x]` Search and filter workflow added
- `[x]` District coverage cards drill back into the filtered queue
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Runtime Notes

- `[~]` Middleware shows a non-blocking Supabase Edge runtime warning during production build

## Module 3: Rituals and Fard

- `[x]` Ritual CRUD works
- `[x]` Hierarchical category tree CRUD works
- `[x]` Fard JSON editor validates correctly
- `[ ]` Booking Fard snapshot rules hold after ritual edits
- `[x]` Booking Fard snapshot rules are visible in the admin UI
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Module 4: Bookings

- `[x]` Booking queue supports list-first review with dedicated detail page
- `[x]` Booking status changes follow allowed transitions
- `[x]` Replacement flow is auditable
- `[x]` Contact reveal timing follows configured window
- `[x]` OTP completion oversight is visible and editable in the booking workspace
- `[x]` Booking detail page shows the locked Fard snapshot
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Module 5: Trust and Referral

- `[x]` Review moderation works
- `[x]` Referral reward release occurs only after completion
- `[x]` Trust data reflects booking outcomes correctly
- `[x]` Trust score operations panel updates visible score inputs
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Module 6: Payout Management

- `[x]` Payout queue supports search and status filtering
- `[x]` Payout detail page shows UPI details and settlement state
- `[x]` Manual payout status and reference are editable
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
