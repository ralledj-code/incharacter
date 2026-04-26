import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'
import LandingTheme from '@/components/LandingTheme'

export default function PrivacyPage() {
  return (
    <>
      <LandingTheme />
      <div className="min-h-screen" style={{ background: '#faf9f7', color: '#1a1a1a' }}>
        <BurgerMenu loggedIn={false} theme="light" />
        <main className="max-w-2xl mx-auto px-6 py-24 pt-20">
          <Link href="/" className="font-cinzel text-sm tracking-widest mb-10 block"
                style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}>← In Character</Link>
          <h1 className="font-cinzel text-4xl mb-12" style={{ color: '#1a1a1a' }}>Privacy Policy</h1>

          {/* Supabase project is on AWS us-east-1 (US East), not EU. Update if migrated. */}
          <div className="space-y-8 font-garamond text-lg leading-relaxed" style={{ color: '#4a4a4a' }}>
            {[
              { title: 'What we collect', body: 'Email address, character data you provide, events you log during sessions.' },
              { title: "What we don't collect", body: 'Real names, payment information, location data.' },
              { title: 'Who can see it', body: "You, and DMs of campaigns you've joined. We don't sell or share data with anyone." },
              { title: "Where it's stored", body: 'Supabase, US East region (AWS us-east-1), encrypted at rest. Your Anthropic API key is stored encrypted.' },
              { title: 'How to delete it', body: 'Settings → Danger Zone for immediate deletion. Or email ralledj@gmail.com and we\'ll handle it within 48 hours.' },
              { title: 'Cookies', body: 'Session cookies only for authentication. No tracking cookies.' },
              { title: 'Analytics', body: 'We use Vercel Analytics (no personal data) and PostHog (anonymous feature usage only, no personal content ever). Opt out in Settings.' },
            ].map(s => (
              <div key={s.title}>
                <h2 className="font-cinzel text-sm tracking-wide mb-2" style={{ color: '#1a1a1a' }}>{s.title}</h2>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/" className="btn-gold px-6 py-3 text-xs inline-block">← Back Home</Link>
          </div>
        </main>
      </div>
    </>
  )
}
