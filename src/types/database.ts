export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          role: 'player' | 'dm' | 'admin' | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          role?: 'player' | 'dm' | 'admin' | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          role?: 'player' | 'dm' | 'admin' | null
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          dm_id: string
          name: string
          description: string | null
          created_at: string
          archived: boolean
        }
        Insert: {
          id?: string
          dm_id: string
          name: string
          description?: string | null
          created_at?: string
          archived?: boolean
        }
        Update: {
          id?: string
          dm_id?: string
          name?: string
          description?: string | null
          created_at?: string
          archived?: boolean
        }
      }
      campaign_members: {
        Row: {
          campaign_id: string
          player_id: string
          invited_at: string
          accepted: boolean
        }
        Insert: {
          campaign_id: string
          player_id: string
          invited_at?: string
          accepted?: boolean
        }
        Update: {
          campaign_id?: string
          player_id?: string
          invited_at?: string
          accepted?: boolean
        }
      }
      characters: {
        Row: {
          id: string
          player_id: string
          campaign_id: string | null
          name: string
          dossier_text: string | null
          color_scheme: Json | null
          emotion_palette: Json | null
          tracker_config: Json | null
          api_key_encrypted: string | null
          portrait_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          campaign_id?: string | null
          name: string
          dossier_text?: string | null
          color_scheme?: Json | null
          emotion_palette?: Json | null
          tracker_config?: Json | null
          api_key_encrypted?: string | null
          portrait_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          campaign_id?: string | null
          name?: string
          dossier_text?: string | null
          color_scheme?: Json | null
          emotion_palette?: Json | null
          tracker_config?: Json | null
          api_key_encrypted?: string | null
          portrait_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracker_states: {
        Row: {
          id: string
          character_id: string
          mask: number
          dagger: number
          bottle: number
          wound: number
          play_directive: string | null
          glyph_states: Json | null
          state_values: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          character_id: string
          mask?: number
          dagger?: number
          bottle?: number
          wound?: number
          play_directive?: string | null
          glyph_states?: Json | null
          state_values?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          mask?: number
          dagger?: number
          bottle?: number
          wound?: number
          play_directive?: string | null
          glyph_states?: Json | null
          state_values?: Json | null
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          character_id: string
          session_number: number
          started_at: string
          ended_at: string | null
          waking_text: string | null
          long_rest_dream: boolean | null
          long_rest_drink: boolean | null
        }
        Insert: {
          id?: string
          character_id: string
          session_number: number
          started_at?: string
          ended_at?: string | null
          waking_text?: string | null
          long_rest_dream?: boolean | null
          long_rest_drink?: boolean | null
        }
        Update: {
          id?: string
          character_id?: string
          session_number?: number
          started_at?: string
          ended_at?: string | null
          waking_text?: string | null
          long_rest_dream?: boolean | null
          long_rest_drink?: boolean | null
        }
      }
      events: {
        Row: {
          id: string
          session_id: string
          character_id: string
          category: string
          subcategory: string
          reaction: string
          narrative: string | null
          tracker_delta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          character_id: string
          category: string
          subcategory: string
          reaction: string
          narrative?: string | null
          tracker_delta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          character_id?: string
          category?: string
          subcategory?: string
          reaction?: string
          narrative?: string | null
          tracker_delta?: Json | null
          created_at?: string
        }
      }
      clues: {
        Row: {
          id: string
          character_id: string
          source_type: string
          raw_text: string
          narrative: string | null
          current_belief: string | null
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          source_type: string
          raw_text: string
          narrative?: string | null
          current_belief?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          source_type?: string
          raw_text?: string
          narrative?: string | null
          current_belief?: string | null
          created_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          character_id: string
          npc_name: string
          moment_type: string
          trust_direction: string | null
          raw_text: string | null
          narrative: string | null
          current_state: string | null
          created_at: string
        }
        Insert: {
          id?: string
          character_id: string
          npc_name: string
          moment_type: string
          trust_direction?: string | null
          raw_text?: string | null
          narrative?: string | null
          current_state?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          character_id?: string
          npc_name?: string
          moment_type?: string
          trust_direction?: string | null
          raw_text?: string | null
          narrative?: string | null
          current_state?: string | null
          created_at?: string
        }
      }
      error_logs: {
        Row: {
          id: string
          user_id: string | null
          character_id: string | null
          screen: string | null
          action: string | null
          error_type: string | null
          error_message: string | null
          stack_trace: string | null
          app_state: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          character_id?: string | null
          screen?: string | null
          action?: string | null
          error_type?: string | null
          error_message?: string | null
          stack_trace?: string | null
          app_state?: Json | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['error_logs']['Insert']>
      }
      session_replays: {
        Row: {
          id: string
          session_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          event_type: string
          event_data: Json
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['session_replays']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Character = Database['public']['Tables']['characters']['Row']
export type TrackerState = Database['public']['Tables']['tracker_states']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type Clue = Database['public']['Tables']['clues']['Row']
export type Relationship = Database['public']['Tables']['relationships']['Row']
export type ErrorLog = Database['public']['Tables']['error_logs']['Row']
