-- Row Level Security Policies for NED Backend
-- These policies enforce role-based access control at the database level

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role from JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'candidate'::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user ID from JWT
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is company member
CREATE OR REPLACE FUNCTION is_company_member(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_id
    AND cu.user_id = get_current_user_id()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS TABLE POLICIES

-- Users can read their own data, admins can read all
CREATE POLICY "users_select_policy" ON users
FOR SELECT USING (
  id = get_current_user_id() OR 
  get_user_role() = 'admin'
);

-- Users can update their own data, admins can update all
CREATE POLICY "users_update_policy" ON users
FOR UPDATE USING (
  id = get_current_user_id() OR 
  get_user_role() = 'admin'
);

-- Only admins can insert/delete users (handled by Clerk webhooks)
CREATE POLICY "users_insert_policy" ON users
FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "users_delete_policy" ON users
FOR DELETE USING (get_user_role() = 'admin');

-- COMPANIES TABLE POLICIES

-- Company members and admins can read their company data
CREATE POLICY "companies_select_policy" ON companies
FOR SELECT USING (
  get_user_role() = 'admin' OR
  is_company_member(id)
);

-- Only company owners/admins and system admins can update company data
CREATE POLICY "companies_update_policy" ON companies
FOR UPDATE USING (
  get_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = id
    AND cu.user_id = get_current_user_id()
    AND cu.role IN ('owner', 'admin')
  )
);

-- Only admins can create/delete companies
CREATE POLICY "companies_insert_policy" ON companies
FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "companies_delete_policy" ON companies
FOR DELETE USING (get_user_role() = 'admin');

-- COMPANY_USERS TABLE POLICIES

-- Users can see their own company memberships, company admins can see their company members
CREATE POLICY "company_users_select_policy" ON company_users
FOR SELECT USING (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin' OR
  is_company_member(company_id)
);

-- Only company owners and system admins can modify company memberships
CREATE POLICY "company_users_modify_policy" ON company_users
FOR ALL USING (
  get_user_role() = 'admin' OR
  EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.company_id = company_id
    AND cu.user_id = get_current_user_id()
    AND cu.role = 'owner'
  )
);

-- TAGS TABLE POLICIES

-- Tags are readable by all authenticated users
CREATE POLICY "tags_select_policy" ON tags
FOR SELECT USING (get_current_user_id() != '');

-- Only admins can modify tags
CREATE POLICY "tags_modify_policy" ON tags
FOR ALL USING (get_user_role() = 'admin');

-- CANDIDATE_PROFILES TABLE POLICIES

-- Candidates can read/update their own profile, admins can read all, companies can read anonymized versions
CREATE POLICY "candidate_profiles_select_policy" ON candidate_profiles
FOR SELECT USING (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin' OR
  (get_user_role() = 'company' AND is_anonymized = true AND is_active = true)
);

-- Only candidates can update their own profile, admins can update all
CREATE POLICY "candidate_profiles_update_policy" ON candidate_profiles
FOR UPDATE USING (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin'
);

-- Candidates can create their profile, admins can create any
CREATE POLICY "candidate_profiles_insert_policy" ON candidate_profiles
FOR INSERT WITH CHECK (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin'
);

-- Only admins can delete profiles
CREATE POLICY "candidate_profiles_delete_policy" ON candidate_profiles
FOR DELETE USING (get_user_role() = 'admin');

-- CANDIDATE_TAGS TABLE POLICIES

-- Follow candidate profile access rules
CREATE POLICY "candidate_tags_select_policy" ON candidate_tags
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (
      cp.user_id = get_current_user_id() OR
      get_user_role() = 'admin' OR
      (get_user_role() = 'company' AND cp.is_anonymized = true AND cp.is_active = true)
    )
  )
);

-- Only candidate owners and admins can modify
CREATE POLICY "candidate_tags_modify_policy" ON candidate_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (cp.user_id = get_current_user_id() OR get_user_role() = 'admin')
  )
);

-- WORK_EXPERIENCES TABLE POLICIES

-- Follow candidate profile access rules
CREATE POLICY "work_experiences_select_policy" ON work_experiences
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (
      cp.user_id = get_current_user_id() OR
      get_user_role() = 'admin' OR
      (get_user_role() = 'company' AND cp.is_anonymized = true AND cp.is_active = true)
    )
  )
);

-- Only candidate owners and admins can modify
CREATE POLICY "work_experiences_modify_policy" ON work_experiences
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (cp.user_id = get_current_user_id() OR get_user_role() = 'admin')
  )
);

-- EDUCATION TABLE POLICIES

-- Follow candidate profile access rules
CREATE POLICY "education_select_policy" ON education
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (
      cp.user_id = get_current_user_id() OR
      get_user_role() = 'admin' OR
      (get_user_role() = 'company' AND cp.is_anonymized = true AND cp.is_active = true)
    )
  )
);

-- Only candidate owners and admins can modify
CREATE POLICY "education_modify_policy" ON education
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND (cp.user_id = get_current_user_id() OR get_user_role() = 'admin')
  )
);

-- PROFILE_VIEWS TABLE POLICIES

-- Companies can see their own views, candidates can see views of their profile, admins see all
CREATE POLICY "profile_views_select_policy" ON profile_views
FOR SELECT USING (
  get_user_role() = 'admin' OR
  viewed_by_user_id = get_current_user_id() OR
  is_company_member(company_id) OR
  EXISTS (
    SELECT 1 FROM candidate_profiles cp
    WHERE cp.id = candidate_id
    AND cp.user_id = get_current_user_id()
  )
);

-- Only companies and admins can create views
CREATE POLICY "profile_views_insert_policy" ON profile_views
FOR INSERT WITH CHECK (
  get_user_role() = 'admin' OR
  (get_user_role() = 'company' AND is_company_member(company_id))
);

-- SEARCH_QUERIES TABLE POLICIES

-- Companies can see their own searches, admins see all
CREATE POLICY "search_queries_select_policy" ON search_queries
FOR SELECT USING (
  get_user_role() = 'admin' OR
  is_company_member(company_id)
);

-- Companies can create searches, admins can create any
CREATE POLICY "search_queries_insert_policy" ON search_queries
FOR INSERT WITH CHECK (
  get_user_role() = 'admin' OR
  (get_user_role() = 'company' AND is_company_member(company_id))
);

-- NOTIFICATIONS TABLE POLICIES

-- Users can read their own notifications, admins can read all
CREATE POLICY "notifications_select_policy" ON notifications
FOR SELECT USING (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin'
);

-- Users can update their own notifications (mark as read), admins can update all
CREATE POLICY "notifications_update_policy" ON notifications
FOR UPDATE USING (
  user_id = get_current_user_id() OR
  get_user_role() = 'admin'
);

-- Only system/admins can create notifications
CREATE POLICY "notifications_insert_policy" ON notifications
FOR INSERT WITH CHECK (get_user_role() = 'admin');

-- DATA_INGESTION_LOGS TABLE POLICIES

-- Only admins can access ingestion logs
CREATE POLICY "data_ingestion_logs_policy" ON data_ingestion_logs
FOR ALL USING (get_user_role() = 'admin');

-- Create indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_company_users_lookup ON company_users(user_id, company_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;