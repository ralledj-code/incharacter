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
  stateValues: Record<string, number>,
  emotionPalette: Array<{ id: string; name: string; base_value: number }>,
  characterName: string,
  recentEvents?: string[]
): string {
  let ctx = `CHARACTER: ${characterName}\n\nCURRENT PSYCHOLOGICAL STATE:\n`

  emotionPalette.forEach(state => {
    const val = stateValues[state.id] ?? state.base_value
    const desc = val > 70 ? 'high' : val > 40 ? 'moderate' : 'low'
    ctx += `${state.name}: ${val}/100 (${desc})\n`
  })

  if (recentEvents && recentEvents.length > 0) {
    ctx += '\nRECENT EVENTS:\n'
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
  stateValues: Record<string, number>
  emotionPalette: Array<{ id: string; name: string; description: string; base_value: number }>
  recentEvents?: string[]
  dominantState?: { label: string; desc: string }
  previousDirective?: string
  currentEvent?: { category: string; subcategory: string; reaction: string }
  previousEvent?: { category: string; subcategory: string; reaction: string }
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<{ directive: string; dmRead: string; stateChanges: Record<string, number> }> {
  try {
    const client = buildClient(params.apiKey)

    const prevEventLine = params.previousEvent
      ? `Previous event: ${params.previousEvent.category} — ${params.previousEvent.subcategory} — ${params.previousEvent.reaction}`
      : ''
    const currEventLine = params.currentEvent
      ? `Current event: ${params.currentEvent.category} — ${params.currentEvent.subcategory} — ${params.currentEvent.reaction}`
      : ''
    const dominantNote = params.dominantState
      ? `Current dominant state: ${params.dominantState.label} — ${params.dominantState.desc}`
      : ''

    const paletteIds = params.emotionPalette.map(s => `"${s.id}" (${s.name})`).join(', ')
    const paletteNote = `Emotion state IDs for state_changes (use these exact IDs): ${paletteIds}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You are a character performance director for tabletop RPG.\nRULES: Never invent plot. Only reference psychological patterns from dossier and current state.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${prevEventLine}\n${currEventLine}\n${dominantNote}\n${paletteNote}\n\nRespond with ONLY a valid JSON object. No markdown, no code fences, no explanation. All three fields are required.\n{\n  "play_directive": "one sentence, max 12 words, starts with Play them or Play ${params.characterName}, present tense, reflects both events if both present",\n  "dm_read": "one sentence, DM-only, what this character is about to do or what to watch, psychological not narrative",\n  "state_changes": {}\n}\n\ndm_read is REQUIRED. Never omit it. Never set it to null.\nstate_changes: if emotion palette IDs provided, use them. Values -10 to +10. Include 2-4 states. If no palette, use {}.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    console.log('CLAUDE RAW:', text)
    let directive = `Play ${params.characterName} true to their current state.`
    let dmRead = `${params.characterName} is in a heightened state. Watch the patterns.`
    let stateChanges: Record<string, number> = {}
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.play_directive) directive = parsed.play_directive
        if (parsed.dm_read) dmRead = parsed.dm_read
        if (parsed.state_changes && typeof parsed.state_changes === 'object') {
          stateChanges = parsed.state_changes
        }
      }
    } catch {}
    return { directive, dmRead, stateChanges }
  } catch (error) {
    await logError({ userId: params.userId, characterId: params.characterId, screen: 'now', action: 'generatePlayDirective', error })
    return {
      directive: `Play ${params.characterName} true to their current state.`,
      dmRead: `${params.characterName} is in a heightened state. Watch the patterns.`,
      stateChanges: {},
    }
  }
}

export async function generateEventNarrative(params: {
  characterName: string
  dossierSummary: string
  stateValues: Record<string, number>
  emotionPalette: Array<{ id: string; name: string; base_value: number }>
  category: string
  subcategory: string
  reaction: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.stateValues, params.emotionPalette, params.characterName)
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: `You write one-sentence psychological event narratives for tabletop RPG characters. Third person, past tense. Behavioral and specific — what the character did or felt, not interpretation.\nRULES: Never invent plot. Only describe the psychological moment from the dossier and state context.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}\n\nEVENT: ${params.category} / ${params.subcategory}\nREACTION: ${params.reaction}\n\nONE sentence. Third person. Past tense. Behavioral — what they did or felt. Maximum 25 words. No quotes.`
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
  stateValues: Record<string, number>
  emotionPalette: Array<{ id: string; name: string; base_value: number }>
  drank: boolean
  dreamed: boolean
  recentEvents?: string[]
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.stateValues, params.emotionPalette, params.characterName, params.recentEvents)
    const restContext = `Rest details: ${params.drank ? 'drank' : 'did not drink'}. ${params.dreamed ? 'Dreamed.' : 'No dreams.'}`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `You write first-person waking monologues for tabletop RPG characters. Internal, honest, present tense.\nRULES: Never invent plot. Only reference psychological state from dossier and tracker values.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}\n${restContext}\n\nWrite a "waking into this day" internal monologue. First person. Present tense. 3-4 sentences. What they notice, what they carry. Honest and specific to their psychological state. No story invention.`
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
      system: `You write clue responses for tabletop RPG characters. Third person. Internal and specific.\nRULES: Never invent plot. Only describe how the character psychologically processes the clue they received.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}\nCLUE SOURCE: ${params.sourceType}\nNEW CLUE: ${params.rawText}\nCURRENT BELIEF ABOUT ${params.boardSubject || 'the mystery'}: ${params.existingBelief || 'Nothing established yet.'}\n\nPart 1 — NARRATIVE (1-2 sentences): How does ${params.characterName} receive this clue psychologically? Behavioral, not interpretive.\nPart 2 — UPDATED BELIEF (1 paragraph): What does ${params.characterName} now believe about ${params.boardSubject || 'the mystery'}, incorporating this clue? Third person, present tense.\n\nFormat:\nNARRATIVE: [sentences]\nBELIEF: [paragraph]`
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
      system: `You write relationship moment narratives for tabletop RPG characters. Third person. Honest and specific.\nRULES: Never invent plot. Describe the psychological impact of the moment based only on what happened.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `CHARACTER: ${params.characterName}\nNPC: ${params.npcName}\nMOMENT TYPE: ${params.momentType}\nWHAT HAPPENED: ${params.rawText}\nCURRENT RELATIONSHIP STATE: ${params.currentState || 'Not yet established.'}\n\nPart 1 — NARRATIVE (1-2 sentences): What happened psychologically for ${params.characterName} in this moment with ${params.npcName}?\nPart 2 — TRUST DIRECTION: "Closer", "Further", or "Complicated"? One word only.\nPart 3 — UPDATED STATE (1 paragraph): Where do things stand now? Third person, present tense.\n\nFormat:\nNARRATIVE: [sentences]\nTRUST: [word]\nSTATE: [paragraph]`
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
  stateValues: Record<string, number>
  emotionPalette: Array<{ id: string; name: string; base_value: number }>
  recentEvents?: string[]
  cluesSummary?: string
  relationshipSummaries?: string[]
  boardSubject?: string
  apiKey?: string
  userId?: string
  characterId?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const ctx = buildContextBlock(params.stateValues, params.emotionPalette, params.characterName, params.recentEvents)
    let extraCtx = ''
    if (params.cluesSummary) extraCtx += `\nCURRENT BELIEF ABOUT ${params.boardSubject || 'the mystery'}:\n${params.cluesSummary}`
    if (params.relationshipSummaries?.length) extraCtx += `\nRELATIONSHIPS:\n${params.relationshipSummaries.join('\n')}`
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You write pre-session character prep for tabletop RPG players. First person, present tense. Honest and specific.\nRULES: Never invent plot. Only reference psychological patterns from dossier and logged state.\nCharacter dossier: ${params.dossierSummary || 'No dossier provided.'}`,
      messages: [{
        role: 'user',
        content: `${ctx}${extraCtx}\n\nWrite 150-200 words of prep text as ${params.characterName}. First person. Present tense. What they carry into the next session — psychological state, what they want, what they're guarding, what they're performing. Specific to this character's dossier. End with one behavioral anchor sentence about how to play them.`
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
  emotion_palette: Array<{ id: string; name: string; description: string; base_value: number }>
  event_weights: Record<string, Record<string, number>>
}

