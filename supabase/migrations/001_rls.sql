# Supabase RLS policies for ExploreTN
# Project Ref: ajxnljrhueiiuwavbrra
# --------------------------------------------------------
# 1. users table – only the owner or admin can read/update their row
# --------------------------------------------------------
create policy "users_select_self"
  on public.users
  for select
  using (auth.uid() = id);

create policy "users_update_self"
  on public.users
  for update
  using (auth.uid() = id);

create policy "users_admin_read"
  on public.users
  for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- --------------------------------------------------------
# 2. user_profiles – same logic as users
# --------------------------------------------------------
create policy "profiles_select_self"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles_update_self"
  on public.user_profiles
  for update
  using (auth.uid() = user_id);

create policy "profiles_admin_read"
  on public.user_profiles
  for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- --------------------------------------------------------
# 3. user_stats – same logic as users
# --------------------------------------------------------
create policy "stats_select_self"
  on public.user_stats
  for select
  using (auth.uid() = user_id);

create policy "stats_update_self"
  on public.user_stats
  for update
  using (auth.uid() = user_id);

create policy "stats_admin_read"
  on public.user_stats
  for select
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- --------------------------------------------------------
# 4. places – public read, admin write
# --------------------------------------------------------
create policy "places_public_read"
  on public.places
  for select
  using (true);

create policy "places_admin_write"
  on public.places
  for all
  using (exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'super_admin')));

-- Enable row level security on all tables
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_stats enable row level security;
alter table public.places enable row level security;
