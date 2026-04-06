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
- `[x]` Section chips now work as real anchor navigation instead of fake tabs
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell
- `[ ]` Production persistence moved from local file to Supabase

## Module 2: Priest Management

- `[x]` Priest listing renders from persisted data
- `[x]` Priest queue supports list-first review with dedicated detail page
- `[x]` Admin can create a new priest record from the queue page
- `[x]` KYC review actions update status, verification, radius, and notes
- `[x]` KYC document previews render with large modal view and front/back slots
- `[x]` Cascading category selection maps priests to leaf categories and ritual checklists
- `[x]` Changes persist in `apps/admin/data/priests.json`
- `[x]` Search and filter workflow added
- `[x]` Culture and language queue refinements are validated in a runtime-enabled shell
- `[x]` District coverage cards drill back into the filtered queue
- `[x]` Queue-page sub-navigation is limited to real anchors only
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell

## Runtime Notes

- `[~]` Middleware shows a non-blocking Supabase Edge runtime warning during production build

## Module 3: Rituals and Fard

- `[x]` Ritual CRUD works
- `[x]` Hierarchical category tree CRUD works
- `[x]` Safe delete actions exist for rituals and dependency-free categories
- `[x]` Culture-aware category tree, demand ranking, and Panjika research UI are validated in a runtime-enabled shell
- `[x]` Section chips now jump to top-demand, Panjika, category-tree, and ritual-library sections
- `[x]` Fard JSON editor validates correctly
- `[x]` Booking Fard snapshot rules hold after ritual edits
- `[x]` Booking Fard snapshot rules are visible in the admin UI
- `[x]` Category, ritual, Panjika, and Fard pages now expose create + edit + delete actions within the same relevant workspace
- `[x]` Ritual destructive actions open a confirmation dialog before deletion
- `[x]` App-level scrollbar styling is applied instead of the browser default scrollbar
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell

## Module 4: Bookings

- `[x]` Booking queue supports list-first review with dedicated detail page
- `[x]` Admin can create a manual / forced booking from the queue page
- `[x]` Booking queue culture, pricing, and governance summary are validated in a runtime-enabled shell
- `[x]` Booking status changes follow allowed transitions
- `[x]` Replacement flow is auditable
- `[x]` Contact reveal timing follows configured window
- `[x]` OTP completion oversight is visible and editable in the booking workspace
- `[x]` Booking detail page shows the locked Fard snapshot
- `[x]` Booking detail page shows policy snapshot and pending refund amount
- `[x]` Manual refund initiation action works and keeps refund decisions tied to the booking snapshot
- `[x]` WhatsApp deep-link actions render in booking detail
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell
- `[x]` Queue and detail pages have a responsive mobile-first fallback without fake horizontal layout breakage
- `[x]` Field-level info hints are present on complex admin forms and do not break responsive layouts

## Module 4A: User Management

- `[x]` Admin can create a new user profile from the queue page
- `[x]` User queue supports advanced search by name, phone, area, and tradition preference
- `[x]` User queue supports list-first review with dedicated detail page
- `[x]` User detail page edits profile data and account status
- `[x]` User detail page shows booking history and wallet transaction logs
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Protected-route smoke checks pass in a runtime-enabled shell

## Module 5: Trust and Referral

- `[x]` Review moderation works
- `[x]` Referral reward release occurs only after completion
- `[x]` Trust data reflects booking outcomes correctly
- `[x]` Trust score operations panel updates visible score inputs
- `[x]` Trust section chips now jump to real sections instead of acting as fake tabs
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell

## Module 6: Payout Management

- `[x]` Payout queue supports search and status filtering
- `[x]` Payout detail page shows UPI details and settlement state
- `[x]` Manual payout status and reference are editable
- `[x]` Manual payout confirmation appends a wallet-ledger entry
- `[x]` WhatsApp deep-link action renders in payout detail
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Sticky shell/header and protected-route smoke checks pass in a runtime-enabled shell

## Module 6A: Subscriptions

- `[x]` Admin can create a new subscription contract from the queue page
- `[x]` Subscription queue supports search and status filtering
- `[x]` Subscription detail page edits entity, frequency, duration, and generated booking codes
- `[x]` Generated booking visibility is present in the contract detail page
- `[x]` Typecheck passes in a runtime-enabled shell
- `[x]` Lint passes in a runtime-enabled shell
- `[x]` Production build passes in a runtime-enabled shell
- `[x]` Protected-route smoke checks pass in a runtime-enabled shell

## Remaining Non-Admin Work

- `[x]` Priest registration routes render in production build
- `[x]` Priest login route renders in production build
- `[x]` Priest self-registration flow creates distinct priest records for multiple accounts
- `[x]` Priest self-registration creates admin inbox notifications
- `[x]` Priest runtime smoke check passes for `/` and `/register`
- `[ ]` Priest self-registration flow is wired fully to Supabase `app.profiles` / `app.priest_profiles`
- `[ ]` User self-registration flow creates distinct user records for multiple accounts
- `[ ]` Production persistence moved from local files to Supabase
- `[ ]` CI runs lint, typecheck, and build
- `[ ]` Cross-module search experience replaces module-scoped filtering
- `[ ]` Supabase middleware warning is removed from build output

## Documentation and Schema Refactor

- `[x]` PRD reflects multicultural hyper-local marketplace logic
- `[x]` Project plan reflects culture-aware hierarchy, pricing, governance, and availability
- `[x]` SQL schema includes culture tags, language tags, Panjika imports, pricing split, slot blocking, verified reviews, and payout logs
- `[x]` SQL schema includes booking policy snapshots, subscriptions, wallet ledger, and in-app notification tables
- `[x]` SQL schema includes hierarchical and PostGIS-supporting indexes for search and booking integrity
- `[x]` Admin data stores and key workflows are aligned to the incremental refund, subscription, user-control, wallet, and notification contract
- `[x]` Primary admin form actions use consistent top spacing and orange submit-button styling






- [x] route-based settings and rituals workspaces verified via build/lint and responsive layout pass
- [x] dense module submenu behavior verified in the sidebar for settings and rituals workspaces
