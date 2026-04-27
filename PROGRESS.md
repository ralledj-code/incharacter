# In Character — Project Progress

Last updated: 2026-04-27 (session 7)

---

## What's working

### Auth
- Email/password sign in and sign up
- Password reset flow → /auth/reset-password
- Session persists via Supabase cookies
- DM role saved on signIn (handleSignIn upserts role='dm')
- Auth callback upserts role from URL param on email confirmation

### Landing page
- Light theme (#f5f0e8 parchment) — CSS noise grain, gold decorative line
- 5 content sections with warm card shadows

### Onboarding
- 14-screen flow with 5-question interview (motivation, antagonist, ally, danger, stress)
- Claude analyzes dossier + interview in one call
- Character-specific categories (dangerous element, antagonist) from tracker_config
- Color scheme auto-suggested; 6 presets

### CSS Variables system
- All 6 schemes fully defined: --accent, --accent-dim, --glyph-fill, --glyph-stroke, --text-primary, --text-secondary, --surface-raised
- Landing page isolated under [data-theme="light"]
- Player app uses only CSS variables — no hardcoded hex

### Player app — Desktop (new)
- Two-panel layout at ≥768px:
  - Left panel (340px): character name, PLAY AS directive (20px), glyph (290px), dominant state card, LOG MOMENT pinned to bottom
  - Right panel: This Session events, The Arc (Claude paragraph), Last Rest waking text, Clue board (3 clues), Relationships, Long Rest + Prep Me buttons
- Mobile: unchanged bottom-nav tabs, max-width 480px
- The Arc: Claude-generated 2-3 sentence psychological trajectory per session block

### ArcaneGlyph (rebuilt)
- Uses CSS variables: var(--glyph-fill), var(--glyph-stroke)
- Dramatic fill: 0.82 opacity dark crimson/scheme-appropriate fill
- Zero-clamp: values < 0.05 render as zero, no floating dots
- Expanded viewBox with padding — labels never clip
- State labels: Cinzel 10px + EB Garamond 8px desc, non-italic
- mini prop for thumbnail rendering

### Document parsing
- unpdf for PDF, mammoth for docx, plain text for txt/md
- 50k char limit, min 100 chars

### DM app
- Dashboard: party overview with character cards, pre-session brief
- Campaign page (/dm/campaign): campaign code display, email invites, player management
- DM invite sends Resend email with signup link (no magic link)
- DM API key stored encrypted on campaigns.dm_api_key_encrypted

### Settings
- Player: player code, API key, color scheme, dossier append, restart character
- DM: campaign code (not player code), campaign name, DM API key

---

## What's broken or untested

### Email confirmation
- Supabase default email sender rate limited
- To fix: Run docs/fix-trigger-role.sql, configure Resend SMTP

### Cascade deletes
- Not yet applied. Run docs/cascade-delete-migration.sql in Supabase SQL editor
- Also run: docs/fix-rls-circular.sql to fix campaign/campaign_members recursion

### Schema migrations
- Run supabase-migrations.sql for player_code, campaign_code columns + triggers
- Run: ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS dm_api_key_encrypted text;

### Portrait upload
- UI exists but upload to Supabase Storage not wired

### PDF export font
- Google Fonts URL may fail in Vercel serverless — falls back to system font

### Arc view (new)
- Generates on demand via /api/claude/arc
- Requires API key; gracefully falls back if none

### DM tension analysis
- Party tension "read" not yet implemented in DM dashboard

---

## Auth setup status

| Feature | Status |
|---------|--------|
| Email/password sign in | ✅ Working |
| Email/password sign up | ✅ Working |
| Email confirmation | ❌ Rate limit (disable in Supabase for now) |
| DM role assignment on signIn | ✅ Working |
| DM role from trigger | ❌ Needs docs/fix-trigger-role.sql |
| Resend SMTP | ❌ Placeholder key |
| Session persistence | ✅ Working |

---

## Supabase manual steps (in order)

1. `docs/fix-trigger-role.sql` — trigger reads role from user metadata
2. `docs/fix-rls-circular.sql` — breaks campaign↔campaign_members recursion
3. `docs/cascade-delete-migration.sql` — FK cascades
4. `supabase-migrations.sql` — player_code, campaign_code triggers
5. `ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS dm_api_key_encrypted text;`
6. Site URL → `https://incharacter.cloud`, Redirect URLs → `https://incharacter.cloud/**`

---

## Environment variables in Vercel

| Variable | Status |
|----------|--------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ Set |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Set |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Set |
| NEXT_PUBLIC_APP_URL | ✅ Set |
| NEXT_PUBLIC_SITE_URL | ✅ Set |
| API_KEY_ENCRYPTION_SECRET | ✅ Set |
| RESEND_API_KEY | ⚠️ Placeholder |
| NEXT_PUBLIC_POSTHOG_KEY | ⚠️ Placeholder |
| NEXT_PUBLIC_POSTHOG_HOST | ✅ Set |

---

## Next priorities

1. Run all Supabase SQL migrations (see above)
2. Configure Resend SMTP for email confirmation
3. Test end-to-end: sign up → onboard → play session → long rest → journey → desktop layout
4. DM dashboard party tension analysis
5. Portrait upload to Supabase Storage
6. Arc view caching (store generated arc text in DB, not regenerate each visit)
7. Multi-tab relationship board per NPC from key_relationships
