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
      academic_courses: {
        Row: {
          category: string | null
          course_code: string
          course_name: string
          created_at: string
          difficulty: string | null
          grade: string | null
          id: string
          notes: string | null
          prerequisites: string | null
          semester_id: string | null
          status: string
          units: number
          user_id: string
        }
        Insert: {
          category?: string | null
          course_code: string
          course_name: string
          created_at?: string
          difficulty?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          prerequisites?: string | null
          semester_id?: string | null
          status?: string
          units?: number
          user_id: string
        }
        Update: {
          category?: string | null
          course_code?: string
          course_name?: string
          created_at?: string
          difficulty?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          prerequisites?: string | null
          semester_id?: string | null
          status?: string
          units?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_courses_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "academic_semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_profiles: {
        Row: {
          created_at: string
          expected_graduation_year: number | null
          id: string
          is_transfer: boolean | null
          major: string
          minor: string | null
          school_name: string
          start_semester: string
          start_year: number
          total_required_units: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected_graduation_year?: number | null
          id?: string
          is_transfer?: boolean | null
          major: string
          minor?: string | null
          school_name: string
          start_semester: string
          start_year: number
          total_required_units?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected_graduation_year?: number | null
          id?: string
          is_transfer?: boolean | null
          major?: string
          minor?: string | null
          school_name?: string
          start_semester?: string
          start_year?: number
          total_required_units?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      academic_semesters: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          notes: string | null
          profile_id: string | null
          semester_gpa: number | null
          semester_name: string
          semester_type: string
          semester_year: number
          sort_order: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          profile_id?: string | null
          semester_gpa?: number | null
          semester_name: string
          semester_type?: string
          semester_year: number
          sort_order?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          profile_id?: string | null
          semester_gpa?: number | null
          semester_name?: string
          semester_type?: string
          semester_year?: number
          sort_order?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_semesters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "academic_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profiles: {
        Row: {
          background: string | null
          created_at: string
          experience_level: string | null
          id: string
          inspirations: string[] | null
          lifestyle: string | null
          music_goals: string | null
          personality_traits: Json | null
          preferred_genres: string[] | null
          stage_name: string | null
          updated_at: string
          user_id: string
          voice_type: string | null
        }
        Insert: {
          background?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          inspirations?: string[] | null
          lifestyle?: string | null
          music_goals?: string | null
          personality_traits?: Json | null
          preferred_genres?: string[] | null
          stage_name?: string | null
          updated_at?: string
          user_id: string
          voice_type?: string | null
        }
        Update: {
          background?: string | null
          created_at?: string
          experience_level?: string | null
          id?: string
          inspirations?: string[] | null
          lifestyle?: string | null
          music_goals?: string | null
          personality_traits?: Json | null
          preferred_genres?: string[] | null
          stage_name?: string | null
          updated_at?: string
          user_id?: string
          voice_type?: string | null
        }
        Relationships: []
      }
      assignments: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          notes: string | null
          priority: string
          status: string
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_files: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_folder: boolean | null
          language: string | null
          name: string
          path: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_folder?: boolean | null
          language?: string | null
          name: string
          path?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_folder?: boolean | null
          language?: string | null
          name?: string
          path?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "code_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      code_projects: {
        Row: {
          created_at: string
          description: string | null
          github_repo_url: string | null
          id: string
          language: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_repo_url?: string | null
          id?: string
          language?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_repo_url?: string | null
          id?: string
          language?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_groups: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          icon: string | null
          id: string
          member_count: number | null
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          icon?: string | null
          id?: string
          member_count?: number | null
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          icon?: string | null
          id?: string
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          currently_working_on: string | null
          display_name: string
          goals: string | null
          id: string
          interests: string[] | null
          is_online: boolean | null
          last_seen_at: string | null
          location: string | null
          skills: string[] | null
          social_links: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currently_working_on?: string | null
          display_name?: string
          goals?: string | null
          id?: string
          interests?: string[] | null
          is_online?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          currently_working_on?: string | null
          display_name?: string
          goals?: string | null
          id?: string
          interests?: string[] | null
          is_online?: boolean | null
          last_seen_at?: string | null
          location?: string | null
          skills?: string[] | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          receiver_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      feedback_sessions: {
        Row: {
          authenticity_score: number | null
          commercial_appeal_score: number | null
          created_at: string
          energy_score: number | null
          feedback_type: string | null
          flow_score: number | null
          full_feedback: Json | null
          id: string
          improvement_suggestions: Json | null
          lyrics_input: string | null
          profile_id: string | null
          user_id: string
        }
        Insert: {
          authenticity_score?: number | null
          commercial_appeal_score?: number | null
          created_at?: string
          energy_score?: number | null
          feedback_type?: string | null
          flow_score?: number | null
          full_feedback?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          lyrics_input?: string | null
          profile_id?: string | null
          user_id: string
        }
        Update: {
          authenticity_score?: number | null
          commercial_appeal_score?: number | null
          created_at?: string
          energy_score?: number | null
          feedback_type?: string | null
          flow_score?: number | null
          full_feedback?: Json | null
          id?: string
          improvement_suggestions?: Json | null
          lyrics_input?: string | null
          profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_projects: {
        Row: {
          created_at: string
          current_income: number | null
          deadline: string | null
          goal_description: string
          id: string
          milestones: Json | null
          notes: string | null
          phases: Json | null
          progress: number
          recommendations: Json | null
          status: string
          target_amount: number | null
          tasks: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_income?: number | null
          deadline?: string | null
          goal_description: string
          id?: string
          milestones?: Json | null
          notes?: string | null
          phases?: Json | null
          progress?: number
          recommendations?: Json | null
          status?: string
          target_amount?: number | null
          tasks?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_income?: number | null
          deadline?: string | null
          goal_description?: string
          id?: string
          milestones?: Json | null
          notes?: string | null
          phases?: Json | null
          progress?: number
          recommendations?: Json | null
          status?: string
          target_amount?: number | null
          tasks?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          color: string
          completed: number
          created_at: string
          description: string | null
          id: string
          milestones: number
          progress: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          completed?: number
          created_at?: string
          description?: string | null
          id?: string
          milestones?: number
          progress?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          completed?: number
          created_at?: string
          description?: string | null
          id?: string
          milestones?: number
          progress?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_results: {
        Row: {
          archetype: string | null
          audience_profile: string | null
          brand_personality: string | null
          created_at: string
          full_analysis: Json | null
          id: string
          messaging_tone: string | null
          profile_id: string | null
          stage_name_suggestions: string[] | null
          updated_at: string
          user_id: string
          visual_aesthetic: string | null
        }
        Insert: {
          archetype?: string | null
          audience_profile?: string | null
          brand_personality?: string | null
          created_at?: string
          full_analysis?: Json | null
          id?: string
          messaging_tone?: string | null
          profile_id?: string | null
          stage_name_suggestions?: string[] | null
          updated_at?: string
          user_id: string
          visual_aesthetic?: string | null
        }
        Update: {
          archetype?: string | null
          audience_profile?: string | null
          brand_personality?: string | null
          created_at?: string
          full_analysis?: Json | null
          id?: string
          messaging_tone?: string | null
          profile_id?: string | null
          stage_name_suggestions?: string[] | null
          updated_at?: string
          user_id?: string
          visual_aesthetic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_results_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          cost: number | null
          created_at: string
          id: string
          location: string | null
          min_stock: number | null
          name: string
          notes: string | null
          quantity: number
          size: string | null
          sku: string | null
          status: string
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          location?: string | null
          min_stock?: number | null
          name: string
          notes?: string | null
          quantity?: number
          size?: string | null
          sku?: string | null
          status?: string
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost?: number | null
          created_at?: string
          id?: string
          location?: string | null
          min_stock?: number | null
          name?: string
          notes?: string | null
          quantity?: number
          size?: string | null
          sku?: string | null
          status?: string
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linked_tasks: {
        Row: {
          created_at: string
          id: string
          session_id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          task_id: string
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linked_tasks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linked_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ops_tasks"
            referencedColumns: ["id"]
          },
        ]
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
      ops_milestones: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean | null
          project_id: string
          target_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          project_id: string
          target_date?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean | null
          project_id?: string
          target_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ops_projects: {
        Row: {
          created_at: string
          deadline: string | null
          goal: string
          id: string
          notes: string | null
          phases: Json | null
          progress: number | null
          status: string
          team_members: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline?: string | null
          goal: string
          id?: string
          notes?: string | null
          phases?: Json | null
          progress?: number | null
          status?: string
          team_members?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline?: string | null
          goal?: string
          id?: string
          notes?: string | null
          phases?: Json | null
          progress?: number | null
          status?: string
          team_members?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ops_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          deadline: string | null
          dependencies: Json | null
          description: string | null
          id: string
          notes: string | null
          phase: string | null
          priority: string
          project_id: string
          sort_order: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: Json | null
          description?: string | null
          id?: string
          notes?: string | null
          phase?: string | null
          priority?: string
          project_id: string
          sort_order?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: Json | null
          description?: string | null
          id?: string
          notes?: string | null
          phase?: string | null
          priority?: string
          project_id?: string
          sort_order?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ops_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pro_access_overrides: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          granted_by: string | null
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      readiness_scores: {
        Row: {
          ai_explanation: string | null
          brand_clarity: number | null
          consistency: number | null
          created_at: string
          id: string
          market_positioning: number | null
          overall_score: number | null
          profile_id: string | null
          recommendations: Json | null
          story_authenticity: number | null
          updated_at: string
          user_id: string
          voice_potential: number | null
        }
        Insert: {
          ai_explanation?: string | null
          brand_clarity?: number | null
          consistency?: number | null
          created_at?: string
          id?: string
          market_positioning?: number | null
          overall_score?: number | null
          profile_id?: string | null
          recommendations?: Json | null
          story_authenticity?: number | null
          updated_at?: string
          user_id: string
          voice_potential?: number | null
        }
        Update: {
          ai_explanation?: string | null
          brand_clarity?: number | null
          consistency?: number | null
          created_at?: string
          id?: string
          market_positioning?: number | null
          overall_score?: number | null
          profile_id?: string | null
          recommendations?: Json | null
          story_authenticity?: number | null
          updated_at?: string
          user_id?: string
          voice_potential?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "readiness_scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sound_recommendations: {
        Row: {
          beat_styles: string[] | null
          bpm_range: Json | null
          comparable_artists: string[] | null
          created_at: string
          flow_ideas: string[] | null
          full_analysis: Json | null
          genre_scores: Json | null
          id: string
          music_lane_summary: string | null
          profile_id: string | null
          updated_at: string
          user_id: string
          vocal_guidance: string | null
        }
        Insert: {
          beat_styles?: string[] | null
          bpm_range?: Json | null
          comparable_artists?: string[] | null
          created_at?: string
          flow_ideas?: string[] | null
          full_analysis?: Json | null
          genre_scores?: Json | null
          id?: string
          music_lane_summary?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id: string
          vocal_guidance?: string | null
        }
        Update: {
          beat_styles?: string[] | null
          bpm_range?: Json | null
          comparable_artists?: string[] | null
          created_at?: string
          flow_ideas?: string[] | null
          full_analysis?: Json | null
          genre_scores?: Json | null
          id?: string
          music_lane_summary?: string | null
          profile_id?: string | null
          updated_at?: string
          user_id?: string
          vocal_guidance?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sound_recommendations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_plans: {
        Row: {
          audience_conversion: Json | null
          brand_positioning: string | null
          content_strategy: Json | null
          created_at: string
          growth_recommendations: Json | null
          id: string
          long_term_strategy: string | null
          next_steps: Json | null
          priority_actions: Json | null
          profile_id: string | null
          release_roadmap: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience_conversion?: Json | null
          brand_positioning?: string | null
          content_strategy?: Json | null
          created_at?: string
          growth_recommendations?: Json | null
          id?: string
          long_term_strategy?: string | null
          next_steps?: Json | null
          priority_actions?: Json | null
          profile_id?: string | null
          release_roadmap?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience_conversion?: Json | null
          brand_positioning?: string | null
          content_strategy?: Json | null
          created_at?: string
          growth_recommendations?: Json | null
          id?: string
          long_term_strategy?: string | null
          next_steps?: Json | null
          priority_actions?: Json | null
          profile_id?: string | null
          release_roadmap?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_careers: {
        Row: {
          career_title: string
          created_at: string
          description: string | null
          education_path: Json | null
          id: string
          match_score: number | null
          salary_range: Json | null
          skills_needed: Json | null
          user_id: string
        }
        Insert: {
          career_title: string
          created_at?: string
          description?: string | null
          education_path?: Json | null
          id?: string
          match_score?: number | null
          salary_range?: Json | null
          skills_needed?: Json | null
          user_id: string
        }
        Update: {
          career_title?: string
          created_at?: string
          description?: string | null
          education_path?: Json | null
          id?: string
          match_score?: number | null
          salary_range?: Json | null
          skills_needed?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      student_resumes: {
        Row: {
          content: Json | null
          cover_letter: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          ai_generated: boolean | null
          content: string | null
          created_at: string
          id: string
          material_type: string
          metadata: Json | null
          source_text: string | null
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          material_type?: string
          metadata?: Json | null
          source_text?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          content?: string | null
          created_at?: string
          id?: string
          material_type?: string
          metadata?: Json | null
          source_text?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_chat_members: {
        Row: {
          chat_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "sync_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_chats: {
        Row: {
          chat_type: string
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_type?: string
          created_at?: string
          id?: string
          project_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_type?: string
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "sync_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_journal_entries: {
        Row: {
          ai_feedback: string | null
          asset_type: string
          confidence_level: number | null
          created_at: string
          emotion_after: string | null
          emotion_before: string | null
          entry_price: number
          exit_price: number | null
          id: string
          lesson_learned: string | null
          mistakes_made: string | null
          position_size: number
          profit_loss: number | null
          screenshot_url: string | null
          setup_description: string | null
          strategy_used: string | null
          symbol: string
          timeframe: string
          trade_date: string
          trade_type: string
          updated_at: string
          user_id: string
          what_went_well: string | null
          what_went_wrong: string | null
        }
        Insert: {
          ai_feedback?: string | null
          asset_type: string
          confidence_level?: number | null
          created_at?: string
          emotion_after?: string | null
          emotion_before?: string | null
          entry_price: number
          exit_price?: number | null
          id?: string
          lesson_learned?: string | null
          mistakes_made?: string | null
          position_size: number
          profit_loss?: number | null
          screenshot_url?: string | null
          setup_description?: string | null
          strategy_used?: string | null
          symbol: string
          timeframe: string
          trade_date?: string
          trade_type: string
          updated_at?: string
          user_id: string
          what_went_well?: string | null
          what_went_wrong?: string | null
        }
        Update: {
          ai_feedback?: string | null
          asset_type?: string
          confidence_level?: number | null
          created_at?: string
          emotion_after?: string | null
          emotion_before?: string | null
          entry_price?: number
          exit_price?: number | null
          id?: string
          lesson_learned?: string | null
          mistakes_made?: string | null
          position_size?: number
          profit_loss?: number | null
          screenshot_url?: string | null
          setup_description?: string | null
          strategy_used?: string | null
          symbol?: string
          timeframe?: string
          trade_date?: string
          trade_type?: string
          updated_at?: string
          user_id?: string
          what_went_well?: string | null
          what_went_wrong?: string | null
        }
        Relationships: []
      }
      user_focus_areas: {
        Row: {
          created_at: string
          focus_areas: string[]
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          focus_areas?: string[]
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          focus_areas?: string[]
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dark_mode: boolean
          id: string
          notifications: boolean
          public_profile: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean
          id?: string
          notifications?: boolean
          public_profile?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dark_mode?: boolean
          id?: string
          notifications?: boolean
          public_profile?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_profiles: {
        Row: {
          id: string
          monthly_savings: number
          total_income_monthly: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          monthly_savings?: number
          total_income_monthly?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          monthly_savings?: number
          total_income_monthly?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_participants: {
        Row: {
          id: string
          is_muted: boolean
          joined_at: string
          left_at: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "voice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_rooms: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          name: string
          project_id: string | null
          room_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          name: string
          project_id?: string | null
          room_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          name?: string
          project_id?: string | null
          room_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_sessions: {
        Row: {
          action_items: Json | null
          created_at: string
          end_time: string | null
          id: string
          key_decisions: Json | null
          room_id: string
          start_time: string
          status: string
          summary: string | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          end_time?: string | null
          id?: string
          key_decisions?: Json | null
          room_id: string
          start_time?: string
          status?: string
          summary?: string | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          end_time?: string | null
          id?: string
          key_decisions?: Json | null
          room_id?: string
          start_time?: string
          status?: string
          summary?: string | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      work_logs: {
        Row: {
          created_at: string
          employee_name: string
          end_time: string
          hourly_rate: number
          hours: number
          id: string
          notes: string | null
          start_time: string
          total_pay: number
          user_id: string
          work_date: string
        }
        Insert: {
          created_at?: string
          employee_name: string
          end_time?: string
          hourly_rate?: number
          hours?: number
          id?: string
          notes?: string | null
          start_time?: string
          total_pay?: number
          user_id: string
          work_date?: string
        }
        Update: {
          created_at?: string
          employee_name?: string
          end_time?: string
          hourly_rate?: number
          hours?: number
          id?: string
          notes?: string | null
          start_time?: string
          total_pay?: number
          user_id?: string
          work_date?: string
        }
        Relationships: []
      }
      workflow_edges: {
        Row: {
          created_at: string
          id: string
          label: string | null
          project_id: string
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          project_id: string
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          project_id?: string
          source_node_id?: string
          target_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_edges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "workflow_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_nodes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          node_type: string
          owner: string | null
          position_x: number
          position_y: number
          project_id: string
          sort_order: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          node_type?: string
          owner?: string | null
          position_x?: number
          position_y?: number
          project_id: string
          sort_order?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          node_type?: string
          owner?: string | null
          position_x?: number
          position_y?: number
          project_id?: string
          sort_order?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ops_projects"
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
