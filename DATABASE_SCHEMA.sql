create extension if not exists postgis;
create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create schema if not exists app;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'role_type' and typnamespace = 'app'::regnamespace) then
    create type app.role_type as enum ('admin', 'priest', 'user');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'culture_type' and typnamespace = 'app'::regnamespace) then
    create type app.culture_type as enum ('Bengali', 'North_Indian', 'Marwadi', 'Odia', 'Gujarati');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'language_type' and typnamespace = 'app'::regnamespace) then
    create type app.language_type as enum ('Bengali', 'Hindi', 'Marwari', 'Odia', 'Gujarati', 'English', 'Sanskrit');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'category_node_type' and typnamespace = 'app'::regnamespace) then
    create type app.category_node_type as enum ('tradition', 'service_type', 'sub_type');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'kyc_status' and typnamespace = 'app'::regnamespace) then
    create type app.kyc_status as enum ('pending', 'under_review', 'approved', 'rejected');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'verification_status' and typnamespace = 'app'::regnamespace) then
    create type app.verification_status as enum ('unverified', 'verified', 'suspended');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'panjika_source' and typnamespace = 'app'::regnamespace) then
    create type app.panjika_source as enum ('Bengali_Panjika', 'North_Indian_Panchang', 'Odia_Kohinoor', 'Gujarati_Janmabhoomi');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'import_status' and typnamespace = 'app'::regnamespace) then
    create type app.import_status as enum ('draft', 'parsed', 'failed', 'published');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'booking_status' and typnamespace = 'app'::regnamespace) then
    create type app.booking_status as enum (
      'draft',
      'pending_advance',
      'confirmed',
      'replacement_in_progress',
      'in_progress',
      'completed',
      'cancelled',
      'expired'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_type' and typnamespace = 'app'::regnamespace) then
    create type app.payment_type as enum ('advance', 'balance', 'full');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payment_status' and typnamespace = 'app'::regnamespace) then
    create type app.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'payout_status' and typnamespace = 'app'::regnamespace) then
    create type app.payout_status as enum ('pending', 'scheduled', 'paid', 'failed');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'review_status' and typnamespace = 'app'::regnamespace) then
    create type app.review_status as enum ('published', 'hidden', 'flagged');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'communication_channel' and typnamespace = 'app'::regnamespace) then
    create type app.communication_channel as enum ('whatsapp', 'sms', 'email', 'manual_note');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'communication_status' and typnamespace = 'app'::regnamespace) then
    create type app.communication_status as enum ('pending', 'sent', 'failed');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_entity_type' and typnamespace = 'app'::regnamespace) then
    create type app.subscription_entity_type as enum ('temple', 'office', 'factory');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_frequency' and typnamespace = 'app'::regnamespace) then
    create type app.subscription_frequency as enum ('daily', 'weekly', 'monthly');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_status' and typnamespace = 'app'::regnamespace) then
    create type app.subscription_status as enum ('draft', 'active', 'paused', 'completed', 'cancelled');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_account_status' and typnamespace = 'app'::regnamespace) then
    create type app.user_account_status as enum ('active', 'blocked', 'deactivated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'wallet_transaction_type' and typnamespace = 'app'::regnamespace) then
    create type app.wallet_transaction_type as enum ('wallet_topup', 'advance_payment', 'refund_credit', 'referral_credit', 'manual_adjustment', 'priest_settlement');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'wallet_transaction_status' and typnamespace = 'app'::regnamespace) then
    create type app.wallet_transaction_status as enum ('pending', 'completed', 'failed', 'reversed');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'document_side' and typnamespace = 'app'::regnamespace) then
    create type app.document_side as enum ('front', 'back', 'single');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'priest_document_type' and typnamespace = 'app'::regnamespace) then
    create type app.priest_document_type as enum (
      'aadhaar',
      'voter_id',
      'address_proof',
      'profile_photo',
      'bank_or_upi_proof'
    );
  end if;
end $$;

create table if not exists app.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  role app.role_type not null,
  full_name text not null,
  email text not null unique,
  phone text,
  preferred_language app.language_type,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_name_idx
  on app.profiles (full_name);

