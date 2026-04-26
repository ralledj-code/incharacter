import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'player'
  const type = searchParams.get('type') // 'recovery' for password reset

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('No confirmation code in URL')}`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error?.message || 'Could not confirm email')}`
    )
  }

  // Password reset flow — redirect to reset page with session active
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  // Email confirmation flow — check/create profile then redirect
  const user = data.session.user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as any)
  const { data: profile } = await db('profiles').select('id, role').eq('id', user.id).single()

  if (!profile) {
    await db('profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] ?? null,
      role,
    })
    return NextResponse.redirect(`${origin}/onboarding?role=${role}`)
  }

  return NextResponse.redirect(`${origin}/auth/login?confirmed=true`)
}
