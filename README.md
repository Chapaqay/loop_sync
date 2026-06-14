# Loop Sync

A sync-enabled replica of [Loop Habit Tracker](https://github.com/iSoron/uhabits) as a Telegram Mini App + web app, backed by Supabase.

> **Attribution:** Derivative work of Loop Habit Tracker (https://github.com/iSoron/uhabits) by Álinson Santos Xavier, licensed under GPLv3. Algorithms ported from uhabits-core. UI redesigned for Telegram Mini App + web.

## License

GPLv3 — see [LICENSE](LICENSE).

## Tech stack

- React 18 + Vite + TypeScript
- Tailwind CSS (dark mode via `class` strategy)
- React Router v7
- Zustand (UI state) + TanStack Query (server state)
- Recharts (charts + heatmap)
- Supabase JS client (auth, DB, realtime)
- Telegram WebApp SDK (`@twa-dev/sdk`)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd loop_sync
npm install
```

### 2. Environment

```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_TELEGRAM_BOT_USERNAME
```

### 3. Run Supabase migrations

Using the Supabase dashboard SQL editor or CLI:

```bash
supabase db push  # or run supabase/migrations/*.sql manually
```

### 4. Deploy the Edge Function

```bash
supabase functions deploy telegram-auth
# Set secret: supabase secrets set TELEGRAM_BOT_TOKEN=<your-token>
```

### 5. Dev server

```bash
npm run dev
```

### 6. Tests

```bash
npm test
```

## Project structure

```
src/
├── pages/         # HabitList, HabitDetail, HabitForm, Settings
├── components/    # CheckmarkButton, HabitRow, HistoryGrid, ScoreChart, ColorPicker
├── lib/
│   ├── supabase.ts
│   ├── telegram.ts
│   ├── auth.ts
│   └── core/      # Ported algorithms: score, streak, frequency, dates, entry
├── hooks/         # useHabits, useEntries, useTelegram, useAuth
├── stores/
└── types/
supabase/
├── migrations/
└── functions/telegram-auth/
```
