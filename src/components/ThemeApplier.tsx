'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const THEME_MAP: Record<string, string> = {
  dark:   'theme-dark',
  slate:  'theme-slate',
  forest: 'theme-forest',
  ink:    'theme-ink',
  // 'warm' or undefined → no class (default :root applies)
}

export default function ThemeApplier() {
  useEffect(() => {
    async function apply() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from('profiles') as any)
          .select('color_scheme').eq('id', user.id).single()
        const scheme: string = (profile as { color_scheme?: string } | null)?.color_scheme || 'warm'
        const themeClass = THEME_MAP[scheme] || ''
        // Remove existing theme classes
        const html = document.documentElement
        Object.values(THEME_MAP).forEach(cls => html.classList.remove(cls))
        if (themeClass) html.classList.add(themeClass)
      } catch {}
    }
    apply()
  }, [])
  return null
}
