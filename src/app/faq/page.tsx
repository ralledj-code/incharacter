import Link from 'next/link'
import BurgerMenu from '@/components/BurgerMenu'
import LandingTheme from '@/components/LandingTheme'

const FAQS = [
  { q: 'Is my data private?', a: "Yes. Your sessions and entries are only visible to you. We don't sell data or use it for advertising." },
  { q: 'What does it cost?', a: 'In Character is free. You bring your own Anthropic API key. A full session typically costs less than $0.10 in API usage.' },
  { q: 'Do I need a specific game system?', a: 'No. Works for any tabletop RPG — D&D, Pathfinder, Call of Cthulhu, Blades in the Dark, anything with characters and sessions.' },
  { q: 'How does the AI summary work?', a: "When you end a session, Claude reads all your entries and writes a 3–4 sentence summary of what happened. It only uses what you logged — no invented details." },
  { q: "What's an Anthropic API key?", a: "It's your personal key to access Claude AI. Get one free at console.anthropic.com. Paste it into In Character during setup. It's encrypted and never visible after you save it." },
  { q: 'Can I edit past entries?', a: 'You can edit entries within an active session. Once you end a session it\'s locked — the summary is final.' },
  { q: 'What happens to my data if I stop playing?', a: 'Your sessions stay saved until you delete your account. Reset character in Settings to start fresh while keeping your account.' },
  { q: 'Can my DM receive session notes?', a: 'Yes — and this is one of In Character\'s best features. Add your DM\'s email in Settings. After each session, rate combat, roleplay, world and party dynamics with stars and optional comments. In Character sends a formatted email with your Claude-written summary, every logged entry, and your feedback. Your DM can reply directly. No account needed.' },
  { q: 'What does the DM email look like?', a: 'A styled email with your character name large at the top, the session summary written by Claude, your logged entries with icons, and your star ratings with comments. Clean, readable, worth keeping. Your DM can reply directly to you.' },
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

          <div className="card-light p-6 mt-5">
            <h2 className="font-cinzel text-sm tracking-wide mb-3" style={{ color: '#c9a84c' }}>Still have questions?</h2>
            <p className="font-garamond leading-relaxed" style={{ color: '#4a4a4a' }}>
              <Link href="/contact" style={{ color: '#c9a84c', minHeight: 'auto', minWidth: 'auto' }}>Contact Us</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  )
}
