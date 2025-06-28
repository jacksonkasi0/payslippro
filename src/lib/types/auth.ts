import type { User } from '@supabase/supabase-js'
import type { AdminUser } from './database'

// ** Authentication types
export interface AuthUser extends User {
  adminProfile?: AdminUser
} 