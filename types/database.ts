/**
 * Handgeschriebene TypeScript-Typen zu docs/supabase_schema.sql.
 * Struktur folgt dem Format, das `supabase gen types typescript` erzeugt,
 * damit sich das Projekt später verlustfrei auf generierte Typen umstellen lässt.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadSegment = "privat" | "business";
export type LeadStatus =
  | "neu"
  | "kontaktiert"
  | "termin_gebucht"
  | "gespraech_gefuehrt"
  | "kunde"
  | "kein_interesse";
export type QuestionType = "single" | "multi" | "scale" | "text";
export type QuestionSegment = "alle" | "privat" | "business";
export type QuestionAlign = "left" | "center" | "right";
export type BookingStatus =
  "gebucht" | "abgesagt" | "wahrgenommen" | "nicht_erschienen";
export type ContentStatus = "entwurf" | "veroeffentlicht";

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  iconUrl?: string;
  iconAlt?: string;
}

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          email: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          email: string;
          name: string;
          company: string | null;
          phone: string | null;
          segment: LeadSegment;
          status: LeadStatus;
          source: string | null;
          consent_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          company?: string | null;
          phone?: string | null;
          segment?: LeadSegment;
          status?: LeadStatus;
          source?: string | null;
          consent_at: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          company?: string | null;
          phone?: string | null;
          segment?: LeadSegment;
          status?: LeadStatus;
          source?: string | null;
          consent_at?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lead_activities: {
        Row: {
          id: string;
          lead_id: string;
          kind: string;
          body: string | null;
          meta: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          kind: string;
          body?: string | null;
          meta?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          kind?: string;
          body?: string | null;
          meta?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          position: number;
          type: QuestionType;
          segment: QuestionSegment;
          title: string;
          hint: string | null;
          options: QuizOption[];
          icon_align: QuestionAlign;
          text_align: QuestionAlign;
          required: boolean;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          position: number;
          type?: QuestionType;
          segment?: QuestionSegment;
          title: string;
          hint?: string | null;
          options?: QuizOption[];
          icon_align?: QuestionAlign;
          text_align?: QuestionAlign;
          required?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          position?: number;
          type?: QuestionType;
          segment?: QuestionSegment;
          title?: string;
          hint?: string | null;
          options?: QuizOption[];
          icon_align?: QuestionAlign;
          text_align?: QuestionAlign;
          required?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quiz_responses: {
        Row: {
          id: string;
          lead_id: string | null;
          session_id: string;
          segment: LeadSegment;
          answers: Record<string, Json>;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id?: string | null;
          session_id: string;
          segment: LeadSegment;
          answers?: Record<string, Json>;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string | null;
          session_id?: string;
          segment?: LeadSegment;
          answers?: Record<string, Json>;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes: number;
          buffer_minutes: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes?: number;
          buffer_minutes?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          slot_minutes?: number;
          buffer_minutes?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      availability_exceptions: {
        Row: {
          id: string;
          day: string;
          blocked: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
        };
        Insert: {
          id?: string;
          day: string;
          blocked?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
        };
        Update: {
          id?: string;
          day?: string;
          blocked?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          lead_id: string;
          starts_at: string;
          ends_at: string;
          status: BookingStatus;
          meeting_url: string | null;
          manage_token: string;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          starts_at: string;
          ends_at: string;
          status?: BookingStatus;
          meeting_url?: string | null;
          manage_token?: string;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          starts_at?: string;
          ends_at?: string;
          status?: BookingStatus;
          meeting_url?: string | null;
          manage_token?: string;
          message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string;
          body: Json;
          cover_url: string | null;
          cover_alt: string | null;
          category: string;
          tags: string[];
          status: ContentStatus;
          reading_min: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          excerpt: string;
          body?: Json;
          cover_url?: string | null;
          cover_alt?: string | null;
          category?: string;
          tags?: string[];
          status?: ContentStatus;
          reading_min?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          excerpt?: string;
          body?: Json;
          cover_url?: string | null;
          cover_alt?: string | null;
          category?: string;
          tags?: string[];
          status?: ContentStatus;
          reading_min?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          id: string;
          slug: string;
          position: number;
          title: string;
          summary: string;
          body: Json;
          cover_url: string | null;
          cover_alt: string | null;
          level: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          position: number;
          title: string;
          summary: string;
          body?: Json;
          cover_url?: string | null;
          cover_alt?: string | null;
          level?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          position?: number;
          title?: string;
          summary?: string;
          body?: Json;
          cover_url?: string | null;
          cover_alt?: string | null;
          level?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tools: {
        Row: {
          id: string;
          slug: string;
          name: string;
          vendor: string | null;
          category: string;
          summary: string;
          good_for: string[];
          watch_out: string | null;
          logo_url: string | null;
          website: string | null;
          price_hint: string | null;
          position: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          vendor?: string | null;
          category: string;
          summary: string;
          good_for?: string[];
          watch_out?: string | null;
          logo_url?: string | null;
          website?: string | null;
          price_hint?: string | null;
          position?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          vendor?: string | null;
          category?: string;
          summary?: string;
          good_for?: string[];
          watch_out?: string | null;
          logo_url?: string | null;
          website?: string | null;
          price_hint?: string | null;
          position?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          body: Json;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          body?: Json;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          body?: Json;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          path: string;
          url: string;
          alt: string;
          caption: string | null;
          width: number | null;
          height: number | null;
          bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          url: string;
          alt: string;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          path?: string;
          url?: string;
          alt?: string;
          caption?: string | null;
          width?: number | null;
          height?: number | null;
          bytes?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_log: {
        Row: {
          id: string;
          to_email: string;
          template: string;
          subject: string | null;
          status: string;
          error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          to_email: string;
          template: string;
          subject?: string | null;
          status?: string;
          error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          to_email?: string;
          template?: string;
          subject?: string | null;
          status?: string;
          error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      lead_segment: LeadSegment;
      lead_status: LeadStatus;
      question_type: QuestionType;
      question_segment: QuestionSegment;
      booking_status: BookingStatus;
      content_status: ContentStatus;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Lead = Tables<"leads">;
export type LeadActivity = Tables<"lead_activities">;
export type QuizQuestion = Tables<"quiz_questions">;
export type QuizResponse = Tables<"quiz_responses">;
export type AvailabilityRule = Tables<"availability_rules">;
export type AvailabilityException = Tables<"availability_exceptions">;
export type Booking = Tables<"bookings">;
export type Post = Tables<"posts">;
export type Chapter = Tables<"chapters">;
export type Tool = Tables<"tools">;
export type Page = Tables<"pages">;
export type Media = Tables<"media">;
export type Setting = Tables<"settings">;
export type EmailLog = Tables<"email_log">;
