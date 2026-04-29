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
              In Character was built by Rasmus, a digital strategist from Denmark
              who kept forgetting what happened in last week&rsquo;s session.
            </p>

            <p>
              A session journal for tabletop RPG players. Not a character sheet.
              Not a dice roller. The thing that remembers what happened at the table
              so you don&rsquo;t have to.
            </p>

            <p>
              Log moments during play. End the session and get a summary written by
              Claude. Come back next week and remember exactly where you left off.
            </p>

            <p>
              Built for the player who cares about the story.
            </p>
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
