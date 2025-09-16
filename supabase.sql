-- Supabase SQL migration for RoomLedger
-- Safe to run on a fresh project. Uses identity columns and creates sequences/constraints correctly.

-- Extensions (if needed)
create extension if not exists pgcrypto;

-- Tables need to be created in dependency order: groups -> group_members -> expense_categories -> transactions -> settlements -> audit_log -> notifications -> recurring_expenses -> group_invites

create table if not exists public.groups (
  id bigint generated always as identity primary key,
  name text,
  password text not null,
  description text,
  currency varchar default 'PKR',
  timezone varchar default 'Asia/Karachi',
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.group_members (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  username text not null,
  display_name text,
  email text,
  phone text,
  is_admin boolean default false,
  is_active boolean default true,
  avatar_url text,
  notification_preferences jsonb default '{"push": false, "email": true}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.expense_categories (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  name text not null,
  description text,
  color varchar default '#667eea',
  icon text default '💰',
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  category_id bigint references public.expense_categories(id) on delete set null,
  description text not null,
  notes text,
  from_member_id bigint references public.group_members(id) on delete set null,
  to_member_id bigint references public.group_members(id) on delete set null,
  amount numeric not null,
  original_amount numeric,
  currency varchar default 'PKR',
  exchange_rate numeric default 1.0,
  settled boolean default false,
  transaction_type varchar default 'expense',
  payment_method varchar,
  receipt_url text,
  location text,
  transaction_date timestamptz default now(),
  created_by bigint references public.group_members(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.settlements (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  settlement_data jsonb not null,
  algorithm_used varchar default 'greedy',
  optimization_metrics jsonb,
  total_amount numeric,
  transaction_count integer,
  efficiency_percentage numeric,
  notes text,
  created_by bigint references public.group_members(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  member_id bigint references public.group_members(id) on delete set null,
  action varchar not null,
  entity_type varchar not null,
  entity_id bigint,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  member_id bigint references public.group_members(id) on delete set null,
  type varchar not null,
  title text not null,
  message text not null,
  data jsonb,
  is_read boolean default false,
  sent_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.recurring_expenses (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  category_id bigint references public.expense_categories(id) on delete set null,
  name text not null,
  description text,
  amount numeric not null,
  frequency varchar not null,
  frequency_interval integer default 1,
  start_date date not null,
  end_date date,
  next_due_date date,
  auto_create boolean default false,
  split_equally boolean default true,
  assigned_members jsonb,
  is_active boolean default true,
  created_by bigint references public.group_members(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.group_invites (
  id bigint generated always as identity primary key,
  group_id bigint references public.groups(id) on delete cascade,
  invited_by bigint references public.group_members(id) on delete set null,
  email text,
  phone text,
  invite_code varchar not null unique,
  expires_at timestamptz,
  used_at timestamptz,
  used_by bigint references public.group_members(id) on delete set null,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_group_members_group on public.group_members(group_id);
create index if not exists idx_transactions_group on public.transactions(group_id);
create index if not exists idx_transactions_members on public.transactions(from_member_id, to_member_id);
create index if not exists idx_settlements_group on public.settlements(group_id);

-- RLS (optional) - disabled by default. Enable and tailor as needed.
-- alter table public.groups enable row level security;
-- alter table public.group_members enable row level security;
-- alter table public.transactions enable row level security;
-- alter table public.settlements enable row level security;

