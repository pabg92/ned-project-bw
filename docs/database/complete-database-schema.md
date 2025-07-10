# Board Champions Complete Database Schema Documentation

## Database Overview

Board Champions is a talent recruitment platform built on PostgreSQL/Supabase that connects companies with board-level executives and senior professionals. The platform uses a credit-based system where companies purchase credits to unlock and view detailed candidate profiles.

### Key Features:
- Credit-based profile access system
- Comprehensive candidate profiles with work history and education
- Tag-based categorization and search
- Saved searches with email alerts
- Shortlist management with folders
- Complete audit trails and version history
- Soft delete functionality for data retention
- Row-level security on sensitive tables

## Complete Table Schemas

### 1. **users**
Central user authentication and role management table.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | text | NO | - | PRIMARY KEY | User ID from Clerk authentication |
| `email` | text | NO | - | UNIQUE | User's email address |
| `role` | text | NO | 'candidate' | CHECK: IN ('candidate', 'company', 'admin') | User role in the system |
| `first_name` | text | YES | - | - | User's first name |
| `last_name` | text | YES | - | - | User's last name |
| `image_url` | text | YES | - | - | Profile picture URL |
| `is_active` | boolean | NO | true | - | Whether account is active |
| `last_login` | timestamptz | YES | - | - | Last login timestamp |
| `created_at` | timestamptz | NO | now() | - | Account creation time |
| `updated_at` | timestamptz | NO | now() | - | Last profile update |
| `admin_notes` | text | YES | - | - | Internal admin notes |
| `deleted_at` | timestamptz | YES | - | - | Soft delete timestamp |
| `deleted_by` | text | YES | - | FK: users(id) | Admin who deleted the account |
| `deletion_reason` | text | YES | - | - | Reason for account deletion |

**Foreign Keys:**
- `deleted_by` → users(id)

---

### 2. **candidate_profiles**
Comprehensive profiles for job-seeking candidates.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Unique profile identifier |
| `user_id` | text | NO | - | FK: users(id) | Link to user account |
| `title` | text | YES | - | - | Professional title/headline |
| `summary` | text | YES | - | - | Profile summary/bio |
| `experience` | text | YES | - | CHECK: IN ('junior', 'mid', 'senior', 'lead', 'executive') | Experience level |
| `location` | text | YES | - | - | Current location |
| `remote_preference` | text | YES | - | CHECK: IN ('remote', 'hybrid', 'onsite', 'flexible') | Work preference |
| `salary_min` | text | YES | - | - | Minimum salary expectation |
| `salary_max` | text | YES | - | - | Maximum salary expectation |
| `salary_currency` | text | YES | 'USD' | - | Salary currency |
| `availability` | text | YES | - | CHECK: IN ('immediately', '2weeks', '1month', '3months') | When available |
| `is_active` | boolean | NO | true | - | Whether actively job seeking |
| `is_public` | boolean | NO | false | - | Public profile visibility |
| `profile_completed` | boolean | NO | false | - | Profile completion status |
| `is_anonymized` | boolean | NO | true | - | Hide personal details |
| `linkedin_url` | text | YES | - | - | LinkedIn profile URL |
| `github_url` | text | YES | - | - | GitHub profile URL |
| `portfolio_url` | text | YES | - | - | Portfolio website |
| `resume_url` | text | YES | - | - | Resume file URL |
| `private_metadata` | jsonb | YES | '{}' | - | Private data (not shown to companies) |
| `public_metadata` | jsonb | YES | '{}' | - | Public additional data |
| `created_at` | timestamptz | NO | now() | - | Profile creation time |
| `updated_at` | timestamptz | NO | now() | - | Last update time |
| `admin_notes` | text | YES | - | - | Internal admin notes |
| `deleted_at` | timestamptz | YES | - | - | Soft delete timestamp |
| `deleted_by` | text | YES | - | FK: users(id) | Admin who deleted |
| `deletion_reason` | text | YES | - | - | Deletion reason |

**Foreign Keys:**
- `user_id` → users(id)
- `deleted_by` → users(id)

---

