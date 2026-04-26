import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/play/now'
  const role = searchParams.get('role') || 'player'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as AnyRecord)

  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !user) {
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
  }

  // Ensure profile exists
  const { data: profile } = await db('profiles').select('id, role').eq('id', user.id).single()

  if (!profile) {
    await db('profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] || null,
      role: role,
    })
    return NextResponse.redirect(new URL(`/onboarding?role=${role}`, request.url))
  }

  // Returning user
  const profileData = profile as { role: string | null; id: string }
  const destination = profileData.role === 'dm' ? '/dm/dashboard' : next
  return NextResponse.redirect(new URL(destination, request.url))
}
