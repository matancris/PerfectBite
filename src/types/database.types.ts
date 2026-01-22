// Supabase database types - will be auto-generated in production
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
// For now, this is manually maintained to match our schema

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          settings: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      menu_categories: {
        Row: {
          id: string
          business_id: string
          name: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>
      }
      menu_items: {
        Row: {
          id: string
          business_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_active: boolean
          available_anytime: boolean
          max_quantity: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['menu_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      events: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string | null
          event_date: string
          start_time: string
          end_time: string
          order_deadline: string
          is_active: boolean
          allow_any_pickup_time: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_items: {
        Row: {
          id: string
          event_id: string
          menu_item_id: string
          custom_price: number | null
          max_quantity: number | null
          current_quantity: number
        }
        Insert: Omit<Database['public']['Tables']['event_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['event_items']['Insert']>
      }
      event_pickup_slots: {
        Row: {
          id: string
          event_id: string
          time: string
          max_orders: number
          current_orders: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_pickup_slots']['Row'], 'id' | 'created_at' | 'current_orders'>
        Update: Partial<Database['public']['Tables']['event_pickup_slots']['Insert']>
      }
      pickup_slots: {
        Row: {
          id: string
          business_id: string
          event_id: string | null
          time: string
          max_orders: number | null
          current_orders: number
        }
        Insert: Omit<Database['public']['Tables']['pickup_slots']['Row'], 'id' | 'current_orders'>
        Update: Partial<Database['public']['Tables']['pickup_slots']['Insert']>
      }
      orders: {
        Row: {
          id: string
          business_id: string
          event_id: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          fulfillment_type: 'pickup' | 'dine_in'
          pickup_slot_id: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          total_amount: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          name: string
          price: number
          quantity: number
          notes: string | null
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string
          transaction_id: string | null
          amount: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      create_order_atomic: {
        Args: {
          p_business_id: string
          p_event_id: string | null
          p_customer_name: string
          p_customer_phone: string
          p_customer_email: string | null
          p_fulfillment_type: string
          p_pickup_slot_id: string | null
          p_notes: string | null
          p_total_amount: number
          p_items: unknown[]
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
