'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from './supabase/server'

function buildClient(apiKey?: string) {
  return new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })
}

function buildContextBlock(
  trackers: { mask: number; dagger: number; bottle: number; wound: number },
  characterName: string,
  recentEvents?: string[]
): string {
  const maskDesc = trackers.mask > 70 ? 'performance solid' : trackers.mask > 40 ? 'cracks showing' : 'barely holding'
  const daggerDesc = trackers.dagger > 70 ? 'deafeningly loud' : trackers.dagger > 40 ? 'pressure building' : 'quiet but present'
  const bottleDesc = trackers.bottle > 70 ? 'deep in it' : trackers.bottle > 40 ? 'familiar levels' : 'holding back'
  const woundDesc = trackers.wound > 70 ? 'walls fully up' : trackers.wound > 40 ? 'bruised, wary' : 'unusually open'

  let ctx = `CHARACTER: ${characterName}

CURRENT INTERNAL STATE:
The Mask (public persona integrity): ${trackers.mask}/100 — ${maskDesc}
The Dagger (infernal pressure / whisper frequency): ${trackers.dagger}/100 — ${daggerDesc}
The Bottle (appetite for oblivion): ${trackers.bottle}/100 — ${bottleDesc}
The Wound (damage / capacity for connection): ${trackers.wound}/100 — ${woundDesc}`

  if (recentEvents && recentEvents.length > 0) {
    ctx += '\n\nRECENT EVENTS (most recent last):\n'
    recentEvents.slice(-5).forEach((e, i) => { ctx += `${i + 1}. ${e}\n` })
  }

  return ctx
}

async function logError(params: {
  userId?: string
  characterId?: string
  screen?: string
  action?: string
  error: unknown
  appState?: Record<string, unknown>
}) {
  try {
    const supabase = await createServiceClient()
    const err = params.error instanceof Error ? params.error : new Error(String(params.error))
    await supabase.from('error_logs').insert({
      user_id: params.userId,
      character_id: params.characterId,
      screen: params.screen,
      action: params.action,
      error_type: err.name,
      error_message: err.message,
      stack_trace: err.stack,
      app_state: params.appState as never,
    })
  } catch {}
}

export async function generatePlayDirective(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  recentEvents?: string[]
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      system: `You are a character performance director for tabletop RPG. You give precise, behavioral instructions to players.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `${ctx}

Generate ONE behavioral play directive. Exactly one sentence. Maximum 12 words. Always starts with "Play him" or "Play her" or "Play them". Present tense. Behavioral, not descriptive. No explanation.

Single sentence. Starts with "Play". Twelve words maximum.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || 'Play him like the performance is the only thing holding him together.'
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'now', action: 'generatePlayDirective', error })
    return 'Play him like the performance is the only thing holding him together.'
  }
}

export async function generateEventNarrative(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  category: string
  subcategory: string
  reaction: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You are writing internal narrative for a tabletop RPG character. Third person, past tense, specific and behavioral.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `${ctx}

EVENT: ${params.category} / ${params.subcategory}
REACTION: ${params.reaction}

Write ONE sentence of internal narrative for this moment. Third person. Past tense. Behavioral and specific — what he actually did or felt, not what it means. Maximum 25 words. No quotes around the sentence.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || `He moved through it the way he always did — with enough performance to cover the fact that something had shifted.`
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'session', action: 'generateEventNarrative', error })
    return `He moved through it the way he always did — with enough performance to cover the fact that something had shifted.`
  }
}

export async function generateLongRestMonologue(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  drank: boolean
  dreamed: boolean
  recentEvents?: string[]
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents)
    const restContext = `Did he drink tonight: ${params.drank ? 'Yes' : 'No'}. Did he dream: ${params.dreamed ? 'Yes' : 'No'}.`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are writing waking monologue for a tabletop RPG character. First person, present tense, internal and honest.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `${ctx}

${restContext}

Write a "waking into this day" paragraph. First person. Present tense. 3-4 sentences. Internal — what he notices upon waking, what he carries into this day. Honest and specific. References recent events if relevant.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || `I wake with the familiar weight of yesterday still on my chest. Whatever happened, it stays with me.`
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'session', action: 'generateLongRestMonologue', error })
    return `I wake with the familiar weight of yesterday still on my chest. Whatever happened, it stays with me.`
  }
}

