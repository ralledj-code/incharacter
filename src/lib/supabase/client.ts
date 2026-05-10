import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton — every createClient() call must return the same instance so that
// onAuthStateChange is registered exactly once and 429 state is shared.
let clientInstance: SupabaseClient | null = null

// Shared 429 backoff state across all requests on this client.
let blockedUntil = 0

function rateLimitedFetch(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const now = Date.now()
  if (now < blockedUntil) {
    const waitMs = blockedUntil - now
    console.error(`[Supabase] Rate-limited — waiting ${Math.ceil(waitMs / 1000)}s before retry`)
    return new Promise(resolve => setTimeout(resolve, waitMs))
      .then(() => fetch(url, options))
      .then(r => { if (r.status === 429) blockedUntil = Date.now() + 60_000; return r })
  }
  return fetch(url, options).then(r => {
    if (r.status === 429) {
      console.error('[Supabase] 429 received — blocking all auth requests for 60s')
      blockedUntil = Date.now() + 60_000
    }
    return r
  })
}

export function createClient() {
  if (clientInstance) return clientInstance

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: 'pkce' },
      cookieOptions: {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      },
      global: { fetch: rateLimitedFetch },
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client.auth.onAuthStateChange((event: any) => {
    console.error('[Supabase] onAuthStateChange:', event)
    if (event === 'TOKEN_REFRESH_FAILED') {
      client.auth.signOut().finally(() => {
        window.location.href = '/auth/login'
      })
    }
  })

  clientInstance = client
  return client
}
