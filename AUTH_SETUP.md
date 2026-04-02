# Dakshina Auth Setup

## Current Direction

The admin app is wired for Supabase SSR with email-based authentication only.

Supported MVP methods:

- Magic Link via email
- Email OTP via verification code

Out of scope:

- SMS OTP
- Twilio
- other paid phone gateways

## Required Supabase Configuration

1. Set `Site URL` and allowed redirect URLs to include the admin app host and `/auth/confirm`
2. Enable email provider in Supabase Auth
3. Choose Magic Link email template or OTP email template
4. Mark admin users with role metadata of `admin`

## Required Environment Variables

Create `D:\My-work\Dakshina\dakshina-dev\.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
DEV_ADMIN_EMAILS=you@example.com
DEV_FIXED_OTP=246810
```

## Local Dev Admin Fallback

- `DEV_ADMIN_EMAILS` is for development only.
- If a signed-in user's email appears in that comma-separated list, the app will treat that user as admin even if Supabase role metadata is not set.
- This fallback is disabled in production.
- You still need the user to exist in Supabase Auth and complete email sign-in successfully.

## Local Fixed OTP

- `DEV_FIXED_OTP` is for development only.
- If it is set, the sign-in page will use that code instead of Supabase email delivery.
- This allows you to test the dashboard without real auth wiring.
- Use any email value you want, but keep `DEV_ADMIN_EMAILS` set to the same email if you want the admin gate to pass.

## Current Protected Routes

- `/dashboard`

## Implementation Notes

- Middleware refreshes the Supabase session using cookies
- `/sign-in` supports both magic link and email OTP flows
- `/auth/confirm` exchanges the token hash from a magic link for a session
- dashboard access currently requires authenticated user metadata to contain `admin`, or match `DEV_ADMIN_EMAILS` in development
- when env values are missing, the home page now shows a configuration warning instead of crashing middleware

## Verification Constraint

The code is scaffolded and structurally reviewed, but it has not been install-tested in this environment because Node.js and package managers are not currently available in the session.
