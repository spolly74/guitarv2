export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          title: string
          ui_schema: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          ui_schema?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          ui_schema?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          id: string
          lesson_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_lesson_id_fkey"
            columns: ["lesson_id"]
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

/**
 * Chat message stored in the database
 */
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  toolCalls?: ToolCallResult[]
}

/**
 * Result of a tool call from the AI
 */
export interface ToolCallResult {
  id: string
  name: string
  success: boolean
  blockId?: string
  error?: string
}