export async function analyzeDossier(params: {
  dossierText: string
  interview?: InterviewAnswers
  apiKey?: string
}): Promise<{
  characterName: string
  voiceSummary: string
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
    dangerous_element_category: { id: 'special', icon: '✝', name: 'The Unknown', description: 'a surge, whisper, or moment of uncontrolled power', tracker_weights: { state_2: 10, state_1: -4 } },
    antagonist_category: { id: 'antagonist', icon: '🔍', name: 'The Mystery', description: 'clue, sighting, connection to the antagonist', tracker_weights: { state_2: 5, state_5: 8 } },
    key_relationships: [],
    clue_board_name: 'The Mystery',
    clue_board_subject: 'the antagonist',
    color_scheme_suggestion: 'warm',
    emotion_palette: [
      { id: 'state_1', name: 'Controlled', description: 'Measured, careful, holding everything together', base_value: 40 },
      { id: 'state_2', name: 'Volatile', description: 'Pressure rising, edges starting to show', base_value: 30 },
      { id: 'state_3', name: 'Reckless', description: 'Past caution, acting without thinking ahead', base_value: 35 },
      { id: 'state_4', name: 'Withdrawn', description: 'Closed off, minimizing contact and exposure', base_value: 25 },
      { id: 'state_5', name: 'Guarded', description: 'Watching, trusting no one fully right now', base_value: 45 },
      { id: 'state_6', name: 'Present', description: 'Grounded, clear, fully here in this moment', base_value: 50 },
    ],
    event_weights: {
      violence:     { state_2: 8,  state_1: -3 },
      performance:  { state_1: -5, state_6: 6  },
      avoided:      { state_4: 7,  state_5: -4 },
      indulged:     { state_3: 8,  state_2: 5  },
      opened_up:    { state_6: 10, state_4: -6 },
      crossed_line: { state_2: 9,  state_3: 6  },
      antagonist:   { state_5: 8,  state_2: 5  },
      special:      { state_4: -4, state_6: 10 },
    },
  }

  try {
    const client = buildClient(params.apiKey)
    const interviewBlock = params.interview ? `\nINTERVIEW ANSWERS:\n- Core motivation: ${params.interview.core_motivation}\n- Antagonist: ${params.interview.antagonist ? `${params.interview.antagonist.name} — ${params.interview.antagonist.relationship}` : 'none yet'}\n- Primary ally: ${params.interview.primary_ally ? `${params.interview.primary_ally.name} (${params.interview.primary_ally.role})` : 'no one yet'}\n- Dangerous element: ${params.interview.dangerous_element ? params.interview.dangerous_element.name : 'none'}\n- Stress responses: ${params.interview.stress_responses.join(', ') || 'not specified'}\n` : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: 'You analyze tabletop RPG character dossiers to extract psychological profile data. Respond ONLY in valid JSON. Never invent plot. Base everything on what is in the dossier.',
      messages: [{
        role: 'user',
        content: `DOSSIER:\n${params.dossierText}\n${interviewBlock}\n\nExtract character data. Return ONLY this JSON:\n{\n  "characterName": "character's name from dossier",\n  "voiceSummary": "2-3 sentences, third person, psychological patterns only",\n  "colorSchemeSuggestion": "warm|dark|slate|forest|ink",\n  "openingLine": "first-person sentence in this specific character's voice",\n  "antagonistName": "antagonist name or 'the mystery'",\n  "dangerous_element_category": {\n    "id": "special",\n    "icon": "✝",\n    "name": "name for this character's dangerous element category",\n    "description": "what this category tracks for this character",\n    "tracker_weights": {"state_2": 10, "state_1": -4}\n  },\n  "antagonist_category": {\n    "id": "antagonist",\n    "icon": "🔍",\n    "name": "name for the antagonist/mystery category",\n    "description": "what this tracks for this character",\n    "tracker_weights": {"state_2": 5, "state_5": 8}\n  },\n  "key_relationships": [\n    {"name": "NPC name", "role": "role in character's life", "description": "one sentence"}\n  ],\n  "clue_board_name": "name for the mystery tracking board",\n  "clue_board_subject": "name of the antagonist or mystery being tracked",\n  "emotion_palette": [\n    {"id": "state_1", "name": "short state name", "description": "one sentence", "base_value": 40},\n    {"id": "state_2", "name": "short state name", "description": "one sentence", "base_value": 35},\n    {"id": "state_3", "name": "short state name", "description": "one sentence", "base_value": 30},\n    {"id": "state_4", "name": "short state name", "description": "one sentence", "base_value": 25},\n    {"id": "state_5", "name": "short state name", "description": "one sentence", "base_value": 20},\n    {"id": "state_6", "name": "short state name", "description": "one sentence", "base_value": 15}\n  ],\n  "event_weights": {\n    "violence":     {"state_1": 8,  "state_2": -4},\n    "performance":  {"state_1": -5, "state_3": 7 },\n    "avoided":      {"state_4": 6,  "state_2": -3},\n    "indulged":     {"state_5": 9,  "state_1": -5},\n    "opened_up":    {"state_6": 10, "state_4": -6},\n    "crossed_line": {"state_2": 8,  "state_5": 5 },\n    "antagonist":   {"state_3": 7,  "state_2": 4 },\n    "special":      {"state_1": -4, "state_2": 10}\n  }\n}\n\nemotion_palette: six states derived from this character's specific psychology. IDs must be exactly state_1 through state_6. base_value between 15-50.\nevent_weights: use the actual state IDs from your emotion_palette above. Values -10 to +10. Each category must have exactly 2 state IDs with non-zero weights. No other fields. No markdown.`
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
      emotion_palette: parsed.emotion_palette || fallbackConfig.emotion_palette,
      event_weights: parsed.event_weights || fallbackConfig.event_weights,
    }

    return {
      characterName: parsed.characterName || 'Unknown Character',
      voiceSummary: parsed.voiceSummary || '',
      colorScheme: { primary: '#9b7e4e', secondary: '#7a6038', accent: '#f0e6d3' },
      openingLine: parsed.openingLine || 'The work begins.',
      antagonistName: parsed.antagonistName || 'the mystery',
      characterConfig: config,
    }
  } catch {
    return {
      characterName: 'Unknown Character',
      voiceSummary: 'A complex individual navigating a difficult world.',
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
    stateValues: Record<string, number>
    emotionPalette: Array<{ id: string; name: string; base_value: number }>
    recentEvents?: string[]
  }>
  apiKey?: string
}): Promise<string> {
  try {
    const client = buildClient(params.apiKey)
    const charSummaries = params.characters.map(c => {
      const ctx = buildContextBlock(c.stateValues, c.emotionPalette, c.name, c.recentEvents)
      return `${ctx}\nCURRENT DIRECTIVE: ${c.playDirective}`
    }).join('\n\n---\n\n')

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: 'You generate pre-session party briefs for DMs. Specific, actionable, based only on character states provided. Never invent plot.',
      messages: [{
        role: 'user',
        content: `CAMPAIGN: ${params.campaignName}\n\nCHARACTER STATES:\n${charSummaries}\n\nGenerate a pre-session party brief. For each character: their current psychological state in one sentence. Then: psychological tensions between characters. Then: 2-3 narrative hooks suggested by the current states. 300 words maximum.`
      }]
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    return text || 'Party is ready for the next session.'
  } catch {
    return 'Party is ready for the next session.'
  }
}
