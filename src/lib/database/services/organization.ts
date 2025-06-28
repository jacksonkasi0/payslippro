// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Organization } from '@/lib/types'

/**
 * Organization service for managing organization data
 */
export const organizationService = {
  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Organization
  },

  /**
   * Update organization
   */
  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Organization
  }
} 