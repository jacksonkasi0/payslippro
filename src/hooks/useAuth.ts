'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { authService } from '@/lib/auth'
import type { AuthUser } from '@/lib/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, organizationName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  resendConfirmation: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(session => {
      if (session?.user) {
        authService.getCurrentUser().then(setUser)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signIn(email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, organizationName: string) => {
    setLoading(true)
    try {
      await authService.signUp(email, password, organizationName)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      await authService.signInWithGoogle()
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Add timeout to prevent infinite loading on signOut
      const signOutPromise = authService.signOut()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timed out')), 30000) // 30 second timeout
      })
      
      await Promise.race([signOutPromise, timeoutPromise])
      
      // After successful server-side sign out, immediately clear client-side state
      console.log('Server-side sign out successful, clearing client-side auth state...')
      setUser(null)
      
      // Clear any stored auth data
      if (typeof window !== 'undefined') {
        // Clear all possible Supabase localStorage keys
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          console.log('Clearing localStorage key:', key)
          localStorage.removeItem(key)
        })
        
        // Also clear session storage
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            console.log('Clearing sessionStorage key:', key)
            sessionStorage.removeItem(key)
          }
        }
        
        // Force redirect to login page
        console.log('Redirecting to login page...')
        setTimeout(() => {
          window.location.replace('/auth/login')
        }, 100)
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if sign out fails, clear the loading state and user
      setUser(null)
      
      // Still redirect on error to ensure user is logged out
      if (typeof window !== 'undefined') {
        console.log('Sign out failed, but still redirecting to ensure user is logged out')
        setTimeout(() => {
          window.location.replace('/auth/login')
        }, 100)
      }
      
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const updatePassword = async (password: string) => {
    await authService.updatePassword(password)
  }

  const resendConfirmation = async (email: string) => {
    await authService.resendConfirmation(email)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation
  }
}

export { AuthContext }