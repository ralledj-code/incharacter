import Link from 'next/link'
import Image from 'next/image'
import BurgerMenu from '@/components/BurgerMenu'
import LandingNav from '@/components/LandingNav'
import LandingTheme from '@/components/LandingTheme'

export default function LandingPage() {
  return (
    <>
      <LandingTheme />

      <div className="min-h-screen" style={{ background: '#f5f0e8', color: '#1a1a1a' }}>
        <LandingNav />
        <BurgerMenu loggedIn={false} theme="light" />

        {/* ── Hero ─────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center"
          style={{ paddingTop: 80 }}
        >
          <Image
            src="/images/hero.webp"
            alt="An open journal on a tavern table by candlelight"
            fill
            priority
            quality={85}
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
          {/* Gradient overlay — dark at top, fades to parchment at bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 60%, #f5f0e8 100%)',
          }} />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest mb-6" style={{ color: 'rgba(201,168,76,0.9)' }}>
              FOR THE TABLE
            </p>
            <h1
              className="font-cinzel mb-3 leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#f5f0e8' }}
            >
              In Character.<br />Your RPG session journal.
            </h1>
            <div className="mx-auto mb-8" style={{ width: 60, height: 1.5, background: '#c9a84c', opacity: 0.7 }} />
            <p
              className="font-garamond text-xl mb-10 leading-relaxed max-w-lg mx-auto"
              style={{ color: 'rgba(245,240,232,0.75)' }}
            >
              Log moments during play. End the session, get a Claude-written summary.
              Send your DM structured feedback tied to what actually happened.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn-gold-solid px-10 py-3 text-sm tracking-widest">
                Start Playing
              </Link>
              <a
                href="#how-it-works"
                className="font-cinzel px-10 py-3 text-sm tracking-widest inline-flex items-center justify-center"
                style={{
                  border: '1px solid rgba(255,255,255,0.6)',
                  color: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  minHeight: 44,
                }}
              >
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* ── Section 1: How It Works ──────────────────────── */}
        <section id="how-it-works" className="px-6 py-16" style={{ background: '#ede6d6' }}>
          <div className="max-w-4xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest text-center mb-3" style={{ color: '#c9a84c' }}>
              HOW IT WORKS
            </p>
            <h2 className="font-cinzel text-3xl text-center mb-12" style={{ color: '#1a1a1a' }}>
              Four steps. No disruption.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  n: '01', icon: '✍️',
                  title: 'Log what happened',
                  body: 'Type a quick entry after each moment at the table. Claude instantly assigns it an icon and category. No interruption to the game.',
                },
                {
                  n: '02', icon: '📖',
                  title: 'End the session, get a summary',
                  body: 'Tap End Session when you\'re done. Claude reads every entry and writes a 3–4 sentence summary — in the voice of what actually happened.',
                },
                {
                  n: '03', icon: '📩',
                  title: 'Send your DM a debrief',
                  body: 'Rate combat, roleplay, world and party dynamics. Add what worked and what you\'d love next time. In Character sends your DM a formatted email with your summary, entries and feedback. No DM account needed.',
                },
                {
                  n: '04', icon: '🗂️',
                  title: 'Browse every past session',
                  body: 'Everything is saved and searchable. Come back next week and remember exactly where you left off.',
                },
              ].map(step => (
                <div key={step.n} className="card-light card-hover p-7">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <p className="font-cinzel text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>{step.n}</p>
                  <h3 className="font-cinzel text-base tracking-wide mb-3" style={{ color: '#1a1a1a' }}>{step.title}</h3>
                  <p className="font-garamond leading-relaxed" style={{ color: '#4a4a4a' }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 2: DM Debrief ────────────────────────── */}
        <section className="px-6 py-20" style={{ background: '#f5f0e8' }}>
          <div className="max-w-2xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>THE DM DEBRIEF</p>
            <h2 className="font-cinzel text-3xl mb-6" style={{ color: '#1a1a1a' }}>
              Structured feedback your DM actually wants.
            </h2>
            <p className="font-garamond text-lg leading-relaxed mb-8" style={{ color: '#4a4a4a' }}>
              After every session, rate what happened across four categories.
              Add what worked. Add what you&rsquo;d love to explore next time.
              In Character sends your DM an email with:
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Your session summary, written by Claude',
                'Every entry you logged, with icons',
                'Your star ratings with comments',
                'A direct reply line back to you',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#c9a84c', flexShrink: 0, marginTop: 4 }}>·</span>
                  <span className="font-garamond text-lg" style={{ color: '#4a4a4a' }}>{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-garamond text-lg" style={{ color: '#4a4a4a' }}>
              No DM account. No app to install. Just an email worth opening.
            </p>
          </div>
        </section>

        {/* ── Section 3: Pricing ───────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-lg mx-auto text-center">
            <p className="font-cinzel text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>PRICING</p>
            <h2 className="font-cinzel text-3xl mb-8" style={{ color: '#1a1a1a' }}>Free. Bring your own API key.</h2>
            <div className="card-light p-8 mb-6">
              <ul className="space-y-4 text-left">
                {[
                  'In Character is free to use',
                  'Bring your own Anthropic API key',
                  'Sessions cost less than $0.10 in API usage',
                  'DM feedback emails included',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span style={{ color: '#c9a84c', flexShrink: 0, marginTop: 2 }}>✦</span>
                    <span className="font-garamond" style={{ color: '#4a4a4a' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="font-garamond text-sm" style={{ color: '#8a8a8a' }}>No subscription. No ads. No data selling.</p>
          </div>
        </section>

        {/* ── Dark CTA ─────────────────────────────────────── */}
        <section className="px-6 py-20 text-center" style={{ background: '#1a1a1a' }}>
          <h2 className="font-cinzel text-3xl mb-4" style={{ color: '#ffffff' }}>Start journalling your campaign.</h2>
          <p className="font-garamond text-lg mb-8" style={{ color: '#a0a0a0' }}>Log entries, end the session, read the summary.</p>
          <Link href="/auth/login" className="btn-gold-solid inline-block px-14 py-4 text-sm tracking-widest">
            Start Playing
          </Link>
        </section>

        {/* ── Footer ──────────────────────────────────────── */}
        <footer className="px-6 py-10" style={{ background: '#1a1a1a', borderTop: '1px solid #2e2e2e' }}>
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="font-cinzel text-base tracking-wider" style={{ color: '#c9a84c' }}>In Character</span>
            <nav className="flex flex-wrap justify-center gap-5">
              {['/about', '/faq', '/privacy', '/contact'].map(href => (
                <Link key={href} href={href} className="font-garamond text-sm"
                  style={{ color: '#606060', minHeight: 'auto', minWidth: 'auto' }}>
                  {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </nav>
            <div className="text-right">
              <p className="font-garamond text-sm" style={{ color: '#606060' }}>Built by Rasmus · Denmark</p>
              <p className="font-garamond text-xs mt-1" style={{ color: '#404040' }}>Powered by Claude AI</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
