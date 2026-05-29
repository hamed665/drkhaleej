export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointment_cancellations: {
        Row: {
          appointment_id: string
          cancellation_reason: Database["public"]["Enums"]["appointment_cancellation_reason"]
          cancelled_at: string
          cancelled_by_actor: Database["public"]["Enums"]["appointment_cancellation_actor"]
          cancelled_by_profile_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          note: string | null
          updated_at: string
        }
        Insert: {
          appointment_id: string
          cancellation_reason?: Database["public"]["Enums"]["appointment_cancellation_reason"]
          cancelled_at?: string
          cancelled_by_actor?: Database["public"]["Enums"]["appointment_cancellation_actor"]
          cancelled_by_profile_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          cancellation_reason?: Database["public"]["Enums"]["appointment_cancellation_reason"]
          cancelled_at?: string
          cancelled_by_actor?: Database["public"]["Enums"]["appointment_cancellation_actor"]
          cancelled_by_profile_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_cancellations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_cancellations_cancelled_by_profile_id_fkey"
            columns: ["cancelled_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_slots: {
        Row: {
          booked_count: number
          capacity: number
          center_id: string | null
          center_location_id: string | null
          center_service_id: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          doctor_practice_location_id: string | null
          doctor_schedule_exception_id: string | null
          doctor_schedule_id: string | null
          doctor_service_id: string | null
          end_time: string
          hold_expires_at: string | null
          id: string
          is_online: boolean
          is_walk_in: boolean
          metadata: Json
          notes_ar: string | null
          notes_en: string | null
          slot_date: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_slot_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          booked_count?: number
          capacity?: number
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          doctor_practice_location_id?: string | null
          doctor_schedule_exception_id?: string | null
          doctor_schedule_id?: string | null
          doctor_service_id?: string | null
          end_time: string
          hold_expires_at?: string | null
          id?: string
          is_online?: boolean
          is_walk_in?: boolean
          metadata?: Json
          notes_ar?: string | null
          notes_en?: string | null
          slot_date: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_slot_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          booked_count?: number
          capacity?: number
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          doctor_practice_location_id?: string | null
          doctor_schedule_exception_id?: string | null
          doctor_schedule_id?: string | null
          doctor_service_id?: string | null
          end_time?: string
          hold_expires_at?: string | null
          id?: string
          is_online?: boolean
          is_walk_in?: boolean
          metadata?: Json
          notes_ar?: string | null
          notes_en?: string | null
          slot_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_slot_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_slots_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_center_service_id_fkey"
            columns: ["center_service_id"]
            isOneToOne: false
            referencedRelation: "center_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_schedule_exception_id_fkey"
            columns: ["doctor_schedule_exception_id"]
            isOneToOne: false
            referencedRelation: "doctor_schedule_exceptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_schedule_id_fkey"
            columns: ["doctor_schedule_id"]
            isOneToOne: false
            referencedRelation: "doctor_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_service_id_fkey"
            columns: ["doctor_service_id"]
            isOneToOne: false
            referencedRelation: "doctor_services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_status_history: {
        Row: {
          appointment_id: string
          change_reason: string | null
          changed_by_profile_id: string | null
          created_at: string
          deleted_at: string | null
          from_status: Database["public"]["Enums"]["appointment_status"] | null
          id: string
          metadata: Json
          to_status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          appointment_id: string
          change_reason?: string | null
          changed_by_profile_id?: string | null
          created_at?: string
          deleted_at?: string | null
          from_status?: Database["public"]["Enums"]["appointment_status"] | null
          id?: string
          metadata?: Json
          to_status: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          appointment_id?: string
          change_reason?: string | null
          changed_by_profile_id?: string | null
          created_at?: string
          deleted_at?: string | null
          from_status?: Database["public"]["Enums"]["appointment_status"] | null
          id?: string
          metadata?: Json
          to_status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointment_status_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_status_history_changed_by_profile_id_fkey"
            columns: ["changed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_slot_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          center_id: string | null
          center_location_id: string | null
          center_service_id: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          doctor_practice_location_id: string | null
          doctor_service_id: string | null
          end_time: string
          id: string
          internal_note: string | null
          metadata: Json
          patient_contact_id: string
          patient_note: string | null
          requested_at: string
          slot_date: string
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          appointment_slot_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          doctor_practice_location_id?: string | null
          doctor_service_id?: string | null
          end_time: string
          id?: string
          internal_note?: string | null
          metadata?: Json
          patient_contact_id: string
          patient_note?: string | null
          requested_at?: string
          slot_date: string
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          appointment_slot_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          doctor_practice_location_id?: string | null
          doctor_service_id?: string | null
          end_time?: string
          id?: string
          internal_note?: string | null
          metadata?: Json
          patient_contact_id?: string
          patient_note?: string | null
          requested_at?: string
          slot_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_appointment_slot_id_fkey"
            columns: ["appointment_slot_id"]
            isOneToOne: false
            referencedRelation: "appointment_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_center_service_id_fkey"
            columns: ["center_service_id"]
            isOneToOne: false
            referencedRelation: "center_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_service_id_fkey"
            columns: ["doctor_service_id"]
            isOneToOne: false
            referencedRelation: "doctor_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_contact_id_fkey"
            columns: ["patient_contact_id"]
            isOneToOne: false
            referencedRelation: "patient_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action_type"]
          actor_profile_id: string | null
          actor_type: Database["public"]["Enums"]["audit_actor_type"]
          after_data: Json | null
          before_data: Json | null
          created_at: string
          deleted_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          metadata: Json
          request_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action_type"]
          actor_profile_id?: string | null
          actor_type?: Database["public"]["Enums"]["audit_actor_type"]
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          request_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action_type"]
          actor_profile_id?: string | null
          actor_type?: Database["public"]["Enums"]["audit_actor_type"]
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          request_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      callback_requests: {
        Row: {
          center_id: string
          center_location_id: string | null
          consent_to_contact: boolean
          country_code: Database["public"]["Enums"]["country_code"]
          created_at: string
          deleted_at: string | null
          doctor_id: string | null
          doctor_practice_location_id: string | null
          handled_at: string | null
          id: string
          locale: Database["public"]["Enums"]["app_locale"]
          message: string | null
          metadata: Json
          preferred_language: string | null
          priority: string
          profile_id: string | null
          request_source: string
          requester_name: string
          requester_phone: string
          status: string
          updated_at: string
        }
        Insert: {
          center_id: string
          center_location_id?: string | null
          consent_to_contact?: boolean
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          doctor_practice_location_id?: string | null
          handled_at?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["app_locale"]
          message?: string | null
          metadata?: Json
          preferred_language?: string | null
          priority?: string
          profile_id?: string | null
          request_source?: string
          requester_name: string
          requester_phone: string
          status?: string
          updated_at?: string
        }
        Update: {
          center_id?: string
          center_location_id?: string | null
          consent_to_contact?: boolean
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          doctor_practice_location_id?: string | null
          handled_at?: string | null
          id?: string
          locale?: Database["public"]["Enums"]["app_locale"]
          message?: string | null
          metadata?: Json
          preferred_language?: string | null
          priority?: string
          profile_id?: string | null
          request_source?: string
          requester_name?: string
          requester_phone?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "callback_requests_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "callback_requests_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "callback_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "callback_requests_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "callback_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      center_claims: {
        Row: {
          approved_at: string | null
          center_id: string
          claim_status: Database["public"]["Enums"]["claim_status"]
          claimant_email: string | null
          claimant_name: string | null
          claimant_phone: string | null
          claimant_position: string | null
          claimant_profile_id: string
          created_at: string
          deleted_at: string | null
          evidence: Json
          id: string
          metadata: Json
          rejected_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by_profile_id: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          center_id: string
          claim_status?: Database["public"]["Enums"]["claim_status"]
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_position?: string | null
          claimant_profile_id: string
          created_at?: string
          deleted_at?: string | null
          evidence?: Json
          id?: string
          metadata?: Json
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_profile_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          center_id?: string
          claim_status?: Database["public"]["Enums"]["claim_status"]
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_position?: string | null
          claimant_profile_id?: string
          created_at?: string
          deleted_at?: string | null
          evidence?: Json
          id?: string
          metadata?: Json
          rejected_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by_profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_claims_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_claims_claimant_profile_id_fkey"
            columns: ["claimant_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_claims_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      center_locations: {
        Row: {
          address_line1_ar: string | null
          address_line1_en: string | null
          address_line2_ar: string | null
          address_line2_en: string | null
          area_id: string | null
          center_id: string
          city_id: string
          contact_review_status: string
          contact_reviewed_at: string | null
          country_id: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_active: boolean
          is_primary: boolean
          landmark_ar: string | null
          landmark_en: string | null
          latitude: number | null
          longitude: number | null
          map_url: string | null
          metadata: Json
          name_ar: string | null
          name_en: string | null
          postal_code: string | null
          primary_phone: string | null
          public_email_visible: boolean
          public_primary_phone_visible: boolean
          public_secondary_phone_visible: boolean
          public_whatsapp_phone_visible: boolean
          region_id: string
          secondary_phone: string | null
          slug: string
          sort_order: number
          updated_at: string
          whatsapp_phone: string | null
        }
        Insert: {
          address_line1_ar?: string | null
          address_line1_en?: string | null
          address_line2_ar?: string | null
          address_line2_en?: string | null
          area_id?: string | null
          center_id: string
          city_id: string
          contact_review_status?: string
          contact_reviewed_at?: string | null
          country_id: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          landmark_ar?: string | null
          landmark_en?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          metadata?: Json
          name_ar?: string | null
          name_en?: string | null
          postal_code?: string | null
          primary_phone?: string | null
          public_email_visible?: boolean
          public_primary_phone_visible?: boolean
          public_secondary_phone_visible?: boolean
          public_whatsapp_phone_visible?: boolean
          region_id: string
          secondary_phone?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Update: {
          address_line1_ar?: string | null
          address_line1_en?: string | null
          address_line2_ar?: string | null
          address_line2_en?: string | null
          area_id?: string | null
          center_id?: string
          city_id?: string
          contact_review_status?: string
          contact_reviewed_at?: string | null
          country_id?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_primary?: boolean
          landmark_ar?: string | null
          landmark_en?: string | null
          latitude?: number | null
          longitude?: number | null
          map_url?: string | null
          metadata?: Json
          name_ar?: string | null
          name_en?: string | null
          postal_code?: string | null
          primary_phone?: string | null
          public_email_visible?: boolean
          public_primary_phone_visible?: boolean
          public_secondary_phone_visible?: boolean
          public_whatsapp_phone_visible?: boolean
          region_id?: string
          secondary_phone?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "center_locations_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "geo_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_locations_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "geo_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_locations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_locations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "geo_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      center_memberships: {
        Row: {
          accepted_at: string | null
          approved_at: string | null
          approved_by_profile_id: string | null
          center_id: string
          created_at: string
          deleted_at: string | null
          id: string
          invite_email: string | null
          invite_phone: string | null
          invited_at: string | null
          invited_by_profile_id: string | null
          metadata: Json
          profile_id: string
          removed_at: string | null
          role: Database["public"]["Enums"]["center_member_role"]
          status: Database["public"]["Enums"]["center_membership_status"]
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          approved_at?: string | null
          approved_by_profile_id?: string | null
          center_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          invite_email?: string | null
          invite_phone?: string | null
          invited_at?: string | null
          invited_by_profile_id?: string | null
          metadata?: Json
          profile_id: string
          removed_at?: string | null
          role?: Database["public"]["Enums"]["center_member_role"]
          status?: Database["public"]["Enums"]["center_membership_status"]
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          approved_at?: string | null
          approved_by_profile_id?: string | null
          center_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          invite_email?: string | null
          invite_phone?: string | null
          invited_at?: string | null
          invited_by_profile_id?: string | null
          metadata?: Json
          profile_id?: string
          removed_at?: string | null
          role?: Database["public"]["Enums"]["center_member_role"]
          status?: Database["public"]["Enums"]["center_membership_status"]
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_memberships_approved_by_profile_id_fkey"
            columns: ["approved_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_memberships_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_memberships_invited_by_profile_id_fkey"
            columns: ["invited_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      center_services: {
        Row: {
          center_id: string
          center_location_id: string | null
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          display_name_ar: string | null
          display_name_en: string | null
          id: string
          is_available: boolean
          is_featured: boolean
          metadata: Json
          requires_medical_disclaimer: boolean
          service_category_id: string | null
          service_id: string | null
          slug: string | null
          sort_order: number
          specialty_id: string | null
          taxonomy_group_id: string | null
          updated_at: string
        }
        Insert: {
          center_id: string
          center_location_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          requires_medical_disclaimer?: boolean
          service_category_id?: string | null
          service_id?: string | null
          slug?: string | null
          sort_order?: number
          specialty_id?: string | null
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Update: {
          center_id?: string
          center_location_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          requires_medical_disclaimer?: boolean
          service_category_id?: string | null
          service_id?: string | null
          slug?: string | null
          sort_order?: number
          specialty_id?: string | null
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_services_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_services_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_services_taxonomy_group_id_fkey"
            columns: ["taxonomy_group_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      center_subscriptions: {
        Row: {
          agreed_price_amount: number | null
          billing_interval: Database["public"]["Enums"]["plan_interval"]
          cancelled_at: string | null
          center_id: string
          created_at: string
          currency_code: string
          deleted_at: string | null
          ends_at: string | null
          id: string
          metadata: Json
          notes: string | null
          sales_profile_id: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["center_subscription_status"]
          subscription_plan_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          agreed_price_amount?: number | null
          billing_interval?: Database["public"]["Enums"]["plan_interval"]
          cancelled_at?: string | null
          center_id: string
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          sales_profile_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["center_subscription_status"]
          subscription_plan_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          agreed_price_amount?: number | null
          billing_interval?: Database["public"]["Enums"]["plan_interval"]
          cancelled_at?: string | null
          center_id?: string
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          sales_profile_id?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["center_subscription_status"]
          subscription_plan_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "center_subscriptions_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_subscriptions_sales_profile_id_fkey"
            columns: ["sales_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "center_subscriptions_subscription_plan_id_fkey"
            columns: ["subscription_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      centers: {
        Row: {
          center_type: Database["public"]["Enums"]["center_type"]
          contact_review_status: string
          contact_reviewed_at: string | null
          cover_image_url: string | null
          created_at: string
          default_country: Database["public"]["Enums"]["country_code"]
          default_locale: Database["public"]["Enums"]["app_locale"]
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          email: string | null
          id: string
          is_active: boolean
          is_claimable: boolean
          is_featured: boolean
          legal_name: string | null
          logo_url: string | null
          metadata: Json
          name_ar: string | null
          name_en: string
          primary_phone: string | null
          public_email_visible: boolean
          public_primary_phone_visible: boolean
          public_secondary_phone_visible: boolean
          public_whatsapp_phone_visible: boolean
          secondary_phone: string | null
          short_description_ar: string | null
          short_description_en: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["provider_status"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          website_url: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          center_type: Database["public"]["Enums"]["center_type"]
          contact_review_status?: string
          contact_reviewed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_country?: Database["public"]["Enums"]["country_code"]
          default_locale?: Database["public"]["Enums"]["app_locale"]
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_claimable?: boolean
          is_featured?: boolean
          legal_name?: string | null
          logo_url?: string | null
          metadata?: Json
          name_ar?: string | null
          name_en: string
          primary_phone?: string | null
          public_email_visible?: boolean
          public_primary_phone_visible?: boolean
          public_secondary_phone_visible?: boolean
          public_whatsapp_phone_visible?: boolean
          secondary_phone?: string | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          center_type?: Database["public"]["Enums"]["center_type"]
          contact_review_status?: string
          contact_reviewed_at?: string | null
          cover_image_url?: string | null
          created_at?: string
          default_country?: Database["public"]["Enums"]["country_code"]
          default_locale?: Database["public"]["Enums"]["app_locale"]
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          is_claimable?: boolean
          is_featured?: boolean
          legal_name?: string | null
          logo_url?: string | null
          metadata?: Json
          name_ar?: string | null
          name_en?: string
          primary_phone?: string | null
          public_email_visible?: boolean
          public_primary_phone_visible?: boolean
          public_secondary_phone_visible?: boolean
          public_whatsapp_phone_visible?: boolean
          secondary_phone?: string | null
          short_description_ar?: string | null
          short_description_en?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website_url?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      consent_logs: {
        Row: {
          anonymous_id: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          consented: boolean
          consented_at: string
          country_code: Database["public"]["Enums"]["country_code"]
          created_at: string
          deleted_at: string | null
          id: string
          ip_hash: string | null
          legal_document_id: string | null
          locale: Database["public"]["Enums"]["app_locale"]
          metadata: Json
          patient_contact_id: string | null
          profile_id: string | null
          source: string | null
          user_agent: string | null
        }
        Insert: {
          anonymous_id?: string | null
          consent_type: Database["public"]["Enums"]["consent_type"]
          consented?: boolean
          consented_at?: string
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          ip_hash?: string | null
          legal_document_id?: string | null
          locale?: Database["public"]["Enums"]["app_locale"]
          metadata?: Json
          patient_contact_id?: string | null
          profile_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Update: {
          anonymous_id?: string | null
          consent_type?: Database["public"]["Enums"]["consent_type"]
          consented?: boolean
          consented_at?: string
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          ip_hash?: string | null
          legal_document_id?: string | null
          locale?: Database["public"]["Enums"]["app_locale"]
          metadata?: Json
          patient_contact_id?: string | null
          profile_id?: string | null
          source?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_logs_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_logs_patient_contact_id_fkey"
            columns: ["patient_contact_id"]
            isOneToOne: false
            referencedRelation: "patient_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_practice_locations: {
        Row: {
          bio_override_ar: string | null
          bio_override_en: string | null
          center_id: string
          center_location_id: string | null
          consultation_note_ar: string | null
          consultation_note_en: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          id: string
          is_accepting_new_patients: boolean
          is_active: boolean
          is_primary: boolean
          metadata: Json
          primary_specialty_id: string | null
          sort_order: number
          title_override_ar: string | null
          title_override_en: string | null
          updated_at: string
        }
        Insert: {
          bio_override_ar?: string | null
          bio_override_en?: string | null
          center_id: string
          center_location_id?: string | null
          consultation_note_ar?: string | null
          consultation_note_en?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          id?: string
          is_accepting_new_patients?: boolean
          is_active?: boolean
          is_primary?: boolean
          metadata?: Json
          primary_specialty_id?: string | null
          sort_order?: number
          title_override_ar?: string | null
          title_override_en?: string | null
          updated_at?: string
        }
        Update: {
          bio_override_ar?: string | null
          bio_override_en?: string | null
          center_id?: string
          center_location_id?: string | null
          consultation_note_ar?: string | null
          consultation_note_en?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          id?: string
          is_accepting_new_patients?: boolean
          is_active?: boolean
          is_primary?: boolean
          metadata?: Json
          primary_specialty_id?: string | null
          sort_order?: number
          title_override_ar?: string | null
          title_override_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_practice_locations_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_practice_locations_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_practice_locations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_practice_locations_primary_specialty_id_fkey"
            columns: ["primary_specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedule_exceptions: {
        Row: {
          center_id: string | null
          center_location_id: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string
          doctor_practice_location_id: string | null
          doctor_schedule_id: string | null
          end_time: string | null
          exception_date: string
          exception_type: Database["public"]["Enums"]["doctor_schedule_exception_type"]
          id: string
          is_available: boolean
          metadata: Json
          reason_ar: string | null
          reason_en: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          center_id?: string | null
          center_location_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id: string
          doctor_practice_location_id?: string | null
          doctor_schedule_id?: string | null
          end_time?: string | null
          exception_date: string
          exception_type: Database["public"]["Enums"]["doctor_schedule_exception_type"]
          id?: string
          is_available?: boolean
          metadata?: Json
          reason_ar?: string | null
          reason_en?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          center_id?: string | null
          center_location_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string
          doctor_practice_location_id?: string | null
          doctor_schedule_id?: string | null
          end_time?: string | null
          exception_date?: string
          exception_type?: Database["public"]["Enums"]["doctor_schedule_exception_type"]
          id?: string
          is_available?: boolean
          metadata?: Json
          reason_ar?: string | null
          reason_en?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedule_exceptions_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedule_exceptions_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedule_exceptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedule_exceptions_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedule_exceptions_doctor_schedule_id_fkey"
            columns: ["doctor_schedule_id"]
            isOneToOne: false
            referencedRelation: "doctor_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          center_id: string | null
          center_location_id: string | null
          created_at: string
          day_of_week: Database["public"]["Enums"]["doctor_schedule_day"]
          deleted_at: string | null
          doctor_id: string
          doctor_practice_location_id: string | null
          effective_from: string | null
          effective_to: string | null
          end_time: string
          id: string
          is_active: boolean
          metadata: Json
          notes_ar: string | null
          notes_en: string | null
          slot_minutes: number | null
          start_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          center_id?: string | null
          center_location_id?: string | null
          created_at?: string
          day_of_week: Database["public"]["Enums"]["doctor_schedule_day"]
          deleted_at?: string | null
          doctor_id: string
          doctor_practice_location_id?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          metadata?: Json
          notes_ar?: string | null
          notes_en?: string | null
          slot_minutes?: number | null
          start_time: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          center_id?: string | null
          center_location_id?: string | null
          created_at?: string
          day_of_week?: Database["public"]["Enums"]["doctor_schedule_day"]
          deleted_at?: string | null
          doctor_id?: string
          doctor_practice_location_id?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          notes_ar?: string | null
          notes_en?: string | null
          slot_minutes?: number | null
          start_time?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedules_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_schedules_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_services: {
        Row: {
          center_id: string | null
          center_location_id: string | null
          center_service_id: string | null
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          display_name_ar: string | null
          display_name_en: string | null
          doctor_id: string
          doctor_practice_location_id: string | null
          id: string
          is_available: boolean
          is_featured: boolean
          metadata: Json
          requires_medical_disclaimer: boolean
          service_category_id: string | null
          service_id: string | null
          slug: string | null
          sort_order: number
          specialty_id: string | null
          taxonomy_group_id: string | null
          updated_at: string
        }
        Insert: {
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          doctor_id: string
          doctor_practice_location_id?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          requires_medical_disclaimer?: boolean
          service_category_id?: string | null
          service_id?: string | null
          slug?: string | null
          sort_order?: number
          specialty_id?: string | null
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Update: {
          center_id?: string | null
          center_location_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          doctor_id?: string
          doctor_practice_location_id?: string | null
          id?: string
          is_available?: boolean
          is_featured?: boolean
          metadata?: Json
          requires_medical_disclaimer?: boolean
          service_category_id?: string | null
          service_id?: string | null
          slug?: string | null
          sort_order?: number
          specialty_id?: string | null
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_services_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_center_location_id_fkey"
            columns: ["center_location_id"]
            isOneToOne: false
            referencedRelation: "center_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_center_service_id_fkey"
            columns: ["center_service_id"]
            isOneToOne: false
            referencedRelation: "center_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_doctor_practice_location_id_fkey"
            columns: ["doctor_practice_location_id"]
            isOneToOne: false
            referencedRelation: "doctor_practice_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_service_category_id_fkey"
            columns: ["service_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_services_taxonomy_group_id_fkey"
            columns: ["taxonomy_group_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          created_at: string
          default_country: Database["public"]["Enums"]["country_code"]
          default_locale: Database["public"]["Enums"]["app_locale"]
          deleted_at: string | null
          display_name_ar: string | null
          display_name_en: string | null
          full_name_ar: string | null
          full_name_en: string
          gender: Database["public"]["Enums"]["doctor_gender"]
          id: string
          is_active: boolean
          is_claimable: boolean
          is_featured: boolean
          license_number: string | null
          metadata: Json
          primary_specialty_id: string | null
          profile_image_url: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["provider_status"]
          title: Database["public"]["Enums"]["doctor_title"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          years_experience: number | null
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          default_country?: Database["public"]["Enums"]["country_code"]
          default_locale?: Database["public"]["Enums"]["app_locale"]
          deleted_at?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          full_name_ar?: string | null
          full_name_en: string
          gender?: Database["public"]["Enums"]["doctor_gender"]
          id?: string
          is_active?: boolean
          is_claimable?: boolean
          is_featured?: boolean
          license_number?: string | null
          metadata?: Json
          primary_specialty_id?: string | null
          profile_image_url?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["provider_status"]
          title?: Database["public"]["Enums"]["doctor_title"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          created_at?: string
          default_country?: Database["public"]["Enums"]["country_code"]
          default_locale?: Database["public"]["Enums"]["app_locale"]
          deleted_at?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          full_name_ar?: string | null
          full_name_en?: string
          gender?: Database["public"]["Enums"]["doctor_gender"]
          id?: string
          is_active?: boolean
          is_claimable?: boolean
          is_featured?: boolean
          license_number?: string | null
          metadata?: Json
          primary_specialty_id?: string | null
          profile_image_url?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["provider_status"]
          title?: Database["public"]["Enums"]["doctor_title"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_primary_specialty_id_fkey"
            columns: ["primary_specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_media: {
        Row: {
          alt_text_ar: string | null
          alt_text_en: string | null
          caption_ar: string | null
          caption_en: string | null
          created_at: string
          deleted_at: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["media_entity_type"]
          id: string
          is_featured: boolean
          is_primary: boolean
          media_asset_id: string
          metadata: Json
          sort_order: number
          updated_at: string
          usage_kind: Database["public"]["Enums"]["media_usage_kind"]
        }
        Insert: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["media_entity_type"]
          id?: string
          is_featured?: boolean
          is_primary?: boolean
          media_asset_id: string
          metadata?: Json
          sort_order?: number
          updated_at?: string
          usage_kind?: Database["public"]["Enums"]["media_usage_kind"]
        }
        Update: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          deleted_at?: string | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["media_entity_type"]
          id?: string
          is_featured?: boolean
          is_primary?: boolean
          media_asset_id?: string
          metadata?: Json
          sort_order?: number
          updated_at?: string
          usage_kind?: Database["public"]["Enums"]["media_usage_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "entity_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_areas: {
        Row: {
          city_id: string
          country_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          metadata: Json
          name_ar: string
          name_en: string
          region_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          city_id: string
          country_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name_ar: string
          name_en: string
          region_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          city_id?: string
          country_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name_ar?: string
          name_en?: string
          region_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "geo_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_areas_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_areas_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "geo_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_cities: {
        Row: {
          country_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          is_capital: boolean
          metadata: Json
          name_ar: string
          name_en: string
          region_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_capital?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          region_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          is_capital?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          region_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geo_cities_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "geo_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      geo_countries: {
        Row: {
          code: Database["public"]["Enums"]["country_code"]
          created_at: string
          currency_code: string | null
          deleted_at: string | null
          id: string
          is_active: boolean
          metadata: Json
          name_ar: string
          name_en: string
          phone_country_code: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          phone_country_code?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          currency_code?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          phone_country_code?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      geo_regions: {
        Row: {
          country_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          metadata: Json
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          country_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          country_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geo_regions_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "geo_countries"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          body_ar: string | null
          body_en: string
          created_at: string
          created_by_profile_id: string | null
          deleted_at: string | null
          document_type: Database["public"]["Enums"]["consent_type"]
          effective_at: string | null
          id: string
          metadata: Json
          published_at: string | null
          status: Database["public"]["Enums"]["legal_document_status"]
          title_ar: string | null
          title_en: string
          updated_at: string
          version: string
        }
        Insert: {
          body_ar?: string | null
          body_en: string
          created_at?: string
          created_by_profile_id?: string | null
          deleted_at?: string | null
          document_type: Database["public"]["Enums"]["consent_type"]
          effective_at?: string | null
          id?: string
          metadata?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["legal_document_status"]
          title_ar?: string | null
          title_en: string
          updated_at?: string
          version: string
        }
        Update: {
          body_ar?: string | null
          body_en?: string
          created_at?: string
          created_by_profile_id?: string | null
          deleted_at?: string | null
          document_type?: Database["public"]["Enums"]["consent_type"]
          effective_at?: string | null
          id?: string
          metadata?: Json
          published_at?: string | null
          status?: Database["public"]["Enums"]["legal_document_status"]
          title_ar?: string | null
          title_en?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          blurhash: string | null
          checksum_sha256: string | null
          created_at: string
          created_by_profile_id: string | null
          deleted_at: string | null
          external_url: string | null
          file_size_bytes: number | null
          height: number | null
          id: string
          metadata: Json
          mime_type: string | null
          original_filename: string | null
          public_url: string | null
          source: Database["public"]["Enums"]["media_asset_source"]
          status: Database["public"]["Enums"]["media_asset_status"]
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string
          width: number | null
        }
        Insert: {
          blurhash?: string | null
          checksum_sha256?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          deleted_at?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_filename?: string | null
          public_url?: string | null
          source?: Database["public"]["Enums"]["media_asset_source"]
          status?: Database["public"]["Enums"]["media_asset_status"]
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          blurhash?: string | null
          checksum_sha256?: string | null
          created_at?: string
          created_by_profile_id?: string | null
          deleted_at?: string | null
          external_url?: string | null
          file_size_bytes?: number | null
          height?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          original_filename?: string | null
          public_url?: string | null
          source?: Database["public"]["Enums"]["media_asset_source"]
          status?: Database["public"]["Enums"]["media_asset_status"]
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_contacts: {
        Row: {
          birth_year: number | null
          country_code: Database["public"]["Enums"]["country_code"]
          created_at: string
          deleted_at: string | null
          email: string | null
          full_name: string
          gender: Database["public"]["Enums"]["patient_contact_gender"]
          id: string
          metadata: Json
          phone: string
          preferred_locale: Database["public"]["Enums"]["app_locale"]
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          birth_year?: number | null
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name: string
          gender?: Database["public"]["Enums"]["patient_contact_gender"]
          id?: string
          metadata?: Json
          phone: string
          preferred_locale?: Database["public"]["Enums"]["app_locale"]
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_year?: number | null
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["patient_contact_gender"]
          id?: string
          metadata?: Json
          phone?: string
          preferred_locale?: Database["public"]["Enums"]["app_locale"]
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          country: Database["public"]["Enums"]["country_code"]
          created_at: string
          deleted_at: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_patient_user: boolean
          is_platform_admin: boolean
          is_provider_user: boolean
          locale: Database["public"]["Enums"]["app_locale"]
          metadata: Json
          phone: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_patient_user?: boolean
          is_platform_admin?: boolean
          is_provider_user?: boolean
          locale?: Database["public"]["Enums"]["app_locale"]
          metadata?: Json
          phone?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_patient_user?: boolean
          is_platform_admin?: boolean
          is_provider_user?: boolean
          locale?: Database["public"]["Enums"]["app_locale"]
          metadata?: Json
          phone?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json
          note: string | null
          reason: Database["public"]["Enums"]["review_report_reason"]
          reported_by_patient_contact_id: string | null
          reported_by_profile_id: string | null
          resolved_at: string | null
          review_id: string
          reviewed_at: string | null
          reviewed_by_profile_id: string | null
          status: Database["public"]["Enums"]["review_report_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          reason?: Database["public"]["Enums"]["review_report_reason"]
          reported_by_patient_contact_id?: string | null
          reported_by_profile_id?: string | null
          resolved_at?: string | null
          review_id: string
          reviewed_at?: string | null
          reviewed_by_profile_id?: string | null
          status?: Database["public"]["Enums"]["review_report_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json
          note?: string | null
          reason?: Database["public"]["Enums"]["review_report_reason"]
          reported_by_patient_contact_id?: string | null
          reported_by_profile_id?: string | null
          resolved_at?: string | null
          review_id?: string
          reviewed_at?: string | null
          reviewed_by_profile_id?: string | null
          status?: Database["public"]["Enums"]["review_report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_reported_by_patient_contact_id_fkey"
            columns: ["reported_by_patient_contact_id"]
            isOneToOne: false
            referencedRelation: "patient_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reported_by_profile_id_fkey"
            columns: ["reported_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_reviewed_by_profile_id_fkey"
            columns: ["reviewed_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          appointment_id: string | null
          approved_at: string | null
          body: string | null
          center_id: string | null
          center_service_id: string | null
          created_at: string
          deleted_at: string | null
          doctor_id: string | null
          doctor_service_id: string | null
          id: string
          is_featured: boolean
          is_verified: boolean
          metadata: Json
          patient_contact_id: string | null
          rating: number
          rejected_at: string | null
          source_locale: Database["public"]["Enums"]["app_locale"]
          status: Database["public"]["Enums"]["review_status"]
          submitted_at: string
          target_type: Database["public"]["Enums"]["review_target_type"]
          title: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          approved_at?: string | null
          body?: string | null
          center_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          doctor_service_id?: string | null
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          metadata?: Json
          patient_contact_id?: string | null
          rating: number
          rejected_at?: string | null
          source_locale?: Database["public"]["Enums"]["app_locale"]
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          target_type: Database["public"]["Enums"]["review_target_type"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          approved_at?: string | null
          body?: string | null
          center_id?: string | null
          center_service_id?: string | null
          created_at?: string
          deleted_at?: string | null
          doctor_id?: string | null
          doctor_service_id?: string | null
          id?: string
          is_featured?: boolean
          is_verified?: boolean
          metadata?: Json
          patient_contact_id?: string | null
          rating?: number
          rejected_at?: string | null
          source_locale?: Database["public"]["Enums"]["app_locale"]
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          target_type?: Database["public"]["Enums"]["review_target_type"]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_center_service_id_fkey"
            columns: ["center_service_id"]
            isOneToOne: false
            referencedRelation: "center_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_doctor_service_id_fkey"
            columns: ["doctor_service_id"]
            isOneToOne: false
            referencedRelation: "doctor_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_patient_contact_id_fkey"
            columns: ["patient_contact_id"]
            isOneToOne: false
            referencedRelation: "patient_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          is_medical: boolean
          metadata: Json
          name_ar: string
          name_en: string
          parent_category_id: string | null
          slug: string
          sort_order: number
          taxonomy_group_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          parent_category_id?: string | null
          slug: string
          sort_order?: number
          taxonomy_group_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          parent_category_id?: string | null
          slug?: string
          sort_order?: number
          taxonomy_group_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_categories_taxonomy_group_id_fkey"
            columns: ["taxonomy_group_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          is_medical: boolean
          metadata: Json
          name_ar: string
          name_en: string
          requires_medical_disclaimer: boolean
          search_keywords_ar: string[]
          search_keywords_en: string[]
          slug: string
          sort_order: number
          taxonomy_group_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          requires_medical_disclaimer?: boolean
          search_keywords_ar?: string[]
          search_keywords_en?: string[]
          slug: string
          sort_order?: number
          taxonomy_group_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          requires_medical_disclaimer?: boolean
          search_keywords_ar?: string[]
          search_keywords_en?: string[]
          slug?: string
          sort_order?: number
          taxonomy_group_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_taxonomy_group_id_fkey"
            columns: ["taxonomy_group_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          is_medical: boolean
          metadata: Json
          name_ar: string
          name_en: string
          requires_medical_disclaimer: boolean
          slug: string
          sort_order: number
          taxonomy_group_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          requires_medical_disclaimer?: boolean
          slug: string
          sort_order?: number
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          requires_medical_disclaimer?: boolean
          slug?: string
          sort_order?: number
          taxonomy_group_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_taxonomy_group_id_fkey"
            columns: ["taxonomy_group_id"]
            isOneToOne: false
            referencedRelation: "taxonomy_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_campaigns: {
        Row: {
          budget_amount: number | null
          center_id: string
          created_at: string
          created_by_profile_id: string | null
          currency_code: string
          deleted_at: string | null
          ends_at: string | null
          id: string
          metadata: Json
          starts_at: string | null
          status: Database["public"]["Enums"]["sponsored_campaign_status"]
          title_ar: string | null
          title_en: string
          updated_at: string
        }
        Insert: {
          budget_amount?: number | null
          center_id: string
          created_at?: string
          created_by_profile_id?: string | null
          currency_code?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["sponsored_campaign_status"]
          title_ar?: string | null
          title_en: string
          updated_at?: string
        }
        Update: {
          budget_amount?: number | null
          center_id?: string
          created_at?: string
          created_by_profile_id?: string | null
          currency_code?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          metadata?: Json
          starts_at?: string | null
          status?: Database["public"]["Enums"]["sponsored_campaign_status"]
          title_ar?: string | null
          title_en?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_campaigns_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_campaigns_created_by_profile_id_fkey"
            columns: ["created_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_placements: {
        Row: {
          campaign_id: string
          country_code: Database["public"]["Enums"]["country_code"]
          created_at: string
          deleted_at: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          locale: Database["public"]["Enums"]["app_locale"] | null
          metadata: Json
          placement_key: string | null
          priority: number
          slot_type: Database["public"]["Enums"]["sponsored_slot_type"]
          starts_at: string | null
          target_center_id: string | null
          target_center_service_id: string | null
          target_doctor_id: string | null
          target_doctor_service_id: string | null
          updated_at: string
        }
        Insert: {
          campaign_id: string
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          locale?: Database["public"]["Enums"]["app_locale"] | null
          metadata?: Json
          placement_key?: string | null
          priority?: number
          slot_type?: Database["public"]["Enums"]["sponsored_slot_type"]
          starts_at?: string | null
          target_center_id?: string | null
          target_center_service_id?: string | null
          target_doctor_id?: string | null
          target_doctor_service_id?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          country_code?: Database["public"]["Enums"]["country_code"]
          created_at?: string
          deleted_at?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          locale?: Database["public"]["Enums"]["app_locale"] | null
          metadata?: Json
          placement_key?: string | null
          priority?: number
          slot_type?: Database["public"]["Enums"]["sponsored_slot_type"]
          starts_at?: string | null
          target_center_id?: string | null
          target_center_service_id?: string | null
          target_doctor_id?: string | null
          target_doctor_service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_placements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "sponsored_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_placements_target_center_id_fkey"
            columns: ["target_center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_placements_target_center_service_id_fkey"
            columns: ["target_center_service_id"]
            isOneToOne: false
            referencedRelation: "center_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_placements_target_doctor_id_fkey"
            columns: ["target_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_placements_target_doctor_service_id_fkey"
            columns: ["target_doctor_service_id"]
            isOneToOne: false
            referencedRelation: "doctor_services"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency_code: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          includes_claim_badge: boolean
          includes_featured_listing: boolean
          includes_media_gallery: boolean
          interval: Database["public"]["Enums"]["plan_interval"]
          max_doctors: number | null
          max_locations: number | null
          max_services: number | null
          metadata: Json
          name_ar: string | null
          name_en: string
          price_amount: number
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["subscription_plan_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          includes_claim_badge?: boolean
          includes_featured_listing?: boolean
          includes_media_gallery?: boolean
          interval?: Database["public"]["Enums"]["plan_interval"]
          max_doctors?: number | null
          max_locations?: number | null
          max_services?: number | null
          metadata?: Json
          name_ar?: string | null
          name_en: string
          price_amount?: number
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_code?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          includes_claim_badge?: boolean
          includes_featured_listing?: boolean
          includes_media_gallery?: boolean
          interval?: Database["public"]["Enums"]["plan_interval"]
          max_doctors?: number | null
          max_locations?: number | null
          max_services?: number | null
          metadata?: Json
          name_ar?: string | null
          name_en?: string
          price_amount?: number
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["subscription_plan_status"]
          updated_at?: string
        }
        Relationships: []
      }
      taxonomy_groups: {
        Row: {
          created_at: string
          deleted_at: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          is_medical: boolean
          metadata: Json
          name_ar: string
          name_en: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar: string
          name_en: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          is_medical?: boolean
          metadata?: Json
          name_ar?: string
          name_en?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_center: {
        Args: { target_center_id: string }
        Returns: boolean
      }
      can_view_appointment: {
        Args: { target_appointment_id: string }
        Returns: boolean
      }
      can_view_audit_log: {
        Args: { target_audit_log_id: string }
        Returns: boolean
      }
      can_view_center_private_data: {
        Args: { target_center_id: string }
        Returns: boolean
      }
      can_view_center_subscription: {
        Args: { target_center_subscription_id: string }
        Returns: boolean
      }
      can_view_consent_log: {
        Args: { target_consent_log_id: string }
        Returns: boolean
      }
      can_view_entity_media_private: {
        Args: { target_entity_media_id: string }
        Returns: boolean
      }
      can_view_media_asset_private: {
        Args: { target_media_asset_id: string }
        Returns: boolean
      }
      can_view_patient_contact: {
        Args: { target_patient_contact_id: string }
        Returns: boolean
      }
      can_view_review_private: {
        Args: { target_review_id: string }
        Returns: boolean
      }
      can_view_review_report: {
        Args: { target_review_report_id: string }
        Returns: boolean
      }
      can_view_sponsored_campaign: {
        Args: { target_sponsored_campaign_id: string }
        Returns: boolean
      }
      can_view_sponsored_placement_private: {
        Args: { target_sponsored_placement_id: string }
        Returns: boolean
      }
      current_profile_id: { Args: never; Returns: string }
      is_active_center_member: {
        Args: { target_center_id: string }
        Returns: boolean
      }
      is_patient_user: { Args: never; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_provider_user: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_locale: "en" | "ar"
      appointment_cancellation_actor:
        | "patient"
        | "center"
        | "doctor"
        | "admin"
        | "system"
        | "unknown"
      appointment_cancellation_reason:
        | "patient_request"
        | "doctor_unavailable"
        | "center_unavailable"
        | "duplicate_booking"
        | "no_confirmation"
        | "no_show"
        | "emergency"
        | "other"
      appointment_slot_status:
        | "draft"
        | "available"
        | "held"
        | "booked"
        | "blocked"
        | "cancelled"
        | "expired"
      appointment_status:
        | "requested"
        | "pending_confirmation"
        | "confirmed"
        | "rescheduled"
        | "cancelled"
        | "completed"
        | "no_show"
        | "rejected"
      audit_action_type:
        | "create"
        | "update"
        | "delete"
        | "approve"
        | "reject"
        | "login"
        | "logout"
        | "claim"
        | "publish"
        | "unpublish"
      audit_actor_type:
        | "system"
        | "admin"
        | "provider_user"
        | "patient_user"
        | "anonymous"
      center_member_role:
        | "owner"
        | "admin"
        | "manager"
        | "editor"
        | "staff"
        | "billing"
        | "sales"
      center_membership_status:
        | "invited"
        | "pending"
        | "active"
        | "inactive"
        | "suspended"
        | "removed"
      center_subscription_status:
        | "pending"
        | "active"
        | "paused"
        | "cancelled"
        | "expired"
      center_type:
        | "clinic"
        | "hospital"
        | "dental_clinic"
        | "beauty_clinic"
        | "laboratory"
        | "imaging_center"
        | "pharmacy"
        | "wellness_center"
        | "physiotherapy_center"
        | "other"
        | "gym"
        | "fitness_center"
        | "spa"
        | "healthy_restaurant"
        | "nutrition_center"
        | "juice_bar"
        | "meal_plan_provider"
        | "home_healthcare"
        | "optical_store"
        | "medical_equipment_store"
      claim_status:
        | "started"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "cancelled"
      consent_type:
        | "cookie_necessary"
        | "cookie_analytics"
        | "cookie_marketing"
        | "medical_disclaimer"
        | "terms"
        | "privacy"
      country_code: "om"
      doctor_gender: "male" | "female" | "unspecified"
      doctor_schedule_day:
        | "saturday"
        | "sunday"
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
      doctor_schedule_exception_type:
        | "unavailable"
        | "custom_hours"
        | "holiday"
        | "leave"
        | "emergency"
        | "other"
      doctor_title:
        | "dr"
        | "prof"
        | "consultant"
        | "specialist"
        | "therapist"
        | "dentist"
        | "other"
      legal_document_status: "draft" | "active" | "archived" | "deprecated"
      media_asset_source:
        | "uploaded"
        | "external_url"
        | "imported"
        | "generated"
        | "unknown"
      media_asset_status:
        | "draft"
        | "pending_review"
        | "approved"
        | "rejected"
        | "hidden"
        | "archived"
      media_entity_type:
        | "center"
        | "center_location"
        | "doctor"
        | "service"
        | "center_service"
        | "doctor_service"
        | "review"
      media_usage_kind:
        | "logo"
        | "cover"
        | "profile"
        | "gallery"
        | "menu"
        | "certificate"
        | "document"
        | "before_after"
        | "thumbnail"
        | "other"
      notification_channel: "email" | "sms" | "whatsapp" | "push"
      patient_contact_gender: "male" | "female" | "other" | "unspecified"
      plan_interval: "monthly" | "quarterly" | "semi_annual" | "annual"
      provider_status:
        | "draft"
        | "pending_review"
        | "active"
        | "inactive"
        | "rejected"
        | "suspended"
      review_report_reason:
        | "spam"
        | "offensive"
        | "fake"
        | "irrelevant"
        | "privacy"
        | "medical_claim"
        | "other"
      review_report_status: "open" | "under_review" | "resolved" | "dismissed"
      review_status: "pending" | "approved" | "rejected" | "hidden" | "flagged"
      review_target_type: "center" | "doctor" | "service"
      sponsored_campaign_status:
        | "draft"
        | "pending_review"
        | "active"
        | "paused"
        | "completed"
        | "rejected"
        | "cancelled"
      sponsored_slot_type:
        | "featured_partner"
        | "sponsored_result"
        | "homepage_featured"
      subscription_plan_status: "draft" | "active" | "inactive" | "archived"
      verification_status:
        | "unverified"
        | "pending"
        | "verified"
        | "rejected"
        | "suspended"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_locale: ["en", "ar"],
      appointment_cancellation_actor: [
        "patient",
        "center",
        "doctor",
        "admin",
        "system",
        "unknown",
      ],
      appointment_cancellation_reason: [
        "patient_request",
        "doctor_unavailable",
        "center_unavailable",
        "duplicate_booking",
        "no_confirmation",
        "no_show",
        "emergency",
        "other",
      ],
      appointment_slot_status: [
        "draft",
        "available",
        "held",
        "booked",
        "blocked",
        "cancelled",
        "expired",
      ],
      appointment_status: [
        "requested",
        "pending_confirmation",
        "confirmed",
        "rescheduled",
        "cancelled",
        "completed",
        "no_show",
        "rejected",
      ],
      audit_action_type: [
        "create",
        "update",
        "delete",
        "approve",
        "reject",
        "login",
        "logout",
        "claim",
        "publish",
        "unpublish",
      ],
      audit_actor_type: [
        "system",
        "admin",
        "provider_user",
        "patient_user",
        "anonymous",
      ],
      center_member_role: [
        "owner",
        "admin",
        "manager",
        "editor",
        "staff",
        "billing",
        "sales",
      ],
      center_membership_status: [
        "invited",
        "pending",
        "active",
        "inactive",
        "suspended",
        "removed",
      ],
      center_subscription_status: [
        "pending",
        "active",
        "paused",
        "cancelled",
        "expired",
      ],
      center_type: [
        "clinic",
        "hospital",
        "dental_clinic",
        "beauty_clinic",
        "laboratory",
        "imaging_center",
        "pharmacy",
        "wellness_center",
        "physiotherapy_center",
        "other",
        "gym",
        "fitness_center",
        "spa",
        "healthy_restaurant",
        "nutrition_center",
        "juice_bar",
        "meal_plan_provider",
        "home_healthcare",
        "optical_store",
        "medical_equipment_store",
      ],
      claim_status: [
        "started",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      consent_type: [
        "cookie_necessary",
        "cookie_analytics",
        "cookie_marketing",
        "medical_disclaimer",
        "terms",
        "privacy",
      ],
      country_code: ["om"],
      doctor_gender: ["male", "female", "unspecified"],
      doctor_schedule_day: [
        "saturday",
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ],
      doctor_schedule_exception_type: [
        "unavailable",
        "custom_hours",
        "holiday",
        "leave",
        "emergency",
        "other",
      ],
      doctor_title: [
        "dr",
        "prof",
        "consultant",
        "specialist",
        "therapist",
        "dentist",
        "other",
      ],
      legal_document_status: ["draft", "active", "archived", "deprecated"],
      media_asset_source: [
        "uploaded",
        "external_url",
        "imported",
        "generated",
        "unknown",
      ],
      media_asset_status: [
        "draft",
        "pending_review",
        "approved",
        "rejected",
        "hidden",
        "archived",
      ],
      media_entity_type: [
        "center",
        "center_location",
        "doctor",
        "service",
        "center_service",
        "doctor_service",
        "review",
      ],
      media_usage_kind: [
        "logo",
        "cover",
        "profile",
        "gallery",
        "menu",
        "certificate",
        "document",
        "before_after",
        "thumbnail",
        "other",
      ],
      notification_channel: ["email", "sms", "whatsapp", "push"],
      patient_contact_gender: ["male", "female", "other", "unspecified"],
      plan_interval: ["monthly", "quarterly", "semi_annual", "annual"],
      provider_status: [
        "draft",
        "pending_review",
        "active",
        "inactive",
        "rejected",
        "suspended",
      ],
      review_report_reason: [
        "spam",
        "offensive",
        "fake",
        "irrelevant",
        "privacy",
        "medical_claim",
        "other",
      ],
      review_report_status: ["open", "under_review", "resolved", "dismissed"],
      review_status: ["pending", "approved", "rejected", "hidden", "flagged"],
      review_target_type: ["center", "doctor", "service"],
      sponsored_campaign_status: [
        "draft",
        "pending_review",
        "active",
        "paused",
        "completed",
        "rejected",
        "cancelled",
      ],
      sponsored_slot_type: [
        "featured_partner",
        "sponsored_result",
        "homepage_featured",
      ],
      subscription_plan_status: ["draft", "active", "inactive", "archived"],
      verification_status: [
        "unverified",
        "pending",
        "verified",
        "rejected",
        "suspended",
      ],
    },
  },
} as const

