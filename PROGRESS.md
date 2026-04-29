# In Character — Rebuild Progress

## Status: Complete ✓

Full rebuild completed 2026-04-29.

---

## What was built

### Deleted
- All tracker state logic (emotion_palette, event_weights, state_values, bars)
- DM dashboard and all DM routes
- Campaign system (campaign_members, CAMP codes, DM invite)
- Log Moment modal and three-step flow
- Now screen, Motivations tab, Relationship boards, Clue boards
- Onboarding flow (all 14 steps)
- Realtime subscriptions
- Old Claude prompts (directive, event-narrative, arc, prep, etc.)

### Kept
- Design system, CSS variables, all five themes
- Auth (email/password login/signup/reset)
- Landing page (updated copy)
- `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/keyEncryption.ts`
- `components/ThemeApplier.tsx`, `components/PostHogProvider.tsx`
- `components/LandingNav.tsx`, `components/LandingTheme.tsx`, `components/LandingGlyph.tsx`
- `components/BurgerMenu.tsx` (updated links)
- Static pages: about, faq, privacy, contact
- `api/account/delete`, `api/health`, `api/contact`

---

## Database (run in Supabase SQL editor before testing)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS character_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS api_key_encrypted text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS character_note text;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name text,
  title text,
  summary text,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

CREATE TABLE IF NOT EXISTS entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  icon text,
  category text,
  pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## New pages

| Path | Description |
|------|-------------|
| `/setup` | First-login: character name + API key |
| `/play` | Main two-tab app: Current Session + Past Sessions |
| `/settings` | Character name, note, API key, theme, delete account |

## New API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/setup` | POST | Save profile fields + encrypt API key |
| `/api/setup` | PUT | Test API key validity |
| `/api/sessions` | POST | Create session |
| `/api/sessions/[id]` | PATCH | End session (ended_at + summary) |
| `/api/entries` | POST | Create entry |
| `/api/entries/[id]` | PATCH | Update entry |
| `/api/entries/[id]` | DELETE | Delete entry |
| `/api/claude/categorise` | POST | Assign icon + category (Claude Haiku) |
| `/api/claude/summarise` | POST | Write 3–4 sentence summary (Claude Haiku) |

---

## Commit log

- `0d8e721` CLEANUP: Remove DM, tracker, onboarding, campaign code
- `724804e` REBUILD: Update types, lib, middleware, nav for new schema
- `c2a5e7e` REBUILD: New API routes — sessions, entries, categorise, summarise
- `4427ff4` REBUILD: First-login setup page (character name + API key)
- `866983c` REBUILD: Main app — two-tab journal (current/past sessions)
- `b0d1a17` REBUILD: Settings page
- `451506a` REBUILD: Update landing copy and auth redirects
