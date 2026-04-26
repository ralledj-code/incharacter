'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(
  email: string,
  next: string,
  role: string
): Promise<{ error: string | null }> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://incharacter.cloud'
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}&role=${encodeURIComponent(role)}`

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    })
    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to send magic link' }
  }
}
