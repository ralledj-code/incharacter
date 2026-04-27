# In Character — Progress

Last updated: 2026-04-28 (session 8 — full redesign)

---

## Design System

### CSS Variables (globals.css)
- **5 themes**: Warm (default light), Dark, Slate, Forest, Ink
- All colors through CSS variables — zero hardcoded hex in player app
- Variable names: --bg, --bg2, --surface, --surface2, --border, --border2,
  --accent, --accent-dim, --accent-faint, --accent-text, --text, --text2,
  --text3, --danger, --danger-faint
- ThemeApplier component reads profiles.color_scheme and applies theme class on every page
- Landing page uses data-theme="landing" with its own warm parchment values

### Typography
- System font stack: -apple-system, BlinkMacSystemFont, SF Pro, Segoe UI
- No Cinzel/EB Garamond in player app (landing page keeps them)
- Sizes: 26px directive (300-weight), 15px body, 11px labels, 13px secondary

### Component classes
- .btn-primary, .btn-secondary, .btn-ghost, .btn-danger
- .card, .page-header, .tab-bar, .tab-item, .label-caps, .directive-text
- .loading-shimmer, .animate-fade-in

---

## What's working

### Auth
- Email/password sign in + sign up
- Role from URL param stored via signUp data.role (read by trigger)
- DM role upserted in profiles on signIn
- Auth callback upserts role from URL param on email confirmation
- No localStorage role storage (removed — was causing role bleeding)
- No PKCE/finalize page (removed)

### Landing page
- Warm parchment light theme, data-theme="landing"
- Gold decorative elements, 5 content sections

### Onboarding
- 14-screen flow with 5-question interview
- Campaign join: looks up by campaign_code column (CAMP-XXXX), logs errors
- Color scheme now maps to: warm/dark/slate/forest/ink themes

### Player app — Now screen
- State bars (sorted by value, dominant in accent color)
- 26px 300-weight directive text
- Log moment + Long rest buttons
- Bars animate 0→value on load

### Player app — Desktop
- Two-panel layout: left 340px (directive + state bars + dominant state + LOG MOMENT)
- Right panel: session events, The Arc, last rest, clues, relationships, prep+rest buttons
- State bars same pattern as Now screen

### Player app — Session
- Clean event rows: category label + narrative + timestamp
- Empty state: "Nothing logged yet."
- Long rest button

### Player app — Journey
- Tab bar: Sessions / Clues / Relationships
- Prep me for next session pinned to bottom

### DM app
- Dashboard: character cards, pre-session brief
- Campaign page: campaign code, invite by email, player list
- DM API key stored encrypted

### Settings
- Theme switching: writes to profiles.color_scheme, applies class immediately
- Player: player code, API key, dossier update, danger zone
- DM: campaign code, DM API key

---

## Still broken / untested

### Email confirmation
- Supabase rate limit — disable email confirmation in Supabase dashboard for now
- Run docs/fix-trigger-role.sql to make trigger read role from metadata

### Cascade deletes + RLS
- Run docs/fix-rls-circular.sql (campaign↔campaign_members RLS recursion)
- Run docs/cascade-delete-migration.sql
- Run supabase-migrations.sql (player_code, campaign_code triggers)
- ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS dm_api_key_encrypted text;
- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color_scheme text;

### Campaign join
- Code logic is correct (looks up by campaign_code column)
- May still be blocked by RLS if fix-rls-circular.sql hasn't been run
- Errors now logged to console for debugging

### PDF export
- Null safety added, but font loading may still fail in Vercel edge

### DM invite
- Sends Resend email, but RESEND_API_KEY is placeholder

### Arc view
- Generates on demand via /api/claude/arc
- Not yet cached in DB (regenerated each visit)

---

## Supabase SQL steps (run in order)

1. `docs/fix-trigger-role.sql`
2. `docs/fix-rls-circular.sql`
3. `docs/cascade-delete-migration.sql`
4. `supabase-migrations.sql`
5. `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS dm_api_key_encrypted text;`
6. `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color_scheme text;`
7. Site URL → https://incharacter.cloud, Redirect URLs → https://incharacter.cloud/**

---

## Environment

| Variable | Status |
|----------|--------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | ✅ |
| NEXT_PUBLIC_APP_URL | ✅ |
| NEXT_PUBLIC_SITE_URL | ✅ |
| API_KEY_ENCRYPTION_SECRET | ✅ |
| RESEND_API_KEY | ⚠️ Placeholder |
| NEXT_PUBLIC_POSTHOG_KEY | ⚠️ Placeholder |

---

## Next priorities

1. Run all Supabase SQL migrations
2. Test campaign join end-to-end with CAMP-84RX-LHVR
3. Configure Resend SMTP
4. Arc view — cache generated text in DB (tracker_states.arc_text column)
5. DM dashboard party tension analysis
6. PDF export font fix
