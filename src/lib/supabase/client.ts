import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

export function createClient() {
  return createBrowserClient(
    env.supabase.url,
    env.supabase.anonKey
  )
}

// Keep the old export for backward compatibility
export const supabase = createClient() 