// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Attendance } from '@/lib/types'

/**
 * Attendance service for managing attendance data
 */
export const attendanceService = {
  /**
   * Get attendance by employee and month
   */
  async getByEmployeeAndMonth(employeeId: string, month: string): Promise<Attendance | null> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as Attendance | null
  },

  /**
   * Upsert attendance record
   */
  async upsert(attendance: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendance, { 
        onConflict: 'employee_id,month',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) throw error
    return data as Attendance
  }
} 