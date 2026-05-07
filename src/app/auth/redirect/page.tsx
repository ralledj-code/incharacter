'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RedirectHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const to = searchParams.get('to') || '/dashboard'

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.href = to
      } else {
        router.replace('/auth/login')
      }
    })
  }, [to, router])

  return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
}

export default function AuthRedirectPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
      <RedirectHandler />
    </Suspense>
  )
}
