-- Drop the restrictive policy that's causing the signup issue
DROP POLICY IF EXISTS "Users can access their organization" ON organizations;

-- Keep the permissive policy that allows signup to work
-- This policy should already exist from your previous fix:
-- CREATE POLICY "Allow all operations for authenticated users" ON organizations
--     FOR ALL TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- If it doesn't exist, create it:
CREATE POLICY "Allow all operations for authenticated users" ON organizations
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);