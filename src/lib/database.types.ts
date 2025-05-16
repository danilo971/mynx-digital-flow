
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
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role?: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: number
          code: string
          name: string
          barcode: string
          price: number
          stock: number
          category: string
          image_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          code: string
          name: string
          barcode: string
          price: number
          stock: number
          category: string
          image_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          name?: string
          barcode?: string
          price?: number
          stock?: number
          category?: string
          image_url?: string | null
          updated_at?: string | null
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
