import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/callback',
  '/auth/error',
  '/auth/reset-password',
  '/about',
  '/faq',
  '/privacy',
  '/contact',
  '/api/contact',
  '/api/health',
  '/og',
  '/sitemap.xml',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/auth/'))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API routes handle their own auth — skip middleware entirely
  if (pathname.startsWith('/api/')) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Unauthenticated → redirect to login for protected routes
  if (!user && !isPublic(pathname)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated + visiting /onboarding → verify they actually need it
  if (user && pathname === '/onboarding') {
    // Let them through — onboarding handles its own redirect after completion
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