### 3. **candidate_profile_versions**
Historical versions of candidate profiles (RLS enabled).

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Version ID |
| `profile_id` | uuid | NO | - | FK: candidate_profiles(id) | Original profile |
| `user_id` | text | NO | - | FK: users(id) | User reference |
| `version_number` | integer | NO | - | - | Sequential version |
| `title` | varchar(255) | YES | - | - | Historical title |
| `summary` | text | YES | - | - | Historical summary |
| `experience_level` | varchar(20) | YES | - | - | Historical experience |
| `location` | varchar(100) | YES | - | - | Historical location |
| `remote_preference` | varchar(20) | YES | - | - | Historical remote preference |
| `availability` | varchar(20) | YES | - | - | Historical availability |
| `salary_min` | integer | YES | - | - | Historical salary min |
| `salary_max` | integer | YES | - | - | Historical salary max |
| `salary_currency` | varchar(3) | YES | - | - | Historical currency |
| `linkedin_url` | text | YES | - | - | Historical LinkedIn |
| `github_url` | text | YES | - | - | Historical GitHub |
| `portfolio_url` | text | YES | - | - | Historical portfolio |
| `resume_url` | text | YES | - | - | Historical resume |
| `is_anonymized` | boolean | YES | false | - | Historical anonymization |
| `is_active` | boolean | YES | true | - | Historical active status |
| `public_metadata` | jsonb | YES | - | - | Historical public data |
| `private_metadata` | jsonb | YES | - | - | Historical private data |
| `created_by` | text | YES | - | FK: users(id) | Who made change |
| `created_at` | timestamptz | NO | - | - | Version timestamp |
| `valid_from` | timestamptz | NO | - | - | Version start time |
| `valid_to` | timestamptz | YES | - | - | Version end time |
| `change_reason` | text | YES | - | - | Why changed |

**Composite Unique:** (profile_id, version_number)

**Foreign Keys:**
- `profile_id` → candidate_profiles(id)
- `user_id` → users(id)
- `created_by` → users(id)

---

### 4. **work_experiences**
Employment history for candidates.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Experience record ID |
| `candidate_id` | uuid | NO | - | FK: candidate_profiles(id) | Link to candidate |
| `company_name` | text | NO | - | - | Company name |
| `position` | text | NO | - | - | Job title |
| `description` | text | YES | - | - | Role description |
| `start_date` | date | NO | - | - | Employment start date |
| `end_date` | date | YES | - | - | Employment end date (NULL = current) |
| `is_current` | boolean | NO | false | - | Currently employed here |
| `created_at` | timestamptz | NO | now() | - | Record creation time |
| `updated_at` | timestamptz | NO | now() | - | Last update time |

**Foreign Keys:**
- `candidate_id` → candidate_profiles(id)

---

### 5. **education**
Educational background for candidates.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Education record ID |
| `candidate_id` | uuid | NO | - | FK: candidate_profiles(id) | Link to candidate |
| `institution` | text | NO | - | - | School/university name |
| `degree` | text | NO | - | - | Degree obtained |
| `field_of_study` | text | YES | - | - | Major/field of study |
| `start_date` | date | YES | - | - | Education start date |
| `end_date` | date | YES | - | - | Graduation date |
| `created_at` | timestamptz | NO | now() | - | Record creation time |
| `updated_at` | timestamptz | NO | now() | - | Last update time |

**Foreign Keys:**
- `candidate_id` → candidate_profiles(id)

---

### 6. **tags**
Categorization system for skills, industries, and roles.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Tag ID |
| `name` | text | NO | - | UNIQUE | Tag name |
| `type` | text | NO | - | CHECK: IN ('skill', 'industry', 'role', 'technology', 'certification') | Tag category |
| `created_at` | timestamptz | NO | now() | - | Creation time |

---

### 7. **candidate_tags**
Links candidates to their tags (many-to-many).

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `candidate_id` | uuid | NO | - | FK: candidate_profiles(id) | Candidate reference |
| `tag_id` | uuid | NO | - | FK: tags(id) | Tag reference |
| `created_at` | timestamptz | NO | now() | - | Assignment time |

**Primary Key:** Composite on (candidate_id, tag_id)

**Foreign Keys:**
- `candidate_id` → candidate_profiles(id)
- `tag_id` → tags(id)

