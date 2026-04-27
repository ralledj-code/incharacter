# In Character — Progress

Last updated: 2026-04-28 (session 10 — targeted fixes)

---

## What's working

### Auth
- Email/password sign in + sign up
- **No email confirmation screen** — signup redirects immediately to onboarding (email confirmation disabled in Supabase)
- Role from signUp data.role (read by trigger)
- DM role upserted on signIn
- No localStorage role storage
- Supabase browser client uses flowType: 'implicit'

### Onboarding — DM
- **2-step flow**: Create campaign → Done (show CAMP code)
- **No email invite step** (removed entirely)
- Shows CAMP-XXXX-XXXX code, never UUID
- Tap to copy

### Onboarding — Player
- 14-screen flow with 5-question interview
- Campaign join looks up by campaign_code, uses maybeSingle()
- Color scheme picker: 5 themes with visual previews
- Theme saved to profiles.color_scheme

### Player app — Now screen
- Single centred column on ALL viewports (max 520px)
- State bars sorted by value, dominant in accent color
- 26px 300-weight directive
- Tab bar sticky at top: 44px

### Player app — Log Moment
- 8 categories: 6 universal + dangerous element + antagonist from tracker_config
- **All subcategories generic** — no Lucien/Severin/dagger hardcoding
- Dynamic subcategories use tracker_config.clue_board_subject for antagonist

### Player app — Session
- Dynamic category labels from tracker_config
- Clean event rows

### Player app — Relationship board
- **Flow: category tap first, then "What happened?" text field**
- Skips NPC name when only one NPC exists
- Field labeled "What happened?" with generic placeholder

### DM app
- Dashboard: character cards, pre-session brief
- Invite modal: IC code or email, maybeSingle() lookup, detailed errors
- **No /dm/invite page** (correctly 404s)

### Settings
- Campaign join: maybeSingle() lookup, console logging, clear error messages
- Campaign leave
- Theme switching

### API
- /api/health — public
- /api/character, /api/events, /api/tracker — authenticated

---

## Still broken / may need attention

### Campaign join
- RLS on campaign_members may still block players reading their own rows
- maybeSingle() now in use — should surface DB errors clearly in console
- If still failing: check browser console for [campaign-join] logs

### DM invite
- IC code lookup: check console for [dm-invite] logs if failing
- player_code column must exist on profiles (confirmed via healthcheck)

### PDF export
- Font loading may fail in Vercel edge

### Arc view
- Not cached in DB — regenerated each visit

---

## SQL status (all run)
- fix-trigger-role.sql ✅
- fix-rls-circular.sql ✅
- cascade-delete-migration.sql ✅
- supabase-migrations.sql (player_code, campaign_code) ✅
- campaigns.dm_api_key_encrypted ✅
- profiles.color_scheme ✅

---

## Health checks

```
npx ts-node --project scripts/tsconfig.json scripts/healthcheck.ts
```

Last run: 12/15 pass (3 require HEALTHCHECK_PASSWORD).
Set `HEALTHCHECK_PASSWORD` in .env.local to run auth checks.

---

## Environment

| Variable | Status |
|----------|--------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| API_KEY_ENCRYPTION_SECRET | ✅ |
| RESEND_API_KEY | ⚠️ Placeholder |
| HEALTHCHECK_PASSWORD | ⚠️ Not set |
