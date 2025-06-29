-- Drop ALL existing policies more comprehensively
DROP POLICY IF EXISTS "Users can access their organization" ON organizations;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Users can manage their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can delete their organization" ON organizations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON organizations;

DROP POLICY IF EXISTS "Users can access admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Allow users to create their admin profile" ON admin_users;
DROP POLICY IF EXISTS "Users can manage admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Users can update admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Users can delete admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON admin_users;

DROP POLICY IF EXISTS "Users can access departments in their org" ON departments;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON departments;

DROP POLICY IF EXISTS "Users can access positions in their org" ON positions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON positions;

DROP POLICY IF EXISTS "Users can access employees in their org" ON employees;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON employees;

DROP POLICY IF EXISTS "Users can access attendance in their org" ON attendance;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON attendance;

DROP POLICY IF EXISTS "Users can access payslips in their org" ON payslips;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payslips;

DROP POLICY IF EXISTS "Users can access payslip emails in their org" ON payslip_emails;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON payslip_emails;

DROP POLICY IF EXISTS "Users can access PDF configs in their org" ON pdf_configs;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON pdf_configs;

-- Create working policies for signup
CREATE POLICY "Allow all operations for authenticated users" ON organizations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON admin_users
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON departments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON positions
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON employees
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON attendance
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON payslips
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON payslip_emails
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users" ON pdf_configs
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);