'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from './supabase/server'

function buildClient(apiKey?: string) {
  return new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })
}

/**
 * Build context block from live data only.
 * NO hardcoded character names, tracker names, or story references.
 * Tracker names come from tracker_config when available.
 */
function buildContextBlock(
  trackers: { mask: number; dagger: number; bottle: number; wound: number },
  characterName: string,
  recentEvents?: string[],
  trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
): string {
  const t1 = trackerNames?.mask || 'Tracker 1 (public persona)'
  const t2 = trackerNames?.dagger || 'Tracker 2 (internal pressure)'
  const t3 = trackerNames?.bottle || 'Tracker 3 (self-medication)'
  const t4 = trackerNames?.wound || 'Tracker 4 (emotional openness)'

  const desc1 = trackers.mask > 70 ? 'high' : trackers.mask > 40 ? 'moderate' : 'low'
  const desc2 = trackers.dagger > 70 ? 'high' : trackers.dagger > 40 ? 'moderate' : 'low'
  const desc3 = trackers.bottle > 70 ? 'high' : trackers.bottle > 40 ? 'moderate' : 'low'
  const desc4 = trackers.wound > 70 ? 'high' : trackers.wound > 40 ? 'moderate' : 'low'

  let ctx = `CHARACTER: ${characterName}

CURRENT PSYCHOLOGICAL STATE:
${t1}: ${trackers.mask}/100 (${desc1})
${t2}: ${trackers.dagger}/100 (${desc2})
${t3}: ${trackers.bottle}/100 (${desc3})
${t4}: ${trackers.wound}/100 (${desc4})`

  if (recentEvents && recentEvents.length > 0) {
    ctx += '\n\nRECENT EVENTS:\n'
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
    })
  } catch {}
}

export async function generatePlayDirective(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  recentEvents?: string[]
  trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
  dominantState?: { label: string; desc: string }
  previousDirective?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<{ directive: string; dmRead: string }> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents, params.trackerNames)
    const dominantNote = params.dominantState
      ? `
DOMINANT STATE: ${params.dominantState.label} — ${params.dominantState.desc}`
      : ''
    const prevNote = params.previousDirective
      ? `
PREVIOUS DIRECTIVE: "${params.previousDirective}" — evolve this subtly.`
      : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `You are a character performance director for tabletop RPG. Two outputs required.
RULES: Never invent plot. Only reference psychological patterns from dossier and current state.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}${dominantNote}${prevNote}

Generate two outputs in this exact format:

DIRECTIVE: [one sentence, max 12 words, starts with "Play them" or "Play ${params.characterName}", present tense, behavioral]
DM_READ: [one or two sentences, DM perspective only, what this character is about to do or what to watch for, pure psychological read, no story invention]`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    const directiveLine = text.split('\n').find(l => l.startsWith('DIRECTIVE:'))
    const dmReadLine = text.split('\n').find(l => l.startsWith('DM_READ:'))
    const directive = directiveLine?.replace(/^DIRECTIVE:\s*/i, '').trim()
      || `Play ${params.characterName} true to their current state.`
    const dmRead = dmReadLine?.replace(/^DM_READ:\s*/i, '').trim()
      || `${params.characterName} is in a heightened state. Watch the patterns.`
    return { directive, dmRead }
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'now', action: 'generatePlayDirective', error })
    return {
      directive: `Play ${params.characterName} true to their current state.`,
      dmRead: `${params.characterName} is in a heightened state. Watch the patterns.`,
    }
  }
}

export async function generateEventNarrative(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  category: string
  subcategory: string
  reaction: string
  trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, undefined, params.trackerNames)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You write one-sentence psychological event narratives for tabletop RPG characters. Third person, past tense. Behavioral and specific — what the character did or felt, not interpretation.
RULES: Never invent plot. Only describe the psychological moment from the dossier and state context.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}

EVENT: ${params.category} / ${params.subcategory}
REACTION: ${params.reaction}

