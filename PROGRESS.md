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
| `/api/claude/quest-assign` | POST | Map new entry to an existing quest or create a new one |
| `/api/claude/quest-update` | POST | Rewrite current status of a quest from all its entries |
| `/api/claude/quest-recalibrate` | POST | Manual recalibration with player instruction |
| `/api/quests` | GET | Return all quests with update history and linked entries |
| `/api/quests/[id]` | PATCH | Generic status update (used for reopen) |
| `/api/quests/[id]/dismiss` | PATCH | Set quest status to dismissed |

---

## Quest System — Architecture Replacement (2026-06-05)

Replaced the old `quest_threads` / `quest_thread_updates` two-table model with a cleaner three-table design.

**New tables (run in Supabase SQL editor):**
```sql
CREATE TABLE quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'active',
  urgency text DEFAULT 'normal',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE quest_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
  status_text text NOT NULL,
  is_current boolean DEFAULT true,
  entry_id uuid REFERENCES entries(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE entry_quest_map (
  entry_id uuid REFERENCES entries(id) ON DELETE CASCADE,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, quest_id)
);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_quest_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own quests" ON quests
  FOR ALL USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Own quest updates" ON quest_updates
  FOR ALL USING (
    auth.uid() = (SELECT player_id FROM quests WHERE id = quest_id)
  );

CREATE POLICY "Own entry quest map" ON entry_quest_map
  FOR ALL USING (
    auth.uid() = (SELECT player_id FROM entries WHERE id = entry_id)
  );
```

**Drop old tables after confirming new system works:**
```sql
DROP TABLE IF EXISTS quest_thread_updates CASCADE;
DROP TABLE IF EXISTS quest_threads CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS threads_initialised;
ALTER TABLE profiles DROP COLUMN IF EXISTS threads_grouped;
```

**Three Claude calls:**
- `quest-assign` (400 tokens): for each new entry, match to existing quest or create new one
- `quest-update` (300 tokens): rewrite current one-sentence status from all entries for that quest
- `quest-recalibrate` (500 tokens): player provides instruction; re-evaluate status/urgency/resolution

**Retrospective (first Threads tab visit, empty quests):**
- Shows "Building your quest log..."
- Fetches all entries from existing session state (no extra API call)
- Processes chronologically in sequential batches of 5: quest-assign → quest-update per entry
- Prevents double-run with a `useRef` flag within the session

**Threads tab UI:**
- Active quests sorted urgent-first then by `updated_at` desc
- Each quest: `◆` prefix + title (15px fw600) + urgency dot (🔴/🟡) on right
- Current status (14px, bold) + old statuses with `text-decoration: line-through`
- Action bar: entries toggle (shows count) + Recalibrate + Dismiss
- Recalibrate opens a modal: "What should Claude know?" → calls quest-recalibrate
- Entries expand to show icon + category + truncated text + timestamp (newest first)
- Resolved section collapsed by default; shows final status text + Reopen ghost button

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

- `174f724` FEAT: Quest system — new API routes (Section 1, architecture replacement)
- `fe9b0a3` FEAT: Quests tab — entry wiring, retrospective, new UI (Sections 2-4)
- `7f7b2a8` CLEANUP: Remove old quest_threads references from entries DELETE (Section 5)

- `0d8e721` CLEANUP: Remove DM, tracker, onboarding, campaign code
- `724804e` REBUILD: Update types, lib, middleware, nav for new schema
- `c2a5e7e` REBUILD: New API routes — sessions, entries, categorise, summarise
- `4427ff4` REBUILD: First-login setup page (character name + API key)
- `866983c` REBUILD: Main app — two-tab journal (current/past sessions)
- `b0d1a17` REBUILD: Settings page
- `451506a` REBUILD: Update landing copy and auth redirects
