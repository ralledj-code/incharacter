import { createBrowserClient } from '@supabase/ssr'

let handlerAttached = false

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: 'pkce' },
      cookieOptions: {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      },
    }
  )

  if (!handlerAttached) {
    handlerAttached = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.auth.onAuthStateChange((event: any) => {
      if (event === 'TOKEN_REFRESH_FAILED') {
        client.auth.signOut().finally(() => {
          window.location.href = '/auth/login'
        })
      }
    })
  }

  return client
}
