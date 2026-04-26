import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore as any })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`
      )
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?message=${encodeURIComponent('Could not retrieve user after session exchange')}`
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from('profiles') as any)
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      // New user — create profile, route to onboarding
      const role = requestUrl.searchParams.get('role') || 'player'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any).insert({
        id: user.id,
        username: user.email?.split('@')[0] ?? null,
        role,
      })
      return NextResponse.redirect(`${requestUrl.origin}/onboarding?role=${role}`)
    }

    // Returning user — route to dashboard (which redirects by role)
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/auth/error?message=${encodeURIComponent('No code parameter in callback URL')}`
  )
}
