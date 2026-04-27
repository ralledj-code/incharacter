import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import PostHogProvider from '@/components/PostHogProvider'
import ThemeApplier from '@/components/ThemeApplier'

export const metadata: Metadata = {
  title: 'In Character — Your character, in character.',
  description: 'A psychological companion for tabletop RPG players. Upload your character dossier, log what happens at the table, and get told exactly how to play them in the moment. Works for D&D, Pathfinder, and any tabletop RPG.',
  keywords: ['DnD', 'D&D', 'tabletop RPG', 'roleplay', 'character companion', 'stay in character', 'Dungeons and Dragons', 'Pathfinder', 'RPG tool', 'character tracker'],
  authors: [{ name: 'Rasmus' }],
  openGraph: {
    title: 'In Character',
    description: 'Your character, in character. The psychological companion for tabletop roleplayers.',
    url: 'https://incharacter.cloud',
    siteName: 'In Character',
    type: 'website',
    images: [{ url: 'https://incharacter.cloud/og', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', title: 'In Character', description: 'Your character, in character.', images: ['https://incharacter.cloud/og'] },
  alternates: { canonical: 'https://incharacter.cloud' },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
  themeColor: '#faf9f7',
}

const jsonLd = {
  '@context': 'https://schema.org', '@type': 'WebApplication',
  name: 'In Character', url: 'https://incharacter.cloud',
  description: 'A psychological companion for tabletop RPG players',
  applicationCategory: 'GameApplication', operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Rasmus' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen">
        <ThemeApplier />
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
