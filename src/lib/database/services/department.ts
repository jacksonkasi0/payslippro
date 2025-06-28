// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Department } from '@/lib/types'

/**
 * Department service for managing department data
 */
export const departmentService = {
  /**
   * Get all departments for an organization
   */
  async getAll(organizationId: string): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    
    if (error) throw error
    return data as Department[]
  },

  /**
   * Create new department
   */
  async create(department: Omit<Department, 'id' | 'created_at' | 'updated_at'>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  /**
   * Update department
   */
  async update(id: string, updates: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  /**
   * Delete department
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 