create index if not exists profiles_phone_idx
  on app.profiles (phone);

create table if not exists app.districts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state_name text not null,
  country_name text not null default 'India',
  boundary geography(multipolygon, 4326),
  center geography(point, 4326),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, state_name, country_name)
);

create index if not exists districts_boundary_gix on app.districts using gist (boundary);
create index if not exists districts_center_gix on app.districts using gist (center);

create table if not exists app.localities (
  id uuid primary key default gen_random_uuid(),
  district_id uuid not null references app.districts (id) on delete cascade,
  name text not null,
  pin_code text,
  center geography(point, 4326),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (district_id, name)
);

create index if not exists localities_center_gix on app.localities using gist (center);

create table if not exists app.user_profiles (
  profile_id uuid primary key references app.profiles (id) on delete cascade,
  address_line text,
  district_id uuid references app.districts (id),
  locality_id uuid references app.localities (id),
  tradition_preference app.culture_type,
  wallet_balance numeric(10,2) not null default 0,
  account_status app.user_account_status not null default 'active',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (wallet_balance >= 0)
);

create index if not exists user_profiles_governance_idx
  on app.user_profiles (account_status, district_id, locality_id, tradition_preference);

create table if not exists app.platform_settings (
  id boolean primary key default true,
  advance_payment_percent numeric(5,2) not null default 20.00,
  contact_reveal_min_hours int not null default 48,
  contact_reveal_max_hours int not null default 72,
  min_booking_gap_minutes int not null default 180,
  max_booking_window_days int not null default 60,
  default_slot_minutes int not null default 120,
  registration_alerts_enabled boolean not null default true,
  reviews_require_completed_booking boolean not null default true,
  forced_booking_enabled boolean not null default true,
  festival_rush_blocking_enabled boolean not null default true,
  updated_by uuid references app.profiles (id),
  updated_at timestamptz not null default now(),
  check (id),
  check (advance_payment_percent >= 0 and advance_payment_percent <= 100),
  check (contact_reveal_min_hours <= contact_reveal_max_hours),
  check (min_booking_gap_minutes >= 0),
  check (max_booking_window_days >= 1)
);

insert into app.platform_settings (id) values (true) on conflict (id) do nothing;

create table if not exists app.festival_blackouts (
  id uuid primary key default gen_random_uuid(),
  culture_type app.culture_type,
  district_id uuid references app.districts (id),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booking_blocked boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);

create index if not exists festival_blackouts_lookup_idx
  on app.festival_blackouts (culture_type, district_id, starts_at, ends_at);

create table if not exists app.service_tiers (
  id smallint primary key,
  code text not null unique,
  name text not null,
  description text,
  display_order smallint not null,
  is_subscription boolean not null default false
);

create table if not exists app.ritual_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references app.ritual_categories (id) on delete restrict,
  culture_type app.culture_type not null,
  node_type app.category_node_type not null,
  slug text not null,
  name text not null,
  description text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (culture_type, slug),
  unique (parent_id, name)
);

create index if not exists ritual_categories_parent_idx
  on app.ritual_categories (parent_id, display_order, name);

create index if not exists ritual_categories_culture_parent_idx
  on app.ritual_categories (culture_type, parent_id, display_order);

create table if not exists app.rituals (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references app.ritual_categories (id) on delete restrict,
  culture_type app.culture_type not null,
  service_tier_id smallint references app.service_tiers (id),
  code text not null unique,
  slug text not null,
  name text not null,
  short_description text,
  duration_minutes int not null default 120,
  homepage_rank smallint,
  demand_score numeric(8,2) not null default 0,
  is_active boolean not null default true,
  fard_template jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (culture_type, slug),
  check (jsonb_typeof(fard_template) = 'array')
);

create index if not exists rituals_culture_rank_idx
  on app.rituals (culture_type, homepage_rank)
  where homepage_rank is not null and is_active = true;

create index if not exists rituals_category_idx
  on app.rituals (category_id, is_active, demand_score desc);

