# In Character — Project Progress

Last updated: 2026-04-27

---

## What's working

### Auth
- Email/password sign in and sign up (replaced magic link)
- Password reset flow via email link → /auth/reset-password
- Auth callback handles email confirmation and password recovery
- Session persists across page reloads via Supabase cookies
- Middleware protects all app routes; public paths include landing, auth, content pages

### Landing page
- Light theme (#f5f0e8 parchment) separate from dark app world
- 5 content sections: Problem, How It Works, Six States, For DMs, Pricing
- Static glyph watermark, gold decorative line, CSS noise grain
- LandingTheme component sets/clears data-theme="light" on html element

### Player app
- Now screen: PLAY HIM AS directive, animated arcane glyph, LOG MOMENT button
- Log Moment flow: 3-tap (category → subcategory → reaction), horizontal slide animation
- Session screen: chronological event log, Long Rest modal
- Journey screen: Timeline, Clues board, Relationships board
- Settings page: player code display, API key update, color scheme, dossier append, PDF export, danger zone

### DM dashboard
- Campaign view with character cards
- Pre-session brief generation
- DM-only session notes (never visible to players)
- Privacy boundary: DM routes exclude api_key_encrypted, dossier_text, narrative text

### Admin panel
- Error log with expandable stack traces
- User management with role grant controls (player / dm / admin buttons per user)
- Admin users default to player view (/play/now) not /admin on login
- Admin Panel link in burger menu regardless of which view admin is in

### Content pages
- /about, /faq, /privacy, /contact (all with light theme)
- Contact form routes to /api/contact (Resend if key set, logs to console otherwise)
- /privacy notes actual region: US East (AWS us-east-1)

### SEO / discoverability
- sitemap.xml via /app/sitemap.ts
- robots.txt allowing all crawlers including AI bots
- llms.txt for AI-friendly description
- JSON-LD schema on landing page
- OG image via /og edge route

### Analytics
- @vercel/analytics and @vercel/speed-insights in root layout
- PostHog via PostHogProvider (no autocapture, no session recording)
- analytics.ts event library with typed events

### PDF / document parsing
- pdf-parse for PDF files
- mammoth for .docx/.doc files
- Plain text for .txt/.md
- Cleans whitespace, removes non-printables, caps at 50k chars
- Error if <100 chars extracted

---

## What's broken or untested

### Email confirmation
- **Currently non-functional** — Supabase default email sender hit rate limits
- Sign up creates the account but confirmation email may not arrive
- **To fix**: Configure Resend SMTP (see docs/setup-resend-smtp.md)
- Until fixed: disable "Enable email confirmations" in Supabase Auth settings to allow sign in without confirmation

### PDF export
- /api/export-pdf uses @react-pdf/renderer with a Google Fonts URL for Garamond
- Font loading may fail in Vercel edge/serverless environment
- Fallback: export still generates but with system font

### Portrait upload
- Onboarding step 7 shows upload UI but file → Supabase Storage not wired up
- portraitUrl state exists but upload to storage is a stub

### Onboarding campaign join
- Campaign join (step 8) looks up campaign by CAMP-XXXX-XXXX code
- Requires supabase-migrations.sql to have been run (campaign_code column + trigger)

### Player code display
- Settings shows player code from profile
- Requires supabase-migrations.sql to have been run (player_code column + trigger)

### Cascade deletes
- Foreign key constraints do NOT currently cascade
- Deleting a user from Supabase Auth UI will fail or leave orphaned rows
- **To fix**: Run docs/cascade-delete-migration.sql in Supabase SQL editor

---

## Auth setup status

| Feature | Status |
|---------|--------|
| Email/password sign in | ✅ Working |
| Email/password sign up | ✅ Working (account created) |
| Email confirmation | ❌ Emails not arriving (rate limit) |
| Password reset email | ❓ Untested (same sender issue) |
| Resend SMTP configured | ❌ Not yet (see docs/setup-resend-smtp.md) |
| Magic link | ❌ Removed |
| Session persistence | ✅ Working |

---

## Supabase dashboard manual steps needed

1. **Run cascade-delete-migration.sql** — `docs/cascade-delete-migration.sql`
2. **Run initial schema** — `supabase-migrations.sql` (player_code, campaign_code, dm_session_notes, deletion_log)
3. **Configure Resend SMTP** — `docs/setup-resend-smtp.md`
4. **Site URL**: `https://incharacter.cloud`
5. **Redirect URLs**: `https://incharacter.cloud/**`

---

## Known issues

- Supabase project appears to use new-format keys (`sb_publishable_`) which may require specific client versions
- The `@supabase/auth-helpers-nextjs@0.9` package is installed alongside `@supabase/ssr` — callback route now uses ssr only
- PostHog key is a placeholder — replace `NEXT_PUBLIC_POSTHOG_KEY` in Vercel with real key
- Resend API key is a placeholder — replace `RESEND_API_KEY` in Vercel with real key

---

## Next priorities

1. Configure Resend SMTP so email confirmation works
2. Run cascade delete migration so Supabase Auth UI delete works cleanly
3. Test full sign up → confirm email → sign in → onboarding → play flow end to end
4. Wire up portrait upload to Supabase Storage
5. Test PDF export in production
6. Add character creation flow from DM side (DM assigns character to player)

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
