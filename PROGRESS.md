# In Character — Progress

Last updated: 2026-04-28 (session 9 — targeted fixes)

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
- No localStorage role storage (removed)
- No PKCE/finalize page (removed)
- **Supabase browser client uses flowType: 'implicit' to prevent PKCE errors on email confirmation**

### Landing page
- Warm parchment light theme, data-theme="landing"
- Gold decorative elements, 5 content sections

### Onboarding
- 14-screen flow with 5-question interview
- Campaign join: looks up by campaign_code column (CAMP-XXXX), logs errors
- Color scheme picker: 5 themes (warm/dark/slate/forest/ink) with visual previews
- Theme saved to profiles.color_scheme on character creation

### Player app — Now screen
- Single centred column on ALL viewports (no two-panel desktop)
- State bars (sorted by value, dominant in accent color)
- 26px 300-weight directive text
- Log moment + Long rest buttons
- Bars animate 0→value on load
- Tab bar sticky at top:44px, always visible

### Player app — Session
- Dynamic event categories from tracker_config (dangerous_element + antagonist)
- Clean event rows: category label + narrative + timestamp
- Empty state: "Nothing logged yet."
- Long rest button

### Player app — Log Moment
- Dynamic categories from tracker_config (buildCategories function)
- 6 standard + 2 character-specific (dangerous element, antagonist)

### Player app — Journey
- Tab bar: Sessions / Clues / Relationships
- Prep me for next session pinned to bottom

### DM app
- Dashboard: character cards, pre-session brief
- **Dual query for players: via campaign_members AND via characters.campaign_id**
- Campaign page: campaign code, invite modal (no 404), player management
- DM API key stored encrypted

### Settings
- Theme switching: writes to profiles.color_scheme, applies class immediately
- Player: player code, API key, dossier update, campaign join/leave
- DM: campaign code, DM API key

### API Routes
- /api/health — public, returns {status:'ok', timestamp}
- /api/character — authenticated, returns character + tracker state
- /api/events — authenticated, returns recent events
- /api/tracker — authenticated, returns tracker state
- /api/claude/arc, /api/export-pdf — authenticated

---

## Still broken / untested

### Email confirmation
- Supabase default email sender rate limited
- fix-trigger-role.sql has been run (trigger reads role from metadata)
- Resend SMTP not yet configured

### Healthcheck auth checks
- HEALTHCHECK_PASSWORD not set → auth/character/campaign checks skip
- Set HEALTHCHECK_PASSWORD in .env.local and Vercel to run full check

### PDF export
- Null safety added, but font loading may still fail in Vercel edge

### Arc view
- Generates on demand via /api/claude/arc
- Not yet cached in DB (regenerated each visit)

---

## SQL that has been run (confirmed by user)
All Supabase SQL migrations have been run:
- docs/fix-trigger-role.sql ✅
- docs/fix-rls-circular.sql ✅
- docs/cascade-delete-migration.sql ✅
- supabase-migrations.sql (player_code, campaign_code) ✅
- ALTER TABLE campaigns ADD COLUMN dm_api_key_encrypted ✅
- ALTER TABLE profiles ADD COLUMN color_scheme ✅
- Site URL and redirect URLs set ✅

---

## Health Checks

Run after any deploy:
```
npx ts-node --project scripts/tsconfig.json scripts/healthcheck.ts
```

**Current status (last run 2026-04-28):**
- 12/15 checks PASS
- 3 failures — all require HEALTHCHECK_PASSWORD to be set

To run full check: add `HEALTHCHECK_PASSWORD=<password>` to `.env.local`

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
| HEALTHCHECK_PASSWORD | ⚠️ Not set |

---

## Next priorities

1. Set HEALTHCHECK_PASSWORD, run full healthcheck
2. Configure Resend SMTP for email confirmation
3. Verify end-to-end: sign up → onboard → pick theme → CAMP join → DM sees player
4. Arc view — cache in DB
5. PDF export font fix
