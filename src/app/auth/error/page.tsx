'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Something went wrong with the sign-in link.'

  return (
    <div className="w-full max-w-sm animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="font-cinzel text-gold text-3xl tracking-wider mb-2">In Character</h1>
      </div>

      <div className="card-dark card-gold-border p-8 space-y-5">
        <div className="text-center">
          <div className="text-crimson text-3xl mb-3">✦</div>
          <h2 className="font-cinzel text-ink text-base tracking-wider mb-2">
            The link didn&rsquo;t work.
          </h2>
          <p className="font-garamond text-ink-dim italic leading-relaxed text-sm">
            {message}
          </p>
        </div>

        <div
          className="p-4 text-xs font-mono break-all leading-relaxed"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 2,
            color: 'var(--text-faint)',
          }}
        >
          {message}
        </div>

        <div className="space-y-3 pt-2">
          <p className="font-garamond text-ink-faint text-sm leading-relaxed">
            Magic links expire after one hour and can only be used once. Request a new one.
          </p>
          <Link
            href="/auth/login"
            className="btn-gold-solid w-full py-3 text-sm text-center block"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-bg flex flex-col items-center justify-center px-6 py-12">
      <Suspense fallback={
        <div className="w-full max-w-sm card-dark p-8 text-center">
          <p className="font-garamond text-ink-dim italic animate-pulse">Reading the signs...</p>
        </div>
      }>
        <ErrorContent />
      </Suspense>
    </main>
  )
}
