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
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          diff: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auth_logs: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_audit_logs: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          event_type: string
          id: string
          metadata: Json | null
          plan_from: string | null
          plan_to: string | null
          stripe_event_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          plan_from?: string | null
          plan_to?: string | null
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          plan_from?: string | null
          plan_to?: string | null
          stripe_event_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cookie_consents: {
        Row: {
          consent_categories: Json | null
          consent_given: boolean | null
          consent_version: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          lp_id: string | null
          session_id: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          consent_categories?: Json | null
          consent_given?: boolean | null
          consent_version?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          lp_id?: string | null
          session_id: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          consent_categories?: Json | null
          consent_given?: boolean | null
          consent_version?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          lp_id?: string | null
          session_id?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cookie_consents_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          created_at: string | null
          dominio: string | null
          dominio_verificacao_token: string | null
          dominio_verificado: boolean | null
          id: string
          is_official: boolean | null
          is_site: boolean | null
          nome: string
          owner_id: string | null
          publicado: boolean | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          dominio?: string | null
          dominio_verificacao_token?: string | null
          dominio_verificado?: boolean | null
          id?: string
          is_official?: boolean | null
          is_site?: boolean | null
          nome: string
          owner_id?: string | null
          publicado?: boolean | null
          slug: string
        }
        Update: {
          created_at?: string | null
          dominio?: string | null
          dominio_verificacao_token?: string | null
          dominio_verificado?: boolean | null
          id?: string
          is_official?: boolean | null
          is_site?: boolean | null
          nome?: string
          owner_id?: string | null
          publicado?: boolean | null
          slug?: string
        }
        Relationships: []
      }
      lp_ab_tests: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          lp_id: string
          name: string
          section_key: string
          started_at: string | null
          status: string | null
          traffic_split: number | null
          updated_at: string | null
          variant_a_id: string
          variant_b_id: string
          winner_variant: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          lp_id: string
          name: string
          section_key: string
          started_at?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_id: string
          variant_b_id: string
          winner_variant?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          lp_id?: string
          name?: string
          section_key?: string
          started_at?: string | null
          status?: string | null
          traffic_split?: number | null
          updated_at?: string | null
          variant_a_id?: string
          variant_b_id?: string
          winner_variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_ab_tests_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_content: {
        Row: {
          id: string
          key: string
          lp_id: string
          section: string
          section_order: number | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          lp_id: string
          section: string
          section_order?: number | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          lp_id?: string
          section?: string
          section_order?: number | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_content_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_events: {
        Row: {
          created_at: string | null
          device_type: string | null
          event_type: string
          id: string
          lp_id: string
          metadata: Json | null
          referrer: string | null
          section: string | null
          session_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          event_type: string
          id?: string
          lp_id: string
          metadata?: Json | null
          referrer?: string | null
          section?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          event_type?: string
          id?: string
          lp_id?: string
          metadata?: Json | null
          referrer?: string | null
          section?: string | null
          session_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_events_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_leads: {
        Row: {
          created_at: string | null
          device_type: string | null
          email: string | null
          id: string
          lp_id: string
          nome: string | null
          referrer: string | null
          session_id: string | null
          telefone: string | null
          user_agent: string | null
          utm: Json | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          email?: string | null
          id?: string
          lp_id: string
          nome?: string | null
          referrer?: string | null
          session_id?: string | null
          telefone?: string | null
          user_agent?: string | null
          utm?: Json | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          email?: string | null
          id?: string
          lp_id?: string
          nome?: string | null
          referrer?: string | null
          session_id?: string | null
          telefone?: string | null
          user_agent?: string | null
          utm?: Json | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_leads_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_section_separators: {
        Row: {
          created_at: string | null
          custom_color: string | null
          id: string
          lp_id: string
          position: string
          section: string
          separator_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_color?: string | null
          id?: string
          lp_id: string
          position: string
          section: string
          separator_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_color?: string | null
          id?: string
          lp_id?: string
          position?: string
          section?: string
          separator_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_section_separators_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lp_section_separators_separator_id_fkey"
            columns: ["separator_id"]
            isOneToOne: false
            referencedRelation: "section_separators"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_settings: {
        Row: {
          id: string
          key: string
          lp_id: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          lp_id: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          lp_id?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_settings_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_user_roles: {
        Row: {
          created_at: string | null
          id: string
          lp_id: string
          role: Database["public"]["Enums"]["lp_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lp_id: string
          role?: Database["public"]["Enums"]["lp_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lp_id?: string
          role?: Database["public"]["Enums"]["lp_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lp_user_roles_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          lead_id: string | null
          response_body: string | null
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string | null
          response_body?: string | null
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          lead_id?: string | null
          response_body?: string | null
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lp_webhook_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lp_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lp_webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "lp_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      lp_webhooks: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          lp_id: string
          tipo: string
          url: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          lp_id: string
          tipo?: string
          url: string
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          lp_id?: string
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "lp_webhooks_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          ab_testing_enabled: boolean | null
          advanced_integrations_enabled: boolean | null
          allowed_model_categories: string[]
          allowed_separator_categories: string[]
          created_at: string | null
          custom_domain_limit: number
          export_leads_enabled: boolean | null
          features: Json | null
          id: string
          max_sites: number
          max_storage_mb: number
          plan: string
          premium_sections_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          ab_testing_enabled?: boolean | null
          advanced_integrations_enabled?: boolean | null
          allowed_model_categories?: string[]
          allowed_separator_categories?: string[]
          created_at?: string | null
          custom_domain_limit?: number
          export_leads_enabled?: boolean | null
          features?: Json | null
          id?: string
          max_sites?: number
          max_storage_mb?: number
          plan: string
          premium_sections_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          ab_testing_enabled?: boolean | null
          advanced_integrations_enabled?: boolean | null
          allowed_model_categories?: string[]
          allowed_separator_categories?: string[]
          created_at?: string | null
          custom_domain_limit?: number
          export_leads_enabled?: boolean | null
          features?: Json | null
          id?: string
          max_sites?: number
          max_storage_mb?: number
          plan?: string
          premium_sections_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          invoice_url: string | null
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          invoice_url?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          invoice_url?: string | null
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saas_settings: {
        Row: {
          created_at: string
          home_lp_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          home_lp_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          home_lp_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saas_settings_home_lp_id_fkey"
            columns: ["home_lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      section_model_configs: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          is_featured: boolean
          sort_order: number
          updated_at: string
          visible_for_free: boolean
          visible_for_premium: boolean
          visible_for_pro: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id: string
          is_featured?: boolean
          sort_order?: number
          updated_at?: string
          visible_for_free?: boolean
          visible_for_premium?: boolean
          visible_for_pro?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          is_featured?: boolean
          sort_order?: number
          updated_at?: string
          visible_for_free?: boolean
          visible_for_premium?: boolean
          visible_for_pro?: boolean
        }
        Relationships: []
      }
      section_separators: {
        Row: {
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          min_plan_tier: string
          name: string
          png_url: string | null
          preview_thumbnail: string | null
          svg_content: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_plan_tier?: string
          name: string
          png_url?: string | null
          preview_thumbnail?: string | null
          svg_content?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          min_plan_tier?: string
          name?: string
          png_url?: string | null
          preview_thumbnail?: string | null
          svg_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      section_templates: {
        Row: {
          category: string
          componente_front: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          min_plan_tier: string
          name: string
          preview_dynamic_enabled: boolean | null
          preview_thumbnail: string | null
          section: string
          updated_at: string | null
          variant_id: string
        }
        Insert: {
          category: string
          componente_front?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_plan_tier?: string
          name: string
          preview_dynamic_enabled?: boolean | null
          preview_thumbnail?: string | null
          section: string
          updated_at?: string | null
          variant_id: string
        }
        Update: {
          category?: string
          componente_front?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_plan_tier?: string
          name?: string
          preview_dynamic_enabled?: boolean | null
          preview_thumbnail?: string | null
          section?: string
          updated_at?: string | null
          variant_id?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          created_at: string | null
          id: string
          lp_id: string
          nome: string
          publicado: boolean | null
          section_order: string[] | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lp_id: string
          nome: string
          publicado?: boolean | null
          section_order?: string[] | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lp_id?: string
          nome?: string
          publicado?: boolean | null
          section_order?: string[] | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string | null
          id: string
          level: string
          lp_id: string | null
          message: string
          metadata: Json | null
          source: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string
          lp_id?: string | null
          message: string
          metadata?: Json | null
          source: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          lp_id?: string | null
          message?: string
          metadata?: Json | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_lp_id_fkey"
            columns: ["lp_id"]
            isOneToOne: false
            referencedRelation: "landing_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      uptime_checks: {
        Row: {
          checked_at: string | null
          id: string
          message: string | null
          status: string
        }
        Insert: {
          checked_at?: string | null
          id?: string
          message?: string | null
          status?: string
        }
        Update: {
          checked_at?: string | null
          id?: string
          message?: string | null
          status?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          last_login_at: string | null
          plan: string
          storage_used_mb: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_login_at?: string | null
          plan?: string
          storage_used_mb?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          last_login_at?: string | null
          plan?: string
          storage_used_mb?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_feature: {
        Args: { _category: string; _user_id: string }
        Returns: boolean
      }
      can_access_lp: {
        Args: {
          _lp_id: string
          _min_role?: Database["public"]["Enums"]["lp_role"]
          _user_id: string
        }
        Returns: boolean
      }
      can_create_site: { Args: { _user_id: string }; Returns: boolean }
      can_edit_lp: {
        Args: { _lp_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_lp: {
        Args: { _lp_id: string; _user_id: string }
        Returns: boolean
      }
      can_use_feature: {
        Args: { _feature: string; _user_id: string }
        Returns: boolean
      }
      check_lead_rate_limit: {
        Args: { _email: string; _lp_id: string }
        Returns: boolean
      }
      get_effective_plan_limits: {
        Args: { _user_id: string }
        Returns: {
          ab_testing_enabled: boolean
          can_edit_background: boolean
          can_edit_glass_effects: boolean
          can_edit_gradients: boolean
          can_edit_section_colors: boolean
          can_edit_typography: boolean
          custom_domain_limit: number
          export_leads_enabled: boolean
          max_blocks: number
          max_sites: number
          max_storage_mb: number
          plan: string
          premium_sections_enabled: boolean
        }[]
      }
      get_lp_analytics: {
        Args: { _end_date?: string; _lp_id: string; _start_date?: string }
        Returns: {
          conversion_rate: number
          device_breakdown: Json
          top_utm_source: string
          total_clicks: number
          total_leads: number
          total_views: number
          unique_sessions: number
        }[]
      }
      get_lp_event_counts: {
        Args: { _lp_id: string }
        Returns: {
          count: number
          event_type: string
        }[]
      }
      get_user_plan: { Args: { _user_id: string }; Returns: string }
      get_user_site_count: { Args: { _user_id: string }; Returns: number }
      has_app_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_lp_role: {
        Args: {
          _lp_id: string
          _roles: Database["public"]["Enums"]["lp_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      health_check: { Args: never; Returns: Json }
      is_admin_master: { Args: { _user_id: string }; Returns: boolean }
      is_lp_owner: {
        Args: { _lp_id: string; _user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _details?: Json
          _target_id?: string
          _target_type: string
        }
        Returns: string
      }
      log_auth_event: {
        Args: {
          _event_type: string
          _ip_address?: string
          _metadata?: Json
          _user_agent?: string
          _user_id?: string
        }
        Returns: string
      }
      log_system_event: {
        Args: {
          _level: string
          _lp_id: string
          _message: string
          _metadata?: Json
          _source: string
        }
        Returns: string
      }
      plan_has_feature: {
        Args: { _feature: string; _plan: string }
        Returns: boolean
      }
      user_has_feature: {
        Args: { _feature: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin_master" | "client"
      lp_role: "owner" | "editor" | "viewer"
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
      app_role: ["admin_master", "client"],
      lp_role: ["owner", "editor", "viewer"],
    },
  },
} as const
