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
  earnings: EarningItem[]
  deductions: DeductionItem[]
  previous_company?: PreviousCompany
  created_at: string
  updated_at: string
  department?: Department
  position?: Position
}

export interface EarningItem {
  id: string
  type: string
  amount: number
}

export interface DeductionItem {
  id: string
  type: string
  amount: number
}

export interface PreviousCompany {
  company_name: string
  last_designation: string
  duration_worked: string
  last_drawn_salary: number
  contact_mobile: string
  previous_email: string
  experience_certificate_urls: string[]
  salary_slip_urls: string[]
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

export interface CreateEmployeeData {
  full_name: string
  email: string
  employment_status: 'active' | 'inactive' | 'probation'
  department_id?: string
  position_id?: string
  profile_photo_url?: string
  earnings: Omit<EarningItem, 'id'>[]
  deductions: Omit<DeductionItem, 'id'>[]
  previous_company?: Omit<PreviousCompany, 'experience_certificate_urls' | 'salary_slip_urls'> & {
    experience_certificates?: File[]
    salary_slips?: File[]
  }
}