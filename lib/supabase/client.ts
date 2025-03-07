import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // During build time, these environment variables might not be available
  // Use empty strings as fallbacks to prevent build errors
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
} 