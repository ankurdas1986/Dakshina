# Dakshina UAT Checklist

This file records user acceptance checks for each module. A module should not be marked complete until its UAT checks pass.

Legend:

- `[x]` passed
- `[~]` ready for user testing
- `[ ]` pending

## Module 1: Global Settings

- `[x]` Login route is wired on `/`
- `[x]` Global Settings page renders without build errors
- `[x]` Saving commercial settings updates persisted values
- `[x]` Saving district overrides updates persisted values
- `[x]` Saving policy controls updates persisted values
- `[x]` Saving notification settings updates header inbox behavior and persisted values
- `[x]` Admin inbox shows new priest and user registration alerts
- `[x]` Settings audit log records admin changes
- `[x]` Changes persist in `apps/admin/data/global-settings.json`
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[ ]` Production persistence moved from local file to Supabase

## Module 2: Priest Management

- `[x]` Priest listing renders from persisted data
- `[x]` Priest queue supports list-first review with dedicated detail page
- `[x]` KYC review actions update status, verification, radius, and notes
- `[x]` KYC document previews render with large modal view and front/back slots
- `[x]` Cascading category selection maps priests to leaf categories and ritual checklists
- `[x]` Changes persist in `apps/admin/data/priests.json`
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
- `[x]` Booking Fard snapshot rules hold after ritual edits
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

## Remaining Non-Admin Work

- `[ ]` Priest self-registration flow creates distinct priest records for multiple accounts
- `[ ]` User self-registration flow creates distinct user records for multiple accounts
- `[ ]` Production persistence moved from local files to Supabase
- `[ ]` CI runs lint, typecheck, and build
- `[ ]` Cross-module search experience replaces module-scoped filtering
- `[ ]` Supabase middleware warning is removed from build output
