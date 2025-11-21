export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      di_dashboards: {
        Row: {
          charts: Json
          created_at: string
          dataset_id: string | null
          description: string | null
          id: string
          layout: Json
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          charts?: Json
          created_at?: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          layout?: Json
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          charts?: Json
          created_at?: string
          dataset_id?: string | null
          description?: string | null
          id?: string
          layout?: Json
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "di_dashboards_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "di_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      di_datasets: {
        Row: {
          column_count: number | null
          created_at: string
          data: Json
          description: string | null
          id: string
          name: string
          row_count: number | null
          schema: Json
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          column_count?: number | null
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          name: string
          row_count?: number | null
          schema?: Json
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          column_count?: number | null
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          name?: string
          row_count?: number | null
          schema?: Json
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      di_experiments: {
        Row: {
          created_at: string
          description: string | null
          group_a_dataset_id: string | null
          group_b_dataset_id: string | null
          hypothesis: string | null
          id: string
          metrics: Json
          name: string
          p_value: number | null
          results: Json | null
          significance_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_a_dataset_id?: string | null
          group_b_dataset_id?: string | null
          hypothesis?: string | null
          id?: string
          metrics?: Json
          name: string
          p_value?: number | null
          results?: Json | null
          significance_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_a_dataset_id?: string | null
          group_b_dataset_id?: string | null
          hypothesis?: string | null
          id?: string
          metrics?: Json
          name?: string
          p_value?: number | null
          results?: Json | null
          significance_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "di_experiments_group_a_dataset_id_fkey"
            columns: ["group_a_dataset_id"]
            isOneToOne: false
            referencedRelation: "di_datasets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "di_experiments_group_b_dataset_id_fkey"
            columns: ["group_b_dataset_id"]
            isOneToOne: false
            referencedRelation: "di_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      di_mission_completions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string | null
          progress: number | null
          status: Database["public"]["Enums"]["mission_status"]
          submission: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["mission_status"]
          submission?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string | null
          progress?: number | null
          status?: Database["public"]["Enums"]["mission_status"]
          submission?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "di_mission_completions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "di_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      di_missions: {
        Row: {
          created_at: string
          dataset_template: Json | null
          description: string
          difficulty: Database["public"]["Enums"]["mission_difficulty"]
          id: string
          objectives: Json
          order_index: number
          title: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          dataset_template?: Json | null
          description: string
          difficulty?: Database["public"]["Enums"]["mission_difficulty"]
          id?: string
          objectives?: Json
          order_index?: number
          title: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          dataset_template?: Json | null
          description?: string
          difficulty?: Database["public"]["Enums"]["mission_difficulty"]
          id?: string
          objectives?: Json
          order_index?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      di_portfolio_items: {
        Row: {
          content: Json
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      di_sql_queries: {
        Row: {
          created_at: string
          dataset_id: string | null
          id: string
          name: string
          query: string
          results: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dataset_id?: string | null
          id?: string
          name: string
          query: string
          results?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dataset_id?: string | null
          id?: string
          name?: string
          query?: string
          results?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "di_sql_queries_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "di_datasets"
            referencedColumns: ["id"]
          },
        ]
      }
      di_user_stats: {
        Row: {
          created_at: string
          dashboards_created: number | null
          experiments_run: number | null
          level: number | null
          missions_completed: number | null
          queries_executed: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboards_created?: number | null
          experiments_run?: number | null
          level?: number | null
          missions_completed?: number | null
          queries_executed?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboards_created?: number | null
          experiments_run?: number | null
          level?: number | null
          missions_completed?: number | null
          queries_executed?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_projects: {
        Row: {
          bpm: number | null
          created_at: string
          id: string
          time_signature: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          id?: string
          time_signature?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          id?: string
          time_signature?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          audio_url: string | null
          color: string | null
          created_at: string
          effects: Json | null
          id: string
          muted: boolean | null
          name: string
          order_index: number
          pan: number | null
          project_id: string
          solo: boolean | null
          volume: number | null
        }
        Insert: {
          audio_url?: string | null
          color?: string | null
          created_at?: string
          effects?: Json | null
          id?: string
          muted?: boolean | null
          name: string
          order_index: number
          pan?: number | null
          project_id: string
          solo?: boolean | null
          volume?: number | null
        }
        Update: {
          audio_url?: string | null
          color?: string | null
          created_at?: string
          effects?: Json | null
          id?: string
          muted?: boolean | null
          name?: string
          order_index?: number
          pan?: number | null
          project_id?: string
          solo?: boolean | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "music_tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "music_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          created_at: string
          id: string
          permission: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "music_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      chart_type: "bar" | "line" | "scatter" | "pie" | "heatmap" | "correlation"
      mission_difficulty: "beginner" | "intermediate" | "advanced" | "expert"
      mission_status: "locked" | "available" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      chart_type: ["bar", "line", "scatter", "pie", "heatmap", "correlation"],
      mission_difficulty: ["beginner", "intermediate", "advanced", "expert"],
      mission_status: ["locked", "available", "in_progress", "completed"],
    },
  },
} as const
