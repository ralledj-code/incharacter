// Server-only — fetches and decrypts a character's API key.
// User ownership is verified via the authenticated JWT, never from the request body.
import { createClient } from './supabase/server'
import { decryptApiKey, isEncrypted } from './keyEncryption'

/**
 * Returns the decrypted Anthropic API key for characterId if:
 *  1. The calling user (from verified JWT) owns that character.
 *  2. An encrypted key is stored.
 * Returns null if no key is stored or ownership fails.
 * Never throws — caller falls back to server-side ANTHROPIC_API_KEY.
 */
export async function getDecryptedApiKey(
  userId: string,
  characterId: string
): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Verify ownership and fetch only the encrypted key column
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('characters') as any)
      .select('api_key_encrypted')
      .eq('id', characterId)
      .eq('player_id', userId) // ownership check via verified JWT user
      .single()

    const raw: string | null = (data as { api_key_encrypted: string | null } | null)?.api_key_encrypted ?? null
    if (!raw) return null

    // Support migration: if somehow plaintext was stored, return as-is
    if (!isEncrypted(raw)) return raw

    return decryptApiKey(raw)
  } catch {
    // Never log the key or the error in a way that could expose it
    return null
  }
}
