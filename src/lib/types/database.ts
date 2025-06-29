// ** Database types for TypeScript
export interface Organization {
  id: string
  name: string
  logo_url?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'viewer'
  avatar_url?: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  name: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  employee_code: string
  full_name: string
  email: string
  profile_photo_url?: string
  employment_status: 'active' | 'inactive' | 'probation'
  department_id?: string
  position_id?: string
  organization_id: string
  created_at: string
  updated_at: string
  department?: Department
  position?: Position
}

export interface Attendance {
  id: string
  employee_id: string
  month: string
  working_days: number
  leave_days: number
  ot_hours: number
  generated_from_payslip_id?: string
  created_at: string
  updated_at: string
  employee?: Employee
}

export interface PayslipEarnings {
  base_salary?: number
  allowances?: Record<string, number>
  overtime?: number
  bonus?: number
  [key: string]: unknown
}

export interface PayslipDeductions {
  tax?: number
  pf?: number
  insurance?: number
  loan?: number
  [key: string]: unknown
}

export interface Payslip {
  id: string
  employee_id: string
  month: string
  earnings: PayslipEarnings
  deductions: PayslipDeductions
  net_pay: number
  status: 'draft' | 'sent'
  pdf_url?: string
  generated_at?: string
  created_by: string
  created_at: string
  updated_at: string
  employee?: Employee
  payslip_email?: PayslipEmail
}

export interface PayslipEmail {
  id: string
  payslip_id: string
  employee_email: string
  status: 'sent' | 'failed' | 'pending'
  sent_at?: string
  smtp_config_id?: string
  error_message?: string
  created_at: string
}

export interface PDFConfig {
  id: string
  organization_id: string
  provider: string
  api_key: string
  is_active: boolean
  created_at: string
  updated_at: string
} 