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
  status text DEFAULT 'active',    -- 'active' | 'resolved' | 'dismissed'
  first_entry_id uuid REFERENCES entries(id) ON DELETE SET NULL,
  parent_thread_id uuid REFERENCES quest_threads(id) ON DELETE SET NULL,
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

**Tables:** `quest_threads` (title, summary, urgency, status, parent_thread_id, session refs) and `quest_thread_updates` (chronological update log per thread, with session and entry refs).

**Additional columns needed:**
```sql
ALTER TABLE quest_threads
  ADD COLUMN IF NOT EXISTS parent_thread_id uuid REFERENCES quest_threads(id) ON DELETE SET NULL;
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS threads_initialised boolean DEFAULT false;
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS threads_grouped boolean DEFAULT false;
```

**Three-phase Claude analysis (POST):**
- Phase 1 (1000 tokens): identify new threads → `[{title, entry_id, urgency}]`
- Phase 2 (200 tokens each, parallel): one-sentence summary per new thread
- Phase 3 (1500 tokens): group related threads under parent quests + find thread updates to existing threads

**Profile flags:**
- `threads_initialised` — set after first retrospective succeeds; gates the one-time full-history seed
- `threads_grouped` — set after Phase 3 grouping runs; gates the one-time parent-grouping pass

**Route POST body:**
```typescript
{ newEntryId?: string, retrospective?: boolean }
```
- `retrospective: true` — analyses full entry history; triggers Phase 3 grouping on first call where `!threads_grouped`; sets `threads_initialised` on success
- `newEntryId` — fires fire-and-forget from entry save flow; runs phases 1–3 but skips grouping

**GET route:** Returns `{ threads, threadsInitialised, threadsGrouped }`. Threads are returned as a hierarchy: parent threads contain `children: QuestThreadWithUpdates[]`; orphaned threads appear at root level with `children: []`; dismissed threads are excluded.

**Threads tab:** Third tab in `/play` app.
- First visit, not initialised: POST `{ retrospective: true }`, show "Analysing your journal..."
- Initialised but not grouped: show threads immediately, POST `{ retrospective: true }` in background, show "Grouping quest threads..."
- Active threads sorted urgent-first (including urgency of children) then by `updated_at` desc
- Parent threads (with children) shown with `◆` prefix; children indented with left border
- Solo threads (no parent, no children) shown with urgency dot (🔴/🟡)
- Resolved section collapsed by default
- Tap any thread to expand its chronological update history; tap child to expand child updates
- Dismiss button on every thread (top-level and child)

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
- `a5f6573` FIX: Quest Threads — full history, robust JSON, BG3 prompt
- `7a36653` FEAT: Quest Threads — GET returns hierarchy, POST returns hierarchy (Section 2 rev2)
- `aebea30` FEAT: Quest Threads — hierarchical UI + grouping trigger (Sections 3+4)

- `0d8e721` CLEANUP: Remove DM, tracker, onboarding, campaign code
- `724804e` REBUILD: Update types, lib, middleware, nav for new schema
- `c2a5e7e` REBUILD: New API routes — sessions, entries, categorise, summarise
- `4427ff4` REBUILD: First-login setup page (character name + API key)
- `866983c` REBUILD: Main app — two-tab journal (current/past sessions)
- `b0d1a17` REBUILD: Settings page
- `451506a` REBUILD: Update landing copy and auth redirects
