# Board Champions Database Documentation

## Overview

Board Champions is a talent recruitment platform that connects companies with board-level executives and senior professionals. The database is designed to support a credit-based system where companies purchase credits to unlock and view detailed candidate profiles.

## Database Architecture

### Core Design Principles

1. **Credit-Based Access**: Companies must spend credits to unlock full candidate profiles
2. **Audit Trail**: Complete versioning and audit logs for compliance
3. **Soft Deletes**: User data is never hard deleted, maintaining historical records
4. **Privacy First**: Candidates can control anonymization and visibility
5. **Scalability**: Indexed for performance with proper foreign key relationships

## Table Structure

### 1. User Management

#### `users` Table
Core user authentication and role management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | User ID from Clerk authentication |
| `email` | TEXT | NOT NULL, UNIQUE | User's email address |
| `role` | TEXT | NOT NULL, CHECK | User role: 'candidate', 'company', or 'admin' |
| `first_name` | TEXT | | User's first name |
| `last_name` | TEXT | | User's last name |
| `image_url` | TEXT | | Profile picture URL |
| `is_active` | BOOLEAN | DEFAULT true | Whether account is active |
| `last_login` | TIMESTAMPTZ | | Last login timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last profile update |
| `admin_notes` | TEXT | | Internal admin notes |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by` | TEXT | FK to users | Admin who deleted the account |
| `deletion_reason` | TEXT | | Reason for account deletion |

**Indexes**: 
- Primary key on `id`
- Unique constraint on `email`

**Usage**: Central user table referenced by all user-specific data. Supports three roles with different permissions.

---

### 2. Candidate Information

#### `candidate_profiles` Table
Comprehensive profiles for job-seeking candidates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique profile identifier |
| `user_id` | TEXT | FK to users | Link to user account |
| `title` | TEXT | | Professional title/headline |
| `summary` | TEXT | | Profile summary/bio |
| `experience` | TEXT | CHECK | Experience level: junior/mid/senior/lead/executive |
| `location` | TEXT | | Current location |
| `remote_preference` | TEXT | CHECK | Work preference: remote/hybrid/onsite/flexible |
| `salary_min` | TEXT | | Minimum salary expectation |
| `salary_max` | TEXT | | Maximum salary expectation |
| `salary_currency` | TEXT | DEFAULT 'USD' | Salary currency |
| `availability` | TEXT | CHECK | When available: immediately/2weeks/1month/3months |
| `is_active` | BOOLEAN | DEFAULT true | Whether actively job seeking |
| `is_public` | BOOLEAN | DEFAULT false | Public profile visibility |
| `profile_completed` | BOOLEAN | DEFAULT false | Profile completion status |
| `is_anonymized` | BOOLEAN | DEFAULT true | Hide personal details |
| `linkedin_url` | TEXT | | LinkedIn profile URL |
| `github_url` | TEXT | | GitHub profile URL |
| `portfolio_url` | TEXT | | Portfolio website |
| `resume_url` | TEXT | | Resume file URL |
| `private_metadata` | JSONB | DEFAULT '{}' | Private data (not shown to companies) |
| `public_metadata` | JSONB | DEFAULT '{}' | Public additional data |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Profile creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |
| `admin_notes` | TEXT | | Internal admin notes |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by` | TEXT | FK to users | Admin who deleted |
| `deletion_reason` | TEXT | | Deletion reason |

**Indexes**: 
- Primary key on `id`
- Foreign key index on `user_id`

**Usage**: Main candidate data. Companies see anonymized version until they spend credits to unlock.

#### `work_experiences` Table
Employment history for candidates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Experience record ID |
| `candidate_id` | UUID | FK to candidate_profiles | Link to candidate |
| `company_name` | TEXT | NOT NULL | Company name |
| `position` | TEXT | NOT NULL | Job title |
| `description` | TEXT | | Role description |
| `start_date` | DATE | NOT NULL | Employment start date |
| `end_date` | DATE | | Employment end date (NULL = current) |
| `is_current` | BOOLEAN | DEFAULT false | Currently employed here |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Usage**: Displayed on candidate profiles. Can be anonymized (company names hidden) based on candidate preferences.

