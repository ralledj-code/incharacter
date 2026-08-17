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
| `/api/claude/recap-song` | POST | Generate a Suno v5.5 style prompt + lyrics recap of a past session (Claude Sonnet) |
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

## Recap Song Generator (2026-08-17)

Turns any past session into a bard's ballad for Suno v5.5 — a copy-ready style prompt plus structured lyrics.

**API route** — `POST /api/claude/recap-song`, input `{ sessionId, playerId }`:
1. **Auth** — fetches the session with the service-role client and returns `403` if `sessions.player_id !== auth.uid()` (`404` if the session is missing) before any Claude call. `playerId` from the client is ignored; the authed `user.id` is authoritative.
2. **Entries** — read from the `entries` table ordered by `created_at ASC` (strict chronological), never the `summary` blob.
3. **Mood scoring** — counts `entries.category` frequency (upper-cased to match `MOOD_MAP` keys); the final 20% of entries are weighted `1.5x` (`MOOD_WEIGHTS = { early: 1.0, late: 1.5 }`) so the ending colours the tone. Non-mood categories (Rest, Note) are ignored; falls back to `MYSTERY` if none. Top 1–2 tags become the dominant moods.
4. **Style string** — `buildStyleString` maps the dominant moods through `MOOD_MAP` (instruments/bpm/energy) into a Suno v5.5 line: BPM + D minor, nordic battle-hymn genre, instrument stack, raspy male bard vocal, negatives — under 1000 chars.
5. **Claude** — `claude-sonnet-5` with `thinking: {type: 'disabled'}`, strict system prompt: hardcoded character context (Lucien Vale first-person narrator, Arthas paladin, Cedric monk), Suno bracket-tag format rules, chronological-order/no-invention/unresolved-outro content rules. User message carries the timestamped entry list, dominant moods, title, and style prompt.
6. **Returns** `{ stylePrompt, lyrics }`.

**Bug fixed:** Sonnet 5 runs adaptive thinking by default when `thinking` is omitted (unlike Sonnet 4.6, which defaulted to thinking-off) — a `thinking` block landed ahead of the `text` block in `message.content`, and reading `content[0]` unconditionally returned empty lyrics while the locally-built `stylePrompt` still succeeded. Fixed by finding the block by `.type === 'text'` and explicitly disabling thinking for this bounded lyric-writing task.

**UI** — `PlayApp.tsx` Past Sessions:
- Each expanded session card gets a `🎵 Generate Song` ghost button (`btn-ghost`); label switches to `🎵 View Song` once a song has been generated for that session.
- Songs are cached client-side per `session.id` (`songResultsBySession` state) — re-clicking the button reopens the cached result instead of re-calling Claude. Cache is in-memory only, not persisted to Supabase, so it resets on page reload.
- Loading modal: "Composing your recap…" (10–15s).
- Result modal (max-width 680px, scrollable, `var(--surface)`, 12px radius): title, a monospace `var(--bg2)` style-prompt block, and lyrics at 15px with `[section]` header lines rendered in `var(--accent)` and line breaks preserved exactly. Both sections have a `Copy ↗` button (style → Suno Style field, lyrics → Suno Lyrics field). Footer has `Regenerate` (force-refetch, overwrites cache) and `Close`. Error state offers Try again / Close.
- Entries are scoped strictly to the session being viewed (`entries.session_id = sessionId`) — never cross-session, never the `summary` blob.

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

- FEAT: Recap Song Generator — /api/claude/recap-song + Generate Song button in Past Sessions
- FIX: recap-song lyrics empty — Sonnet 5 defaults to adaptive thinking, read content[0] unconditionally
- FEAT: Cache recap songs per session — button opens existing, modal gets Regenerate

- `0d8e721` CLEANUP: Remove DM, tracker, onboarding, campaign code
- `724804e` REBUILD: Update types, lib, middleware, nav for new schema
- `c2a5e7e` REBUILD: New API routes — sessions, entries, categorise, summarise
- `4427ff4` REBUILD: First-login setup page (character name + API key)
- `866983c` REBUILD: Main app — two-tab journal (current/past sessions)
- `b0d1a17` REBUILD: Settings page
- `451506a` REBUILD: Update landing copy and auth redirects
