export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          description?: string
          user_id: string
          created_at: string
          updated_at: string
          is_shared: boolean
          last_accessed_at?: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          user_id: string
          created_at?: string
          updated_at?: string
          is_shared?: boolean
          last_accessed_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          is_shared?: boolean
          last_accessed_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          content: any // JSON content
          workspace_id: string
          user_id: string
          created_at: string
          updated_at: string
          is_public: boolean
          room_id?: string
          file_size: number
          input_method: string
        }
        Insert: {
          id?: string
          title: string
          content: any
          workspace_id: string
          user_id: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          room_id?: string
          file_size?: number
          input_method?: string
        }
        Update: {
          id?: string
          title?: string
          content?: any
          workspace_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          is_public?: boolean
          room_id?: string
          file_size?: number
          input_method?: string
        }
      }
      collaboration_rooms: {
        Row: {
          id: string
          name: string
          document_id: string
          created_by: string
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          document_id: string
          created_by: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          document_id?: string
          created_by?: string
          created_at?: string
          is_active?: boolean
        }
      }
      room_participants: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
          cursor_position?: any
          is_online: boolean
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
          cursor_position?: any
          is_online?: boolean
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
          cursor_position?: any
          is_online?: boolean
        }
      }
    }
  }
}