---

### 8. **user_credits**
Tracks credit balance for each user.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Record ID |
| `user_id` | text | NO | - | UNIQUE, FK: users(id) | One record per user |
| `credits` | integer | NO | 0 | - | Current credit balance |
| `total_purchased` | integer | NO | 0 | - | Lifetime credits purchased |
| `credits_expiry_date` | date | YES | - | - | When credits expire (NULL = no expiry) |
| `created_at` | timestamptz | NO | now() | - | First credit purchase |
| `updated_at` | timestamptz | NO | now() | - | Last balance change |

**Foreign Keys:**
- `user_id` → users(id)

**Indexes:**
- Partial index on credits_expiry_date WHERE credits_expiry_date IS NOT NULL

---

### 9. **credit_transactions**
Audit log of all credit changes.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Transaction ID |
| `user_id` | text | NO | - | FK: users(id) | User affected |
| `amount` | integer | NO | - | - | Credit amount (positive or negative) |
| `type` | text | NO | - | CHECK: IN ('purchase', 'debit', 'refund', 'bonus', 'expired') | Transaction type |
| `description` | text | YES | - | - | Human-readable description |
| `stripe_payment_id` | text | YES | - | - | Stripe payment reference |
| `stripe_invoice_id` | text | YES | - | - | Stripe invoice reference |
| `reference_id` | uuid | YES | - | - | Link to related record |
| `reference_type` | text | YES | - | - | Type of reference |
| `created_at` | timestamptz | NO | now() | - | Transaction time |

**Foreign Keys:**
- `user_id` → users(id)

**Indexes:**
- Index on user_id
- Composite index on (reference_id, reference_type)

---

### 10. **credit_packages**
Defines purchasable credit bundles.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Package ID |
| `name` | text | NO | - | - | Package name |
| `credits` | integer | NO | - | - | Number of credits |
| `price` | decimal(10,2) | NO | - | - | Price amount |
| `currency` | text | NO | 'GBP' | - | Price currency |
| `stripe_price_id` | text | YES | - | - | Stripe price ID for checkout |
| `stripe_product_id` | text | YES | - | - | Stripe product ID |
| `validity_days` | integer | YES | - | - | Days until credits expire |
| `is_active` | boolean | YES | true | - | Available for purchase |
| `is_recurring` | boolean | YES | false | - | Subscription package |
| `description` | text | YES | - | - | Package description |
| `badge_text` | text | YES | - | - | UI badge (e.g., "Most Popular") |
| `badge_color` | text | YES | 'blue' | - | Badge color |
| `sort_order` | integer | YES | 0 | - | Display order |
| `created_at` | timestamptz | NO | now() | - | Package creation |
| `updated_at` | timestamptz | NO | now() | - | Last update |

---

### 11. **credit_expiry_log**
Records expired credits for auditing.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Log entry ID |
| `user_id` | text | NO | - | FK: users(id) | User affected |
| `credits_expired` | integer | NO | - | - | Number of credits expired |
| `expiry_date` | date | NO | - | - | Original expiry date |
| `processed_at` | timestamptz | NO | now() | - | When expiry was processed |

**Foreign Keys:**
- `user_id` → users(id)

---

### 12. **profile_unlocks**
Records which profiles a user has unlocked access to.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Unlock record ID |
| `user_id` | text | NO | - | FK: users(id) | Company user who unlocked |
| `candidate_id` | uuid | NO | - | FK: candidate_profiles(id) | Profile unlocked |
| `unlocked_at` | timestamptz | NO | now() | - | When unlocked |
| `credit_cost` | integer | NO | 1 | - | Credits spent |
| `source` | text | NO | 'direct' | CHECK: IN ('direct', 'bulk', 'admin_grant', 'subscription') | How unlocked |

**Unique Constraint:** (user_id, candidate_id)

**Foreign Keys:**
- `user_id` → users(id)
- `candidate_id` → candidate_profiles(id)

**Indexes:**
- Index on user_id
- Index on candidate_id

---