create table if not exists app.commission_policies (
  id uuid primary key default gen_random_uuid(),
  district_id uuid references app.districts (id),
  culture_type app.culture_type,
  commission_percent numeric(5,2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (commission_percent >= 0 and commission_percent <= 100)
);

create unique index if not exists commission_policies_default_uniq
  on app.commission_policies (is_default)
  where is_default = true;

create table if not exists app.ritual_pricing_profiles (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references app.rituals (id) on delete cascade,
  district_id uuid references app.districts (id),
  culture_type app.culture_type not null,
  base_dakshina_amount numeric(10,2) not null,
  samagri_add_ons jsonb not null default '[]'::jsonb,
  zone_wise_travel_fee numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (base_dakshina_amount >= 0),
  check (zone_wise_travel_fee >= 0),
  check (jsonb_typeof(samagri_add_ons) = 'array')
);

create index if not exists ritual_pricing_profiles_lookup_idx
  on app.ritual_pricing_profiles (ritual_id, district_id, culture_type, is_active);

create table if not exists app.festival_pricing_rules (
  id uuid primary key default gen_random_uuid(),
  culture_type app.culture_type not null,
  festival_name text not null,
  ritual_id uuid references app.rituals (id) on delete cascade,
  district_id uuid references app.districts (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  multiplier numeric(6,3) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_at >= starts_at),
  check (multiplier > 0)
);

create index if not exists festival_pricing_rules_lookup_idx
  on app.festival_pricing_rules (culture_type, district_id, starts_at, ends_at)
  where is_active = true;

create table if not exists app.priest_profiles (
  profile_id uuid primary key references app.profiles (id) on delete cascade,
  display_name text not null,
  bio text,
  primary_district_id uuid references app.districts (id),
  locality_id uuid references app.localities (id),
  home_address_line text,
  home_location geography(point, 4326),
  travel_radius_km numeric(8,2) not null default 10,
  pending_payout numeric(10,2) not null default 0,
  payout_details jsonb not null default '{}'::jsonb,
  kyc_status app.kyc_status not null default 'pending',
  verification_status app.verification_status not null default 'unverified',
  is_live boolean not null default false,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (travel_radius_km >= 0),
  check (pending_payout >= 0),
  check (jsonb_typeof(payout_details) = 'object')
);

create index if not exists priest_profiles_home_location_gix
  on app.priest_profiles using gist (home_location);

create index if not exists priest_profiles_live_idx
  on app.priest_profiles (is_live, verification_status, primary_district_id);

create table if not exists app.priest_culture_tags (
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  culture_type app.culture_type not null,
  created_at timestamptz not null default now(),
  primary key (priest_profile_id, culture_type)
);

create index if not exists priest_culture_tags_culture_idx
  on app.priest_culture_tags (culture_type, priest_profile_id);

create table if not exists app.priest_language_tags (
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  language_type app.language_type not null,
  created_at timestamptz not null default now(),
  primary key (priest_profile_id, language_type)
);

create index if not exists priest_language_tags_language_idx
  on app.priest_language_tags (language_type, priest_profile_id);

create table if not exists app.priest_services (
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  ritual_id uuid not null references app.rituals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (priest_profile_id, ritual_id)
);

create index if not exists priest_services_ritual_idx
  on app.priest_services (ritual_id, priest_profile_id);

create table if not exists app.priest_documents (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  document_type app.priest_document_type not null,
  document_side app.document_side not null default 'single',
  file_path text not null,
  verification_status app.kyc_status not null default 'pending',
  notes text,
  reviewed_by uuid references app.profiles (id),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (priest_profile_id, document_type, document_side)
);

create index if not exists priest_documents_review_idx
  on app.priest_documents (verification_status, submitted_at desc);

create table if not exists app.priest_availability (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  day_of_week smallint not null,
  start_local_time time,
  end_local_time time,
  slot_minutes int not null default 60,
  is_off_day boolean not null default false,
  effective_from date,
  effective_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (day_of_week between 0 and 6),
  check (slot_minutes >= 15),
  check (is_off_day or (start_local_time is not null and end_local_time is not null and end_local_time > start_local_time)),
  check (effective_to is null or effective_from is null or effective_to >= effective_from)
);

create unique index if not exists priest_availability_day_uniq
  on app.priest_availability (priest_profile_id, day_of_week, coalesce(effective_from, date '1970-01-01'));

create table if not exists app.priest_time_off (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists priest_time_off_range_idx
  on app.priest_time_off (priest_profile_id, starts_at, ends_at);

create table if not exists app.panjika_import_jobs (
  id uuid primary key default gen_random_uuid(),
  culture_type app.culture_type not null,
  source app.panjika_source not null,
  import_status app.import_status not null default 'draft',
  raw_text text not null,
  parsed_payload jsonb not null default '{}'::jsonb,
  imported_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(parsed_payload) = 'object')
);

create index if not exists panjika_import_jobs_lookup_idx
  on app.panjika_import_jobs (culture_type, source, import_status, created_at desc);

create table if not exists app.panjika_entries (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references app.panjika_import_jobs (id) on delete cascade,
  culture_type app.culture_type not null,
  ritual_label text,
  tithi text,
  shubha_muhurta_start timestamptz,
  shubha_muhurta_end timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  check (shubha_muhurta_end is null or shubha_muhurta_start is null or shubha_muhurta_end >= shubha_muhurta_start)
);

create index if not exists panjika_entries_lookup_idx
  on app.panjika_entries (culture_type, shubha_muhurta_start);

create table if not exists app.subscriptions (
  id uuid primary key default gen_random_uuid(),
  entity_type app.subscription_entity_type not null,
  entity_name text not null,
  culture_type app.culture_type not null,
  district_id uuid references app.districts (id),
  locality_id uuid references app.localities (id),
  ritual_id uuid not null references app.rituals (id),
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  frequency app.subscription_frequency not null,
  duration_months int not null,
  starts_on date not null,
  ends_on date not null,
  next_generation_date date,
  booking_window_days int not null default 30,
  status app.subscription_status not null default 'draft',
  contract_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (duration_months in (3, 6, 12)),
  check (ends_on >= starts_on),
  check (booking_window_days >= 1),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists subscriptions_lookup_idx
  on app.subscriptions (status, entity_type, culture_type, next_generation_date);

create table if not exists app.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_profile_id uuid not null references app.profiles (id),
  referee_profile_id uuid not null references app.profiles (id),
  referee_discount_amount numeric(10,2) not null default 0,
  referrer_reward_amount numeric(10,2) not null default 0,
  reward_released_at timestamptz,
  first_booking_id uuid,
  created_at timestamptz not null default now(),
  unique (referrer_profile_id, referee_profile_id)
);

create table if not exists app.bookings (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references app.profiles (id),
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  ritual_id uuid not null references app.rituals (id),
  subscription_id uuid references app.subscriptions (id),
  culture_type app.culture_type not null,
  district_id uuid references app.districts (id),
  locality_id uuid references app.localities (id),
  referral_id uuid references app.referrals (id),
  status app.booking_status not null default 'draft',
  scheduled_start_at timestamptz not null,
  scheduled_end_at timestamptz not null,
  service_address_line text not null,
  service_location geography(point, 4326),
  booking_notes text,
  dakshina_amount numeric(10,2) not null default 0,
  samagri_add_ons numeric(10,2) not null default 0,
  zone_wise_travel_fee numeric(10,2) not null default 0,
  quoted_total_amount numeric(10,2) not null default 0,
  festival_multiplier numeric(6,3) not null default 1,
  advance_payment_percent numeric(5,2) not null,
  advance_amount numeric(10,2) not null default 0,
  final_amount numeric(10,2) not null default 0,
  commission_percent numeric(5,2) not null,
  commission_policy_id uuid references app.commission_policies (id),
  policy_snapshot jsonb not null default '{}'::jsonb,
  pending_refund_amount numeric(10,2) not null default 0,
  contact_reveal_at timestamptz,
  contact_reveal_min_hours int not null,
  contact_reveal_max_hours int not null,
  is_contact_visible boolean not null default false,
  is_admin_override boolean not null default false,
  admin_override_reason text,
  admin_override_by uuid references app.profiles (id),
  fard_snapshot jsonb not null default '[]'::jsonb,
  fard_snapshot_version int not null default 1,
  confirmed_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end_at >= scheduled_start_at),
  check (jsonb_typeof(policy_snapshot) = 'object'),
  check (jsonb_typeof(fard_snapshot) = 'array'),
  check (festival_multiplier > 0),
  check (advance_payment_percent >= 0 and advance_payment_percent <= 100),
  check (contact_reveal_min_hours <= contact_reveal_max_hours),
  check (pending_refund_amount >= 0),
  check (dakshina_amount >= 0 and samagri_add_ons >= 0 and zone_wise_travel_fee >= 0 and quoted_total_amount >= 0)
);

