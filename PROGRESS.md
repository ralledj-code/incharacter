# In Character — Progress

Last updated: 2026-04-28 (session 11 — hardcoding audit + motivations tab + directive updates)

---

## Hardcoding Audit Results

### What was found and fixed

| Location | Hardcoded reference | Fixed to |
|---|---|---|
| src/lib/api.ts:23-26 | "The Mask (infernal pressure...)" in Claude prompts | Dynamic trackerNames param |
| src/lib/api.ts:87,90 | "Play him like the performance..." | `Play ${characterName} true to their state` |
| src/lib/api.ts:124,127 | "He moved through it the way he always did..." | `${characterName} moved through it...` |
| src/lib/api.ts:399 | colorSchemeSuggestion: "grimoire\|sanctum..." | "warm\|dark\|slate\|forest\|ink" |
| src/lib/api.ts:419-420 | "Severin Board", "Severin Draik" (examples) | Generic placeholder text |
| src/lib/constants.ts | "The bottle is speaking", "He is here" in GLYPH_STATES | Generic state descriptions |
| src/components/LongRestModal.tsx | "The night was long and the bottle was honest" | Generic fallback |
| src/components/onboarding/OnboardingPlayer.tsx | "The infernal pact, the drinking, wild magic..." placeholder | Generic placeholder |
| src/app/about/page.tsx | "half-elf Wild Magic Sorcerer" (intentional app story origin, left) | — |

### Rules enforced in all Claude prompts
- No character names, place names, or story references as hardcoded strings
- All tracker names come from `trackerNames` param (from `tracker_config`)
- Fallbacks use character name from context, not Lucien-specific text
- `generatePlayDirective`: passes `trackerNames`, `dominantState`, `previousDirective` for evolution
- All prompts have explicit RULES comment: never invent plot, only use dossier + state

---

## What's working

### Auth
- Email/password sign in + sign up → immediate redirect to onboarding (no email confirmation screen)
- No localStorage role storage
- Supabase browser client: flowType: 'implicit'

### Onboarding
- Player: 14-screen flow with 5-question interview
- DM: 2-step (create → CAMP code shown, never UUID)
- No email invite step anywhere

### Player app
- **Now screen**: state bars, 26px directive, tab bar sticky, single column all viewports
- **Directive updates after moments**: every 3 moments triggers subtle evolution via Claude
- **Session tab**: chronological event log, Long Rest button
- **Motivations tab** (was Journey): antagonist board + relationship tabs from tracker_config
  - Sessions tab removed from Motivations (sessions are in Session tab)
  - Tab names from tracker_config.clue_board_name and key_relationships
- **Log Moment**: 8 categories, all names from tracker_config, generic subcategories
- **Relationship board**: "What happened?" field, category tap first

### Campaign flow
- Player Settings: join by CAMP code (maybeSingle, detailed logs), leave campaign
- DM invite modal: IC code and email lookup (maybeSingle, uppercase trim, detailed logs)
- DM dashboard: dual query via campaign_members + characters.campaign_id

### API routes
- /api/health — public
- /api/character, /api/events, /api/tracker — authenticated

---

## Still needs testing

- Campaign join end-to-end (player → DM dashboard sees card)
- DM invite with IC code
- Directive evolution after 3 logged moments
- All board names showing from tracker_config (not hardcoded)

---

## SQL status (all run)
- fix-trigger-role.sql ✅
- fix-rls-circular.sql ✅
- cascade-delete-migration.sql ✅
- supabase-migrations.sql ✅
- campaigns.dm_api_key_encrypted ✅
- profiles.color_scheme ✅

---

## Health check

```
npx ts-node --project scripts/tsconfig.json scripts/healthcheck.ts
```

Set `HEALTHCHECK_PASSWORD` in .env.local to run auth + API checks.

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
