import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // role comes from emailRedirectTo URL param set at signup time
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

  // Email confirmation flow
  const user = data.session.user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (t: string) => (supabase.from(t) as any)

  const { data: profile } = await db('profiles').select('id, role').eq('id', user.id).single()

  if (!profile) {
    // New user — create profile with the role from signup
    await db('profiles').insert({
      id: user.id,
      username: user.email?.split('@')[0] ?? null,
      role,
    })
    // Route to appropriate onboarding
    return NextResponse.redirect(`${origin}/setup?role=${role}`)
  }

  // Profile already exists (created by trigger, likely with role='player').
  // If the intended role from signup was 'dm', update it now.
  // Also respects role from raw_user_meta_data if trigger was updated.
  const intendedRole = role !== 'player' ? role
    : (user.user_metadata?.role as string | undefined) ?? profile.role

  if (intendedRole !== profile.role && intendedRole !== 'player') {
    // Only upgrade (player→dm), never downgrade admin
    if (profile.role !== 'admin') {
      await db('profiles').update({ role: intendedRole }).eq('id', user.id)
    }
  }

  const finalRole = intendedRole !== 'player' && profile.role !== 'admin'
    ? intendedRole
    : profile.role

  // Route returning users based on their role
  if (finalRole === 'dm') {
    // Check if DM has a campaign already
    const { data: campaign } = await db('campaigns')
      .select('id').eq('dm_id', user.id).limit(1).single()
    if (!campaign) {
      return NextResponse.redirect(`${origin}/setup?role=dm`)
    }
    return NextResponse.redirect(`${origin}/dm/dashboard`)
  }

  // Player — send to login with confirmed=true so they can sign in
  return NextResponse.redirect(`${origin}/auth/login?confirmed=true`)
}