create index if not exists bookings_service_location_gix
  on app.bookings using gist (service_location);

create index if not exists bookings_user_status_idx
  on app.bookings (user_profile_id, status, scheduled_start_at desc);

create index if not exists bookings_priest_status_idx
  on app.bookings (priest_profile_id, status, scheduled_start_at desc);

create index if not exists bookings_culture_status_idx
  on app.bookings (culture_type, status, scheduled_start_at desc);

create index if not exists bookings_subscription_idx
  on app.bookings (subscription_id, scheduled_start_at desc)
  where subscription_id is not null;

create index if not exists bookings_completed_idx
  on app.bookings (status, completed_at desc)
  where status = 'completed';

alter table app.referrals
  add constraint referrals_first_booking_fk
  foreign key (first_booking_id) references app.bookings (id);

create or replace function app.enforce_booking_governance()
returns trigger
language plpgsql
as $$
declare
  settings_row app.platform_settings;
  protected_status boolean;
begin
  protected_status := new.status in ('pending_advance', 'confirmed', 'replacement_in_progress', 'in_progress', 'completed');

  if not protected_status or new.is_admin_override then
    return new;
  end if;

  select * into settings_row
  from app.platform_settings
  where id = true;

  if new.scheduled_start_at > now() + make_interval(days => settings_row.max_booking_window_days) then
    raise exception 'Booking exceeds max booking window';
  end if;

  if exists (
    select 1
    from app.festival_blackouts blackout
    where blackout.is_booking_blocked = true
      and (blackout.culture_type is null or blackout.culture_type = new.culture_type)
      and (blackout.district_id is null or blackout.district_id = new.district_id)
      and tstzrange(blackout.starts_at, blackout.ends_at, '[)') && tstzrange(new.scheduled_start_at, new.scheduled_end_at, '[)')
  ) then
    raise exception 'Booking falls within a blocked festival or blackout window';
  end if;

  if exists (
    select 1
    from app.priest_time_off pto
    where pto.priest_profile_id = new.priest_profile_id
      and tstzrange(pto.starts_at, pto.ends_at, '[)') && tstzrange(new.scheduled_start_at, new.scheduled_end_at, '[)')
  ) then
    raise exception 'Priest is unavailable due to time off';
  end if;

  if not exists (
    select 1
    from app.priest_availability availability
    where availability.priest_profile_id = new.priest_profile_id
      and availability.day_of_week = extract(dow from (new.scheduled_start_at at time zone 'Asia/Kolkata'))::smallint
      and (availability.effective_from is null or availability.effective_from <= (new.scheduled_start_at at time zone 'Asia/Kolkata')::date)
      and (availability.effective_to is null or availability.effective_to >= (new.scheduled_start_at at time zone 'Asia/Kolkata')::date)
      and availability.is_off_day = false
      and availability.start_local_time <= (new.scheduled_start_at at time zone 'Asia/Kolkata')::time
      and availability.end_local_time >= (new.scheduled_end_at at time zone 'Asia/Kolkata')::time
  ) then
    raise exception 'Priest is not available in the selected working window';
  end if;

  if exists (
    select 1
    from app.bookings existing_booking
    where existing_booking.priest_profile_id = new.priest_profile_id
      and existing_booking.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and existing_booking.status in ('pending_advance', 'confirmed', 'replacement_in_progress', 'in_progress', 'completed')
      and tstzrange(
        existing_booking.scheduled_start_at - make_interval(mins => settings_row.min_booking_gap_minutes),
        existing_booking.scheduled_end_at + make_interval(mins => settings_row.min_booking_gap_minutes),
        '[)'
      ) && tstzrange(new.scheduled_start_at, new.scheduled_end_at, '[)')
  ) then
    raise exception 'Booking violates minimum gap or overlaps an existing priest assignment';
  end if;

  return new;