### 13. **user_shortlists**
Allows users to save interesting profiles.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Shortlist entry ID |
| `user_id` | text | NO | - | FK: users(id) | User who saved |
| `candidate_id` | uuid | NO | - | FK: candidate_profiles(id) | Profile saved |
| `notes` | text | YES | - | - | User's private notes |
| `folder_name` | text | YES | 'Default' | - | Organization folder |
| `position` | integer | YES | - | - | Custom sort order |
| `added_at` | timestamptz | NO | now() | - | When added |
| `updated_at` | timestamptz | NO | now() | - | Last note update |
| `deleted_at` | timestamptz | YES | - | - | Soft delete |

**Unique Index:** (user_id, candidate_id) WHERE deleted_at IS NULL

**Foreign Keys:**
- `user_id` → users(id)
- `candidate_id` → candidate_profiles(id)

**Indexes:**
- Index on user_id
- Partial index on user_id WHERE deleted_at IS NULL

---

### 14. **saved_searches**
Stores search criteria for reuse and alerts.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Search ID |
| `user_id` | text | NO | - | FK: users(id) | Search owner |
| `name` | text | NO | - | - | Search name |
| `search_criteria` | jsonb | NO | - | - | Search parameters |
| `notification_enabled` | boolean | YES | false | - | Email alerts enabled |
| `last_run_at` | timestamptz | YES | - | - | Last execution time |
| `results_count` | integer | YES | 0 | - | Last result count |
| `created_at` | timestamptz | NO | now() | - | Creation time |
| `updated_at` | timestamptz | NO | now() | - | Last update |
| `deleted_at` | timestamptz | YES | - | - | Soft delete |

**Foreign Keys:**
- `user_id` → users(id)

**Indexes:**
- Index on user_id
- Partial index on user_id WHERE deleted_at IS NULL

---

### 15. **search_alerts**
Manages email notification preferences.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Alert configuration ID |
| `user_id` | text | NO | - | FK: users(id) | Alert recipient |
| `saved_search_id` | uuid | YES | - | FK: saved_searches(id) | Search to monitor |
| `alert_frequency` | text | NO | - | CHECK: IN ('instant', 'daily', 'weekly', 'monthly') | Frequency |
| `last_sent_at` | timestamptz | YES | - | - | Last alert sent |
| `next_send_at` | timestamptz | YES | - | - | Next scheduled send |
| `is_active` | boolean | YES | true | - | Alert enabled |
| `created_at` | timestamptz | NO | now() | - | Configuration time |

**Foreign Keys:**
- `user_id` → users(id)
- `saved_search_id` → saved_searches(id)

**Indexes:**
- Partial index on next_send_at WHERE is_active = true

---

### 16. **user_activity_log**
Comprehensive activity tracking for analytics.

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Log entry ID |
| `user_id` | text | NO | - | FK: users(id) | Acting user |
| `action_type` | text | NO | - | - | Action performed |
| `resource_type` | text | YES | - | - | Type of resource accessed |
| `resource_id` | text | YES | - | - | ID of resource |
| `metadata` | jsonb | YES | - | - | Additional context |
| `ip_address` | inet | YES | - | - | User's IP address |
| `user_agent` | text | YES | - | - | Browser information |
| `session_id` | text | YES | - | - | Session tracking |
| `created_at` | timestamptz | NO | now() | - | Action timestamp |

**Foreign Keys:**
- `user_id` → users(id)

**Indexes:**
- Index on user_id
- Index on created_at

---

### 17. **user_audit_logs**
Detailed audit trail for compliance (RLS enabled).

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Audit log ID |
| `user_id` | text | NO | - | FK: users(id) | User affected |
| `admin_id` | text | NO | - | FK: users(id) | Admin who made change |
| `action` | varchar(50) | NO | - | - | Action type |
| `table_name` | varchar(100) | NO | - | - | Table affected |
| `record_id` | text | NO | - | - | Record affected |
| `old_data` | jsonb | YES | - | - | Previous state |
| `new_data` | jsonb | YES | - | - | New state |
| `changes` | jsonb | YES | - | - | Computed diff |
| `ip_address` | varchar(45) | YES | - | - | Admin's IP |
| `user_agent` | text | YES | - | - | Admin's browser |
| `metadata` | jsonb | YES | - | - | Additional context |
| `created_at` | timestamptz | YES | now() | - | Action time |

