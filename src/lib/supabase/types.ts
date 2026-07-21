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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comparisons: {
        Row: {
          created_at: string
          id: string
          profile: string
          project_id: string
          property_ids: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile?: string
          project_id: string
          property_ids?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile?: string
          project_id?: string
          property_ids?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          agency: string | null
          created_at: string
          email: string | null
          id: string
          kind: Database["public"]["Enums"]["contact_kind"]
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contact_kind"]
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contact_kind"]
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_snapshots: {
        Row: {
          address_key: string
          created_at: string
          fetched_at: string
          id: string
          payload: Json
          source: string | null
          ttl_hours: number
          updated_at: string
        }
        Insert: {
          address_key: string
          created_at?: string
          fetched_at?: string
          id?: string
          payload?: Json
          source?: string | null
          ttl_hours?: number
          updated_at?: string
        }
        Update: {
          address_key?: string
          created_at?: string
          fetched_at?: string
          id?: string
          payload?: Json
          source?: string | null
          ttl_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          archived: boolean
          created_at: string
          criteria: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          criteria?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          criteria?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          add_source: Database["public"]["Enums"]["add_source"]
          address: string | null
          address_extra: string | null
          asking_price: number | null
          bedrooms: number | null
          board_position: number
          city: string | null
          condition: string | null
          contact_id: string | null
          created_at: string
          discard_reason: string | null
          dpe_letter: string | null
          dpe_value: number | null
          estimated_rent: number | null
          exposure: string | null
          floor: number | null
          floors_total: number | null
          furnished: boolean
          ges_letter: string | null
          has_balcony: boolean | null
          has_cave: boolean | null
          has_elevator: boolean | null
          has_parking: boolean | null
          has_terrace: boolean | null
          id: string
          insee_code: string | null
          lat: number | null
          lng: number | null
          max_price: number | null
          monthly_copro_charges: number
          outdoor_area: number | null
          postal_code: string | null
          project_id: string
          property_tax: number
          property_type: string | null
          rooms: number | null
          status: Database["public"]["Enums"]["property_status"]
          surface_carrez: number | null
          updated_at: string
          user_id: string
          works_estimate: number
          year_built: number | null
        }
        Insert: {
          add_source?: Database["public"]["Enums"]["add_source"]
          address?: string | null
          address_extra?: string | null
          asking_price?: number | null
          bedrooms?: number | null
          board_position?: number
          city?: string | null
          condition?: string | null
          contact_id?: string | null
          created_at?: string
          discard_reason?: string | null
          dpe_letter?: string | null
          dpe_value?: number | null
          estimated_rent?: number | null
          exposure?: string | null
          floor?: number | null
          floors_total?: number | null
          furnished?: boolean
          ges_letter?: string | null
          has_balcony?: boolean | null
          has_cave?: boolean | null
          has_elevator?: boolean | null
          has_parking?: boolean | null
          has_terrace?: boolean | null
          id?: string
          insee_code?: string | null
          lat?: number | null
          lng?: number | null
          max_price?: number | null
          monthly_copro_charges?: number
          outdoor_area?: number | null
          postal_code?: string | null
          project_id: string
          property_tax?: number
          property_type?: string | null
          rooms?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          surface_carrez?: number | null
          updated_at?: string
          user_id: string
          works_estimate?: number
          year_built?: number | null
        }
        Update: {
          add_source?: Database["public"]["Enums"]["add_source"]
          address?: string | null
          address_extra?: string | null
          asking_price?: number | null
          bedrooms?: number | null
          board_position?: number
          city?: string | null
          condition?: string | null
          contact_id?: string | null
          created_at?: string
          discard_reason?: string | null
          dpe_letter?: string | null
          dpe_value?: number | null
          estimated_rent?: number | null
          exposure?: string | null
          floor?: number | null
          floors_total?: number | null
          furnished?: boolean
          ges_letter?: string | null
          has_balcony?: boolean | null
          has_cave?: boolean | null
          has_elevator?: boolean | null
          has_parking?: boolean | null
          has_terrace?: boolean | null
          id?: string
          insee_code?: string | null
          lat?: number | null
          lng?: number | null
          max_price?: number | null
          monthly_copro_charges?: number
          outdoor_area?: number | null
          postal_code?: string | null
          project_id?: string
          property_tax?: number
          property_type?: string | null
          rooms?: number | null
          status?: Database["public"]["Enums"]["property_status"]
          surface_carrez?: number | null
          updated_at?: string
          user_id?: string
          works_estimate?: number
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      property_documents: {
        Row: {
          created_at: string
          doc_type: string
          filename: string
          id: string
          property_id: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string
          filename: string
          id?: string
          property_id: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          filename?: string
          id?: string
          property_id?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["note_kind"]
          property_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["note_kind"]
          property_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["note_kind"]
          property_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_notes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          property_id: string
          sort_order: number
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          property_id: string
          sort_order?: number
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          property_id?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_scenarios: {
        Row: {
          apport_pct: number
          broker_fees: number
          created_at: string
          deferral_months: number
          dossier_fees: number
          duration_years: number
          gli: boolean
          guarantee_fees: number
          guarantee_type: string
          horizon_years: number
          id: string
          insurance_on_initial: boolean
          insurance_rate: number
          interest_rate: number
          loan_type: Database["public"]["Enums"]["loan_type"]
          management_fees_pct: number
          market_scenario: Database["public"]["Enums"]["market_scenario"]
          notary_fees_pct: number
          pno: boolean
          property_id: string
          tax_regime: Database["public"]["Enums"]["tax_regime"]
          tmi_pct: number
          updated_at: string
          user_id: string
          vacancy_pct: number
          works_provision: number
        }
        Insert: {
          apport_pct?: number
          broker_fees?: number
          created_at?: string
          deferral_months?: number
          dossier_fees?: number
          duration_years?: number
          gli?: boolean
          guarantee_fees?: number
          guarantee_type?: string
          horizon_years?: number
          id?: string
          insurance_on_initial?: boolean
          insurance_rate?: number
          interest_rate?: number
          loan_type?: Database["public"]["Enums"]["loan_type"]
          management_fees_pct?: number
          market_scenario?: Database["public"]["Enums"]["market_scenario"]
          notary_fees_pct?: number
          pno?: boolean
          property_id: string
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          tmi_pct?: number
          updated_at?: string
          user_id: string
          vacancy_pct?: number
          works_provision?: number
        }
        Update: {
          apport_pct?: number
          broker_fees?: number
          created_at?: string
          deferral_months?: number
          dossier_fees?: number
          duration_years?: number
          gli?: boolean
          guarantee_fees?: number
          guarantee_type?: string
          horizon_years?: number
          id?: string
          insurance_on_initial?: boolean
          insurance_rate?: number
          interest_rate?: number
          loan_type?: Database["public"]["Enums"]["loan_type"]
          management_fees_pct?: number
          market_scenario?: Database["public"]["Enums"]["market_scenario"]
          notary_fees_pct?: number
          pno?: boolean
          property_id?: string
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          tmi_pct?: number
          updated_at?: string
          user_id?: string
          vacancy_pct?: number
          works_provision?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_scenarios_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          created_at: string
          from_status: Database["public"]["Enums"]["property_status"] | null
          id: string
          property_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["property_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          from_status?: Database["public"]["Enums"]["property_status"] | null
          id?: string
          property_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          from_status?: Database["public"]["Enums"]["property_status"] | null
          id?: string
          property_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["property_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_tier"]
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      add_source:
        | "capture"
        | "paste"
        | "pdf"
        | "whatsapp"
        | "manual"
        | "extension"
      contact_kind: "agent" | "mandataire" | "particulier" | "notaire" | "autre"
      loan_type: "amortissable" | "in_fine"
      market_scenario: "prudent" | "central" | "dynamique"
      note_kind: "note" | "visite" | "nego"
      plan_tier: "free" | "pro" | "expert"
      property_status:
        | "analyser"
        | "analyse"
        | "visite"
        | "nego"
        | "ecarte"
        | "offre"
      tax_regime:
        | "nu_micro"
        | "nu_reel"
        | "lmnp_micro"
        | "lmnp_reel"
        | "sci_ir"
        | "sci_is"
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
      add_source: [
        "capture",
        "paste",
        "pdf",
        "whatsapp",
        "manual",
        "extension",
      ],
      contact_kind: ["agent", "mandataire", "particulier", "notaire", "autre"],
      loan_type: ["amortissable", "in_fine"],
      market_scenario: ["prudent", "central", "dynamique"],
      note_kind: ["note", "visite", "nego"],
      plan_tier: ["free", "pro", "expert"],
      property_status: [
        "analyser",
        "analyse",
        "visite",
        "nego",
        "ecarte",
        "offre",
      ],
      tax_regime: [
        "nu_micro",
        "nu_reel",
        "lmnp_micro",
        "lmnp_reel",
        "sci_ir",
        "sci_is",
      ],
    },
  },
} as const
