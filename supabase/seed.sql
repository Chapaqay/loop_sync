-- Demo seed data for Sardorbek's account (telegram_id = 7192447125)
-- Paste into Supabase SQL Editor and run.
-- Safe to re-run: uses DO block with variable UUIDs.

DO $$
DECLARE
  uid  UUID;
  h1   UUID := gen_random_uuid();
  h2   UUID := gen_random_uuid();
  h3   UUID := gen_random_uuid();
BEGIN
  SELECT id INTO uid FROM public.profiles WHERE telegram_id = 7192447125;
  IF uid IS NULL THEN RAISE EXCEPTION 'Profile not found for telegram_id 7192447125'; END IF;

  -- ── Habits ──────────────────────────────────────────────────────────────────
  INSERT INTO public.habits
    (id, user_id, name, type, color, freq_num, freq_den, unit, target_value, target_type, position)
  VALUES
    -- Wake up early: boolean, blue (color index 9)
    (h1, uid, 'Wake up early', 0, 9,  1, 1, '',      0,     0, 0),
    -- Run: numerical, red (color index 0), target 1.0 miles
    (h2, uid, 'Run',           1, 0,  1, 1, 'miles', 1.0,   0, 1),
    -- Read books: numerical, orange (color index 2), target 30 pages
    (h3, uid, 'Read books',    1, 2,  1, 1, 'pages', 30.0,  0, 2);

  -- ── Entries: Wake up early (boolean: YES_MANUAL=2, NO=0) ────────────────────
  INSERT INTO public.entries (habit_id, user_id, day, value) VALUES
    (h1, uid, current_date,     2),
    (h1, uid, current_date - 1, 2),
    (h1, uid, current_date - 2, 0),
    (h1, uid, current_date - 3, 2),
    (h1, uid, current_date - 4, 0);

  -- ── Entries: Run (numerical, value × 1000) ───────────────────────────────
  INSERT INTO public.entries (habit_id, user_id, day, value) VALUES
    (h2, uid, current_date,     1200),   -- 1.2 miles
    (h2, uid, current_date - 1,    0),   -- rest day
    (h2, uid, current_date - 2, 1300),   -- 1.3 miles
    (h2, uid, current_date - 3,    0),   -- rest day
    (h2, uid, current_date - 4,  500);   -- 0.5 miles

  -- ── Entries: Read books (numerical, value × 1000) ────────────────────────
  INSERT INTO public.entries (habit_id, user_id, day, value) VALUES
    (h3, uid, current_date,      50000),  -- 50 pages
    (h3, uid, current_date - 1,  38000),  -- 38 pages
    (h3, uid, current_date - 2,  65000),  -- 65 pages
    (h3, uid, current_date - 3, 100000),  -- 100 pages
    (h3, uid, current_date - 4,  10000);  -- 10 pages

  RAISE NOTICE 'Seeded habits h1=%, h2=%, h3=% for user %', h1, h2, h3, uid;
END $$;