ONE sentence. Third person. Past tense. Behavioral — what they did or felt. Maximum 25 words. No quotes.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || `${params.characterName} moved through it — performance holding, something shifting underneath.`
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'session', action: 'generateEventNarrative', error })
    return `${params.characterName} moved through it — something shifted underneath.`
  }
}

export async function generateLongRestMonologue(params: {
  characterName: string
  dossierSummary: string
  trackers: { mask: number; dagger: number; bottle: number; wound: number }
  drank: boolean
  dreamed: boolean
  recentEvents?: string[]
  trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents, params.trackerNames)
    const restContext = `Rest details: ${params.drank ? 'drank' : 'did not drink'}. ${params.dreamed ? 'Dreamed.' : 'No dreams.'}`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You write first-person waking monologues for tabletop RPG characters. Internal, honest, present tense.
RULES: Never invent plot. Only reference psychological state from dossier and tracker values.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}
${restContext}

Write a "waking into this day" internal monologue. First person. Present tense. 3-4 sentences. What they notice, what they carry. Honest and specific to their psychological state. No story invention.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || `Another day. The weight from last session is still here. Something is different, but I haven't named it yet.`
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'session', action: 'generateLongRestMonologue', error })
    return `Another day. The weight from last session is still here.`
  }
}

export async function generateClueNarrative(params: {
  characterName: string
  dossierSummary: string
  sourceType: string
  rawText: string
  existingBelief?: string
  boardSubject?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<{ narrative: string; updatedBelief: string }> {
  try {
    const client = buildClient(params.apiKey)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: `You write clue responses for tabletop RPG characters. Third person. Internal and specific.
RULES: Never invent plot. Only describe how the character psychologically processes the clue they received.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}
CLUE SOURCE: ${params.sourceType}
NEW CLUE: ${params.rawText}
CURRENT BELIEF ABOUT ${params.boardSubject || 'the mystery'}: ${params.existingBelief || 'Nothing established yet.'}

Part 1 — NARRATIVE (1-2 sentences): How does ${params.characterName} receive this clue psychologically? Behavioral, not interpretive.
Part 2 — UPDATED BELIEF (1 paragraph): What does ${params.characterName} now believe about ${params.boardSubject || 'the mystery'}, incorporating this clue? Third person, present tense.

Format:
NARRATIVE: [sentences]
BELIEF: [paragraph]`
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
      system: `You write relationship moment narratives for tabletop RPG characters. Third person. Honest and specific.
RULES: Never invent plot. Describe the psychological impact of the moment based only on what happened.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}
NPC: ${params.npcName}
MOMENT TYPE: ${params.momentType}
WHAT HAPPENED: ${params.rawText}
CURRENT RELATIONSHIP STATE: ${params.currentState || 'Not yet established.'}

Part 1 — NARRATIVE (1-2 sentences): What happened psychologically for ${params.characterName} in this moment with ${params.npcName}?
Part 2 — TRUST DIRECTION: "Closer", "Further", or "Complicated"? One word only.
Part 3 — UPDATED STATE (1 paragraph): Where do things stand now? Third person, present tense.

Format:
NARRATIVE: [sentences]
TRUST: [word]
STATE: [paragraph]`
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
  trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
  boardSubject?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.trackers, params.characterName, params.recentEvents, params.trackerNames)
    let extraCtx = ''
    if (params.cluesSummary) extraCtx += `\nCURRENT BELIEF ABOUT ${params.boardSubject || 'the mystery'}:\n${params.cluesSummary}`
    if (params.relationshipSummaries?.length) extraCtx += `\nRELATIONSHIPS:\n${params.relationshipSummaries.join('\n')}`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You write pre-session character prep for tabletop RPG players. First person, present tense. Honest and specific.
RULES: Never invent plot. Only reference psychological patterns from dossier and logged state.
Character dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}${extraCtx}

Write 150-200 words of prep text as ${params.characterName}. First person. Present tense. What they carry into the next session — psychological state, what they want, what they're guarding, what they're performing. Specific to this character's dossier. End with one behavioral anchor sentence about how to play them.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || `I carry what happened into today. Whatever comes next, I'll meet it as myself.`
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'journey', action: 'generatePrepText', error })
    return `I carry what happened into today. Whatever comes next, I'll meet it as myself.`
  }
}

