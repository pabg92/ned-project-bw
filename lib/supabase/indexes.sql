-- Performance Indexes for NED Backend Database
-- These indexes optimize search queries and frequent operations

-- Users table indexes (already defined in schema)
-- CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
-- CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
-- CREATE INDEX IF NOT EXISTS users_active_idx ON users(is_active);

-- Companies table indexes (already defined in schema)
-- CREATE INDEX IF NOT EXISTS companies_name_idx ON companies(name);
-- CREATE INDEX IF NOT EXISTS companies_tier_idx ON companies(tier);
-- CREATE INDEX IF NOT EXISTS companies_subscription_idx ON companies(subscription_status);

-- Candidate profiles - Advanced search indexes
CREATE INDEX IF NOT EXISTS candidate_profiles_search_idx ON candidate_profiles 
  USING GIN ((public_metadata));

CREATE INDEX IF NOT EXISTS candidate_profiles_salary_idx ON candidate_profiles 
  (salary_min, salary_max) WHERE is_active = true AND is_anonymized = true;

CREATE INDEX IF NOT EXISTS candidate_profiles_location_experience_idx ON candidate_profiles 
  (location, experience) WHERE is_active = true AND is_anonymized = true;

CREATE INDEX IF NOT EXISTS candidate_profiles_availability_active_idx ON candidate_profiles 
  (availability, is_active, is_anonymized);

-- Composite index for common search patterns
CREATE INDEX IF NOT EXISTS candidate_profiles_search_composite_idx ON candidate_profiles 
  (experience, location, remote_preference, availability) 
  WHERE is_active = true AND is_anonymized = true;

-- Tags - Full text search support
CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON tags 
  USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tags_search_idx ON tags 
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Candidate tags - Skills search optimization
CREATE INDEX IF NOT EXISTS candidate_tags_search_idx ON candidate_tags 
  (tag_id, proficiency, years_experience);

CREATE INDEX IF NOT EXISTS candidate_tags_candidate_proficiency_idx ON candidate_tags 
  (candidate_id, proficiency) WHERE is_endorsed = true;

-- Work experiences - Company and title search
CREATE INDEX IF NOT EXISTS work_experiences_company_trgm_idx ON work_experiences 
  USING GIN (company gin_trgm_ops);

CREATE INDEX IF NOT EXISTS work_experiences_title_trgm_idx ON work_experiences 
  USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS work_experiences_current_candidate_idx ON work_experiences 
  (candidate_id, is_current, end_date DESC) WHERE is_current = true;

-- Education - Institution and degree search
CREATE INDEX IF NOT EXISTS education_institution_trgm_idx ON education 
  USING GIN (institution gin_trgm_ops);

CREATE INDEX IF NOT EXISTS education_degree_field_idx ON education 
  (degree, field);

-- Profile views - Analytics and billing
CREATE INDEX IF NOT EXISTS profile_views_company_date_idx ON profile_views 
  (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS profile_views_candidate_date_idx ON profile_views 
  (candidate_id, created_at DESC);

CREATE INDEX IF NOT EXISTS profile_views_payment_analytics_idx ON profile_views 
  (view_type, payment_amount, created_at) WHERE view_type = 'purchased';

-- Search queries - Analytics optimization
CREATE INDEX IF NOT EXISTS search_queries_company_date_idx ON search_queries 
  (company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS search_queries_results_idx ON search_queries 
  (results_count, created_at DESC);

-- Notifications - User dashboard optimization
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications 
  (user_id, is_read, created_at DESC) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS notifications_type_date_idx ON notifications 
  (type, created_at DESC);

-- Data ingestion logs - Admin monitoring
CREATE INDEX IF NOT EXISTS data_ingestion_logs_status_date_idx ON data_ingestion_logs 
  (status, created_at DESC);

CREATE INDEX IF NOT EXISTS data_ingestion_logs_source_success_idx ON data_ingestion_logs 
  (source, records_success, created_at DESC);

-- Advanced search indexes for candidate discovery

-- Multi-column index for complex candidate searches
CREATE INDEX IF NOT EXISTS candidate_search_advanced_idx ON candidate_profiles 
  (experience, location, remote_preference, availability, salary_min, salary_max)
  WHERE is_active = true AND is_anonymized = true AND profile_completed = true;

-- Index for tag-based searches (requires joining with candidate_tags)
CREATE INDEX IF NOT EXISTS candidate_tags_skills_search_idx ON candidate_tags 
  (tag_id, candidate_id, proficiency, years_experience)
  WHERE is_endorsed = true;

-- Partial indexes for specific use cases

-- Recently updated active candidates
CREATE INDEX IF NOT EXISTS candidate_profiles_recent_updates_idx ON candidate_profiles 
  (updated_at DESC, is_active, is_anonymized)
  WHERE is_active = true AND updated_at > NOW() - INTERVAL '30 days';

-- High-value candidates (based on salary)
CREATE INDEX IF NOT EXISTS candidate_profiles_high_value_idx ON candidate_profiles 
  (salary_min DESC, experience, location)
  WHERE is_active = true AND is_anonymized = true AND salary_min > 100000;

-- Available candidates
CREATE INDEX IF NOT EXISTS candidate_profiles_available_idx ON candidate_profiles 
  (availability, updated_at DESC)
  WHERE is_active = true AND is_anonymized = true 
  AND availability IN ('immediately', '2weeks');

-- Covering indexes for common queries

-- Company dashboard queries
CREATE INDEX IF NOT EXISTS profile_views_company_dashboard_idx ON profile_views 
  (company_id, created_at DESC, view_type, candidate_id);

-- Candidate analytics
CREATE INDEX IF NOT EXISTS candidate_analytics_idx ON profile_views 
  (candidate_id, view_type, created_at DESC, company_id);

-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable full text search extensions
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Function-based indexes for search optimization
CREATE INDEX IF NOT EXISTS candidate_profiles_search_vector_idx ON candidate_profiles 
  USING GIN (to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(summary, '') || ' ' || 
    COALESCE(location, '') || ' ' || 
    COALESCE(experience, '')
  )) WHERE is_active = true AND is_anonymized = true;

-- Index for geographic searches (if implementing location-based search)
-- Note: This would require PostGIS extension for advanced geo features
CREATE INDEX IF NOT EXISTS candidate_profiles_location_search_idx ON candidate_profiles 
  USING GIN (location gin_trgm_ops) 
  WHERE is_active = true AND is_anonymized = true;

-- Analyze tables to update statistics
ANALYZE users;
ANALYZE companies;
ANALYZE company_users;
ANALYZE tags;
ANALYZE candidate_profiles;
ANALYZE candidate_tags;
ANALYZE work_experiences;
ANALYZE education;
ANALYZE profile_views;
ANALYZE search_queries;
ANALYZE notifications;
ANALYZE data_ingestion_logs;