end;
$$;

create trigger bookings_governance_before_write
before insert or update of priest_profile_id, scheduled_start_at, scheduled_end_at, status, district_id, culture_type, is_admin_override
on app.bookings
for each row
execute function app.enforce_booking_governance();

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
  provider text not null default 'razorpay_individual',
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

create table if not exists app.priest_booked_slots (
  id uuid primary key default gen_random_uuid(),
  priest_profile_id uuid not null references app.priest_profiles (profile_id) on delete cascade,
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  blocked_range tstzrange not null,
  source_status app.booking_status not null,
  created_at timestamptz not null default now(),
  exclude using gist (
    priest_profile_id with =,
    blocked_range with &&
  )
);

create index if not exists priest_booked_slots_lookup_idx
  on app.priest_booked_slots (priest_profile_id, source_status, created_at desc);

create or replace function app.sync_priest_booked_slot()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    delete from app.priest_booked_slots where booking_id = old.id;
    return old;
  end if;

  if new.status in ('confirmed', 'replacement_in_progress', 'in_progress', 'completed') then
    insert into app.priest_booked_slots (
      priest_profile_id,
      booking_id,
      blocked_range,
      source_status
    )
    values (
      new.priest_profile_id,
      new.id,
      tstzrange(new.scheduled_start_at, new.scheduled_end_at, '[)'),
      new.status
    )
    on conflict (booking_id) do update
    set
      priest_profile_id = excluded.priest_profile_id,
      blocked_range = excluded.blocked_range,
      source_status = excluded.source_status;
  else
    delete from app.priest_booked_slots where booking_id = new.id;
  end if;

  return new;
