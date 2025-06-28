// ** import supabase client
import { supabase } from '@/lib/supabase'

// ** import types
import type { Payslip, PayslipEmail } from '@/lib/types'

/**
 * Payslip service for managing payslip data
 */
export const payslipService = {
  /**
   * Get all payslips for an organization
   */
  async getAll(organizationId: string, month?: string): Promise<Payslip[]> {
    let query = supabase
      .from('payslips')
      .select(`
        *,
        employee:employees!inner(
          id, employee_code, full_name, email, organization_id,
          department:departments(name),
          position:positions(name)
        ),
        payslip_email:payslip_emails(*)
      `)
      .eq('employee.organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (month) {
      query = query.eq('month', month)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data as Payslip[]
  },

  /**
   * Get payslip by ID
   */
  async getById(id: string): Promise<Payslip> {
    const { data, error } = await supabase
      .from('payslips')
      .select(`
        *,
        employee:employees(
          id, employee_code, full_name, email,
          department:departments(name),
          position:positions(name)
        ),
        payslip_email:payslip_emails(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Payslip
  },

  /**
   * Create new payslip
   */
  async create(payslip: Omit<Payslip, 'id' | 'created_at' | 'updated_at'>): Promise<Payslip> {
    const { data, error } = await supabase
      .from('payslips')
      .insert(payslip)
      .select()
      .single()
    
    if (error) throw error
    return data as Payslip
  },

  /**
   * Update payslip
   */
  async update(id: string, updates: Partial<Payslip>): Promise<Payslip> {
    const { data, error } = await supabase
      .from('payslips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Payslip
  },

  /**
   * Delete payslip
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payslips')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

/**
 * Payslip Email service for managing payslip email data
 */
export const payslipEmailService = {
  /**
   * Create payslip email record
   */
  async create(email: Omit<PayslipEmail, 'id' | 'created_at'>): Promise<PayslipEmail> {
    const { data, error } = await supabase
      .from('payslip_emails')
      .insert(email)
      .select()
      .single()
    
    if (error) throw error
    return data as PayslipEmail
  },

  /**
   * Update email status
   */
  async updateStatus(id: string, status: PayslipEmail['status'], errorMessage?: string): Promise<PayslipEmail> {
    const updates: Partial<PayslipEmail> = { 
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : undefined,
      error_message: errorMessage 
    }
    
    const { data, error } = await supabase
      .from('payslip_emails')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as PayslipEmail
  }
} 