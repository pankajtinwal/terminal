-- ==============================================================================
-- QUANT TERMINAL: SUPABASE DATABASE SCHEMA & RLS POLICIES
-- Run this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Create PROFILES Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Create SUBSCRIPTIONS Table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  plan text default 'free' check (plan in ('free', 'pro', 'institutional')),
  status text default 'active' check (status in ('trial', 'active', 'past_due', 'canceled')),
  razorpay_payment_id text,
  razorpay_order_id text,
  amount_paid integer default 0, -- in Paise (e.g. 149900 = ₹1,499)
  current_period_start timestamptz default timezone('utc'::text, now()) not null,
  current_period_end timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Create PAYMENT_LOGS Table (Audit Trail)
create table if not exists public.payment_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  razorpay_payment_id text not null,
  razorpay_order_id text,
  amount integer not null, -- in Paise
  currency text default 'INR',
  status text default 'captured',
  plan text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_logs enable row level security;

-- 5. RLS Policies for Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 6. RLS Policies for Subscriptions
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 7. RLS Policies for Payment Logs
create policy "Users can view own payment logs"
  on public.payment_logs for select
  using (auth.uid() = user_id);

-- 8. Automation: Auto-create Profile and Free Subscription on Sign-Up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into profiles
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- Initialize default free tier subscription
  insert into public.subscriptions (user_id, plan, status, current_period_end)
  values (
    new.id,
    'free',
    'active',
    now() + interval '365 days'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
