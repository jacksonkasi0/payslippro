// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Employee } from '@/lib/types'

/**
 * Employee service for managing employee data
 */
export const employeeService = {
  /**
   * Get all employees for an organization
   */
  async getAll(organizationId: string): Promise<Employee[]> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Employee[]
  },

  /**
   * Get employee by ID
   */
  async getById(id: string): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Employee
  },

  /**
   * Create new employee
   */
  async create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single()
    
    if (error) throw error
    return data as Employee
  },

  /**
   * Update employee
   */
  async update(id: string, updates: Partial<Employee>): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Employee
  },

  /**
   * Delete employee
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 