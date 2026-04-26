import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'
import LandingTheme from '@/components/LandingTheme'

const FAQS = [
  { q: 'Is my data private?', a: "Yes. Your character data is stored securely and only visible to you and DMs of campaigns you've explicitly joined. We don't sell data or use it for advertising." },
  { q: 'What does it cost?', a: 'In Character is free. You bring your own Anthropic API key for AI features. A full session typically costs less than $0.10.' },
  { q: 'Do I need D&D experience?', a: 'No. In Character works for any tabletop RPG — new players welcome.' },
  { q: 'What games does it work for?', a: 'Any tabletop RPG with characters — D&D, Pathfinder, Call of Cthulhu, Blades in the Dark, anything.' },
  { q: 'Can my DM see everything?', a: "DMs see your character's current psychological state and recent session summaries — what's on your Now screen. They cannot see your raw event log, clue boards, relationship threads, or personal notes." },
  { q: 'What happens to my character if I stop playing?', a: 'Your data stays until you delete it. Export your full character journey as a PDF at any time from your Settings page.' },
  { q: "What's a dossier?", a: 'A description of your character — background, personality, flaws, relationships, motivations. A paragraph or ten pages. More detail means better guidance.' },
  { q: 'Is this only for experienced roleplayers?', a: 'Especially not. In Character is most useful for players who find staying in character difficult.' },
  { q: "What's a player code?", a: 'Every player gets a unique IC-XXXX-XXXX code on account creation. Share it with your DM to join their campaign without needing your email address.' },
]

export default function FAQPage() {
  return (
    <>
      <LandingTheme />
      <div className="min-h-screen" style={{ background: '#faf9f7', color: '#1a1a1a' }}>
        <BurgerMenu loggedIn={false} theme="light" />
        <main className="max-w-2xl mx-auto px-6 py-24 pt-20">
          <Link href="/" className="font-cinzel text-sm tracking-widest mb-10 block"
                style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}>← In Character</Link>
          <h1 className="font-cinzel text-4xl mb-12" style={{ color: '#1a1a1a' }}>Questions.</h1>

          <div className="space-y-5">
            {FAQS.map((item, i) => (
              <div key={i} className="card-light p-6">
                <h2 className="font-cinzel text-sm tracking-wide mb-3" style={{ color: '#c9a84c' }}>{item.q}</h2>
                <p className="font-garamond leading-relaxed" style={{ color: '#4a4a4a' }}>{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="font-garamond mb-4" style={{ color: '#4a4a4a' }}>Still have questions?</p>
            <Link href="/contact" className="btn-gold px-8 py-3 text-sm inline-block">Contact Us</Link>
          </div>
        </main>
      </div>
    </>
  )
}
