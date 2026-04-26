-- In Character Database Schema
-- Run this in your Supabase SQL editor

-- ─────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────

create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique,
  role text check (role in ('player', 'dm', 'admin')),
  created_at timestamp with time zone default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  dm_id uuid references profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamp with time zone default now(),
  archived boolean default false
);

create table if not exists campaign_members (
  campaign_id uuid references campaigns(id) on delete cascade,
  player_id uuid references profiles(id) on delete cascade,
  invited_at timestamp with time zone default now(),
  accepted boolean default false,
  primary key (campaign_id, player_id)
);

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references profiles(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null,
  dossier_text text,
  color_scheme jsonb,
  emotion_palette jsonb,
  tracker_config jsonb,
  api_key_encrypted text,
  portrait_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists tracker_states (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade,
  mask integer default 50 check (mask between 0 and 100),
  dagger integer default 30 check (dagger between 0 and 100),
  bottle integer default 40 check (bottle between 0 and 100),
  wound integer default 60 check (wound between 0 and 100),
  play_directive text,
  glyph_states jsonb,
  updated_at timestamp with time zone default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade,
  session_number integer not null default 1,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  waking_text text,
  long_rest_dream boolean,
  long_rest_drink boolean
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  character_id uuid references characters(id) on delete cascade,
  category text not null,
  subcategory text not null,
  reaction text not null,
  narrative text,
  tracker_delta jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists clues (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade,
  source_type text not null,
  raw_text text not null,
  narrative text,
  current_belief text,
  created_at timestamp with time zone default now()
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references characters(id) on delete cascade,
  npc_name text not null,
  moment_type text not null,
  trust_direction text,
  raw_text text,
  narrative text,
  current_state text,
  created_at timestamp with time zone default now()
);

create table if not exists error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  character_id uuid references characters(id) on delete set null,
  screen text,
  action text,
  error_type text,
  error_message text,
  stack_trace text,
  app_state jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists session_replays (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null,
  created_at timestamp with time zone default now()
);

-- ─────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────

alter table profiles enable row level security;
alter table campaigns enable row level security;
alter table campaign_members enable row level security;
alter table characters enable row level security;
alter table tracker_states enable row level security;
alter table sessions enable row level security;
alter table events enable row level security;
alter table clues enable row level security;
alter table relationships enable row level security;
alter table error_logs enable row level security;
alter table session_replays enable row level security;

-- Profiles: users can read/write their own
create policy "profiles_own" on profiles for all using (auth.uid() = id);

-- Campaigns: DMs own their campaigns, members can read
-- NOTE: The two policies below use SECURITY DEFINER helper functions to avoid
-- infinite recursion. campaigns_member_read and campaign_members_dm previously
-- referenced each other in subqueries, causing circular RLS evaluation.
-- Run the fixed SQL in docs/fix-rls-circular.sql before using this schema.
create policy "campaigns_dm_all" on campaigns for all using (auth.uid() = dm_id);
-- campaigns_member_read: see docs/fix-rls-circular.sql
-- campaign_members_dm: see docs/fix-rls-circular.sql
create policy "campaign_members_own" on campaign_members for select using (player_id = auth.uid());

-- Characters: players own their characters, DMs can read characters in their campaigns
create policy "characters_own" on characters for all using (player_id = auth.uid());
create policy "characters_dm_read" on characters for select using (
  campaign_id in (select id from campaigns where dm_id = auth.uid())
);

-- Tracker states: same as characters
create policy "tracker_own" on tracker_states for all using (
  character_id in (select id from characters where player_id = auth.uid())
);
create policy "tracker_dm_read" on tracker_states for select using (
  character_id in (
    select c.id from characters c
    join campaigns camp on c.campaign_id = camp.id
    where camp.dm_id = auth.uid()
  )
);

-- Sessions, events, clues, relationships: same pattern
create policy "sessions_own" on sessions for all using (
  character_id in (select id from characters where player_id = auth.uid())
);
create policy "sessions_dm_read" on sessions for select using (
  character_id in (
    select c.id from characters c
    join campaigns camp on c.campaign_id = camp.id
    where camp.dm_id = auth.uid()
  )
);

create policy "events_own" on events for all using (
  character_id in (select id from characters where player_id = auth.uid())
);
create policy "events_dm_read" on events for select using (
  character_id in (
    select c.id from characters c
    join campaigns camp on c.campaign_id = camp.id
    where camp.dm_id = auth.uid()
  )
);

create policy "clues_own" on clues for all using (
  character_id in (select id from characters where player_id = auth.uid())
);
create policy "clues_dm_read" on clues for select using (
  character_id in (
    select c.id from characters c
    join campaigns camp on c.campaign_id = camp.id
    where camp.dm_id = auth.uid()
  )
);

create policy "relationships_own" on relationships for all using (
  character_id in (select id from characters where player_id = auth.uid())
);
create policy "relationships_dm_read" on relationships for select using (
  character_id in (
    select c.id from characters c
    join campaigns camp on c.campaign_id = camp.id
    where camp.dm_id = auth.uid()
  )
);

-- Error logs: users can insert their own, admins can read all
create policy "errors_insert" on error_logs for insert with check (auth.uid() = user_id or user_id is null);
create policy "errors_admin_read" on error_logs for select using (
  auth.uid() in (select id from profiles where role = 'admin')
);

-- Session replays: same as events
create policy "replays_own" on session_replays for all using (
  session_id in (
    select s.id from sessions s
    join characters c on s.character_id = c.id
    where c.player_id = auth.uid()
  )
);

-- ─────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, split_part(new.email, '@', 1), 'player')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Updated_at trigger for characters
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists characters_updated_at on characters;
create trigger characters_updated_at
  before update on characters
  for each row execute procedure update_updated_at();

drop trigger if exists tracker_states_updated_at on tracker_states;
create trigger tracker_states_updated_at
  before update on tracker_states
  for each row execute procedure update_updated_at();
