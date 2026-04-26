import posthog from 'posthog-js'

// Only tracks events — never personal content, never raw text
export function track(event: string, properties?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  try {
    posthog.capture(event, properties)
  } catch {}
}

export const Events = {
  ONBOARDING_STARTED:           () => track('onboarding_started'),
  ONBOARDING_COMPLETED:         () => track('onboarding_completed'),
  ONBOARDING_ABANDONED:         (step: number) => track('onboarding_abandoned', { step }),
  DOSSIER_UPLOADED:             (method: 'pdf' | 'text') => track('dossier_uploaded', { method }),
  MOMENT_LOGGED:                (category: string, subcategory: string) => track('moment_logged', { category, subcategory }),
  LONG_REST_TRIGGERED:          () => track('long_rest_triggered'),
  PREP_BRIEF_GENERATED:         () => track('prep_brief_generated'),
  CLUE_ADDED:                   () => track('clue_added'),
  RELATIONSHIP_ADDED:           () => track('relationship_added'),
  SCHEME_SELECTED:              (scheme: string) => track('scheme_selected', { scheme }),
  EXPORT_DOWNLOADED:            () => track('export_downloaded'),
  DM_DASHBOARD_VIEWED:          () => track('dm_dashboard_viewed'),
  PRE_SESSION_BRIEF_GENERATED:  () => track('pre_session_brief_generated'),
  CAMPAIGN_CREATED:             () => track('campaign_created'),
  PLAYER_ADDED_TO_CAMPAIGN:     () => track('player_added_to_campaign'),
} as const
