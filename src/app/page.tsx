import Link from 'next/link'
import LandingGlyph from '@/components/LandingGlyph'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Background glyph */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="opacity-[0.04] animate-glow scale-150">
            <LandingGlyph size={600} />
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="label-caps mb-4 tracking-widest">For the table</p>

          <h1 className="font-cinzel text-5xl md:text-6xl font-semibold text-gold mb-3 tracking-wider">
            In Character
          </h1>

          <p className="font-garamond text-xl text-ink-dim italic mb-12">
            Your character, in character.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login?role=player"
              className="btn-gold text-center px-8 py-3 text-sm tracking-widest inline-block"
            >
              I&rsquo;m a Player
            </Link>
            <Link
              href="/auth/login?role=dm"
              className="btn-gold text-center px-8 py-3 text-sm tracking-widest inline-block"
            >
              I&rsquo;m a DM
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <p className="label-caps text-ink-faint">scroll</p>
            <div className="w-px h-12 bg-gradient-to-b from-gold-faint to-transparent" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-24 max-w-2xl mx-auto w-full">
        <div className="card-dark card-gold-border p-8 mb-10">
          <h2 className="font-cinzel text-gold text-lg tracking-widest mb-4">Not a character sheet.</h2>
          <p className="font-garamond text-ink-dim text-lg leading-relaxed">
            In Character is a psychological companion for your character. It doesn&rsquo;t track HP or spell slots.
            It tracks who your character is becoming &mdash; session by session, choice by choice.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="font-cinzel text-gold text-sm tracking-widest mb-8">How It Works</h2>
          <ol className="space-y-6">
            {[
              {
                n: '01',
                title: 'Upload your dossier',
                body: "Paste or upload your character background. Claude reads it and builds your character's psychological profile — their tensions, their voice, their breaking points.",
              },
              {
                n: '02',
                title: 'Log what happens',
                body: 'Three taps. No typing. When something worth remembering happens at the table, log it. Claude writes the narrative. The glyph shifts.',
              },
              {
                n: '03',
                title: 'Get told how to play them',
                body: "One directive. Always visible. Updated when things shift. \"Play him like the smile is taking effort he doesn't have.\"",
              },
            ].map(step => (
              <li key={step.n} className="flex gap-6">
                <span className="font-cinzel text-gold-dim text-2xl leading-none pt-1 flex-shrink-0">{step.n}</span>
                <div>
                  <h3 className="font-cinzel text-ink text-sm tracking-wider mb-2">{step.title}</h3>
                  <p className="font-garamond text-ink-dim leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {[
            { name: 'NOW', desc: "How to play him right now. One directive. Updated by what happens." },
            { name: 'SESSION', desc: 'What happened this session, in order, in his voice.' },
            { name: 'JOURNEY', desc: "Who he's becoming. Clues. Relationships. The arc." },
          ].map(p => (
            <div key={p.name} className="card-dark p-5 text-center">
              <h3 className="font-cinzel text-gold text-xs tracking-widest mb-3">{p.name}</h3>
              <p className="font-garamond text-ink-dim text-sm leading-relaxed italic">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/auth/login?role=player"
            className="btn-gold-solid inline-block px-12 py-4 text-sm tracking-widest"
          >
            Begin
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-ink-faint">
          <span className="font-cinzel text-xs tracking-widest">incharacter.cloud</span>
          <span className="hidden sm:inline opacity-30">·</span>
          <span className="font-garamond text-sm">Built for roleplayers</span>
          <span className="hidden sm:inline opacity-30">·</span>
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-garamond text-sm text-gold-dim hover:text-gold transition-colors"
          >
            Support the project
          </a>
          <span className="hidden sm:inline opacity-30">·</span>
          <a
            href="https://github.com/ralledj-code/incharacter"
            target="_blank"
            rel="noopener noreferrer"
            className="font-garamond text-sm text-gold-dim hover:text-gold transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  )
}
