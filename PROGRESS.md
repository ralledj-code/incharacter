# In Character — Project Progress

Last updated: 2026-04-27 (session 6)

---

## What's working

### Auth
- Email/password sign in and sign up (magic link removed)
- Password reset flow via email link → /auth/reset-password
- Session persists via Supabase cookies
- Middleware protects all app routes

### Landing page
- Light theme (#f5f0e8 parchment) — CSS noise grain, gold decorative line
- 5 content sections with warm card shadows
- LandingTheme component sets data-theme="light" on html element

### Onboarding (major update this session)
- **New 14-screen flow** with 5-question interview between upload and analysis
  - Q1: Core motivation (text)
  - Q2: Antagonist (yes/no + name + relationship)
  - Q3: Primary ally (name + role, or "no one yet")
  - Q4: Dangerous element (yes/no + name)
  - Q5: Stress responses (pick up to 2 of 6)
- Claude analyzes BOTH dossier AND interview answers in one call
- Generates character-specific category names (dangerous element, antagonist)
- Character config stored in tracker_config with full dynamic structure
- Color scheme auto-suggested from dossier themes

### Document parsing
- **unpdf** for PDF extraction (replaces pdf-parse which failed in Vercel serverless)
- mammoth for .docx/.doc
- Plain text for .txt, .md
- All file types route through /api/extract-pdf
- 50k char limit, min 100 chars, clean error message

### Player app
- Now screen: PLAY HIM AS directive, animated arcane glyph, LOG MOMENT
- Log Moment flow: 3-tap with horizontal slide animation
- Session screen: chronological event log, Long Rest modal
- Journey screen: dynamic tab names from tracker_config
  - Clue board tab: reads tracker_config.clue_board_name
  - "What [character] believes about [subject]" uses clue_board_subject
  - Relationship tab: reads first key relationship name from tracker_config
- Settings: player code, API key, color scheme, Update Dossier, Restart Character, PDF export, Danger Zone

### Settings (new this session)
- **Restart Character** button — wipes all character data, redirects to onboarding
  - Two-step: warning modal + hold 2s to confirm
  - Keeps account and email, deletes character + all sessions/events/clues/relationships
- Update Dossier: append-only with timestamp separator

### Admin panel
- Error log with expandable stack traces
- User management with role buttons (player/dm/admin) per row
- /api/admin/grant-role POST route

### Content pages
- /about, /faq, /privacy, /contact all working with light theme
- Contact form via Resend (or console fallback)

### SEO
- sitemap.xml, robots.txt, llms.txt, OG image via /og edge route, JSON-LD

---

## What's broken or untested

### Email confirmation
- Supabase default email sender hit rate limits
- **To fix**: Configure Resend SMTP (see docs/setup-resend-smtp.md)
- Until fixed: disable email confirmations in Supabase Auth settings

### Cascade deletes
- FK constraints do NOT cascade yet
- Deleting user from Supabase Auth UI leaves orphaned rows
- **To fix**: Run docs/cascade-delete-migration.sql in Supabase SQL editor

### PDF export
- /api/export-pdf — font loading may fail in Vercel edge environment

### Portrait upload
- Onboarding has portrait step UI but upload to Storage is a stub

### Character-specific LOG MOMENT categories
- LogMomentFlow still uses hardcoded EVENT_CATEGORIES from constants.ts
- Should read dangerous_element_category and antagonist_category from tracker_config
- This is the next major feature to implement

### Journey screen relationship tabs
- Currently shows first key relationship as tab name
- Should show multiple tabs per NPC (up to 3) from tracker_config.key_relationships
- Placeholder groundwork done, full multi-tab not yet implemented

---

## Auth setup status

| Feature | Status |
|---------|--------|
| Email/password sign in | ✅ Working |
| Email/password sign up | ✅ Working |
| Email confirmation | ❌ Not arriving (rate limit) |
| Password reset | ❓ Untested |
| Resend SMTP | ❌ Not configured |
| Magic link | ❌ Removed |
| Session persistence | ✅ Working |

---

## Supabase manual steps required

1. **Run cascade-delete-migration.sql** → `docs/cascade-delete-migration.sql`
2. **Run supabase-migrations.sql** → player_code, campaign_code triggers
3. **Configure Resend SMTP** → `docs/setup-resend-smtp.md`
4. **Site URL**: `https://incharacter.cloud`
5. **Redirect URLs**: `https://incharacter.cloud/**`

---

## Known issues

- `@supabase/auth-helpers-nextjs@0.9` still installed but no longer used in callback
- PostHog and Resend keys are placeholders in Vercel — replace with real keys
- LogMomentFlow uses hardcoded categories — not reading from character's tracker_config yet

---

## Next priorities

1. Run cascade delete migration and initial schema in Supabase
2. Configure Resend SMTP so email confirmation works
3. Update LogMomentFlow to read dynamic categories from tracker_config
4. Implement multi-tab relationship board (one tab per NPC from key_relationships)
5. Wire portrait upload to Supabase Storage
6. End-to-end test: sign up → onboard → play session → long rest → journey

---

## Environment variables in Vercel

| Variable | Status |
|----------|--------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ Set |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ Set |
| SUPABASE_SERVICE_ROLE_KEY | ✅ Set |
| NEXT_PUBLIC_APP_URL | ✅ Set |
| NEXT_PUBLIC_SITE_URL | ✅ Set |
| RESEND_API_KEY | ⚠️ Placeholder |
| NEXT_PUBLIC_POSTHOG_KEY | ⚠️ Placeholder |
| NEXT_PUBLIC_POSTHOG_HOST | ✅ Set |
