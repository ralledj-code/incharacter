// Server-only module — never import from client components
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12

function getKey(): Buffer {
  const secret = process.env.API_KEY_ENCRYPTION_SECRET
  if (!secret || secret.length < 64) {
    throw new Error('API_KEY_ENCRYPTION_SECRET env var missing or too short')
  }
  // Accept 64-char hex string → 32-byte key
  return Buffer.from(secret.slice(0, 64), 'hex')
}

export function encryptApiKey(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv:tag:ciphertext  (all hex)
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptApiKey(blob: string): string {
  const parts = blob.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted key format')
  const [ivHex, tagHex, cipherHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ciphertext = Buffer.from(cipherHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
}

/** Returns true if the blob looks like our encrypted format (not plaintext). */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':')
  return parts.length === 3 && parts[0].length === IV_BYTES * 2
}
