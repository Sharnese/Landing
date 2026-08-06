-- ============================================================================
-- Page Visibility, Learning Center, and Pricing
-- ============================================================================
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query)
-- for the project this app already connects to (see src/lib/supabase.ts).
--
-- This migration assumes an existing `admin_profiles` table with columns
-- (auth_user_id uuid, status text) — the same table AdminAuth.tsx already
-- reads from to authorize the admin portal. Every "admin write" policy below
-- checks against it, so only people who can already log into /admin can
-- create/edit/delete this content. Everyone else (anonymous site visitors)
-- gets read-only access.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Page Visibility — lets the admin toggle optional public pages on/off
-- ----------------------------------------------------------------------------
create table if not exists mq_page_settings (
  key         text primary key,
  label       text not null,
  description text,
  visible     boolean not null default true,
  updated_at  timestamptz not null default now()
);

alter table mq_page_settings enable row level security;

drop policy if exists "mq_page_settings_public_select" on mq_page_settings;
create policy "mq_page_settings_public_select" on mq_page_settings
  for select using (true);

drop policy if exists "mq_page_settings_admin_write" on mq_page_settings;
create policy "mq_page_settings_admin_write" on mq_page_settings
  for all using (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  )
  with check (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

insert into mq_page_settings (key, label, description, visible) values
  ('learning_center', 'Learning Center', 'Public training videos, digital manuals, and module resources.', false),
  ('pricing',         'Pricing',         'Public pricing and subscription plans page.', true),
  ('use_cases',       'Use Cases',       'Public industry use case articles.', true)
on conflict (key) do nothing;


-- ----------------------------------------------------------------------------
-- 2. Learning Center — modules, each with videos and downloadable files
-- ----------------------------------------------------------------------------
create table if not exists mq_learning_modules (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists mq_learning_resources (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references mq_learning_modules(id) on delete cascade,
  kind        text not null check (kind in ('video', 'file')),
  title       text not null,
  url         text not null,   -- public URL (Supabase Storage or an external link)
  file_path   text,            -- storage object path, so it can be deleted later; null for external links
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table mq_learning_modules enable row level security;
alter table mq_learning_resources enable row level security;

drop policy if exists "mq_learning_modules_public_select" on mq_learning_modules;
create policy "mq_learning_modules_public_select" on mq_learning_modules for select using (true);
drop policy if exists "mq_learning_modules_admin_write" on mq_learning_modules;
create policy "mq_learning_modules_admin_write" on mq_learning_modules
  for all using (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  )
  with check (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

drop policy if exists "mq_learning_resources_public_select" on mq_learning_resources;
create policy "mq_learning_resources_public_select" on mq_learning_resources for select using (true);
drop policy if exists "mq_learning_resources_admin_write" on mq_learning_resources;
create policy "mq_learning_resources_admin_write" on mq_learning_resources
  for all using (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  )
  with check (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

-- Starter modules so the admin has something to see and edit right away.
insert into mq_learning_modules (name, description, sort_order)
select * from (values
  ('Getting Started', 'Platform overview, navigation, and your first login.', 0),
  ('Compliance Dashboard', 'Reading compliance scores, alerts, and tasks.', 1),
  ('Form Builder', 'Building, publishing, and managing custom forms.', 2)
) as v(name, description, sort_order)
where not exists (select 1 from mq_learning_modules);


-- ----------------------------------------------------------------------------
-- 3. Pricing — plans shown on the public /pricing page. Editing these does
--    NOT touch Stripe or any billing system — it only changes what visitors
--    see on the page. Actual billing still has to be updated separately.
-- ----------------------------------------------------------------------------
create table if not exists mq_pricing_plans (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  price_label  text not null,
  billing_note text,
  description  text,
  features     text[] not null default '{}',
  cta_label    text not null default 'Book a Demo',
  highlighted  boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table mq_pricing_plans enable row level security;

drop policy if exists "mq_pricing_plans_public_select" on mq_pricing_plans;
create policy "mq_pricing_plans_public_select" on mq_pricing_plans for select using (true);
drop policy if exists "mq_pricing_plans_admin_write" on mq_pricing_plans;
create policy "mq_pricing_plans_admin_write" on mq_pricing_plans
  for all using (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  )
  with check (
    exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

-- Seed with industry-standard starting points for a compliance + EVV + eMAR
-- human-services platform. These are placeholders meant to be adjusted from
-- Admin → Pricing once real numbers are decided.
insert into mq_pricing_plans (name, price_label, billing_note, description, features, cta_label, highlighted, sort_order)
select * from (values
  (
    'Starter',
    '$499/mo',
    'Per organization, billed monthly. Up to 25 staff.',
    'Core compliance and records for a single-site organization getting started.',
    array[
      'Compliance Dashboard',
      'Custom Forms',
      'Records Management',
      'Incident Tracking',
      'Reports & Analytics',
      'Knowledge Base',
      'Email support'
    ],
    'Book a Demo',
    false,
    0
  ),
  (
    'Professional',
    '$1,299/mo',
    'Per organization, billed monthly. Up to 100 staff.',
    'Everything a multi-program agency needs to stay audit-ready, day to day.',
    array[
      'Everything in Starter',
      'Visit Verification (EVV)',
      'eMAR',
      'Client Portal',
      'Staff Credentialing',
      'AI Trend Insights',
      'Task Management',
      '6 free training hours',
      'Live office hours',
      'Priority support'
    ],
    'Book a Demo',
    true,
    1
  ),
  (
    'Enterprise',
    'Custom',
    'Unlimited staff and programs. Custom contract.',
    'For larger or multi-state organizations that need dedicated support and integrations.',
    array[
      'Everything in Professional',
      'Compliance Manager (checks & CAPs)',
      'Custom integrations & API access',
      'Dedicated account specialist',
      'Custom onboarding & training',
      'SLA-backed Help Desk'
    ],
    'Contact Sales',
    false,
    2
  )
) as v(name, price_label, billing_note, description, features, cta_label, highlighted, sort_order)
where not exists (select 1 from mq_pricing_plans);


-- ----------------------------------------------------------------------------
-- 4. Storage bucket for Learning Center uploads (manuals, video files)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('learning-center', 'learning-center', true)
on conflict (id) do nothing;

drop policy if exists "learning_center_public_read" on storage.objects;
create policy "learning_center_public_read" on storage.objects
  for select using (bucket_id = 'learning-center');

drop policy if exists "learning_center_admin_insert" on storage.objects;
create policy "learning_center_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'learning-center'
    and exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

drop policy if exists "learning_center_admin_update" on storage.objects;
create policy "learning_center_admin_update" on storage.objects
  for update using (
    bucket_id = 'learning-center'
    and exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

drop policy if exists "learning_center_admin_delete" on storage.objects;
create policy "learning_center_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'learning-center'
    and exists (select 1 from admin_profiles ap where ap.auth_user_id = auth.uid() and ap.status = 'Active')
  );

-- ============================================================================
-- Done. After running this, refresh /admin — you should see three new pages:
-- Page Visibility, Learning Center, and Pricing.
-- ============================================================================
