'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendMagicLink(email: string, redirectTo: string): Promise<{ error: string | null }> {
  try {
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
