import Link from 'next/link'
import LandingGlyph from '@/components/LandingGlyph'
import BurgerMenu from '@/components/BurgerMenu'

export default function LandingPage() {
  return (
    <div className="animate-page">
      <BurgerMenu loggedIn={false} />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Slow-rotating background glyph */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.06 }}
        >
          <div className="animate-slow-rotate">
            <LandingGlyph size={700} />
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <h1 className="font-cinzel text-5xl md:text-7xl font-semibold mb-4 tracking-wider"
              style={{ color: 'var(--gold)' }}>
            In Character
          </h1>

          <p className="font-garamond text-xl md:text-2xl mb-4 italic-permitted"
             style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Your character, in character.
          </p>

          <p className="font-garamond text-lg mb-12 leading-relaxed"
             style={{ color: 'var(--text-dim)' }}>
            The psychological companion for tabletop roleplayers.
            Know who your character is. Play them that way.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login?role=player"
                  className="btn-gold-solid px-10 py-3 text-sm tracking-widest">
              Start Playing
            </Link>
            <a href="#how-it-works"
               className="btn-gold px-10 py-3 text-sm tracking-widest">
              How It Works
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-14 bg-gradient-to-b"
                 style={{ background: `linear-gradient(to bottom, var(--gold-faint), transparent)` }} />
          </div>
        </div>
      </section>

      {/* ── Section 1: The Problem ───────────────────────── */}
      <section className="px-6 py-24 max-w-2xl mx-auto text-center">
        <p className="label-caps mb-6" style={{ color: 'var(--text-faint)' }}>The Problem</p>
        <p className="font-garamond text-xl leading-relaxed" style={{ color: 'var(--text)' }}>
          Staying in character is hard. You know who your character is on paper. But in the moment,
          under pressure, three hours into a session &mdash; it&rsquo;s easy to play yourself instead of them.
        </p>
      </section>

      {/* ── Section 2: How It Works ──────────────────────── */}
      <section id="how-it-works" className="px-6 py-16 max-w-4xl mx-auto">
        <p className="label-caps text-center mb-10" style={{ color: 'var(--text-faint)' }}>How It Works</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              n: '01',
              title: 'Upload your dossier',
              body: 'Claude reads your character background and builds a psychological profile — tensions, voice, breaking points.',
            },
            {
              n: '02',
              title: 'Log what happens',
              body: 'Three taps. No typing. Tap what occurred and how your character handled it. Claude writes the narrative.',
            },
            {
              n: '03',
              title: 'Know how to play them',
              body: 'One behavioral directive. Always visible. Updated as things shift. Not stats — guidance.',
            },
          ].map(step => (
            <div key={step.n} className="card-dark p-7 card-hover">
              <p className="font-cinzel text-3xl mb-4" style={{ color: 'var(--gold-faint)' }}>{step.n}</p>
              <h3 className="font-cinzel text-sm tracking-wider mb-3" style={{ color: 'var(--text)' }}>
                {step.title}
              </h3>
              <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: The Glyph ────────────────────────── */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <p className="label-caps text-center mb-3" style={{ color: 'var(--text-faint)' }}>What It Tracks</p>
        <p className="font-garamond text-center text-lg mb-12" style={{ color: 'var(--text-dim)' }}>
          Six behavioral states, always in tension with each other.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-shrink-0 animate-breathe">
            <LandingGlyph size={280} />
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {[
              { label: 'CHARMING',  desc: 'The performance is holding' },
              { label: 'GUARDED',   desc: 'The wound is talking' },
              { label: 'RECKLESS',  desc: 'The bottle is speaking' },
              { label: 'VOLATILE',  desc: 'The pressure is loud' },
              { label: 'WITHDRAWN', desc: 'The mask is slipping' },
              { label: 'PRESENT',   desc: 'He is here, right now' },
            ].map(s => (
              <div key={s.label} className="p-3"
                   style={{ borderLeft: '2px solid var(--gold-faint)' }}>
                <p className="font-cinzel text-xs tracking-widest mb-1"
                   style={{ color: 'var(--accent)' }}>{s.label}</p>
                <p className="font-garamond text-sm" style={{ color: 'var(--text-dim)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center">
        <Link href="/auth/login?role=player"
              className="btn-gold-solid inline-block px-14 py-4 text-sm tracking-widest">
          Start Playing
        </Link>
        <p className="font-garamond mt-6 text-sm" style={{ color: 'var(--text-faint)' }}>
          Free. Bring your own Anthropic API key. Sessions cost less than $0.10.
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t px-6 py-8 text-center"
              style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
             style={{ color: 'var(--text-faint)' }}>
          <span className="font-cinzel text-xs tracking-widest">incharacter.cloud</span>
          <span className="hidden sm:inline opacity-30">·</span>
          <Link href="/about"   className="font-garamond text-sm hover:text-[var(--text)] transition-colors">About</Link>
          <Link href="/faq"     className="font-garamond text-sm hover:text-[var(--text)] transition-colors">FAQ</Link>
          <Link href="/privacy" className="font-garamond text-sm hover:text-[var(--text)] transition-colors">Privacy</Link>
          <Link href="/contact" className="font-garamond text-sm hover:text-[var(--text)] transition-colors">Contact</Link>
          <span className="hidden sm:inline opacity-30">·</span>
          <a href="https://buymeacoffee.com" target="_blank" rel="noopener noreferrer"
             className="font-garamond text-sm hover:text-[var(--text)] transition-colors">Support</a>
        </div>
      </footer>
    </div>
  )
}
