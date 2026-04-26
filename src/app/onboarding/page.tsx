'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import OnboardingPlayer from '@/components/onboarding/OnboardingPlayer'
import OnboardingDM from '@/components/onboarding/OnboardingDM'

function OnboardingContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'player'

  if (role === 'dm') return <OnboardingDM />
  return <OnboardingPlayer />
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-garamond text-ink-dim italic animate-pulse">The dagger considers...</p>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
