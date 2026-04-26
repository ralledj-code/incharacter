import Link from 'next/link'
import LandingGlyph from '@/components/LandingGlyph'
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
          {/* Static glyph watermark — no animation on landing */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ opacity: 0.04 }}
          >
            <LandingGlyph size={700} color="#c9a84c" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest mb-6" style={{ color: '#c9a84c' }}>
              FOR THE TABLE
            </p>
            <h1
              className="font-cinzel mb-3 leading-tight"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1a1a1a' }}
            >
              Your character,<br />in character.
            </h1>
            {/* Gold decorative line */}
            <div className="mx-auto mb-8" style={{ width: 60, height: 1.5, background: '#c9a84c', opacity: 0.7 }} />
            <p
              className="font-garamond text-xl mb-10 leading-relaxed max-w-lg mx-auto"
              style={{ color: '#4a4a4a' }}
            >
              The psychological companion for tabletop roleplayers.
              Know who your character is. Play them that way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login?role=player" className="btn-gold-solid px-10 py-3 text-sm tracking-widest">
                Start Playing
              </Link>
              <a href="#how-it-works" className="btn-gold px-10 py-3 text-sm tracking-widest">
                See How It Works
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, #c9a84c44, transparent)' }} />
          </div>
        </section>

        {/* ── Section 1: The Problem ───────────────────────── */}
        <section className="px-6 py-24">
          <div className="max-w-2xl mx-auto">
            <div className="card-light card-hover p-10" style={{ textAlign: 'left' }}>
              <div className="text-4xl mb-5">🎭</div>
              <h2 className="font-cinzel text-2xl mb-4" style={{ color: '#1a1a1a' }}>
                Staying in character is hard.
              </h2>
              <p className="font-garamond text-lg leading-relaxed" style={{ color: '#4a4a4a' }}>
                You know who your character is on paper. But in the moment, under pressure,
                three hours into a session &mdash; it&rsquo;s easy to play yourself instead of them.
                In Character fixes that.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 2: How It Works ──────────────────────── */}
        <section id="how-it-works" className="px-6 py-16" style={{ background: '#ede6d6' }}>
          <div className="max-w-4xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest text-center mb-3" style={{ color: '#c9a84c' }}>
              HOW IT WORKS
            </p>
            <h2 className="font-cinzel text-3xl text-center mb-12" style={{ color: '#1a1a1a' }}>
              Three steps. No disruption.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  n: '01', icon: '📄',
                  title: 'Upload your dossier',
                  body: 'Paste or upload your character background. Claude reads it and builds a psychological profile — tensions, voice, breaking points.',
                },
                {
                  n: '02', icon: '⚡',
                  title: 'Log what happens',
                  body: 'Three taps, no typing. Tap what occurred and how they handled it. Never breaks immersion. Takes ten seconds.',
                },
                {
                  n: '03', icon: '🧭',
                  title: 'Know how to play them',
                  body: 'One directive. Always visible. Updated in real time as things shift. Behavioral guidance — not stats.',
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

        {/* ── Section 3: What It Tracks ────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <p className="font-cinzel text-xs tracking-widest text-center mb-3" style={{ color: '#c9a84c' }}>
              WHAT IT TRACKS
            </p>
            <h2 className="font-cinzel text-3xl text-center mb-4" style={{ color: '#1a1a1a' }}>
              Six states. Always in tension.
            </h2>
            <p className="font-garamond text-center text-lg mb-12" style={{ color: '#4a4a4a' }}>
              Your character isn&rsquo;t one thing. In Character tracks the push and pull
              between six behavioral states, updated with every logged moment.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'CHARMING',  desc: 'The performance is holding. The mask is up.' },
                { label: 'GUARDED',   desc: 'The wound is talking. Walls are up.' },
                { label: 'RECKLESS',  desc: 'Appetite driving decisions.' },
                { label: 'VOLATILE',  desc: 'Internal pressure is building.' },
                { label: 'WITHDRAWN', desc: 'The mask is slipping. Going quiet.' },
                { label: 'PRESENT',   desc: 'Genuinely here. Rare, and real.' },
              ].map(s => (
                <div key={s.label} className="card-light landing-state-card p-5">
                  <p className="font-cinzel text-xs tracking-widest mb-2" style={{ color: '#c9a84c' }}>{s.label}</p>
                  <p className="font-garamond text-sm" style={{ color: '#4a4a4a' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 4: For DMs ───────────────────────────── */}
        <section className="px-6 py-20" style={{ background: '#ede6d6' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-cinzel text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>FOR DMS TOO</p>
            <h2 className="font-cinzel text-3xl mb-5" style={{ color: '#1a1a1a' }}>
              See your whole party at a glance.
            </h2>
            <p className="font-garamond text-xl leading-relaxed mb-8" style={{ color: '#4a4a4a' }}>
              Know who&rsquo;s unraveling before they do. The DM dashboard shows each character&rsquo;s
              current psychological state, recent events, and trajectory — all in one view.
              Generate a pre-session brief for the whole party in one click.
            </p>
            <Link href="/auth/login?role=dm" className="btn-gold px-8 py-3 text-sm tracking-widest inline-block">
              Set Up Your Campaign →
            </Link>
          </div>
        </section>

        {/* ── Section 5: Pricing ───────────────────────────── */}
        <section className="px-6 py-20">
          <div className="max-w-lg mx-auto text-center">
            <p className="font-cinzel text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>PRICING</p>
            <h2 className="font-cinzel text-3xl mb-8" style={{ color: '#1a1a1a' }}>Free. Bring your own API key.</h2>
            <div className="card-light p-8 mb-6">
              <ul className="space-y-4 text-left">
                {['In Character is free to use', 'You connect your own Anthropic API key', 'Sessions cost less than $0.10 in API usage'].map(item => (
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
          <h2 className="font-cinzel text-3xl mb-4" style={{ color: '#ffffff' }}>Your character is waiting.</h2>
          <p className="font-garamond text-lg mb-8" style={{ color: '#a0a0a0' }}>Upload a dossier. Log a session. Know who to play.</p>
          <Link href="/auth/login?role=player" className="btn-gold-solid inline-block px-14 py-4 text-sm tracking-widest">
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
