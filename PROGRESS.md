# In Character — Progress

Last updated: 2026-04-28 (session 13)

---

## What's working

### Auth
- Email/password sign in + sign up → immediate redirect to onboarding
- No email confirmation, no localStorage role

### Onboarding
- Player: 14-screen flow with interview
- DM: 2-step (create → CAMP code shown)

### Campaign join
- **DM adds players by IC code only** (IC-XXXX-XXXX) via invite modal
- Player Settings shows current campaign + Leave button (no join UI)
- Both routes use raw supabase-js admin client — bypasses RLS entirely
- IC code lookup uses `ilike` for case-insensitive match

### DM dashboard
- **Character cards**: name, play directive (italic), DM read, dominant state only
- **dm_read**: generated alongside directive in single Claude call, stored in characters.dm_read
- **Realtime**: postgres_changes subscription on characters table, cards update live without reload
- Note: requires realtime enabled on characters table in Supabase (Database → Replication)

### Directive + DM read (FIX 3)
- generatePlayDirective() returns { directive, dmRead }
- Single Claude call, two outputs: DIRECTIVE: and DM_READ: format
- DM read: 1-2 sentences, psychological read for DM, no story invention
- Stored in characters.dm_read via admin client in directive route
- No DM API key required to see dm_read

### Character restart
- Keeps dossier_text, tracker_config, api_key_encrypted, campaign_id
- Clears events, sessions, clues, relationships
- Resets trackers to initial values, creates session 1
- Redirects to /play/now

### Player app
- Now screen: state bars, 26px directive, updates every 3 moments
- Session tab: chronological event log
- Motivations tab: antagonist board + relationship tabs from tracker_config
- Log Moment: 8 categories from tracker_config, generic subcategories

---

## SQL required

Run in Supabase SQL editor:
```sql
ALTER TABLE characters ADD COLUMN IF NOT EXISTS dm_read text;
```

Also enable realtime on characters table:
Supabase Dashboard → Database → Replication → characters → enable

---

## SQL already run
- fix-trigger-role.sql ✅
- fix-rls-circular.sql ✅
- cascade-delete-migration.sql ✅
- supabase-migrations.sql ✅
- campaigns.dm_api_key_encrypted ✅
- profiles.color_scheme ✅

---

## Environment

| Variable | Status |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| API_KEY_ENCRYPTION_SECRET | ✅ |
| RESEND_API_KEY | ⚠️ Placeholder |
