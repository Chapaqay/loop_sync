alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.entries enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "own habits"  on public.habits   for all using (auth.uid() = user_id);
create policy "own entries" on public.entries  for all using (auth.uid() = user_id);
