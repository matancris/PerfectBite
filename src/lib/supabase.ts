import { createClient } from '@supabase/supabase-js'

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const businessId = import.meta.env.VITE_BUSINESS_ID

// Validate required environment variables
function validateEnvVariables() {
  const missing: string[] = []
  
  if (!supabaseUrl) {
    missing.push('VITE_SUPABASE_URL')
  }
  if (!supabaseAnonKey) {
    missing.push('VITE_SUPABASE_ANON_KEY')
  }
  if (!businessId || businessId === 'default' || businessId === 'your-business-uuid') {
    missing.push('VITE_BUSINESS_ID (must be a valid UUID)')
  }
  
  if (missing.length > 0) {
    const errorMessage = `Missing or invalid environment variables:\n${missing.join('\n')}\n\nPlease check your .env file.`
    
    // In development, show console error
    if (import.meta.env.DEV) {
      console.error(errorMessage)
    }
    
    // Throw error to prevent app from running with invalid config
    throw new Error(errorMessage)
  }
}

// Validate on module load
validateEnvVariables()

// Use a simpler client without strict typing to avoid complex generic issues
// In production, generate types with: npx supabase gen types typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export validated business ID for use in services
export const BUSINESS_ID = businessId as string
