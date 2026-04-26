import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'In Character',
  description: 'Your character, in character. A psychological companion for tabletop RPG players.',
  keywords: ['tabletop RPG', 'character tracking', 'D&D', 'roleplay', 'character sheet'],
  authors: [{ name: 'In Character' }],
  openGraph: {
    title: 'In Character',
    description: 'Your character, in character.',
    url: 'https://incharacter.cloud',
    siteName: 'In Character',
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0500',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-bg text-ink min-h-screen">
        {children}
      </body>
    </html>
  )
}
