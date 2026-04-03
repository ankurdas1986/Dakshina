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
- `[~]` Changes persist in `apps/admin/data/global-settings.json`
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[ ]` Production persistence moved from local file to Supabase

## Module 2: Priest Management

- `[~]` Priest listing renders from persisted data
- `[~]` KYC review actions update status, verification, radius, and notes
- `[~]` Changes persist in `apps/admin/data/priests.json`
- `[ ]` Search and filter workflow added
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Runtime Notes

- `[~]` Middleware shows a non-blocking Supabase Edge runtime warning during production build

## Module 3: Rituals and Fard

- `[x]` Ritual CRUD works
- `[x]` Fard JSON editor validates correctly
- `[ ]` Booking Fard snapshot rules hold after ritual edits
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell

## Module 4: Bookings

- `[ ]` Booking status changes follow allowed transitions
- `[ ]` Replacement flow is auditable
- `[ ]` Contact reveal timing follows configured window

## Module 5: Trust and Referral

- `[ ]` Review moderation works
- `[ ]` Referral reward release occurs only after completion
- `[ ]` Trust data reflects booking outcomes correctly
