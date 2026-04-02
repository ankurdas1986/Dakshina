-- Dakshina database schema
-- Admin-first marketplace foundation with PostGIS, ritual Fard JSON, referrals,
-- district-based commissions, delayed contact reveal, and OTP completion.

create extension if not exists pgcrypto;
create extension if not exists postgis;

create schema if not exists app;

create type app.user_role as enum ('admin', 'priest', 'user');
create type app.kyc_status as enum ('pending', 'under_review', 'approved', 'rejected');
create type app.booking_status as enum (
  'draft',
  'pending_priest_confirmation',
  'awaiting_advance_payment',
  'confirmed',
  'contact_window_locked',
  'contact_window_open',
  'in_progress',
  'completed',
  'cancelled_by_user',
  'cancelled_by_priest',
  'cancelled_by_admin',
  'replacement_in_progress',
  'expired'
);
create type app.payment_type as enum ('advance', 'final', 'refund', 'adjustment');
create type app.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded', 'waived');
create type app.referral_reward_status as enum ('pending', 'eligible', 'credited', 'cancelled');
create type app.commission_scope as enum ('global', 'district');
create type app.replacement_status as enum ('open', 'searching', 'assigned', 'resolved', 'cancelled');

create table if not exists app.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role app.user_role not null,
  full_name text not null,
  phone_e164 text,
  email text,
  district_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app.service_tiers (
  id smallint primary key,
  code text not null unique,
  name text not null unique,
  description text not null,
  display_order smallint not null unique,
  is_subscription boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app.districts (
  id uuid primary key default gen_random_uuid(),
  state_name text not null default 'West Bengal',
  district_name text not null,
  region_slug text not null unique,
  boundary geography(multipolygon, 4326),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table app.profiles
  add constraint profiles_district_fk
  foreign key (district_id) references app.districts (id);

create index if not exists districts_boundary_gix on app.districts using gist (boundary);

create table if not exists app.platform_settings (
  id uuid primary key default gen_random_uuid(),
  singleton_key text not null unique default 'default',
  default_commission_percent numeric(5,2) not null check (default_commission_percent >= 0 and default_commission_percent <= 100),
  advance_payment_percent numeric(5,2) not null check (advance_payment_percent >= 0 and advance_payment_percent <= 100),
  referrer_reward_type text not null default 'credit',
  referrer_reward_value numeric(10,2) not null default 0,
  referee_discount_type text not null default 'percentage',
  referee_discount_value numeric(10,2) not null default 0,
  contact_reveal_min_hours int not null default 48 check (contact_reveal_min_hours between 1 and 168),
  contact_reveal_max_hours int not null default 72 check (contact_reveal_max_hours between 1 and 168),
  feature_flags jsonb not null default '{}'::jsonb,
  updated_by uuid references app.profiles (id),
  updated_at timestamptz not null default now(),
  check (contact_reveal_min_hours <= contact_reveal_max_hours)
);

create table if not exists app.commission_policies (
  id uuid primary key default gen_random_uuid(),
  scope app.commission_scope not null,
  district_id uuid references app.districts (id),
  commission_percent numeric(5,2) not null check (commission_percent >= 0 and commission_percent <= 100),
  is_active boolean not null default true,
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  notes text,
  created_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  check (
    (scope = 'global' and district_id is null) or
    (scope = 'district' and district_id is not null)
  ),
  check (effective_to is null or effective_to > effective_from)
);

create unique index if not exists commission_global_active_uniq
  on app.commission_policies (scope)
  where scope = 'global' and is_active = true and effective_to is null;

create unique index if not exists commission_district_active_uniq
  on app.commission_policies (district_id)
  where scope = 'district' and is_active = true and effective_to is null;

create table if not exists app.priest_profiles (
  profile_id uuid primary key references app.profiles (id) on delete cascade,
  display_name text,
  bio text,
  home_location geography(point, 4326),
  service_radius_km numeric(6,2) not null default 10 check (service_radius_km > 0),
  trust_score numeric(6,3) not null default 0,
  punctuality_score numeric(6,3) not null default 0,
  verification_status app.kyc_status not null default 'pending',
  is_verified boolean not null default false,
  verified_at timestamptz,
  verified_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists priest_profiles_home_location_gix
  on app.priest_profiles using gist (home_location);

create table if not exists app.priest_kyc_documents (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  status app.kyc_status not null default 'pending',
  reviewed_by uuid references app.profiles (id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists app.ritual_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists app.rituals (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references app.ritual_categories (id),
  service_tier_id smallint not null references app.service_tiers (id),
  name text not null unique,
  slug text not null unique,
  description text,
  base_price numeric(10,2),
  duration_minutes int,
  is_active boolean not null default true,
  fard_template jsonb not null default '[]'::jsonb,
  fard_template_version int not null default 1,
  created_by uuid references app.profiles (id),
  updated_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(fard_template) = 'array')
);

create table if not exists app.priest_rituals (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  ritual_id uuid not null references app.rituals (id) on delete cascade,
  custom_price numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (priest_profile_id, ritual_id)
);

create table if not exists app.referral_codes (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid not null references app.profiles (id) on delete cascade,
  code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app.referrals (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references app.referral_codes (id),
  referrer_profile_id uuid not null references app.profiles (id),
  referee_profile_id uuid not null references app.profiles (id),
  first_booking_id uuid,
  referee_discount_type text not null default 'percentage',
  referee_discount_value numeric(10,2) not null default 0,
  reward_status app.referral_reward_status not null default 'pending',
  reward_credit_amount numeric(10,2) not null default 0,
  reward_credited_at timestamptz,
  created_at timestamptz not null default now(),
  unique (referee_profile_id),
  check (referrer_profile_id <> referee_profile_id)
);

create table if not exists app.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  user_profile_id uuid not null references app.profiles (id),
  priest_profile_id uuid references app.priest_profiles (profile_id),
  ritual_id uuid not null references app.rituals (id),
  district_id uuid references app.districts (id),
  referral_id uuid references app.referrals (id),
  status app.booking_status not null default 'draft',
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz,
  service_address_line text not null,
  service_location geography(point, 4326),
  notes text,
  quoted_price numeric(10,2) not null,
  advance_payment_percent numeric(5,2) not null,
  advance_amount numeric(10,2) not null default 0,
  final_amount numeric(10,2) not null default 0,
  commission_percent numeric(5,2) not null,
  commission_policy_id uuid references app.commission_policies (id),
  contact_reveal_at timestamptz,
  contact_reveal_min_hours int not null,
  contact_reveal_max_hours int not null,
  is_contact_visible boolean not null default false,
  fard_snapshot jsonb not null default '[]'::jsonb,
  fard_snapshot_version int not null default 1,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(fard_snapshot) = 'array'),
  check (contact_reveal_min_hours <= contact_reveal_max_hours),
  check (scheduled_end_at is null or scheduled_end_at >= scheduled_start_at)
);

create index if not exists bookings_service_location_gix
  on app.bookings using gist (service_location);

create index if not exists bookings_user_status_idx
  on app.bookings (user_profile_id, status, scheduled_start_at desc);

create index if not exists bookings_priest_status_idx
  on app.bookings (priest_profile_id, status, scheduled_start_at desc);

alter table app.referrals
  add constraint referrals_first_booking_fk
  foreign key (first_booking_id) references app.bookings (id);

create table if not exists app.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references app.bookings (id) on delete cascade,
  from_status app.booking_status,
  to_status app.booking_status not null,
  changed_by uuid references app.profiles (id),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references app.bookings (id) on delete cascade,
  payment_type app.payment_type not null,
  status app.payment_status not null default 'pending',
  provider text,
  provider_payment_id text,
  amount numeric(10,2) not null check (amount >= 0),
  currency_code text not null default 'INR',
  paid_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);

create table if not exists app.booking_completion_otps (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  otp_hash text not null,
  expires_at timestamptz not null,
  entered_at timestamptz,
  verified_at timestamptz,
  verified_by_priest_id uuid references app.priest_profiles (profile_id),
  created_at timestamptz not null default now()
);

create table if not exists app.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  user_profile_id uuid not null references app.profiles (id),
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  rating smallint not null check (rating between 1 and 5),
  punctuality_rating smallint check (punctuality_rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

create table if not exists app.replacement_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  cancelled_priest_profile_id uuid references app.priest_profiles (profile_id),
  replacement_priest_profile_id uuid references app.priest_profiles (profile_id),
  status app.replacement_status not null default 'open',
  triggered_by uuid references app.profiles (id),
  reason text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists app.replacement_candidates (
  id uuid primary key default gen_random_uuid(),
  replacement_request_id uuid not null references app.replacement_requests (id) on delete cascade,
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  distance_km numeric(8,2),
  was_contacted boolean not null default false,
  was_assigned boolean not null default false,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique (replacement_request_id, priest_profile_id)
);

create table if not exists app.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references app.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into app.service_tiers (id, code, name, description, display_order, is_subscription)
values
  (1, 'essential_home', 'Tier 1: Essential Home', 'Small, frequent rituals such as Satyanarayan and Lakshmi Puja.', 1, false),
  (2, 'grand_event', 'Tier 2: Grand Event', 'High-ticket milestones such as Weddings, Sacred Thread, and House-warming.', 2, false),
  (3, 'barwari_public', 'Tier 3: Barwari / Public', 'Community events such as Durga Puja and Kali Puja.', 3, false),
  (4, 'monthly_trustee', 'Tier 4: Monthly Trustee', 'Subscription-based recurring priest management.', 4, true)
on conflict (id) do update
set
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  display_order = excluded.display_order,
  is_subscription = excluded.is_subscription;

comment on table app.platform_settings is
  'Singleton table for platform-wide operational rules such as advance payment percentage, referral defaults, and contact reveal timing.';

comment on table app.commission_policies is
  'Stores the global commission rate and district-level overrides such as different percentages for Howrah and Hooghly.';

comment on column app.rituals.fard_template is
  'JSON array representing the ritual item list (Fard). Suggested item shape: [{\"label\":\"Ghee\",\"quantity\":\"500 ml\",\"optional\":false,\"notes\":\"Cow ghee preferred\"}].';

comment on column app.bookings.fard_snapshot is
  'Immutable booking-time copy of the ritual Fard so the user can view or download the exact checklist after confirmation even if the ritual template changes later.';

comment on column app.bookings.contact_reveal_at is
  'Phone numbers should only become visible after advance payment confirmation and when current time is within the configured pre-ritual reveal window.';

comment on table app.referrals is
  'Tracks referee discount and referrer reward release. Reward moves to credited only after the referred booking reaches completed via OTP verification.';
