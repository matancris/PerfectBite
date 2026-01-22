import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Use a simpler client without strict typing to avoid complex generic issues
// In production, generate types with: npx supabase gen types typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
