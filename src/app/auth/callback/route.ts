import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/play/now'
  const role = searchParams.get('role') || 'player'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  // No code — redirect to login
  if (!code) {
    return NextResponse.redirect(`${siteUrl}/auth/login`)
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Route handler cannot always set cookies — session will be set by
            // the next server request that reads it.
          }
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    const msg = encodeURIComponent(error?.message || 'Session exchange failed')
    return NextResponse.redirect(`${siteUrl}/auth/error?message=${msg}`)
  }

  const user = data.user

  // Ensure profile row exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as any)
  const { data: profile } = await db('profiles').select('id, role').eq('id', user.id).single()

  if (!profile) {
    await db('profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] ?? null,
      role,
    })
    return NextResponse.redirect(`${siteUrl}/onboarding?role=${role}`)
  }

  const destination = (profile as { role: string | null }).role === 'dm'
    ? '/dm/dashboard'
    : next

  return NextResponse.redirect(`${siteUrl}${destination}`)
}
