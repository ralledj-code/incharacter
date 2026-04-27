# In Character — Progress

Last updated: 2026-04-28 (session 12 — restart fix, campaign join overhaul)

---

## What's working

### Auth
- Email/password sign in + sign up → immediate redirect to onboarding
- No localStorage role storage, flowType: 'implicit'

### Onboarding
- Player: 14-screen flow with 5-question interview
- DM: 2-step (create → CAMP code shown, never UUID, no email invite step)

### Character restart (fixed)
- Keeps: dossier_text, tracker_config, api_key_encrypted, campaign_id, color_scheme, name
- Clears: events, sessions, clues, relationships, session_replays
- Resets tracker_states to initial values (from tracker_config.initial_trackers or 50/30/40/60)
- Creates fresh session 1, clears play_directive (regenerated on next Now screen visit)
- Redirects to /play/now, not /onboarding
- Confirmation modal: "Reset Gameplay" — explains dossier/config kept

### Campaign join (fixed — all three paths use service role)

**Path A — CAMP code (player Settings):**
- /api/campaign/join POST uses service role → bypasses campaigns RLS
- Input normalized: .trim().toUpperCase() on both sides
- Specific errors: 'Campaign not found', 'Already a member'
- Updates characters.campaign_id

**Path B — Email (DM invite modal):**
- /api/dm/add-player POST uses service.auth.admin.listUsers()
- Case-insensitive email search
- Error if not found: 'No account found with email...'

**Path C — IC code (DM invite modal):**
- /api/dm/add-player uses service role + .limit(1) not .single()
- Error: 'No player found with code IC-...'
- 409 if 'Already in campaign'

### DM dashboard
- All queries use service role client (bypasses campaign_members RLS)
- Dual-path: characters WHERE campaign_id IN campaigns + via campaign_members
- console.log at each step → visible in Vercel logs

### Player app
- Now screen: state bars, 26px directive, directive updates every 3 moments (fade 300ms)
- Session tab: chronological event log
- Motivations tab: antagonist board + relationship tabs from tracker_config
- Log Moment: 8 categories from tracker_config, generic subcategories
- Relationship board: category tap → "What happened?" field

### Claude prompts
- No hardcoded character names or story references anywhere
- All tracker names from trackerNames param
- Fallbacks use characterName from context

---

## Known issues / untested

- Portrait upload to Supabase Storage: UI exists, not wired
- PDF export: font loading may fail in Vercel edge
- Arc view: not cached in DB, regenerated each visit
- Email confirmation via Resend: RESEND_API_KEY is placeholder

---

## SQL status (all run)
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
| HEALTHCHECK_PASSWORD | ⚠️ Not set |
