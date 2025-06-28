// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { AuthUser } from '@/lib/types'

/**
 * Authentication service for managing user authentication
 */
export const authService = {
  /**
   * Sign up new user with organization
   */
  async signUp(email: string, password: string, organizationName: string) {
    // Start a Supabase transaction
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    try {
      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single()
      
      if (orgError) throw orgError

      // Create admin user profile
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          role: 'admin',
          organization_id: organization.id
        })
      
      if (adminError) throw adminError

      return authData
    } catch (error) {
      // If organization or admin user creation fails, we should ideally clean up the auth user
      // But Supabase doesn't allow deleting unconfirmed users programmatically
      console.error('Failed to complete signup:', error)
      throw error
    }
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
   * Sign in with Google
   */
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
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