export interface InterviewAnswers {
  core_motivation: string
  antagonist: { name: string; relationship: string } | null
  primary_ally: { name: string; role: string } | null
  dangerous_element: { name: string } | null
  stress_responses: string[]
}

export interface CharacterConfig {
  core_motivation: string
  antagonist: { name: string; relationship: string } | null
  primary_ally: { name: string; role: string } | null
  dangerous_element: { name: string; exists: boolean } | null
  stress_responses: string[]
  dangerous_element_category: {
    id: string; icon: string; name: string; description: string
    tracker_weights: Record<string, number>
  }
  antagonist_category: {
    id: string; icon: string; name: string; description: string
    tracker_weights: Record<string, number>
  }
  key_relationships: Array<{ name: string; role: string; description: string }>
  clue_board_name: string
  clue_board_subject: string
  color_scheme_suggestion: string
  trackerNames: { mask: string; dagger: string; bottle: string; wound: string }
}

export async function analyzeDossier(params: {
  dossierText: string
  interview?: InterviewAnswers
  apiKey?: string
}): Promise<{
  characterName: string
  voiceSummary: string
  trackerNames: { mask: string; dagger: string; bottle: string; wound: string }
  emotionPalette: Array<{ key: string; label: string; desc: string }>
  colorScheme: { primary: string; secondary: string; accent: string }
  openingLine: string
  antagonistName: string
  characterConfig: CharacterConfig | null
}> {
  const fallbackConfig: CharacterConfig = {
    core_motivation: params.interview?.core_motivation || '',
    antagonist: params.interview?.antagonist || null,
    primary_ally: params.interview?.primary_ally || null,
    dangerous_element: params.interview?.dangerous_element ? { name: params.interview.dangerous_element.name, exists: true } : null,
    stress_responses: params.interview?.stress_responses || [],
    dangerous_element_category: { id: 'special', icon: '✝', name: 'The Unknown', description: 'a surge, whisper, or moment of uncontrolled power', tracker_weights: { dagger: 10, mask: -4 } },
    antagonist_category: { id: 'antagonist', icon: '🔍', name: 'The Mystery', description: 'clue, sighting, connection to the antagonist', tracker_weights: { dagger: 5, wound: 8 } },
    key_relationships: [],
    clue_board_name: 'The Mystery',
    clue_board_subject: 'the antagonist',
    color_scheme_suggestion: 'warm',
    trackerNames: { mask: 'The Mask', dagger: 'The Dagger', bottle: 'The Bottle', wound: 'The Wound' },
  }

  try {
    const client = buildClient(params.apiKey)
    const interviewBlock = params.interview ? `
INTERVIEW ANSWERS:
- Core motivation: ${params.interview.core_motivation}
- Antagonist: ${params.interview.antagonist ? `${params.interview.antagonist.name} — ${params.interview.antagonist.relationship}` : 'none yet'}
- Primary ally: ${params.interview.primary_ally ? `${params.interview.primary_ally.name} (${params.interview.primary_ally.role})` : 'no one yet'}
- Dangerous element: ${params.interview.dangerous_element ? params.interview.dangerous_element.name : 'none'}
- Stress responses: ${params.interview.stress_responses.join(', ') || 'not specified'}
` : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: 'You analyze tabletop RPG character dossiers to extract psychological profile data. Respond ONLY in valid JSON. Never invent plot. Base everything on what is in the dossier.',
      messages: [{
        role: 'user',
        content: `DOSSIER:\n${params.dossierText}\n${interviewBlock}

Extract character data. Return ONLY this JSON:
{
  "characterName": "character's name from dossier",
  "voiceSummary": "2-3 sentences, third person, psychological patterns only",
  "trackerNames": {
    "mask": "2-3 words for this character's public persona tracker",
    "dagger": "2-3 words for this character's internal pressure tracker",
    "bottle": "2-3 words for this character's self-medication tracker",
    "wound": "2-3 words for this character's emotional damage tracker"
  },
  "emotionPalette": [
    {"key": "charming", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"},
    {"key": "volatile", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"},
    {"key": "reckless", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"},
    {"key": "withdrawn", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"},
    {"key": "guarded", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"},
    {"key": "present", "label": "ALL_CAPS_LABEL", "desc": "8-word behavioral descriptor"}
  ],
  "colorSchemeSuggestion": "warm|dark|slate|forest|ink",
  "openingLine": "first-person sentence in this specific character's voice",
  "antagonistName": "antagonist name or 'the mystery'",
  "dangerous_element_category": {
    "id": "special",
    "icon": "✝",
    "name": "name for this character's dangerous element category",
    "description": "what this category tracks for this character",
    "tracker_weights": {"dagger": 10, "mask": -4}
  },
  "antagonist_category": {
    "id": "antagonist",
    "icon": "🔍",
    "name": "name for the antagonist/mystery category",
    "description": "what this tracks for this character",
    "tracker_weights": {"dagger": 5, "wound": 8}
  },
  "key_relationships": [
    {"name": "NPC name", "role": "role in character's life", "description": "one sentence"}
  ],
  "clue_board_name": "name for the mystery tracking board",
  "clue_board_subject": "name of the antagonist or mystery being tracked"
}`
      }]
    })
    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    const parsed = JSON.parse(jsonMatch[0])

    const config: CharacterConfig = {
      core_motivation: params.interview?.core_motivation || '',
      antagonist: params.interview?.antagonist || null,
      primary_ally: params.interview?.primary_ally || null,
      dangerous_element: params.interview?.dangerous_element ? { name: params.interview.dangerous_element.name, exists: true } : null,
      stress_responses: params.interview?.stress_responses || [],
      dangerous_element_category: parsed.dangerous_element_category || fallbackConfig.dangerous_element_category,
      antagonist_category: parsed.antagonist_category || fallbackConfig.antagonist_category,
      key_relationships: parsed.key_relationships || [],
      clue_board_name: parsed.clue_board_name || 'The Mystery',
      clue_board_subject: parsed.clue_board_subject || parsed.antagonistName || 'the antagonist',
      color_scheme_suggestion: parsed.colorSchemeSuggestion || 'warm',
      trackerNames: parsed.trackerNames || fallbackConfig.trackerNames,
    }

    return {
      characterName: parsed.characterName || 'Unknown Character',
      voiceSummary: parsed.voiceSummary || '',
      trackerNames: parsed.trackerNames || fallbackConfig.trackerNames,
      emotionPalette: parsed.emotionPalette || [],
      colorScheme: { primary: '#9b7e4e', secondary: '#7a6038', accent: '#f0e6d3' },
      openingLine: parsed.openingLine || 'The work begins.',
      antagonistName: parsed.antagonistName || 'the mystery',
      characterConfig: config,
    }
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
        { key: 'present', label: 'PRESENT', desc: 'Present, here, right now' },
      ],
      colorScheme: { primary: '#9b7e4e', secondary: '#7a6038', accent: '#f0e6d3' },
      openingLine: "The work begins. Let's see who you become.",
      antagonistName: 'the mystery',
      characterConfig: fallbackConfig,
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
    trackerNames?: { mask?: string; dagger?: string; bottle?: string; wound?: string }
  }>
  apiKey?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const charSummaries = params.characters.map(c => {
      const ctx = buildContextBlock(c.trackers, c.name, c.recentEvents, c.trackerNames)
      return `${ctx}\nCURRENT DIRECTIVE: ${c.playDirective}`
    }).join('\n\n---\n\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'You generate pre-session party briefs for DMs. Specific, actionable, based only on character states provided. Never invent plot.',
      messages: [{
        role: 'user',
        content: `CAMPAIGN: ${params.campaignName}

CHARACTER STATES:
${charSummaries}

Generate a pre-session party brief. For each character: their current psychological state in one sentence. Then: psychological tensions between characters. Then: 2-3 narrative hooks suggested by the current states. 300 words maximum.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || 'Party is ready for the next session.'
  } catch {
    return 'Party is ready for the next session.'
  }
}
