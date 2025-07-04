// ** import supabase client
import { createClient } from '@/lib/supabase/client'

// ** import types
import type { AuthUser } from '@/lib/types'

// Create a single instance to use throughout the auth service
const supabase = createClient()

/**
 * Authentication service for managing user authentication
 */
export const authService = {
  /**
   * Sign up new user with organization
   * NOTE: If email confirmation is required, organization creation is deferred
   */
  async signUp(email: string, password: string, organizationName: string) {
    // Step 1: Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_name: organizationName, // Store for later use
        }
      }
    })
    
    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Step 2: Check if we have a session (email confirmation not required)
    const { data: { session } } = await supabase.auth.getSession()
    
    // If no session, email confirmation is required - defer organization creation
    if (!session) {
      return authData
    }

    // Step 3: If we have a session, create organization immediately
    try {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single()
      
      if (orgError) {
        console.error('Organization creation error:', orgError)
        throw new Error(`Failed to create organization: ${orgError.message}`)
      }

      // Step 4: Create admin user profile
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          role: 'admin',
          organization_id: organization.id
        })
      
      if (adminError) {
        console.error('Admin user creation error:', adminError)
        throw new Error(`Failed to create admin profile: ${adminError.message}`)
      }

      return authData
    } catch (error) {
      console.error('Failed to complete signup:', error)
      throw error
    }
  },

  /**
   * Alternative signup method - create organization in callback
   */
  async signUpUserOnly(email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (authError) throw authError
    return authData
  },

  /**
   * Create organization after user is fully authenticated
   */
  async createOrganizationForUser(organizationName: string, userId: string) {
    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: organizationName })
      .select()
      .single()
    
    if (orgError) throw orgError

    // Create admin user profile
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser?.email) {
      throw new Error('User email not available')
    }
    
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: currentUser.email,
        role: 'admin',
        organization_id: organization.id
      })
    
    if (adminError) throw adminError

    return organization
  },

  /**
   * Check if user needs to create organization after email confirmation
   */
  async checkAndCreateOrganization(userId: string) {
    // Check if user already has an organization
    const { data: adminProfile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (adminProfile) {
      // User already has organization
      return null
    }

    // Get user metadata to check for pending organization
    const { data: { user } } = await supabase.auth.getUser()
    const organizationName = user?.user_metadata?.organization_name || 'My Organization'
    
    // Create the organization (either from metadata or default)
    try {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single()
      
      if (orgError) throw orgError

      // Create admin user profile
      if (!user?.email) {
        throw new Error('User email not available')
      }
      
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: user.email,
          role: 'admin',
          organization_id: organization.id
        })
      
      if (adminError) throw adminError

      // Clear the organization name from metadata if it existed
      if (user?.user_metadata?.organization_name) {
        await supabase.auth.updateUser({
          data: { organization_name: null }
        })
      }

      return organization
    } catch (error) {
      console.error('Failed to create organization after email confirmation:', error)
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
    
    // Check if organization needs to be created after email confirmation
    if (data.user) {
      try {
        await this.checkAndCreateOrganization(data.user.id)
      } catch (error) {
        console.error('Failed to create organization after login:', error)
        // Don't throw - allow login to continue
      }
    }
    
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
   * Uses server-side API to avoid client-side hanging issues
   */
  async signOut(): Promise<void> {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign out')
      }
      
      // After successful server-side sign out, refresh client-side auth state
      try {
        // Clear the client-side session to ensure auth listeners are notified
        await supabase.auth.signOut()
      } catch (clientSignOutError) {
        // This is expected since we already signed out server-side
      }
      
      return Promise.resolve()
    } catch (err) {
      console.error('signOut caught error:', err)
      
      // Handle network and server errors
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.')
        }
      }
      
      throw err
    }
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
   * Security: Rate limited by Supabase to prevent abuse
   * Uses PKCE flow with server-side token verification
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
    })
    
    if (error) {
      // Handle specific error cases without exposing sensitive information
      if (error.message.includes('rate limit')) {
        throw new Error('Too many reset attempts. Please wait before trying again.')
      } else if (error.message.includes('not found')) {
        // For security, don't reveal if email exists or not
        throw new Error('If an account with this email exists, you will receive a reset link.')
      } else {
        throw error
      }
    }
  },

  /**
   * Update password
   * Security: Must be called within an authenticated session from password reset flow
   * Uses server-side API to avoid client-side hanging issues
   */
  async updatePassword(password: string): Promise<void> {
    // Validate password strength on client side as well
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.')
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number.')
    }
    
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`)
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update password')
      }
      
      return Promise.resolve()
    } catch (err) {
      console.error('updatePassword caught error:', err)
      
      // Handle network and server errors
      if (err instanceof Error) {
        if (err.message.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.')
        } else if (err.message.includes('401')) {
          throw new Error('Session expired. Please request a new password reset link.')
        } else if (err.message.includes('400')) {
          throw new Error(err.message.replace('Server error: 400', 'Invalid request'))
        }
      }
      
      throw err
    }
  },

  /**
   * Resend confirmation email
   */
  async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })
    
    if (error) throw error
  }
}