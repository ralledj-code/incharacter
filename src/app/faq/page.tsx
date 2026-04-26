import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'

const FAQS = [
  {
    q: 'Is my data private?',
    a: 'Yes. Your character data is stored securely and only visible to you and DMs of campaigns you\'ve explicitly joined. We don\'t sell data or use it for advertising.',
  },
  {
    q: 'What does it cost?',
    a: 'In Character is free. You bring your own Anthropic API key for the AI features. A full session typically costs less than $0.10.',
  },
  {
    q: 'Do I need D&D experience?',
    a: 'No. In Character works for any tabletop RPG — D&D, Pathfinder, Call of Cthulhu, Blades in the Dark, anything with characters.',
  },
  {
    q: 'Can my DM see everything?',
    a: 'DMs can see your character\'s current psychological state and recent session summaries — what\'s on your Now screen. They cannot see your raw event log, personal notes, or clue boards.',
  },
  {
    q: 'What happens to my character if I stop playing?',
    a: 'Your data stays until you delete it. You can export your full character journey as a PDF at any time from your Settings page.',
  },
  {
    q: 'What\'s a dossier?',
    a: 'A description of your character — background, personality, flaws, relationships, what drives them. A paragraph or ten pages. The more detail, the better In Character knows them.',
  },
  {
    q: 'Is this only for experienced roleplayers?',
    a: 'Especially not. In Character is most useful for players who find staying in character difficult.',
  },
  {
    q: 'What is a player code?',
    a: 'Every player gets a unique IC-XXXX-XXXX code generated on account creation. Share it with your DM so they can add you to their campaign without needing your email address.',
  },
]

export default function FAQPage() {
  return (
    <div className="animate-page min-h-screen" style={{ background: 'var(--bg)' }}>
      <BurgerMenu loggedIn={false} />
      <main className="max-w-2xl mx-auto px-6 py-20">
        <p className="label-caps mb-4" style={{ color: 'var(--text-faint)' }}>FAQ</p>
        <h1 className="font-cinzel text-3xl mb-12 tracking-wider" style={{ color: 'var(--text)' }}>
          Questions
        </h1>

        <div className="space-y-6">
          {FAQS.map((item, i) => (
            <div key={i} className="card-dark p-6">
              <h2 className="font-cinzel text-sm tracking-wider mb-3" style={{ color: 'var(--accent)' }}>
                {item.q}
              </h2>
              <p className="font-garamond leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {item.a}
              </p>
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
