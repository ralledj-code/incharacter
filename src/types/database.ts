export interface Profile {
  id: string
  character_name: string | null
  character_note: string | null
  api_key_encrypted: string | null
  color_scheme: string | null
  created_at?: string
}

export interface Session {
  id: string
  player_id: string
  character_name: string | null
  title: string | null
  summary: string | null
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
