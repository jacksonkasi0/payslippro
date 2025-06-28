import { supabase } from './supabase'
import type { 
  Organization, 
  AdminUser, 
  Department, 
  Position, 
  Employee, 
  Attendance, 
  Payslip, 
  PayslipEmail, 
  PDFConfig 
} from './supabase'

// Organization operations
export const organizationService = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Organization
  },

  async update(id: string, updates: Partial<Organization>) {
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

// Employee operations
export const employeeService = {
  async getAll(organizationId: string) {
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

  async getById(id: string) {
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

  async create(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single()
    
    if (error) throw error
    return data as Employee
  },

  async update(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Employee
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Department operations
export const departmentService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    
    if (error) throw error
    return data as Department[]
  },

  async create(department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  async update(id: string, updates: Partial<Department>) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Department
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Position operations
export const positionService = {
  async getAll(organizationId: string) {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name')
    
    if (error) throw error
    return data as Position[]
  },

  async create(position: Omit<Position, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('positions')
      .insert(position)
      .select()
      .single()
    
    if (error) throw error
    return data as Position
  },

  async update(id: string, updates: Partial<Position>) {
    const { data, error } = await supabase
      .from('positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Position
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('positions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Attendance operations
export const attendanceService = {
  async getByEmployeeAndMonth(employeeId: string, month: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as Attendance | null
  },

  async upsert(attendance: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>) {
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

// Payslip operations
export const payslipService = {
  async getAll(organizationId: string, month?: string) {
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

  async getById(id: string) {
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

  async create(payslip: Omit<Payslip, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payslips')
      .insert(payslip)
      .select()
      .single()
    
    if (error) throw error
    return data as Payslip
  },

  async update(id: string, updates: Partial<Payslip>) {
    const { data, error } = await supabase
      .from('payslips')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Payslip
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payslips')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// PDF Config operations
export const pdfConfigService = {
  async getByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('pdf_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as PDFConfig | null
  },

  async upsert(config: Omit<PDFConfig, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('pdf_configs')
      .upsert(config, { 
        onConflict: 'organization_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (error) throw error
    return data as PDFConfig
  }
}

// Payslip Email operations
export const payslipEmailService = {
  async create(email: Omit<PayslipEmail, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('payslip_emails')
      .insert(email)
      .select()
      .single()
    
    if (error) throw error
    return data as PayslipEmail
  },

  async updateStatus(id: string, status: PayslipEmail['status'], errorMessage?: string) {
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