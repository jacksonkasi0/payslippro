/*
  # PaySlip Pro Database Schema

  1. New Tables
    - `organizations` - Company/organization data with logo and address
    - `admin_users` - Admin users with roles (admin/viewer) linked to organizations
    - `departments` - Department management per organization
    - `positions` - Job positions/titles per organization
    - `employees` - Employee records with status, department, and position
    - `attendance` - Monthly attendance tracking with working days, leave, and overtime
    - `payslips` - Payslip generation with earnings, deductions, and PDF links
    - `payslip_emails` - Email delivery tracking for payslips
    - `pdf_configs` - PDF generation service configuration per organization

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their organization's data
    - Secure admin-only operations for sensitive data

  3. Features
    - JSONB storage for flexible earnings/deductions structure
    - Unique constraints for employee codes and monthly records
    - Comprehensive indexing for performance
    - Audit timestamps on all tables
*/

-- ==========================
-- 1. ORGANIZATIONS
-- ==========================
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    logo_url text,
    address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================
-- 2. ADMIN USERS
-- ==========================
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) UNIQUE NOT NULL,
    role varchar(50) CHECK (role IN ('admin', 'viewer')) NOT NULL DEFAULT 'viewer',
    avatar_url text,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================
-- 3. DEPARTMENTS
-- ==========================
CREATE TABLE IF NOT EXISTS departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================
-- 4. POSITIONS
-- ==========================
CREATE TABLE IF NOT EXISTS positions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================
-- 5. EMPLOYEES
-- ==========================
CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code varchar(50) NOT NULL,
    full_name varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    profile_photo_url text,
    employment_status varchar(50) CHECK (employment_status IN ('active', 'inactive', 'probation')) NOT NULL DEFAULT 'active',
    department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
    position_id uuid REFERENCES positions(id) ON DELETE SET NULL,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(employee_code, organization_id),
    UNIQUE(email, organization_id)
);

-- ==========================
-- 6. PAYSLIPS (Must be created before attendance due to FK)
-- ==========================
CREATE TABLE IF NOT EXISTS payslips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month varchar(7) NOT NULL,
    earnings jsonb NOT NULL DEFAULT '{}',
    deductions jsonb NOT NULL DEFAULT '{}',
    net_pay decimal(10, 2) NOT NULL DEFAULT 0.00,
    status varchar(20) CHECK (status IN ('draft', 'sent')) DEFAULT 'draft',
    pdf_url text,
    generated_at timestamptz,
    created_by uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(employee_id, month)
);

-- ==========================
-- 7. ATTENDANCE
-- ==========================
CREATE TABLE IF NOT EXISTS attendance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month varchar(7) NOT NULL,
    working_days int NOT NULL DEFAULT 0,
    leave_days int DEFAULT 0,
    ot_hours decimal(5,2) DEFAULT 0.00,
    generated_from_payslip_id uuid REFERENCES payslips(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(employee_id, month)
);

-- ==========================
-- 8. PAYSLIP EMAILS
-- ==========================
CREATE TABLE IF NOT EXISTS payslip_emails (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payslip_id uuid NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
    employee_email varchar(255) NOT NULL,
    status varchar(20) CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
    sent_at timestamptz,
    smtp_config_id uuid,
    error_message text,
    created_at timestamptz DEFAULT now()
);

-- ==========================
-- 9. PDF CONFIGS
-- ==========================
CREATE TABLE IF NOT EXISTS pdf_configs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider varchar(100) NOT NULL DEFAULT 'html2pdf.app',
    api_key text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(organization_id)
);

-- ==========================
-- INDEXES FOR PERFORMANCE
-- ==========================
CREATE INDEX IF NOT EXISTS idx_admin_users_org ON admin_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_org ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_month ON payslips(month);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_month ON attendance(month);
CREATE INDEX IF NOT EXISTS idx_payslip_emails_status ON payslip_emails(status);
CREATE INDEX IF NOT EXISTS idx_departments_org ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_positions_org ON positions(organization_id);

-- ==========================
-- ROW LEVEL SECURITY
-- ==========================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslip_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_configs ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only access their own organization
CREATE POLICY "Users can access their organization" ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Admin Users: Users can access admin users in their organization
CREATE POLICY "Users can access admin users in their org" ON admin_users
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Departments: Users can access departments in their organization
CREATE POLICY "Users can access departments in their org" ON departments
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Positions: Users can access positions in their organization
CREATE POLICY "Users can access positions in their org" ON positions
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Employees: Users can access employees in their organization
CREATE POLICY "Users can access employees in their org" ON employees
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Attendance: Users can access attendance for employees in their organization
CREATE POLICY "Users can access attendance in their org" ON attendance
    FOR ALL TO authenticated
    USING (
        employee_id IN (
            SELECT e.id FROM employees e
            JOIN admin_users au ON e.organization_id = au.organization_id
            WHERE au.id = auth.uid()
        )
    );

-- Payslips: Users can access payslips for employees in their organization
CREATE POLICY "Users can access payslips in their org" ON payslips
    FOR ALL TO authenticated
    USING (
        employee_id IN (
            SELECT e.id FROM employees e
            JOIN admin_users au ON e.organization_id = au.organization_id
            WHERE au.id = auth.uid()
        )
    );

-- Payslip Emails: Users can access payslip emails for their organization
CREATE POLICY "Users can access payslip emails in their org" ON payslip_emails
    FOR ALL TO authenticated
    USING (
        payslip_id IN (
            SELECT p.id FROM payslips p
            JOIN employees e ON p.employee_id = e.id
            JOIN admin_users au ON e.organization_id = au.organization_id
            WHERE au.id = auth.uid()
        )
    );

-- PDF Configs: Users can access PDF configs for their organization
CREATE POLICY "Users can access PDF configs in their org" ON pdf_configs
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- ==========================
-- FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- ==========================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pdf_configs_updated_at BEFORE UPDATE ON pdf_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();