export async function generateClueNarrative(params: {
  characterName: string
  dossierSummary: string
  sourceType: string
  rawText: string
  existingBelief?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<{ narrative: string; updatedBelief: string }> {
  try {
    const client = buildClient(params.apiKey)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: `You are writing clue responses for a tabletop RPG character. Third person. Internal and specific.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}
CLUE SOURCE: ${params.sourceType}
NEW CLUE: ${params.rawText}
CURRENT BELIEF: ${params.existingBelief || 'Nothing established yet.'}

Part 1 — NARRATIVE (1-2 sentences): How does he receive this clue? What does it do to him internally?
Part 2 — UPDATED BELIEF (1 paragraph): Rewrite what he currently believes about the central mystery, incorporating this new clue. Write in third person, present tense, as a living synthesis.

Format exactly:
NARRATIVE: [1-2 sentences]
BELIEF: [1 paragraph]`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const narrativeMatch = text.match(/NARRATIVE:\s*([\s\S]+?)(?=\nBELIEF:|$)/)
    const beliefMatch = text.match(/BELIEF:\s*([\s\S]+?)$/)
    return {
      narrative: narrativeMatch ? narrativeMatch[1].trim() : 'The clue lands with weight.',
      updatedBelief: beliefMatch ? beliefMatch[1].trim() : params.existingBelief || 'The picture is still forming.',
    }
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'journey', action: 'generateClueNarrative', error })
    return { narrative: 'The clue lands with weight.', updatedBelief: params.existingBelief || 'The picture is still forming.' }
  }
}

export async function generateRelationshipNarrative(params: {
  characterName: string
  dossierSummary: string
  npcName: string
  momentType: string
  rawText: string
  currentState?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<{ narrative: string; trustDirection: string; updatedState: string }> {
  try {
    const client = buildClient(params.apiKey)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: `You are writing relationship moments for a tabletop RPG character. Third person. Honest and specific.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}
NPC: ${params.npcName}
MOMENT TYPE: ${params.momentType}
WHAT HAPPENED: ${params.rawText}
CURRENT RELATIONSHIP STATE: ${params.currentState || 'Not yet established.'}

Part 1 — NARRATIVE (1-2 sentences): What happened between them, from his internal perspective?
Part 2 — TRUST DIRECTION: Is this "Closer", "Further", or "Complicated"? One word only.
Part 3 — UPDATED STATE (1 paragraph): Where do things stand now between them? Third person, present tense.

Format exactly:
NARRATIVE: [1-2 sentences]
TRUST: [Closer/Further/Complicated]
STATE: [1 paragraph]`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const narrativeMatch = text.match(/NARRATIVE:\s*([\s\S]+?)(?=\nTRUST:|$)/)
    const trustMatch = text.match(/TRUST:\s*(\w+)/)
    const stateMatch = text.match(/STATE:\s*([\s\S]+?)$/)
    const trust = trustMatch ? trustMatch[1].trim().toLowerCase() : 'complicated'
    return {
      narrative: narrativeMatch ? narrativeMatch[1].trim() : 'Something shifted between them.',
      trustDirection: ['closer', 'further', 'complicated'].includes(trust) ? trust : 'complicated',
      updatedState: stateMatch ? stateMatch[1].trim() : params.currentState || 'Things are complicated.',
    }
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'journey', action: 'generateRelationshipNarrative', error })
    return { narrative: 'Something shifted between them.', trustDirection: 'complicated', updatedState: params.currentState || 'Things are complicated.' }
  }
}

export async function generatePrepText(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  recentEvents?: string[]
  cluesSummary?: string
  relationshipSummaries?: string[]
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents)
    let extraCtx = ''
    if (params.cluesSummary) extraCtx += `\nCURRENT MYSTERY BELIEF:\n${params.cluesSummary}`
    if (params.relationshipSummaries?.length) extraCtx += `\nRELATIONSHIPS:\n${params.relationshipSummaries.join('\n')}`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are writing pre-session character prep for a tabletop RPG player. First person, present tense, honest and specific. This is how the character feels walking into the next scene.
Character dossier: ${params.dossierSummary}`,
      messages: [{
        role: 'user',
        content: `${ctx}${extraCtx}

