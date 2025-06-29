-- Fix RLS policies for signup flow
-- The existing policy prevents users from creating organizations during signup
-- because they don't exist in admin_users yet

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can access their organization" ON organizations;

-- Create separate policies for different operations
-- Allow authenticated users to INSERT organizations (for signup)
CREATE POLICY "Allow INSERT for authenticated users" ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow users to SELECT/UPDATE/DELETE only their own organization
CREATE POLICY "Users can manage their organization" ON organizations
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Users can update their organization" ON organizations
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their organization" ON organizations
    FOR DELETE TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

-- Also fix admin_users policy to allow INSERT during signup
DROP POLICY IF EXISTS "Users can access admin users in their org" ON admin_users;

-- Allow users to INSERT their own admin_user record (for signup)
CREATE POLICY "Allow users to create their admin profile" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

-- Allow users to manage admin users in their organization
CREATE POLICY "Users can manage admin users in their org" ON admin_users
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Users can update admin users in their org" ON admin_users
    FOR UPDATE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );

CREATE POLICY "Users can delete admin users in their org" ON admin_users
    FOR DELETE TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM admin_users 
            WHERE admin_users.id = auth.uid()
        )
    );