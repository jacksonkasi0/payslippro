// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Position } from '@/lib/types'

/**
 * Position service for managing position data
 */
export const positionService = {
  /**
   * Get all positions for an organization
   */
  async getAll(organizationId: string): Promise<Position[]> {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    
    if (error) throw error
    return data as Position[]
  },

  /**
   * Create new position
   */
  async create(position: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single()
    
    if (error) throw error
    return data as Position
  },

  /**
   * Update position
   */
  async update(id: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Position
  },

  /**
   * Delete position
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 