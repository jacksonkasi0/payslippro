// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { AuthUser } from '@/lib/types'

/**
 * Authentication service for managing user authentication
 */
export const authService = {
  /**
   * Sign up new user
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  /**
   * Sign in user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current user with admin profile
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null

    // Get admin profile
    try {
      const { data: adminProfile } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single()

      return {
        ...user,
        adminProfile: adminProfile || undefined
      }
    } catch {
      return user as AuthUser
    }
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser()
        callback(authUser)
      } else {
        callback(null)
      }
    })
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) throw error
  },

  /**
   * Update password
   */
  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password
    })
    
    if (error) throw error
  }
}