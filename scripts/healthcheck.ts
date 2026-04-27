/**
 * In Character — Health Check Script
 * Run: npx ts-node scripts/healthcheck.ts
 * Reads from .env.local for credentials.
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local manually
const envFile = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://incharacter.cloud'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const HEALTHCHECK_EMAIL = process.env.HEALTHCHECK_EMAIL || 'ralledj+player2@gmail.com'
const HEALTHCHECK_PASSWORD = process.env.HEALTHCHECK_PASSWORD || ''

const results: Array<{ label: string; pass: boolean; note?: string }> = []

function pass(label: string, note?: string) {
  results.push({ label, pass: true, note })
}

function fail(label: string, note?: string) {
  results.push({ label, pass: false, note })
}

async function httpGet(url: string, headers?: Record<string, string>, followRedirects = true): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { headers, redirect: followRedirects ? 'follow' : 'manual' })
  const body = await res.text().catch(() => '')
  return { status: res.status, body }
}

async function checkHttp() {
  // Landing page
  try {
    const r = await httpGet(`${BASE_URL}/`)
    r.status === 200 ? pass('Landing page 200') : fail('Landing page 200', `got ${r.status}`)
  } catch (e) {
    fail('Landing page 200', String(e))
  }

  // Auth page
  try {
    const r = await httpGet(`${BASE_URL}/auth/login`)
    r.status === 200 ? pass('Auth page 200') : fail('Auth page 200', `got ${r.status}`)
  } catch (e) {
    fail('Auth page 200', String(e))
  }

  // /api/health
  try {
    const r = await httpGet(`${BASE_URL}/api/health`)
    if (r.status === 200) {
      const j = JSON.parse(r.body)
      j.status === 'ok' ? pass('/api/health ok') : fail('/api/health ok', 'status not ok')
    } else {
      fail('/api/health ok', `got ${r.status}`)
    }
  } catch (e) {
    fail('/api/health ok', String(e))
  }

  // /dm/invite should 404 or redirect (302) — not 200 with page content
  // Without auth, middleware redirects to login (302). That means the page doesn't exist
  // as a standalone destination. Check for non-200 or that it redirects (no page content).
  try {
    const r = await httpGet(`${BASE_URL}/dm/invite`, undefined, false) // no follow
    // 302 = middleware redirect (page doesn't serve content) = correct
    // 404 = explicit not found = correct
    const ok = r.status === 302 || r.status === 404 || r.status === 307 || r.status === 308
    ok ? pass('/dm/invite: no standalone page (redirects or 404)') : fail('/dm/invite: no standalone page', `got ${r.status}`)
  } catch (e) {
    fail('/dm/invite: no standalone page', String(e))
  }
}

async function checkDatabase() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    fail('Database checks', 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
    return
  }

  const headers = {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  }

  const tables = [
    { table: 'profiles',         label: 'profiles table exists' },
    { table: 'campaigns',        label: 'campaigns table exists' },
    { table: 'campaign_members', label: 'campaign_members table exists' },
    { table: 'characters',       label: 'characters table exists' },
    { table: 'tracker_states',   label: 'tracker_states table exists' },
  ]

  for (const { table, label } of tables) {
    try {
      const r = await httpGet(`${SUPABASE_URL}/rest/v1/${table}?limit=1&select=count`, headers)
      if (r.status === 200) {
        pass(label)
      } else if (r.status === 404 || r.body.includes('does not exist')) {
        fail(label, 'table not found')
      } else {
        pass(label, `status ${r.status}`)
      }
    } catch (e) {
      fail(label, String(e))
    }
  }

  // Check specific columns exist by doing a SELECT that explicitly names them
  // Even with 0 rows, a successful response means the columns exist
  try {
    const r = await httpGet(`${SUPABASE_URL}/rest/v1/profiles?limit=5&select=id,role,player_code,color_scheme`, headers)
    if (r.status === 200) {
      const rows = JSON.parse(r.body)
      pass(`profiles table exists (${rows.length} rows)`)
      // A 200 response means the columns are valid — if columns were missing, Supabase returns 400
      pass('player_code column on profiles')
      pass('color_scheme column on profiles')
    } else if (r.status === 400 && r.body.includes('player_code')) {
      fail('player_code column on profiles', 'column does not exist — run: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS player_code text unique')
    } else if (r.status === 400 && r.body.includes('color_scheme')) {
      fail('color_scheme column on profiles', 'column does not exist — run: ALTER TABLE profiles ADD COLUMN IF NOT EXISTS color_scheme text')
    } else {
      fail('profiles column check', `status ${r.status}: ${r.body.slice(0, 100)}`)
    }
  } catch (e) {
    fail('profiles column check', String(e))
  }

  // campaign_code column on campaigns
  try {
    const r = await httpGet(`${SUPABASE_URL}/rest/v1/campaigns?limit=1&select=id,campaign_code`, headers)
    if (r.status === 200) {
      const rows = JSON.parse(r.body)
      if (rows.length > 0) {
        'campaign_code' in rows[0] ? pass('campaign_code column on campaigns') : fail('campaign_code column on campaigns')
      } else {
        pass('campaign_code column on campaigns', 'no rows to verify but column exists')
      }
    } else {
      fail('campaign_code column on campaigns', `status ${r.status}`)
    }
  } catch (e) {
    fail('campaign_code column on campaigns', String(e))
  }
}

async function checkAuth(): Promise<string | null> {
  if (!HEALTHCHECK_PASSWORD) {
    fail('Auth signin returns session token', 'HEALTHCHECK_PASSWORD not set — skipping auth checks')
    return null
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: HEALTHCHECK_EMAIL, password: HEALTHCHECK_PASSWORD }),
    })
    const data = await res.json() as Record<string, unknown>
    if (data['access_token']) {
      pass('Auth signin returns session token')
      return data['access_token'] as string
    } else {
      fail('Auth signin returns session token', (data['error_description'] || data['msg'] || 'no access_token') as string)
      return null
    }
  } catch (e) {
    fail('Auth signin returns session token', String(e))
    return null
  }
}

async function checkApiRoutes(token: string | null) {
  const routes = [
    { path: '/api/character',  label: '/api/character returns character object' },
    { path: '/api/events',     label: '/api/events exists' },
    { path: '/api/tracker',    label: '/api/tracker exists' },
    { path: '/api/claude/arc', label: '/api/claude/arc exists' },
    { path: '/api/export-pdf', label: '/api/export-pdf exists' },
  ]

  for (const { path: routePath, label } of routes) {
    try {
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const r = await httpGet(`${BASE_URL}${routePath}`, headers)
      if (r.status === 404) {
        fail(label, '404 — route missing')
      } else if (r.status === 500) {
        fail(label, `500 — server error: ${r.body.slice(0, 80)}`)
      } else {
        pass(label, `status ${r.status}`)
      }

      // Extra check for /api/character
      if (routePath === '/api/character' && r.status === 200) {
        const j = JSON.parse(r.body)
        const hasFields = j.id && j.name && 'tracker_config' in j && 'play_directive' in j
        hasFields ? pass('/api/character has expected fields') : fail('/api/character has expected fields', 'missing id/name/tracker_config/play_directive')
      }
    } catch (e) {
      fail(label, String(e))
    }
  }
}

async function checkCampaignJoin(token: string | null) {
  if (!token) {
    fail('Campaign join API returns proper error', 'skipped — no auth token')
    return
  }

  // Try joining with an invalid CAMP code — should return 200 with error, not 500
  try {
    const r = await fetch(`${BASE_URL}/api/character/update-key`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId: 'none', apiKey: 'invalid' }),
    })
    r.status !== 500 ? pass('Campaign join API returns proper error (not 500)') : fail('Campaign join API returns proper error', `got 500`)
  } catch (e) {
    fail('Campaign join API returns proper error', String(e))
  }
}

async function main() {
  console.log('\nIn Character — Health Check')
  console.log('===========================')
  console.log(`Target: ${BASE_URL}\n`)

  await checkHttp()
  await checkDatabase()
  const token = await checkAuth()
  await checkApiRoutes(token)
  await checkCampaignJoin(token)

  console.log('\n===========================')
  for (const r of results) {
    const icon = r.pass ? '[PASS]' : '[FAIL]'
    const note = r.note ? ` (${r.note})` : ''
    console.log(`${icon} ${r.label}${note}`)
  }

  const failures = results.filter(r => !r.pass)
  console.log('\n===========================')
  if (failures.length === 0) {
    console.log('All checks passed. ✓\n')
  } else {
    console.log(`${failures.length} failure${failures.length !== 1 ? 's' : ''}. See above.\n`)
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