**Foreign Keys:**
- `user_id` → users(id)
- `admin_id` → users(id)

**Indexes:**
- Index on user_id
- Index on admin_id
- Index on action
- Index on (table_name, record_id)
- Index on created_at

---

### 18. **user_versions**
Historical versions of user records (RLS enabled).

| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | uuid | NO | gen_random_uuid() | PRIMARY KEY | Version ID |
| `user_id` | text | NO | - | FK: users(id) | User versioned |
| `version_number` | integer | NO | - | - | Sequential version |
| `email` | varchar(255) | NO | - | - | Historical email |
| `first_name` | varchar(100) | YES | - | - | Historical first name |
| `last_name` | varchar(100) | YES | - | - | Historical last name |
| `role` | varchar(20) | NO | - | - | Historical role |
| `is_active` | boolean | NO | true | - | Historical status |
| `image_url` | text | YES | - | - | Historical image |
| `public_metadata` | jsonb | YES | - | - | Historical public data |
| `private_metadata` | jsonb | YES | - | - | Historical private data |
| `created_by` | text | YES | - | FK: users(id) | Who made change |
| `created_at` | timestamptz | NO | - | - | Version timestamp |
| `valid_from` | timestamptz | NO | - | - | Version start time |
| `valid_to` | timestamptz | YES | - | - | Version end time |
| `change_reason` | text | YES | - | - | Why changed |

**Unique Constraint:** (user_id, version_number)

**Foreign Keys:**
- `user_id` → users(id)
- `created_by` → users(id)

**Indexes:**
- Index on user_id
- Index on (user_id, valid_from, valid_to)

---

## Database Views

### **active_shortlist_items**
Filters user_shortlists to show only non-deleted items.

```sql
CREATE VIEW active_shortlist_items AS
SELECT * FROM user_shortlists WHERE deleted_at IS NULL;
```

### **user_credit_summary**
Calculates available credits considering expiry dates.

```sql
CREATE VIEW user_credit_summary AS
SELECT 
  uc.*,
  CASE
    WHEN credits_expiry_date IS NOT NULL AND credits_expiry_date < CURRENT_DATE
    THEN 0
    ELSE credits
  END as available_credits
FROM user_credits uc;
```

### **active_users**
Shows only non-deleted active users.

```sql
CREATE VIEW active_users AS
SELECT * FROM users WHERE deleted_at IS NULL AND is_active = true;
```

### **active_candidate_profiles**
Shows only non-deleted active candidate profiles.

```sql
CREATE VIEW active_candidate_profiles AS
SELECT * FROM candidate_profiles WHERE deleted_at IS NULL AND is_active = true;
```

---

## Index Summary

### Performance Indexes
- `idx_profile_unlocks_user_id` on profile_unlocks(user_id)
- `idx_profile_unlocks_candidate_id` on profile_unlocks(candidate_id)
- `idx_credit_transactions_user_id` on credit_transactions(user_id)
- `idx_user_shortlists_user_id` on user_shortlists(user_id)
- `idx_saved_searches_user_id` on saved_searches(user_id)
- `idx_user_activity_log_user_id` on user_activity_log(user_id)
- `idx_user_activity_log_created_at` on user_activity_log(created_at)

### Soft Delete Support
- `idx_user_shortlists_not_deleted` on user_shortlists(user_id) WHERE deleted_at IS NULL
- `idx_saved_searches_not_deleted` on saved_searches(user_id) WHERE deleted_at IS NULL

### Specialized Indexes
- `idx_user_credits_expiry` on user_credits(credits_expiry_date) WHERE credits_expiry_date IS NOT NULL
- `idx_credit_transactions_reference` on credit_transactions(reference_id, reference_type)
- `idx_search_alerts_next_send` on search_alerts(next_send_at) WHERE is_active = true
- `idx_user_shortlists_unique_active` UNIQUE on user_shortlists(user_id, candidate_id) WHERE deleted_at IS NULL

### Version History Indexes
- Index on user_versions(user_id)
- Index on user_versions(user_id, valid_from, valid_to)

