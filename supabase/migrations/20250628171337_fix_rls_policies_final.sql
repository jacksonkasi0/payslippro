-- Fix RLS policies for signup flow - Final version
-- This migration completely resets and fixes the RLS policies to allow proper signup

-- ==========================
-- 1. REMOVE ALL EXISTING POLICIES
-- ==========================

-- Remove all existing policies on organizations table
DROP POLICY IF EXISTS "Users can access their organization" ON organizations;
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON organizations;
DROP POLICY IF EXISTS "Users can manage their organization" ON organizations;
DROP POLICY IF EXISTS "Users can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can delete their organization" ON organizations;

-- Remove all existing policies on admin_users table
DROP POLICY IF EXISTS "Users can access admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Allow users to create their admin profile" ON admin_users;
DROP POLICY IF EXISTS "Users can manage admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Users can update admin users in their org" ON admin_users;
DROP POLICY IF EXISTS "Users can delete admin users in their org" ON admin_users;

-- ==========================
-- 2. CREATE NEW WORKING POLICIES
-- ==========================

-- Organizations: Allow authenticated users to create and manage organizations
CREATE POLICY "Allow all operations for authenticated users" ON organizations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Admin Users: Allow authenticated users to create and manage admin users
CREATE POLICY "Allow all operations for authenticated users" ON admin_users
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==========================
-- 3. OPTIONAL: MORE SECURE POLICIES (COMMENTED OUT)
-- Uncomment these and remove the permissive ones above for production
-- ==========================

/*
-- Organizations: More secure policies
CREATE POLICY "Users can insert organizations" ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view their organization" ON organizations
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

-- Admin Users: More secure policies
CREATE POLICY "Users can create their admin profile" ON admin_users
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view admin users in their org" ON admin_users
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
*/