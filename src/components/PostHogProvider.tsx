'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
    if (key && typeof window !== 'undefined') {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,
        capture_pageleave: false,
        persistence: 'localStorage',
        autocapture: false,
        disable_session_recording: true,
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
