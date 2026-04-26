import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'
import LandingTheme from '@/components/LandingTheme'

export default function AboutPage() {
  return (
    <>
      <LandingTheme />
      <div className="min-h-screen" style={{ background: '#faf9f7', color: '#1a1a1a' }}>
        <BurgerMenu loggedIn={false} theme="light" />
        <main className="max-w-2xl mx-auto px-6 py-24 pt-20">
          <Link href="/" className="font-cinzel text-sm tracking-widest mb-10 block"
                style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}>
            ← In Character
          </Link>

          <h1 className="font-cinzel text-4xl mb-12" style={{ color: '#1a1a1a' }}>
            Built for roleplayers,<br />by a roleplayer.
          </h1>

          <div className="space-y-8 font-garamond text-lg leading-relaxed" style={{ color: '#4a4a4a' }}>
            <p>
              In Character was built by Rasmus, a digital strategist from Denmark who wanted
              to stay in character during D&amp;D sessions and ended up building a tool for everyone.
              It started as a personal app for one half-elf Wild Magic Sorcerer with an infernal
              debt and a drinking problem. It became something bigger.
            </p>

            <div className="card-light p-7" style={{ borderLeft: '2px solid #c9a84c' }}>
              <p style={{ color: '#1a1a1a' }}>
                A psychological companion for your character. Not a character sheet. Not a dice roller.
                The thing that tells you how to play them in the moment, based on what&rsquo;s actually
                happened at the table.
              </p>
            </div>

            <p>
              Not a replacement for imagination. The DM still runs the world. Your character still
              surprises you. In Character just helps you stay true to who they are when things get
              complicated.
            </p>

            <div style={{ borderTop: '1px solid #e8e4df', paddingTop: '2rem' }}>
              <p className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#8a8a8a' }}>
                BUILT WITH
              </p>
              <ul className="space-y-2">
                <li>Claude AI by Anthropic &mdash; narrative and behavioral intelligence</li>
                <li>Next.js &mdash; web framework</li>
                <li>Supabase &mdash; database and authentication</li>
                <li>Vercel &mdash; hosting and deployment</li>
              </ul>
            </div>
          </div>
        </main>

        <footer className="border-t px-6 py-8 text-center" style={{ borderColor: '#e8e4df' }}>
          <div className="flex flex-wrap justify-center gap-5">
            {['/faq', '/privacy', '/contact'].map(href => (
              <Link key={href} href={href}
                    className="font-garamond text-sm"
                    style={{ color: '#8a8a8a', minHeight: 'auto', minWidth: 'auto' }}>
                {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
              </Link>
            ))}
          </div>
        </footer>
      </div>
    </>
  )
}
