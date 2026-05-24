# In Character — Rebuild Progress

## Status: Complete ✓

Full rebuild completed 2026-04-29. Feedback flow added 2026-05-01.

---

## SQL migrations (run in Supabase SQL editor)

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dm_email text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS feedback jsonb;

-- Quest Threads (2026-05-24)
CREATE TABLE IF NOT EXISTS quest_threads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text,
  urgency text DEFAULT 'normal',   -- 'urgent' | 'normal'
  status text DEFAULT 'active',    -- 'active' | 'resolved'
  first_entry_id uuid REFERENCES entries(id) ON DELETE SET NULL,
  last_updated_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  resolved_session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quest_thread_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id uuid REFERENCES quest_threads(id) ON DELETE CASCADE,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  entry_id uuid REFERENCES entries(id) ON DELETE SET NULL,
  update_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quest_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own threads" ON quest_threads FOR ALL USING (auth.uid() = player_id);

ALTER TABLE quest_thread_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own thread updates" ON quest_thread_updates FOR ALL USING (auth.uid() = player_id);
```

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
| `/api/claude/threads` | GET | Return existing quest threads with update history |
| `/api/claude/threads` | POST | Run Claude thread analysis; persists new threads, updates, resolutions |

---

## Quest Threads (2026-05-24)

BG3-style quest thread log that tracks unresolved situations, characters, and arcs.

**Tables:** `quest_threads` (title, summary, urgency, status, session refs) and `quest_thread_updates` (chronological update log per thread, with session and entry refs).

**Route POST body:**
```typescript
{ playerId?: string, newEntryId?: string, retrospective?: boolean }
```
- `retrospective: true` — analyses full entry history to seed threads from scratch; triggered once when the Threads tab is first visited and the table is empty.
- `newEntryId` — analyses last 3 sessions, updates existing threads, opens new ones. Fired fire-and-forget from the entry save flow (does not block the UI).

**Threads tab:** Third tab in `/play` app. On first load: GET threads; if empty, POST with `retrospective: true` and show "Analysing your journal..." until complete. Active threads sorted urgent-first then by `updated_at` desc. Resolved section collapsed by default. Tap any thread to expand its chronological update history.

---

## New pages / components (2026-05-01)

| Path | Description |
|------|-------------|
| `src/components/SessionFeedback.tsx` | Six-step full-screen feedback flow after ending a session |
| `src/emails/SessionFeedbackEmail.tsx` | React Email template sent to DM |
| `src/app/api/sessions` GET | Returns active+past sessions + dm_email for client hydration |
| `src/app/api/session/feedback-email` POST | Renders and sends feedback email via Resend |

---

## Commit log

- `05312a9` FIX: Data not loading on login — await auth before fetch, subscribe to auth changes
- `ee48187` FEAT: Add DM email field to Settings
- `e1ebc7e` FEAT: End Session triggers feedback flow when DM email is set
- `c9f2f64` FEAT: Session feedback email — React Email template + /api/session/feedback-email

- `3f131a2` FEAT: Quest Threads — API route + DB types (Section 1)
- `c8f88c4` FEAT: Quest Threads — wire to entry save (Section 2)
- `5b817ac` FEAT: Quest Threads — Threads tab UI (Section 3)

- `0d8e721` CLEANUP: Remove DM, tracker, onboarding, campaign code
- `724804e` REBUILD: Update types, lib, middleware, nav for new schema
- `c2a5e7e` REBUILD: New API routes — sessions, entries, categorise, summarise
- `4427ff4` REBUILD: First-login setup page (character name + API key)
- `866983c` REBUILD: Main app — two-tab journal (current/past sessions)
- `b0d1a17` REBUILD: Settings page
- `451506a` REBUILD: Update landing copy and auth redirects
