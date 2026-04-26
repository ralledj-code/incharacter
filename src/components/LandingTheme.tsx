'use client'

import { useEffect } from 'react'

// Sets data-theme="light" on <html> for landing page, clears on unmount
export default function LandingTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    return () => {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])
  return null
}
