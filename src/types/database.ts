export interface Profile {
  id: string
  character_name: string | null
  character_note: string | null
  api_key_encrypted: string | null
  color_scheme: string | null
  dm_email: string | null
  created_at?: string
}

export interface FeedbackCategory {
  stars: number
  comment?: string
}

export interface FeedbackData {
  combat: FeedbackCategory
  roleplay: FeedbackCategory
  world: FeedbackCategory
  party: FeedbackCategory
  whatWorked: string
  nextTime: string
}

export interface Session {
  id: string
  player_id: string
  character_name: string | null
  title: string | null
  summary: string | null
  feedback: FeedbackData | null
  created_at: string
  ended_at: string | null
}

export interface Entry {
  id: string
  session_id: string
  player_id: string
  text: string
  icon: string | null
  category: string | null
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface SessionWithEntries extends Session {
  entries: Entry[]
}

export interface QuestThread {
  id: string
  player_id: string
  title: string
  summary: string | null
  urgency: 'urgent' | 'normal'
  status: 'active' | 'resolved' | 'dismissed'
  first_entry_id: string | null
  last_updated_session_id: string | null
  resolved_session_id: string | null
  created_at: string
  updated_at: string
}

export interface QuestThreadUpdate {
  id: string
  thread_id: string
  session_id: string | null
  entry_id: string | null
  update_text: string
  created_at: string
  sessions?: { title: string | null } | null
}

export interface QuestThreadWithUpdates extends QuestThread {
  updates: QuestThreadUpdate[]
}
