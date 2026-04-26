'use client'

// Client-side finalize page — reads localStorage role set during signup,
// upserts it to the profile (belt-and-suspenders after the callback route),
// then redirects to dashboard.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ROLE_KEY = 'ic_signup_role'

export default function FinalizePage() {
  const router = useRouter()

  useEffect(() => {
    async function finalize() {
      try {
        const savedRole = localStorage.getItem(ROLE_KEY)
        if (savedRole && savedRole !== 'player') {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await (supabase.from('profiles') as any)
              .select('role').eq('id', user.id).single()
            // Only upgrade; never downgrade admin
            if (!profile || profile.role !== 'admin') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (supabase.from('profiles') as any).upsert(
                { id: user.id, role: savedRole },
                { onConflict: 'id' }
              )
            }
          }
        }
      } catch {
        // Non-fatal — dashboard routing handles the fallback
      } finally {
        localStorage.removeItem(ROLE_KEY)
        router.replace('/dashboard')
      }
    }
    finalize()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <p className="font-garamond animate-pulse" style={{ color: 'var(--text-dim)' }}>
        The dagger considers...
      </p>
    </main>
  )
}
