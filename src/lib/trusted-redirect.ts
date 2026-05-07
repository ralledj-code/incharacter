const TRUSTED_ORIGINS = ['https://forge.incharacter.cloud']

export function isTrustedRedirect(url: string): boolean {
  if (url.startsWith('/')) return true
  try {
    return TRUSTED_ORIGINS.includes(new URL(url).origin)
  } catch {
    return false
  }
}

export function safeRedirectUrl(url: string | null | undefined, fallback: string): string {
  if (url && isTrustedRedirect(url)) return url
  return fallback
}
