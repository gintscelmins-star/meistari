export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atsauksmes: {
        Row: { autors: string; datums: string; id: string; meistars_id: string; teksts: string; vertejums: number }
        Insert: { autors: string; datums?: string; id?: string; meistars_id: string; teksts: string; vertejums: number }
        Update: { autors?: string; datums?: string; id?: string; meistars_id?: string; teksts?: string; vertejums?: number }
        Relationships: [{ foreignKeyName: "atsauksmes_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      booking: {
        Row: { datums: string; google_event_id: string | null; id: string; izveidots_at: string; klients_telefons: string; klients_vards: string; laiks: string; meistars_id: string; pakalpojums: string; statuss: string }
        Insert: { datums: string; google_event_id?: string | null; id?: string; izveidots_at?: string; klients_telefons: string; klients_vards: string; laiks: string; meistars_id: string; pakalpojums: string; statuss?: string }
        Update: { datums?: string; google_event_id?: string | null; id?: string; izveidots_at?: string; klients_telefons?: string; klients_vards?: string; laiks?: string; meistars_id?: string; pakalpojums?: string; statuss?: string }
        Relationships: [{ foreignKeyName: "booking_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      darba_laiki: {
        Row: { dienas_nr: number; id: string; lidz_laiks: string; meistars_id: string; no_laiks: string; strada: boolean }
        Insert: { dienas_nr: number; id?: string; lidz_laiks?: string; meistars_id: string; no_laiks?: string; strada?: boolean }
        Update: { dienas_nr?: number; id?: string; lidz_laiks?: string; meistars_id?: string; no_laiks?: string; strada?: boolean }
        Relationships: [{ foreignKeyName: "darba_laiki_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      darba_tipi: {
        Row: { id: string; ikona: string | null; nosaukums: string; slug: string }
        Insert: { id?: string; ikona?: string | null; nosaukums: string; slug: string }
        Update: { id?: string; ikona?: string | null; nosaukums?: string; slug?: string }
        Relationships: []
      }
      kalendars_sync: {
        Row: { google_calendar_id: string | null; google_refresh_token: string | null; meistars_id: string; sync_aktīvs: boolean }
        Insert: { google_calendar_id?: string | null; google_refresh_token?: string | null; meistars_id: string; sync_aktīvs?: boolean }
        Update: { google_calendar_id?: string | null; google_refresh_token?: string | null; meistars_id?: string; sync_aktīvs?: boolean }
        Relationships: [{ foreignKeyName: "kalendars_sync_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: true; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      meistara_foto: {
        Row: { apraksts: string | null; created_at: string | null; id: string; kartiba: number | null; meistars_id: string; url: string }
        Insert: { apraksts?: string | null; created_at?: string | null; id?: string; kartiba?: number | null; meistars_id: string; url: string }
        Update: { apraksts?: string | null; created_at?: string | null; id?: string; kartiba?: number | null; meistars_id?: string; url?: string }
        Relationships: [{ foreignKeyName: "meistara_foto_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      meistara_pakalpojumi: {
        Row: { apraksts: string | null; cena_lidz: number | null; cena_no: number | null; id: string; meistars_id: string; standartu_pakalpojums_id: string }
        Insert: { apraksts?: string | null; cena_lidz?: number | null; cena_no?: number | null; id?: string; meistars_id: string; standartu_pakalpojums_id: string }
        Update: { apraksts?: string | null; cena_lidz?: number | null; cena_no?: number | null; id?: string; meistars_id?: string; standartu_pakalpojums_id?: string }
        Relationships: [
          { foreignKeyName: "meistara_pakalpojumi_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] },
          { foreignKeyName: "meistara_pakalpojumi_standartu_pakalpojums_id_fkey"; columns: ["standartu_pakalpojums_id"]; isOneToOne: false; referencedRelation: "standartu_pakalpojumi"; referencedColumns: ["id"] }
        ]
      }
      meistari: {
        Row: { aktīvs: boolean; apraksts: string | null; foto_url: string | null; id: string; pieredze_gadi: number | null; pilseta: string | null; rating: number | null; slug: string; specialitate: string; telefons: string; user_id: string | null; uzvards: string; vards: string }
        Insert: { aktīvs?: boolean; apraksts?: string | null; foto_url?: string | null; id?: string; pieredze_gadi?: number | null; pilseta?: string | null; rating?: number | null; slug: string; specialitate: string; telefons: string; user_id?: string | null; uzvards: string; vards: string }
        Update: { aktīvs?: boolean; apraksts?: string | null; foto_url?: string | null; id?: string; pieredze_gadi?: number | null; pilseta?: string | null; rating?: number | null; slug?: string; specialitate?: string; telefons?: string; user_id?: string | null; uzvards?: string; vards?: string }
        Relationships: []
      }
      meistars_darba_tipi: {
        Row: { darba_tips_id: string; meistars_id: string }
        Insert: { darba_tips_id: string; meistars_id: string }
        Update: { darba_tips_id?: string; meistars_id?: string }
        Relationships: [
          { foreignKeyName: "meistars_darba_tipi_darba_tips_id_fkey"; columns: ["darba_tips_id"]; isOneToOne: false; referencedRelation: "darba_tipi"; referencedColumns: ["id"] },
          { foreignKeyName: "meistars_darba_tipi_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }
        ]
      }
      meistars_regioni: {
        Row: { meistars_id: string; regions_id: string }
        Insert: { meistars_id: string; regions_id: string }
        Update: { meistars_id?: string; regions_id?: string }
        Relationships: [
          { foreignKeyName: "meistars_regioni_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] },
          { foreignKeyName: "meistars_regioni_regions_id_fkey"; columns: ["regions_id"]; isOneToOne: false; referencedRelation: "regioni"; referencedColumns: ["id"] }
        ]
      }
      pakalpojumi: {
        Row: { cena_no: number; id: string; ilgums_h: number | null; meistars_id: string; nosaukums: string }
        Insert: { cena_no: number; id?: string; ilgums_h?: number | null; meistars_id: string; nosaukums: string }
        Update: { cena_no?: number; id?: string; ilgums_h?: number | null; meistars_id?: string; nosaukums?: string }
        Relationships: [{ foreignKeyName: "pakalpojumi_meistars_id_fkey"; columns: ["meistars_id"]; isOneToOne: false; referencedRelation: "meistari"; referencedColumns: ["id"] }]
      }
      pakalpojumu_kategorijas: {
        Row: { darba_tips_id: string | null; id: string; kartiba: number | null; nosaukums: string }
        Insert: { darba_tips_id?: string | null; id?: string; kartiba?: number | null; nosaukums: string }
        Update: { darba_tips_id?: string | null; id?: string; kartiba?: number | null; nosaukums?: string }
        Relationships: [{ foreignKeyName: "pakalpojumu_kategorijas_darba_tips_id_fkey"; columns: ["darba_tips_id"]; isOneToOne: false; referencedRelation: "darba_tipi"; referencedColumns: ["id"] }]
      }
      regioni: {
        Row: { id: string; nosaukums: string; slug: string }
        Insert: { id?: string; nosaukums: string; slug: string }
        Update: { id?: string; nosaukums?: string; slug?: string }
        Relationships: []
      }
      standartu_pakalpojumi: {
        Row: { id: string; kartiba: number | null; kategorija_id: string | null; nosaukums: string }
        Insert: { id?: string; kartiba?: number | null; kategorija_id?: string | null; nosaukums: string }
        Update: { id?: string; kartiba?: number | null; kategorija_id?: string | null; nosaukums?: string }
        Relationships: [{ foreignKeyName: "standartu_pakalpojumi_kategorija_id_fkey"; columns: ["kategorija_id"]; isOneToOne: false; referencedRelation: "pakalpojumu_kategorijas"; referencedColumns: ["id"] }]
      }
      zinojumi: {
        Row: { id: string; prospect_id: string; teksts: string | null; kanals: string; virziens: string; statuss: string; izveidots_at: string | null }
        Insert: { id?: string; prospect_id: string; teksts?: string | null; kanals?: string; virziens?: string; statuss?: string; izveidots_at?: string | null }
        Update: { id?: string; prospect_id?: string; teksts?: string | null; kanals?: string; virziens?: string; statuss?: string; izveidots_at?: string | null }
        Relationships: [{ foreignKeyName: "zinojumi_prospect_id_fkey"; columns: ["prospect_id"]; isOneToOne: false; referencedRelation: "prospects"; referencedColumns: ["id"] }]
      }
      prospects: {
        Row: {
          id: string; vards: string; uzvards: string; telefons: string;
          whatsapp: string | null; valoda: string; statuss: string; regions: string | null;
          nodarbosanas: string | null;
          demo_slug: string | null; demo_url: string | null;
          maksatajs: boolean; plans: string | null;
          trial_sakums: string | null; trial_beigas: string | null; pedeja_kontakts: string | null;
          ss_url: string | null; piezimes: string | null;
          gdpr_piekrits: boolean; gdpr_datums: string | null;
          dzesanas_pieprasits: boolean; dzesanas_datums: string | null;
          updated_at: string | null; created_at: string | null
        }
        Insert: {
          id?: string; vards: string; uzvards: string; telefons: string;
          whatsapp?: string | null; valoda?: string; statuss?: string; regions?: string | null;
          nodarbosanas?: string | null;
          demo_slug?: string | null; demo_url?: string | null;
          maksatajs?: boolean; plans?: string | null;
          trial_sakums?: string | null; trial_beigas?: string | null; pedeja_kontakts?: string | null;
          ss_url?: string | null; piezimes?: string | null;
          gdpr_piekrits?: boolean; gdpr_datums?: string | null;
          dzesanas_pieprasits?: boolean; dzesanas_datums?: string | null;
          updated_at?: string | null; created_at?: string | null
        }
        Update: {
          id?: string; vards?: string; uzvards?: string; telefons?: string;
          whatsapp?: string | null; valoda?: string; statuss?: string; regions?: string | null;
          nodarbosanas?: string | null;
          demo_slug?: string | null; demo_url?: string | null;
          maksatajs?: boolean; plans?: string | null;
          trial_sakums?: string | null; trial_beigas?: string | null; pedeja_kontakts?: string | null;
          ss_url?: string | null; piezimes?: string | null;
          gdpr_piekrits?: boolean; gdpr_datums?: string | null;
          dzesanas_pieprasits?: boolean; dzesanas_datums?: string | null;
          updated_at?: string | null; created_at?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
