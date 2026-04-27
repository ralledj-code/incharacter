import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      auth: { flowType: 'implicit' } as any,
    }
  )
}
