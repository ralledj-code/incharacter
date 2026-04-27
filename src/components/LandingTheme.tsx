'use client'

import { useEffect } from 'react'

export default function LandingTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'landing')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])
  return null
}
