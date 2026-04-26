import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'

export default function PrivacyPage() {
  return (
    <div className="animate-page min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={false} />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <p className="label-caps mb-4" style={{ color: 'var(--text-faint)' }}>Privacy Policy</p>
        <h1 className="font-cinzel text-3xl mb-12 tracking-wider" style={{ color: 'var(--text)' }}>
          Your data. Your character.
        </h1>

        {/* Note: Supabase project region is US East (AWS us-east-1 / Virginia).
            Update this if project is migrated. */}
        <div className="space-y-8 font-garamond text-lg leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {[
            {
              title: 'What we collect',
              body: 'Email address, character data you provide, events you log during sessions.',
            },
            {
              title: "What we don't collect",
              body: 'Real names, payment information, location data.',
            },
            {
              title: 'Who can see it',
              body: "You, and DMs of campaigns you've joined. We don't sell or share your data with third parties.",
            },
            {
              title: 'Where it\'s stored',
              body: 'Supabase (AWS us-east-1), encrypted at rest. Your Anthropic API key is stored encrypted and never transmitted to us in plain text.',
            },
            {
              title: 'How to delete it',
              body: 'Go to Settings → Danger Zone to delete your account and all data immediately. Or email ralledj@gmail.com and we\'ll handle it within 48 hours.',
            },
            {
              title: 'Cookies',
              body: 'Session cookies only for authentication. No tracking cookies, no analytics.',
            },
          ].map(s => (
            <div key={s.title}>
              <h2 className="font-cinzel text-sm tracking-wider mb-2" style={{ color: 'var(--text)' }}>
                {s.title}
              </h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/" className="btn-gold px-6 py-3 text-xs">← Back Home</Link>
        </div>
      </main>
    </div>
  )
}