end;
$$;

create trigger booking_slot_sync_after_write
after insert or update of priest_profile_id, scheduled_start_at, scheduled_end_at, status
on app.bookings
for each row
execute function app.sync_priest_booked_slot();

create trigger booking_slot_sync_after_delete
after delete on app.bookings
for each row
execute function app.sync_priest_booked_slot();

create table if not exists app.booking_communications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references app.bookings (id) on delete cascade,
  channel app.communication_channel not null,
  status app.communication_status not null default 'pending',
  triggered_by uuid references app.profiles (id),
  template_key text,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists booking_communications_lookup_idx
  on app.booking_communications (booking_id, channel, status, created_at desc);

create table if not exists app.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  user_profile_id uuid not null references app.profiles (id),
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  rating smallint not null check (rating between 1 and 5),
  punctuality_rating smallint check (punctuality_rating between 1 and 5),
  review_text text,
  status app.review_status not null default 'published',
  created_at timestamptz not null default now()
);

create or replace function app.enforce_verified_review()
returns trigger
language plpgsql
as $$
declare
  booking_record app.bookings;
begin
  select * into booking_record
  from app.bookings
  where id = new.booking_id;

  if booking_record.id is null then
    raise exception 'Booking does not exist for review';
  end if;

  if booking_record.status <> 'completed' then
    raise exception 'Reviews are allowed only for completed bookings';
  end if;

  if booking_record.user_profile_id <> new.user_profile_id then
    raise exception 'Review user does not match booking user';
  end if;

  if booking_record.priest_profile_id <> new.priest_profile_id then
    raise exception 'Review priest does not match booking priest';
  end if;

  return new;
end;
$$;

create trigger reviews_completed_booking_only
before insert or update on app.reviews
for each row
execute function app.enforce_verified_review();

