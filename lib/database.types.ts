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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      artifacts: {
        Row: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          mission_id: string
          uploaded_at: string
          user_id: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          mission_id: string
          uploaded_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          mission_id?: string
          uploaded_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          archetype_scores: Json
          archetype_slug: string | null
          calibration_answers: Json
          completed_at: string
          dimension_scores: Json
          id: string
          quiz_answers: number[]
          secondary_archetype_slug: string | null
          tertiary_archetype_slug: string | null
          user_id: string
        }
        Insert: {
          archetype_scores: Json
          archetype_slug?: string | null
          calibration_answers?: Json
          completed_at?: string
          dimension_scores: Json
          id?: string
          quiz_answers: number[]
          secondary_archetype_slug?: string | null
          tertiary_archetype_slug?: string | null
          user_id: string
        }
        Update: {
          archetype_scores?: Json
          archetype_slug?: string | null
          calibration_answers?: Json
          completed_at?: string
          dimension_scores?: Json
          id?: string
          quiz_answers?: number[]
          secondary_archetype_slug?: string | null
          tertiary_archetype_slug?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          accepted_at: string | null
          archetype: string
          completed_at: string | null
          completion: string
          constraint_id: string
          constraint_rule: string
          created_at: string
          expired_at: string | null
          framing: string
          generated_by: string
          id: string
          mode: string
          pattern: string
          scope: string
          status: string
          thought_parking: string | null
          time_to_completion: number | null
          timebox: number
          user_id: string
          work_description: string
          work_type: string
        }
        Insert: {
          accepted_at?: string | null
          archetype: string
          completed_at?: string | null
          completion: string
          constraint_id: string
          constraint_rule: string
          created_at?: string
          expired_at?: string | null
          framing: string
          generated_by: string
          id?: string
          mode: string
          pattern: string
          scope: string
          status?: string
          thought_parking?: string | null
          time_to_completion?: number | null
          timebox: number
          user_id: string
          work_description: string
          work_type: string
        }
        Update: {
          accepted_at?: string | null
          archetype?: string
          completed_at?: string | null
          completion?: string
          constraint_id?: string
          constraint_rule?: string
          created_at?: string
          expired_at?: string | null
          framing?: string
          generated_by?: string
          id?: string
          mode?: string
          pattern?: string
          scope?: string
          status?: string
          thought_parking?: string | null
          time_to_completion?: number | null
          timebox?: number
          user_id?: string
          work_description?: string
          work_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          archetype_scores: Json | null
          archetype_slug: string | null
          assessment_completed_at: string | null
          beta_approved: boolean | null
          calibration_answers: Json | null
          created_at: string | null
          dimension_scores: Json
          email: string
          id: string
          last_mission_id: string | null
          quiz_answers: number[] | null
          secondary_archetype_slug: string | null
          statistics: Json | null
          tertiary_archetype_slug: string | null
          updated_at: string | null
        }
        Insert: {
          archetype_scores?: Json | null
          archetype_slug?: string | null
          assessment_completed_at?: string | null
          beta_approved?: boolean | null
          calibration_answers?: Json | null
          created_at?: string | null
          dimension_scores: Json
          email: string
          id: string
          last_mission_id?: string | null
          quiz_answers?: number[] | null
          secondary_archetype_slug?: string | null
          statistics?: Json | null
          tertiary_archetype_slug?: string | null
          updated_at?: string | null
        }
        Update: {
          archetype_scores?: Json | null
          archetype_slug?: string | null
          assessment_completed_at?: string | null
          beta_approved?: boolean | null
          calibration_answers?: Json | null
          created_at?: string | null
          dimension_scores?: Json
          email?: string
          id?: string
          last_mission_id?: string | null
          quiz_answers?: number[] | null
          secondary_archetype_slug?: string | null
          statistics?: Json | null
          tertiary_archetype_slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_last_mission_id_fkey"
            columns: ["last_mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
