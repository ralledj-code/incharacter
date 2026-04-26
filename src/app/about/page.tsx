import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'

export default function AboutPage() {
  return (
    <div className="animate-page min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={false} />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <p className="label-caps mb-4" style={{ color: 'var(--text-faint)' }}>About</p>
        <h1 className="font-cinzel text-3xl mb-12 tracking-wider" style={{ color: 'var(--text)' }}>
          Built for roleplayers, by a roleplayer.
        </h1>

        <div className="space-y-8 font-garamond text-lg leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          <p>
            In Character was built by Rasmus, a digital strategist from Denmark who wanted to stay in
            character during D&amp;D sessions and ended up building a tool for everyone. It started as a
            personal app for one half-elf Wild Magic Sorcerer with an infernal debt and a drinking problem.
            It became something bigger.
          </p>

          <div className="card-dark card-gold-border p-6">
            <p style={{ color: 'var(--text)' }}>
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

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <p className="label-caps mb-4" style={{ color: 'var(--text-faint)' }}>Built with</p>
            <ul className="space-y-2" style={{ color: 'var(--text-dim)' }}>
              <li>Claude AI by Anthropic &mdash; narrative and behavioral intelligence</li>
              <li>Next.js &mdash; web framework</li>
              <li>Supabase &mdash; database and authentication</li>
              <li>Vercel &mdash; hosting and deployment</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <Link href="/" className="btn-gold px-6 py-3 text-xs">← Back Home</Link>
        </div>
      </main>
    </div>
  )
}