create table if not exists app.replacement_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  cancelled_priest_profile_id uuid references app.priest_profiles (profile_id),
  replacement_priest_profile_id uuid references app.priest_profiles (profile_id),
  reason text,
  opened_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists app.payout_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references app.bookings (id) on delete cascade,
  priest_profile_id uuid not null references app.priest_profiles (profile_id),
  amount numeric(10,2) not null check (amount >= 0),
  status app.payout_status not null default 'pending',
  payout_method text not null default 'manual_upi',
  payout_reference text,
  provider text not null default 'manual',
  provider_payload jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_by uuid references app.profiles (id),
  updated_by uuid references app.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(provider_payload) = 'object')
);

create index if not exists payout_logs_status_idx
  on app.payout_logs (status, created_at desc);

create index if not exists payout_logs_priest_status_idx
  on app.payout_logs (priest_profile_id, status, created_at desc);

create table if not exists app.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references app.user_profiles (profile_id) on delete cascade,
  priest_profile_id uuid references app.priest_profiles (profile_id) on delete cascade,
  booking_id uuid references app.bookings (id) on delete set null,
  payout_log_id uuid references app.payout_logs (id) on delete set null,
  transaction_type app.wallet_transaction_type not null,
  status app.wallet_transaction_status not null default 'pending',
  direction text not null,
  amount numeric(10,2) not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (direction in ('credit', 'debit')),
  check (amount >= 0),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists wallet_transactions_user_idx
  on app.wallet_transactions (user_profile_id, created_at desc);

create index if not exists wallet_transactions_priest_idx
  on app.wallet_transactions (priest_profile_id, created_at desc);

create index if not exists wallet_transactions_booking_idx
  on app.wallet_transactions (booking_id, created_at desc);

create table if not exists app.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references app.profiles (id) on delete cascade,
  recipient_role app.role_type not null,
  title text not null,
  body text not null,
  href text,
  is_read boolean not null default false,
  channel_key text not null default 'platform_notifications',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (jsonb_typeof(payload) = 'object')
);

create index if not exists in_app_notifications_lookup_idx
  on app.in_app_notifications (recipient_profile_id, is_read, created_at desc);

create table if not exists app.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references app.profiles (id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (jsonb_typeof(metadata) = 'object')
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

comment on table app.ritual_categories is
  'Culture-aware hierarchical catalog using culture_type plus parent_id. Expected tree pattern: Tradition -> Service Type -> Specific Ritual group.';

comment on table app.priest_culture_tags is
  'Allows each priest to serve multiple traditions such as Bengali and Odia without duplicating profile records.';

comment on table app.priest_language_tags is
  'Stores the spoken / working languages the priest can serve in during rituals and consultations.';

comment on table app.panjika_import_jobs is
  'Stores admin-selected culture and source-aware Panjika imports so Bengali, North Indian, Odia, and Gujarati calendar text can be parsed differently.';

comment on table app.priest_availability is
  'Recurring working-hours table used for priest self-management. Off-days are represented directly on the row with is_off_day = true.';

comment on table app.priest_booked_slots is
  'Auto-maintained blocked-slot ledger derived from confirmed or active bookings. The exclusion constraint prevents overlapping bookings for the same priest.';

comment on column app.rituals.fard_template is
  'JSON array for ritual item lists. The template is snapshotted into bookings at confirmation and must remain immutable for that booking.';

comment on table app.festival_pricing_rules is
  'Peak pricing rules for culture-aware festivals such as Durga Puja, Chhath, Diwali, Rath Yatra, or Gujarati new-year demand spikes.';

comment on column app.bookings.contact_reveal_at is
  'Phone numbers become visible only after advance payment and inside the configured 48-72 hour pre-ritual window.';

comment on table app.booking_communications is
  'Operational audit log for admin-triggered communications such as manual WhatsApp confirmation in booking detail views.';

comment on table app.reviews is
  'Verified reviews only. A trigger enforces that the underlying booking is completed and the reviewer matches the booking owner.';

comment on column app.priest_profiles.payout_details is
  'JSON object storing UPI and future payout routing information. MVP uses manual payout mode through app.payout_logs.';

comment on table app.payout_logs is
  'Manual-first priest payout ledger designed to migrate later to Razorpay Route or similar automated settlement without schema redesign.';