#### `education` Table
Educational background for candidates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Education record ID |
| `candidate_id` | UUID | FK to candidate_profiles | Link to candidate |
| `institution` | TEXT | NOT NULL | School/university name |
| `degree` | TEXT | NOT NULL | Degree obtained |
| `field_of_study` | TEXT | | Major/field of study |
| `start_date` | DATE | | Education start date |
| `end_date` | DATE | | Graduation date |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Usage**: Part of candidate profile. May be hidden if profile is anonymized.

#### `tags` Table
Categorization system for skills, industries, and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Tag ID |
| `name` | TEXT | NOT NULL, UNIQUE | Tag name |
| `type` | TEXT | NOT NULL, CHECK | Tag category: skill/industry/role/technology/certification |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Usage**: Used for search and filtering. Tags are assigned to candidates via `candidate_tags`.

#### `candidate_tags` Table
Links candidates to their tags (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `candidate_id` | UUID | FK to candidate_profiles | Candidate reference |
| `tag_id` | UUID | FK to tags | Tag reference |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Assignment time |

**Constraints**: 
- Composite primary key on (`candidate_id`, `tag_id`)

**Usage**: Enables tag-based search and filtering of candidates.

---

### 3. Credit System

#### `user_credits` Table
Tracks credit balance for each user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Record ID |
| `user_id` | TEXT | FK to users, UNIQUE | One record per user |
| `credits` | INTEGER | DEFAULT 0 | Current credit balance |
| `total_purchased` | INTEGER | DEFAULT 0 | Lifetime credits purchased |
| `credits_expiry_date` | DATE | | When credits expire (NULL = no expiry) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | First credit purchase |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last balance change |

**Indexes**:
- Unique constraint on `user_id`
- Partial index on `credits_expiry_date` WHERE NOT NULL

**Usage**: Central record of user's credit balance. Updated via credit_transactions.

#### `credit_transactions` Table
Audit log of all credit changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Transaction ID |
| `user_id` | TEXT | FK to users | User affected |
| `amount` | INTEGER | NOT NULL | Credit amount (positive or negative) |
| `type` | TEXT | NOT NULL, CHECK | Transaction type: purchase/debit/refund/bonus/expired |
| `description` | TEXT | | Human-readable description |
| `stripe_payment_id` | TEXT | | Stripe payment reference |
| `stripe_invoice_id` | TEXT | | Stripe invoice reference |
| `reference_id` | UUID | | Link to related record |
| `reference_type` | TEXT | | Type of reference (e.g., 'profile_unlock') |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Transaction time |

**Indexes**:
- Index on `user_id`
- Composite index on (`reference_id`, `reference_type`)

**Usage**: Complete audit trail of credit movements. Used for reconciliation and user history.

#### `credit_packages` Table
Defines purchasable credit bundles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Package ID |
| `name` | TEXT | NOT NULL | Package name |
| `credits` | INTEGER | NOT NULL | Number of credits |
| `price` | DECIMAL(10,2) | NOT NULL | Price amount |
| `currency` | TEXT | DEFAULT 'GBP' | Price currency |
| `stripe_price_id` | TEXT | | Stripe price ID for checkout |
| `stripe_product_id` | TEXT | | Stripe product ID |
| `validity_days` | INTEGER | | Days until credits expire (NULL = no expiry) |
| `is_active` | BOOLEAN | DEFAULT true | Available for purchase |
| `is_recurring` | BOOLEAN | DEFAULT false | Subscription package |
| `description` | TEXT | | Package description |
| `badge_text` | TEXT | | UI badge (e.g., "Most Popular") |
| `badge_color` | TEXT | DEFAULT 'blue' | Badge color |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Package creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Usage**: Displayed on pricing page. Links to Stripe for payment processing.

#### `credit_expiry_log` Table
Records expired credits for auditing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry ID |
| `user_id` | TEXT | FK to users | User affected |
| `credits_expired` | INTEGER | NOT NULL | Number of credits expired |
| `expiry_date` | DATE | NOT NULL | Original expiry date |
| `processed_at` | TIMESTAMPTZ | DEFAULT NOW() | When expiry was processed |

**Usage**: Audit trail for expired credits. Run by scheduled job.

---

### 4. Profile Access & Interaction

#### `profile_unlocks` Table
Records which profiles a user has unlocked access to.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unlock record ID |
| `user_id` | TEXT | FK to users | Company user who unlocked |
| `candidate_id` | UUID | FK to candidate_profiles | Profile unlocked |
| `unlocked_at` | TIMESTAMPTZ | DEFAULT NOW() | When unlocked |
| `credit_cost` | INTEGER | DEFAULT 1 | Credits spent |
| `source` | TEXT | DEFAULT 'direct', CHECK | How unlocked: direct/bulk/admin_grant/subscription |

**Constraints**:
- Unique constraint on (`user_id`, `candidate_id`)

**Indexes**:
- Index on `user_id`
- Index on `candidate_id`

**Usage**: Once unlocked, user has permanent access to view full profile details.

#### `user_shortlists` Table
Allows users to save interesting profiles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Shortlist entry ID |
| `user_id` | TEXT | FK to users | User who saved |
| `candidate_id` | UUID | FK to candidate_profiles | Profile saved |
| `notes` | TEXT | | User's private notes |
| `folder_name` | TEXT | DEFAULT 'Default' | Organization folder |
| `position` | INTEGER | | Custom sort order |
| `added_at` | TIMESTAMPTZ | DEFAULT NOW() | When added |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last note update |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

**Constraints**:
- Unique index on (`user_id`, `candidate_id`) WHERE `deleted_at` IS NULL

**Indexes**:
- Index on `user_id`
- Partial index on `user_id` WHERE `deleted_at` IS NULL

**Usage**: Personal organization tool. Does not require profile unlock.

---

### 5. Search & Alerts

#### `saved_searches` Table
Stores search criteria for reuse and alerts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Search ID |
| `user_id` | TEXT | FK to users | Search owner |
| `name` | TEXT | NOT NULL | Search name |
| `search_criteria` | JSONB | NOT NULL | Search parameters |
| `notification_enabled` | BOOLEAN | DEFAULT false | Email alerts enabled |
| `last_run_at` | TIMESTAMPTZ | | Last execution time |
| `results_count` | INTEGER | DEFAULT 0 | Last result count |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |
| `deleted_at` | TIMESTAMPTZ | | Soft delete |

**Indexes**:
- Index on `user_id`
- Partial index on `user_id` WHERE `deleted_at` IS NULL

**Usage**: Enables saved search functionality and powers alert system.

#### `search_alerts` Table
Manages email notification preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Alert configuration ID |
| `user_id` | TEXT | FK to users | Alert recipient |
| `saved_search_id` | UUID | FK to saved_searches | Search to monitor |
| `alert_frequency` | TEXT | NOT NULL, CHECK | Frequency: instant/daily/weekly/monthly |
| `last_sent_at` | TIMESTAMPTZ | | Last alert sent |
| `next_send_at` | TIMESTAMPTZ | | Next scheduled send |
| `is_active` | BOOLEAN | DEFAULT true | Alert enabled |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Configuration time |

**Indexes**:
- Partial index on `next_send_at` WHERE `is_active` = true

**Usage**: Processed by scheduled jobs to send email notifications about new matches.

---

### 6. Analytics & Audit

#### `user_activity_log` Table
Comprehensive activity tracking for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry ID |
| `user_id` | TEXT | FK to users | Acting user |
| `action_type` | TEXT | NOT NULL | Action: search/view_profile/unlock_profile/etc |
| `resource_type` | TEXT | | Type of resource accessed |
| `resource_id` | TEXT | | ID of resource |
| `metadata` | JSONB | | Additional context |
| `ip_address` | INET | | User's IP address |
| `user_agent` | TEXT | | Browser information |
| `session_id` | TEXT | | Session tracking |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Action timestamp |

**Indexes**:
- Index on `user_id`
- Index on `created_at`

**Usage**: Powers analytics dashboards and user activity reports.

#### `user_audit_logs` Table
Detailed audit trail for compliance (RLS enabled).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Audit log ID |
| `user_id` | TEXT | FK to users | User affected |
| `admin_id` | TEXT | FK to users | Admin who made change |
| `action` | VARCHAR | NOT NULL | Action type |
| `table_name` | VARCHAR | NOT NULL | Table affected |
| `record_id` | TEXT | NOT NULL | Record affected |
| `old_data` | JSONB | | Previous state |
| `new_data` | JSONB | | New state |
| `changes` | JSONB | | Computed diff |
| `ip_address` | VARCHAR | | Admin's IP |
| `user_agent` | TEXT | | Admin's browser |
| `metadata` | JSONB | | Additional context |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Action time |

**Usage**: Compliance and security auditing. Shows who changed what and when.

---

### 7. Version History

#### `user_versions` Table
Historical versions of user records (RLS enabled).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Version ID |
| `user_id` | TEXT | FK to users | User versioned |
| `version_number` | INTEGER | NOT NULL | Sequential version |
| `email` | VARCHAR | NOT NULL | Historical email |
| `first_name` | VARCHAR | | Historical first name |
| `last_name` | VARCHAR | | Historical last name |
| `role` | VARCHAR | NOT NULL | Historical role |
| `is_active` | BOOLEAN | | Historical status |
| `image_url` | TEXT | | Historical image |
| `public_metadata` | JSONB | | Historical public data |
| `private_metadata` | JSONB | | Historical private data |
| `created_by` | TEXT | FK to users | Who made change |
| `created_at` | TIMESTAMPTZ | NOT NULL | Version timestamp |
| `valid_from` | TIMESTAMPTZ | NOT NULL | Version start time |
| `valid_to` | TIMESTAMPTZ | | Version end time |
| `change_reason` | TEXT | | Why changed |

**Usage**: Maintains complete history of user changes for audit purposes.

#### `candidate_profile_versions` Table
Historical versions of candidate profiles (RLS enabled).

Similar structure to `user_versions` but for candidate profile data. Tracks all changes to candidate information over time.

---

## Database Views

### `active_shortlist_items`
Filters `user_shortlists` to show only non-deleted items.

```sql
SELECT * FROM user_shortlists WHERE deleted_at IS NULL
```

### `user_credit_summary`
Calculates available credits considering expiry dates.

```sql
SELECT 
  uc.*,
  CASE
    WHEN credits_expiry_date IS NOT NULL AND credits_expiry_date < CURRENT_DATE
    THEN 0
    ELSE credits
  END as available_credits
FROM user_credits uc
```

### `active_users`
Shows only non-deleted active users.

```sql
SELECT * FROM users WHERE deleted_at IS NULL AND is_active = true
```

### `active_candidate_profiles`
Shows only non-deleted active candidate profiles.

```sql
SELECT * FROM candidate_profiles WHERE deleted_at IS NULL AND is_active = true
```

---

## Key Business Flows

### 1. User Registration
1. User signs up via Clerk → Creates entry in `users` table
2. If role = 'candidate' → Create `candidate_profiles` entry
3. If role = 'company' → Create `user_credits` entry with 0 credits

### 2. Credit Purchase
1. User selects package from `credit_packages`
2. Completes Stripe checkout
3. Webhook creates `credit_transactions` entry (type: 'purchase')
4. Updates `user_credits` balance

### 3. Profile Unlock
1. Company views anonymized candidate profile
2. Clicks "Unlock Profile" → Check `user_credits` balance
3. If sufficient credits:
   - Create `profile_unlocks` entry
   - Create `credit_transactions` entry (type: 'debit')
   - Update `user_credits` balance
   - Log in `user_activity_log`
4. Show full profile details

### 4. Search & Save
1. User performs search → Log in `user_activity_log`
2. User saves search → Create `saved_searches` entry
3. User enables alerts → Create `search_alerts` entry
4. Scheduled job checks for new matches → Send email notifications

### 5. Shortlist Management
1. User adds candidate to shortlist → Create `user_shortlists` entry
2. User can add notes, organize in folders
3. Soft delete when removed (set `deleted_at`)

---

## Security & Compliance

### Row Level Security (RLS)
Enabled on sensitive tables:
- `user_audit_logs` - Only admins can view
- `user_versions` - Only admins can view
- `candidate_profile_versions` - Only admins can view

### Data Privacy
- Soft deletes maintain data for compliance
- Anonymization options for candidates
- Complete audit trail of all changes
- GDPR-compliant data handling

### Best Practices
1. Never hard delete user data
2. Always use transactions for credit operations
3. Log all significant user actions
4. Maintain version history for sensitive data
5. Use TIMESTAMPTZ for all timestamps
6. Index foreign keys and commonly queried fields

---

## Maintenance

### Regular Tasks
1. Process credit expiry (daily job)
2. Send search alerts (per schedule)
3. Archive old activity logs (monthly)
4. Update search result counts

### Monitoring
- Credit balance consistency
- Failed payment reconciliation
- Search performance metrics
- User activity patterns

---

## Future Considerations

1. **Subscription Model**: Add recurring credit packages
2. **Team Accounts**: Multiple users sharing credits
3. **Advanced Analytics**: More detailed tracking
4. **API Access**: Rate limiting and usage tracking
5. **Bulk Operations**: Batch profile unlocks