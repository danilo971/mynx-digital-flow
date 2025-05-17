
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          code: string
          name: string
          barcode: string | null
          price: number
          stock: number
          category: string
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          code: string
          name: string
          barcode?: string | null
          price: number
          stock: number
          category: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          code?: string
          name?: string
          barcode?: string | null
          price?: number
          stock?: number
          category?: string
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: string
          active: boolean | null
          created_at: string | null
          updated_at: string | null
          permissions?: {
            pos?: boolean
            sales?: boolean
            products?: boolean
            reports?: boolean
            users?: boolean
          } | null
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          role?: string
          active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          permissions?: {
            pos?: boolean
            sales?: boolean
            products?: boolean
            reports?: boolean
            users?: boolean
          } | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: string
          active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          permissions?: {
            pos?: boolean
            sales?: boolean
            products?: boolean
            reports?: boolean
            users?: boolean
          } | null
        }
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
  }
}