### Audit Indexes
- Index on user_audit_logs(user_id)
- Index on user_audit_logs(admin_id)
- Index on user_audit_logs(action)
- Index on user_audit_logs(table_name, record_id)
- Index on user_audit_logs(created_at)

---

## Foreign Key Relationships

### User Relationships
- `users.deleted_by` → `users.id`
- `candidate_profiles.user_id` → `users.id`
- `candidate_profiles.deleted_by` → `users.id`
- `candidate_profile_versions.user_id` → `users.id`
- `candidate_profile_versions.created_by` → `users.id`
- `user_credits.user_id` → `users.id`
- `credit_transactions.user_id` → `users.id`
- `credit_expiry_log.user_id` → `users.id`
- `profile_unlocks.user_id` → `users.id`
- `user_shortlists.user_id` → `users.id`
- `saved_searches.user_id` → `users.id`
- `search_alerts.user_id` → `users.id`
- `user_activity_log.user_id` → `users.id`
- `user_audit_logs.user_id` → `users.id`
- `user_audit_logs.admin_id` → `users.id`
- `user_versions.user_id` → `users.id`
- `user_versions.created_by` → `users.id`

### Candidate Profile Relationships
- `candidate_profile_versions.profile_id` → `candidate_profiles.id`
- `work_experiences.candidate_id` → `candidate_profiles.id`
- `education.candidate_id` → `candidate_profiles.id`
- `candidate_tags.candidate_id` → `candidate_profiles.id`
- `profile_unlocks.candidate_id` → `candidate_profiles.id`
- `user_shortlists.candidate_id` → `candidate_profiles.id`

### Other Relationships
- `candidate_tags.tag_id` → `tags.id`
- `search_alerts.saved_search_id` → `saved_searches.id`

---

## Row Level Security (RLS)

The following tables have RLS enabled:
- `candidate_profile_versions` - Audit trail visibility
- `user_audit_logs` - Admin-only access
- `user_versions` - Audit trail visibility

RLS policies should ensure:
- Users can only view their own data
- Users can only modify their own records
- Admins have full access
- Public access to credit packages only

---

## Data Types Summary

### Common Patterns
- **IDs**: UUID with gen_random_uuid() default (except users.id which is TEXT from Clerk)
- **Timestamps**: TIMESTAMPTZ with NOW() default
- **Booleans**: Default values typically true or false
- **JSON**: JSONB for flexible metadata storage
- **Money**: DECIMAL(10,2) for prices, INTEGER for credit amounts
- **Constraints**: CHECK constraints for enums, UNIQUE for business rules

### Special Considerations
- User IDs are TEXT to integrate with Clerk authentication
- Soft deletes use deleted_at TIMESTAMPTZ pattern
- Version tables maintain temporal validity with valid_from/valid_to
- Partial unique constraints handle soft delete scenarios

---

## Maintenance Notes

### Regular Tasks
1. **Credit Expiry Processing**: Run daily to expire old credits
2. **Search Alert Sending**: Check next_send_at and process alerts
3. **Activity Log Archival**: Move old logs to archive storage
4. **Version History Cleanup**: Archive old versions after retention period

### Performance Monitoring
- Monitor index usage and query performance
- Check for missing indexes on foreign keys
- Review JSONB query patterns for optimization
- Monitor table sizes and implement partitioning if needed

### Data Integrity
- All foreign keys should have indexes
- Soft delete queries should use partial indexes
- Version history should never have gaps
- Credit balance should match transaction sum

---

## Security Considerations

1. **Authentication**: User IDs come from Clerk, ensure webhook validation
2. **Authorization**: Implement RLS policies on all sensitive tables
3. **Audit Trail**: user_audit_logs and version tables provide compliance
4. **Data Privacy**: Anonymization flags control PII visibility
5. **Soft Deletes**: Maintain data for compliance while respecting deletion requests

---

## Future Enhancements

1. **Table Partitioning**: Consider partitioning large tables by date
2. **Materialized Views**: For complex search queries
3. **Full Text Search**: Add tsvector columns for better search
4. **Additional Indexes**: Based on query performance analysis
5. **Archive Strategy**: Move old data to archive tables