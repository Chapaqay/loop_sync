-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  telegram_id bigint unique,
  telegram_username text,
  first_name text,
  language_code text default 'en',
  first_weekday smallint default 1,
  theme text default 'dark',
  created_at timestamptz default now()
);

-- habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  question text,
  description text,
  color smallint not null default 8,
  type smallint not null default 0,
  unit text default '',
  target_type smallint default 0,
  target_value numeric default 0,
  freq_num smallint not null default 1,
  freq_den smallint not null default 1,
  reminder_hour smallint,
  reminder_minute smallint,
  reminder_days smallint default 127,
  position int not null default 0,
  archived boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.habits (user_id, archived, position);

-- entries
create table public.entries (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  day date not null,
  value int not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (habit_id, day)
);
create index on public.entries (user_id, day);
create index on public.entries (habit_id, day desc);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger habits_touch before update on public.habits
  for each row execute function public.touch_updated_at();
create trigger entries_touch before update on public.entries
  for each row execute function public.touch_updated_at();
