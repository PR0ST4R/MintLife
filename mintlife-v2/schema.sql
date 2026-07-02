-- ===========================================================
-- MintLife Supabase Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ===========================================================

-- profiles: one row per user (web: google id, app: device uuid)
create table if not exists profiles (
  id          text primary key,           -- google sub OR device uuid
  username    text,
  display_name text,
  mints       integer default 0,
  streak      integer default 0,
  last_active date,
  badges      jsonb default '[]',
  created_at  timestamptz default now()
);

-- share_codes: snapshot of all user data, accessible by short code
create table if not exists share_codes (
  code        text primary key,           -- 6-char uppercase code
  profile_id  text references profiles(id) on delete cascade,
  data        jsonb not null,             -- full snapshot of all user data
  created_at  timestamptz default now(),
  expires_at  timestamptz default (now() + interval '30 days')
);

-- leaderboard view (read-only, safe to query publicly)
create or replace view leaderboard as
  select id, username, display_name, mints, streak, badges
  from profiles
  where username is not null
  order by mints desc
  limit 100;

-- enable row-level security but allow anon reads for leaderboard
alter table profiles enable row level security;
alter table share_codes enable row level security;

-- anyone can read profiles (for leaderboard)
create policy "Public profiles are viewable"
  on profiles for select using (true);

-- anyone can insert/update their own profile (identified by id)
create policy "Users can upsert own profile"
  on profiles for insert with check (true);
create policy "Users can update own profile"
  on profiles for update using (true);

-- anyone can read share codes (to import from another device)
create policy "Share codes are readable"
  on share_codes for select using (true);

-- anyone can create share codes
create policy "Anyone can create share codes"
  on share_codes for insert with check (true);
