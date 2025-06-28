import { createClient } from '@supabase/supabase-js'

// ** import config
import { env } from '@/config/env'

// ** Create and export Supabase client
export const supabase = createClient(env.supabase.url, env.supabase.anonKey) 