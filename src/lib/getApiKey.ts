import { decryptApiKey } from './keyEncryption'
import { createClient as rawClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = Record<string, any>

const admin = rawClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getDecryptedApiKey(userId: string): Promise<string | null> {
  const { data } = await (admin.from('profiles') as AnyRec)
    .select('api_key_encrypted')
    .eq('id', userId)
    .single()
  const blob = (data as { api_key_encrypted?: string } | null)?.api_key_encrypted
  if (!blob) return null
  try {
    return decryptApiKey(blob)
  } catch {
    return null
  }
}