Write 150-200 words of prep text. First person. Present tense. How he's walking into the next session — what he's carrying, what he wants, what he's afraid of, what he's performing. Reference specific events and relationships. End with one behavioral anchor sentence.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || 'I carry yesterday with me. Whatever comes next, I\'ll handle it the way I always do.'
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'journey', action: 'generatePrepText', error })
    return 'I carry yesterday with me. Whatever comes next, I\'ll handle it the way I always do.'
  }
}

export async function analyzeDossier(params: {
  dossierText: string
  apiKey?: string
}): Promise<{
  characterName: string
  voiceSummary: string
  trackerNames: { mask: string; dagger: string; bottle: string; wound: string }
  emotionPalette: Array<{ key: string; label: string; desc: string }>
  colorScheme: { primary: string; secondary: string; accent: string }
  openingLine: string
  antagonistName: string
}> {
  try {
    const client = buildClient(params.apiKey)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: 'You are analyzing a tabletop RPG character dossier to extract character data for a psychological tracking app.',
      messages: [{
        role: 'user',
        content: `Analyze this character dossier and extract the following. Respond in valid JSON only, no explanation.

DOSSIER:
${params.dossierText}

Extract:
{
  "characterName": "character's name",
  "voiceSummary": "2-3 sentences capturing who this character is and how they operate, third person",
  "trackerNames": {
    "mask": "name for the public persona tracker (2-3 words)",
    "dagger": "name for the internal pressure/darkness tracker (2-3 words)",
    "bottle": "name for the self-medication/escapism tracker (2-3 words)",
    "wound": "name for the emotional damage/walls tracker (2-3 words)"
  },
  "emotionPalette": [
    {"key": "charming", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"},
    {"key": "volatile", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"},
    {"key": "reckless", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"},
    {"key": "withdrawn", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"},
    {"key": "guarded", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"},
    {"key": "present", "label": "STATE_NAME", "desc": "8-word behavioral descriptor"}
  ],
  "colorScheme": {
    "primary": "#hex based on character themes",
    "secondary": "#hex complementary",
    "accent": "#hex accent"
  },
  "openingLine": "A single sentence in character voice welcoming them to the app — first person, specific to this character's voice",
  "antagonistName": "name of the central antagonist or mystery figure (or 'the mystery' if unclear)"
}`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    throw new Error('No JSON in response')
  } catch {
    return {
      characterName: 'Unknown Character',
      voiceSummary: 'A complex individual navigating a difficult world.',
      trackerNames: { mask: 'The Mask', dagger: 'The Dagger', bottle: 'The Bottle', wound: 'The Wound' },
      emotionPalette: [
        { key: 'charming', label: 'CHARMING', desc: 'The performance is intact' },
        { key: 'volatile', label: 'VOLATILE', desc: 'The pressure is getting loud' },
        { key: 'reckless', label: 'RECKLESS', desc: 'The bottle is speaking' },
        { key: 'withdrawn', label: 'WITHDRAWN', desc: 'The mask is slipping' },
        { key: 'guarded', label: 'GUARDED', desc: 'The wound is talking' },
        { key: 'present', label: 'PRESENT', desc: 'He is here, right now' },
      ],
      colorScheme: { primary: '#c9a84c', secondary: '#8b6a30', accent: '#f0e6d3' },
      openingLine: 'The work begins. Let\'s see who you become.',
      antagonistName: 'the mystery',
    }
  }
}

export async function generateDMPartyBrief(params: {
  campaignName: string
  characters: Array<{
    name: string
    playDirective: string
    trackers: { mask: number; dagger: number; bottle: number; wound: number }
    recentEvents?: string[]
  }>
  apiKey?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const charSummaries = params.characters.map(c => {
      const ctx = buildContextBlock(c.trackers, c.name, c.recentEvents)
      return `${ctx}\nCURRENT DIRECTIVE: ${c.playDirective}`
    }).join('\n\n---\n\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'You are a DM tool that generates pre-session party briefs. Specific, actionable, based on current character states.',
      messages: [{
        role: 'user',
        content: `CAMPAIGN: ${params.campaignName}

CHARACTER STATES:
${charSummaries}

Generate a pre-session party brief. For each character: their current emotional state in one sentence. Then: tensions between characters based on their states. Then: 2-3 narrative hooks that would naturally engage the party's current states. 300 words maximum.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || 'Party is ready for the next session.'
  } catch {
    return 'Party is ready for the next session.'
  }
}
