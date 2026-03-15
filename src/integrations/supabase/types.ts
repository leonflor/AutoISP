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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_whatsapp_config: {
        Row: {
          api_key_encrypted: string | null
          api_url: string | null
          connected_at: string | null
          created_at: string
          encryption_iv: string | null
          id: string
          is_connected: boolean | null
          phone_number: string | null
          phone_number_id: string | null
          provider: string
          updated_at: string
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string
          encryption_iv?: string | null
          id?: string
          is_connected?: boolean | null
          phone_number?: string | null
          phone_number_id?: string | null
          provider?: string
          updated_at?: string
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string
          encryption_iv?: string | null
          id?: string
          is_connected?: boolean | null
          phone_number?: string | null
          phone_number_id?: string | null
          provider?: string
          updated_at?: string
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      agent_knowledge_base: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          isp_agent_id: string
          question: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_agent_id: string
          question: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          isp_agent_id?: string
          question?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_knowledge_base_isp_agent_id_fkey"
            columns: ["isp_agent_id"]
            isOneToOne: false
            referencedRelation: "isp_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_flow_links: {
        Row: {
          agent_id: string
          created_at: string
          flow_id: string
          id: string
          is_active: boolean
          sort_order: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          flow_id: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          flow_id?: string
          id?: string
          is_active?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_flow_links_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_flow_links_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agent_flows: {
        Row: {
          agent_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_fixed: boolean
          name: string
          slug: string
          sort_order: number
          trigger_keywords: string[] | null
          trigger_prompt: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_fixed?: boolean
          name: string
          slug: string
          sort_order?: number
          trigger_keywords?: string[] | null
          trigger_prompt?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_fixed?: boolean
          name?: string
          slug?: string
          sort_order?: number
          trigger_keywords?: string[] | null
          trigger_prompt?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_flows_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          allowed_data_access: Json | null
          avatar_url: string | null
          created_at: string | null
          description: string | null
          escalation_options: Json | null
          feature_custom: Json | null
          feature_tags: Json | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_tokens: number | null
          model: string | null
          name: string
          scope: Database["public"]["Enums"]["ai_agent_scope"] | null
          slug: string
          sort_order: number | null
          system_prompt: string | null
          temperature: number | null
          type: Database["public"]["Enums"]["tipo_agente"]
          updated_at: string | null
          uses_knowledge_base: boolean | null
          voice_tones: Json | null
        }
        Insert: {
          allowed_data_access?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          escalation_options?: Json | null
          feature_custom?: Json | null
          feature_tags?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name: string
          scope?: Database["public"]["Enums"]["ai_agent_scope"] | null
          slug: string
          sort_order?: number | null
          system_prompt?: string | null
          temperature?: number | null
          type: Database["public"]["Enums"]["tipo_agente"]
          updated_at?: string | null
          uses_knowledge_base?: boolean | null
          voice_tones?: Json | null
        }
        Update: {
          allowed_data_access?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          description?: string | null
          escalation_options?: Json | null
          feature_custom?: Json | null
          feature_tags?: Json | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_tokens?: number | null
          model?: string | null
          name?: string
          scope?: Database["public"]["Enums"]["ai_agent_scope"] | null
          slug?: string
          sort_order?: number | null
          system_prompt?: string | null
          temperature?: number | null
          type?: Database["public"]["Enums"]["tipo_agente"]
          updated_at?: string | null
          uses_knowledge_base?: boolean | null
          voice_tones?: Json | null
        }
        Relationships: []
      }
      ai_limits: {
        Row: {
          agent_id: string
          created_at: string | null
          daily_limit: number | null
          id: string
          is_enabled: boolean | null
          max_agents_active: number | null
          max_documents_per_agent: number | null
          monthly_limit: number | null
          plan_id: string
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_agents_active?: number | null
          max_documents_per_agent?: number | null
          monthly_limit?: number | null
          plan_id: string
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          daily_limit?: number | null
          id?: string
          is_enabled?: boolean | null
          max_agents_active?: number | null
          max_documents_per_agent?: number | null
          monthly_limit?: number | null
          plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_limits_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_limits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_security_clauses: {
        Row: {
          applies_to:
            | Database["public"]["Enums"]["security_clause_applies"]
            | null
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          applies_to?:
            | Database["public"]["Enums"]["security_clause_applies"]
            | null
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          applies_to?:
            | Database["public"]["Enums"]["security_clause_applies"]
            | null
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          agent_id: string
          cost_usd: number | null
          created_at: string | null
          duration_ms: number | null
          id: string
          isp_id: string
          metadata: Json | null
          request_type: string | null
          tokens_input: number | null
          tokens_output: number | null
          tokens_total: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          isp_id: string
          metadata?: Json | null
          request_type?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tokens_total?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          cost_usd?: number | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          isp_id?: string
          metadata?: Json | null
          request_type?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          tokens_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          isp_id: string | null
          metadata: Json | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          isp_id?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          isp_id?: string | null
          metadata?: Json | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          channel: string
          content: string | null
          created_at: string | null
          created_by: string
          delivered_count: number | null
          failed_count: number | null
          filters: Json | null
          id: string
          isp_id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          template: string | null
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          content?: string | null
          created_at?: string | null
          created_by: string
          delivered_count?: number | null
          failed_count?: number | null
          filters?: Json | null
          id?: string
          isp_id: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          content?: string | null
          created_at?: string | null
          created_by?: string
          delivered_count?: number | null
          failed_count?: number | null
          filters?: Json | null
          id?: string
          isp_id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          template?: string | null
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      conversation_sessions: {
        Row: {
          attempts: number
          context: Json
          created_at: string
          current_state: string
          flow_id: string | null
          id: string
          isp_agent_id: string
          isp_id: string
          status: string
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          context?: Json
          created_at?: string
          current_state?: string
          flow_id?: string | null
          id?: string
          isp_agent_id: string
          isp_id: string
          status?: string
          step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          context?: Json
          created_at?: string
          current_state?: string
          flow_id?: string | null
          id?: string
          isp_agent_id?: string
          isp_id?: string
          status?: string
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_sessions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_flows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_sessions_isp_agent_id_fkey"
            columns: ["isp_agent_id"]
            isOneToOne: false
            referencedRelation: "isp_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_sessions_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          agent_id: string | null
          channel: string
          closed_at: string | null
          id: string
          isp_id: string
          messages: Json | null
          metadata: Json | null
          started_at: string | null
          status: string | null
          subject: string | null
          subscriber_id: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          channel: string
          closed_at?: string | null
          id?: string
          isp_id: string
          messages?: Json | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          subject?: string | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          channel?: string
          closed_at?: string | null
          id?: string
          isp_id?: string
          messages?: Json | null
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          subject?: string | null
          subscriber_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          embedding: string | null
          id: string
          isp_agent_id: string
          isp_id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          embedding?: string | null
          id?: string
          isp_agent_id: string
          isp_id: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          embedding?: string | null
          id?: string
          isp_agent_id?: string
          isp_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_logs: {
        Row: {
          created_at: string | null
          document_id: string | null
          error_code: string
          error_details: Json | null
          error_message: string
          id: string
          isp_agent_id: string | null
          isp_id: string
          processing_step: string
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          error_code: string
          error_details?: Json | null
          error_message: string
          id?: string
          isp_agent_id?: string | null
          isp_id: string
          processing_step: string
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          error_code?: string
          error_details?: Json | null
          error_message?: string
          id?: string
          isp_agent_id?: string | null
          isp_id?: string
          processing_step?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_processing_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_processing_logs_isp_agent_id_fkey"
            columns: ["isp_agent_id"]
            isOneToOne: false
            referencedRelation: "isp_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_processing_logs_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_configs: {
        Row: {
          api_key_encrypted: string | null
          api_url: string | null
          connected_at: string | null
          created_at: string | null
          display_name: string | null
          encryption_iv: string | null
          id: string
          is_active: boolean | null
          is_connected: boolean | null
          isp_id: string
          last_sync_at: string | null
          masked_key: string | null
          password_encrypted: string | null
          provider: string
          sync_config: Json | null
          sync_enabled: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          display_name?: string | null
          encryption_iv?: string | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          isp_id: string
          last_sync_at?: string | null
          masked_key?: string | null
          password_encrypted?: string | null
          provider: string
          sync_config?: Json | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          display_name?: string | null
          encryption_iv?: string | null
          id?: string
          is_active?: boolean | null
          is_connected?: boolean | null
          isp_id?: string
          last_sync_at?: string | null
          masked_key?: string | null
          password_encrypted?: string | null
          provider?: string
          sync_config?: Json | null
          sync_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_configs_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: true
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_state_definitions: {
        Row: {
          allowed_tools: string[]
          created_at: string
          fallback_message: string | null
          flow_id: string
          id: string
          is_active: boolean
          max_attempts: number
          objective: string
          state_key: string
          step_order: number
          transition_rules: Json
          updated_at: string
        }
        Insert: {
          allowed_tools?: string[]
          created_at?: string
          fallback_message?: string | null
          flow_id: string
          id?: string
          is_active?: boolean
          max_attempts?: number
          objective: string
          state_key: string
          step_order?: number
          transition_rules?: Json
          updated_at?: string
        }
        Update: {
          allowed_tools?: string[]
          created_at?: string
          fallback_message?: string | null
          flow_id?: string
          id?: string
          is_active?: boolean
          max_attempts?: number
          objective?: string
          state_key?: string
          step_order?: number
          transition_rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_state_definitions_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "ai_agent_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          slug: string
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      help_faqs: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_published: boolean | null
          not_helpful_count: number | null
          order_index: number | null
          question: string
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          order_index?: number | null
          question: string
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_published?: boolean | null
          not_helpful_count?: number | null
          order_index?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_faqs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tutorials: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_tutorials_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          external_id: string | null
          id: string
          invoice_url: string | null
          isp_id: string
          metadata: Json | null
          paid_at: string | null
          payment_method: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["status_fatura"] | null
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          isp_id: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["status_fatura"] | null
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          isp_id?: string
          metadata?: Json | null
          paid_at?: string | null
          payment_method?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["status_fatura"] | null
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      isp_agents: {
        Row: {
          additional_prompt: string | null
          agent_id: string
          avatar_url: string | null
          chunk_size: number | null
          created_at: string | null
          display_name: string | null
          escalation_config: Json | null
          id: string
          is_enabled: boolean | null
          isp_id: string
          updated_at: string | null
          voice_tone: string | null
        }
        Insert: {
          additional_prompt?: string | null
          agent_id: string
          avatar_url?: string | null
          chunk_size?: number | null
          created_at?: string | null
          display_name?: string | null
          escalation_config?: Json | null
          id?: string
          is_enabled?: boolean | null
          isp_id: string
          updated_at?: string | null
          voice_tone?: string | null
        }
        Update: {
          additional_prompt?: string | null
          agent_id?: string
          avatar_url?: string | null
          chunk_size?: number | null
          created_at?: string | null
          display_name?: string | null
          escalation_config?: Json | null
          id?: string
          is_enabled?: boolean | null
          isp_id?: string
          updated_at?: string | null
          voice_tone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "isp_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "isp_agents_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      isp_users: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean
          isp_id: string
          role: Database["public"]["Enums"]["isp_member_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean
          isp_id: string
          role?: Database["public"]["Enums"]["isp_member_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean
          isp_id?: string
          role?: Database["public"]["Enums"]["isp_member_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "isp_users_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      isps: {
        Row: {
          address: Json | null
          created_at: string | null
          document: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["status_cliente"] | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          document: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["status_cliente"] | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          document?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["status_cliente"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      knowledge_documents: {
        Row: {
          chunk_count: number | null
          created_at: string | null
          error_message: string | null
          id: string
          indexed_at: string | null
          isp_agent_id: string
          isp_id: string
          mime_type: string
          name: string
          original_filename: string
          size_bytes: number
          status: string | null
          storage_path: string
          updated_at: string | null
        }
        Insert: {
          chunk_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          isp_agent_id: string
          isp_id: string
          mime_type: string
          name: string
          original_filename: string
          size_bytes: number
          status?: string | null
          storage_path: string
          updated_at?: string | null
        }
        Update: {
          chunk_count?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          isp_agent_id?: string
          isp_id?: string
          mime_type?: string
          name?: string
          original_filename?: string
          size_bytes?: number
          status?: string | null
          storage_path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_isp_agent_id_fkey"
            columns: ["isp_agent_id"]
            isOneToOne: false
            referencedRelation: "isp_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_documents_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          limits: Json | null
          name: string
          price_monthly: number
          price_yearly: number | null
          slug: string
          sort_order: number | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          limits?: Json | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          slug: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          limits?: Json | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          slug?: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_config: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_configs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          plan_id: string | null
          resolution_hours: number
          response_hours: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          resolution_hours?: number
          response_hours?: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          plan_id?: string | null
          resolution_hours?: number
          response_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_configs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          address: Json | null
          created_at: string | null
          document: string | null
          due_day: number | null
          email: string | null
          external_id: string | null
          id: string
          isp_id: string
          metadata: Json | null
          monthly_value: number | null
          name: string
          notes: string | null
          phone: string | null
          plan_name: string | null
          status: Database["public"]["Enums"]["status_cliente"] | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          document?: string | null
          due_day?: number | null
          email?: string | null
          external_id?: string | null
          id?: string
          isp_id: string
          metadata?: Json | null
          monthly_value?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          plan_name?: string | null
          status?: Database["public"]["Enums"]["status_cliente"] | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          document?: string | null
          due_day?: number | null
          email?: string | null
          external_id?: string | null
          id?: string
          isp_id?: string
          metadata?: Json | null
          monthly_value?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          plan_name?: string | null
          status?: Database["public"]["Enums"]["status_cliente"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_reason: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          external_id: string | null
          id: string
          isp_id: string
          payment_method: Json | null
          plan_id: string
          status: Database["public"]["Enums"]["status_assinatura"] | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end: string
          current_period_start?: string
          external_id?: string | null
          id?: string
          isp_id: string
          payment_method?: Json | null
          plan_id: string
          status?: Database["public"]["Enums"]["status_assinatura"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          external_id?: string | null
          id?: string
          isp_id?: string
          payment_method?: Json | null
          plan_id?: string
          status?: Database["public"]["Enums"]["status_assinatura"] | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: true
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          is_staff: boolean | null
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          is_staff?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string | null
          description: string
          first_response_at: string | null
          id: string
          isp_id: string
          priority: string | null
          resolved_at: string | null
          sla_resolution_hours: number | null
          sla_response_hours: number | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string | null
          description: string
          first_response_at?: string | null
          id?: string
          isp_id: string
          priority?: string | null
          resolved_at?: string | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string | null
          description?: string
          first_response_at?: string | null
          id?: string
          isp_id?: string
          priority?: string | null
          resolved_at?: string | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      viability_checks: {
        Row: {
          address: string | null
          cep: string
          created_at: string | null
          email: string | null
          id: string
          is_viable: boolean | null
          name: string | null
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          cep: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_viable?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          cep?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_viable?: boolean | null
          name?: string | null
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          direction: string
          error_message: string | null
          event_type: string
          id: string
          isp_id: string | null
          payload: Json
          processed_at: string | null
          processing_time_ms: number | null
          provider: string
          response: Json | null
          retries: number | null
          status_code: number | null
        }
        Insert: {
          created_at?: string | null
          direction: string
          error_message?: string | null
          event_type: string
          id?: string
          isp_id?: string | null
          payload: Json
          processed_at?: string | null
          processing_time_ms?: number | null
          provider: string
          response?: Json | null
          retries?: number | null
          status_code?: number | null
        }
        Update: {
          created_at?: string | null
          direction?: string
          error_message?: string | null
          event_type?: string
          id?: string
          isp_id?: string | null
          payload?: Json
          processed_at?: string | null
          processing_time_ms?: number | null
          provider?: string
          response?: Json | null
          retries?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_configs: {
        Row: {
          api_key_encrypted: string | null
          api_url: string | null
          connected_at: string | null
          created_at: string | null
          encryption_iv: string | null
          id: string
          instance_name: string | null
          is_connected: boolean | null
          isp_id: string
          phone_number: string | null
          provider: string
          qr_code: string | null
          settings: Json | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          encryption_iv?: string | null
          id?: string
          instance_name?: string | null
          is_connected?: boolean | null
          isp_id: string
          phone_number?: string | null
          provider: string
          qr_code?: string | null
          settings?: Json | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_url?: string | null
          connected_at?: string | null
          created_at?: string | null
          encryption_iv?: string | null
          id?: string
          instance_name?: string | null
          is_connected?: boolean | null
          isp_id?: string
          phone_number?: string | null
          provider?: string
          qr_code?: string | null
          settings?: Json | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: true
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          conversation_id: string | null
          conversation_type: string | null
          cost_usd: number | null
          created_at: string
          delivered_at: string | null
          direction: string
          error_code: string | null
          error_message: string | null
          id: string
          isp_id: string | null
          message_type: string
          read_at: string | null
          recipient_phone: string | null
          sender_phone: string | null
          sent_at: string | null
          status: string
          status_updated_at: string | null
          subscriber_id: string | null
          template_name: string | null
          template_params: Json | null
          wamid: string | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          conversation_type?: string | null
          cost_usd?: number | null
          created_at?: string
          delivered_at?: string | null
          direction: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          isp_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_phone?: string | null
          sender_phone?: string | null
          sent_at?: string | null
          status?: string
          status_updated_at?: string | null
          subscriber_id?: string | null
          template_name?: string | null
          template_params?: Json | null
          wamid?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          conversation_type?: string | null
          cost_usd?: number | null
          created_at?: string
          delivered_at?: string | null
          direction?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          isp_id?: string | null
          message_type?: string
          read_at?: string | null
          recipient_phone?: string | null
          sender_phone?: string | null
          sent_at?: string | null
          status?: string
          status_updated_at?: string | null
          subscriber_id?: string | null
          template_name?: string | null
          template_params?: Json | null
          wamid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_isp_id_fkey"
            columns: ["isp_id"]
            isOneToOne: false
            referencedRelation: "isps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_messages_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_isp_id: { Args: { _user_id: string }; Returns: string }
      has_isp_permission: {
        Args: { _isp_id: string; _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_isp_admin: {
        Args: { _isp_id: string; _user_id: string }
        Returns: boolean
      }
      is_isp_member: {
        Args: { _isp_id: string; _user_id: string }
        Returns: boolean
      }
      match_document_chunks: {
        Args: {
          match_count?: number
          match_isp_agent_id: string
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      ai_agent_scope: "tenant" | "platform"
      app_role: "super_admin" | "admin" | "support"
      isp_member_role: "owner" | "admin" | "operator" | "viewer"
      security_clause_applies: "all" | "tenant" | "platform"
      status_assinatura:
        | "trial"
        | "ativa"
        | "suspensa"
        | "cancelada"
        | "expirada"
      status_cliente: "ativo" | "suspenso" | "cancelado" | "pendente"
      status_fatura: "pendente" | "pago" | "vencido" | "cancelado"
      tipo_agente:
        | "atendente"
        | "cobrador"
        | "vendedor"
        | "analista"
        | "suporte"
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
      ai_agent_scope: ["tenant", "platform"],
      app_role: ["super_admin", "admin", "support"],
      isp_member_role: ["owner", "admin", "operator", "viewer"],
      security_clause_applies: ["all", "tenant", "platform"],
      status_assinatura: [
        "trial",
        "ativa",
        "suspensa",
        "cancelada",
        "expirada",
      ],
      status_cliente: ["ativo", "suspenso", "cancelado", "pendente"],
      status_fatura: ["pendente", "pago", "vencido", "cancelado"],
      tipo_agente: ["atendente", "cobrador", "vendedor", "analista", "suporte"],
    },
  },
} as const
