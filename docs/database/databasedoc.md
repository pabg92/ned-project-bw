# Board Champions Database Documentation

## Overview

The Board Champions database is designed to support a talent recruitment platform with a credit-based system for accessing candidate profiles. The schema includes user management, candidate profiles, credit transactions, and various features for organizing and tracking user activities.

## Database Schema

### Core Tables

#### 1. **users**
Primary user account table supporting multiple roles.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (from Clerk) |
| email | TEXT | User email (unique) |
| role | TEXT | User role: 'candidate', 'company', 'admin' |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| image_url | TEXT | Profile image URL |
| is_active | BOOLEAN | Active status |
| last_login | TIMESTAMPTZ | Last login timestamp |
| created_at | TIMESTAMPTZ | Account creation time |
| updated_at | TIMESTAMPTZ | Last update time |
| admin_notes | TEXT | Internal admin notes |
| deleted_at | TIMESTAMPTZ | Soft delete timestamp |
| deleted_by | TEXT | ID of admin who deleted |
| deletion_reason | TEXT | Reason for deletion |

#### 2. **candidate_profiles**
Detailed profiles for candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| title | TEXT | Professional title |
| summary | TEXT | Profile summary |
| experience | TEXT | Experience level (junior/mid/senior/lead/executive) |
| location | TEXT | Current location |
| remote_preference | TEXT | Work preference (remote/hybrid/onsite/flexible) |
| salary_min | TEXT | Minimum salary expectation |
| salary_max | TEXT | Maximum salary expectation |
| salary_currency | TEXT | Currency (default: USD) |
| availability | TEXT | Availability (immediately/2weeks/1month/3months) |
| is_active | BOOLEAN | Active status |
| is_public | BOOLEAN | Public visibility |
| profile_completed | BOOLEAN | Profile completion status |
| is_anonymized | BOOLEAN | Anonymization status |
| linkedin_url | TEXT | LinkedIn profile |
| github_url | TEXT | GitHub profile |
| portfolio_url | TEXT | Portfolio website |
| resume_url | TEXT | Resume file URL |
| private_metadata | JSONB | Private metadata |
| public_metadata | JSONB | Public metadata |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |
| admin_notes | TEXT | Admin notes |
| deleted_at | TIMESTAMPTZ | Soft delete timestamp |
| deleted_by | TEXT | ID of admin who deleted |
| deletion_reason | TEXT | Deletion reason |

### Credit System Tables

#### 3. **user_credits**
Tracks user credit balances.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users (unique) |
| credits | INTEGER | Current credit balance |
| total_purchased | INTEGER | Total credits purchased |
| credits_expiry_date | DATE | Expiry date (NULL = no expiry) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### 4. **credit_transactions**
Records all credit-related transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| amount | INTEGER | Transaction amount |
| type | TEXT | Transaction type (purchase/debit/refund/bonus/expired) |
| description | TEXT | Transaction description |
| stripe_payment_id | TEXT | Stripe payment ID |
| stripe_invoice_id | TEXT | Stripe invoice ID |
| reference_id | UUID | Reference to related record |
| reference_type | TEXT | Type of reference |
| created_at | TIMESTAMPTZ | Transaction timestamp |

#### 5. **credit_packages**
Defines available credit packages for purchase.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Package name |
| credits | INTEGER | Number of credits |
| price | DECIMAL(10,2) | Price |
| currency | TEXT | Currency (default: GBP) |
| stripe_price_id | TEXT | Stripe price ID |
| stripe_product_id | TEXT | Stripe product ID |
| validity_days | INTEGER | Validity period (NULL = no expiry) |
| is_active | BOOLEAN | Active status |
| is_recurring | BOOLEAN | Subscription flag |
| description | TEXT | Package description |
| badge_text | TEXT | UI badge text |
| badge_color | TEXT | UI badge color |
| sort_order | INTEGER | Display order |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

### Profile Access Tables

#### 6. **profile_unlocks**
Tracks which profiles a user has unlocked.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| candidate_id | UUID | Foreign key to candidate_profiles |
| unlocked_at | TIMESTAMPTZ | Unlock timestamp |
| credit_cost | INTEGER | Credits spent (default: 1) |
| source | TEXT | Unlock source (direct/bulk/admin_grant/subscription) |

Unique constraint: (user_id, candidate_id)

#### 7. **user_shortlists**
Allows users to save profiles to shortlists.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| candidate_id | UUID | Foreign key to candidate_profiles |
| notes | TEXT | User notes |
| folder_name | TEXT | Folder organization (default: Default) |
| position | INTEGER | Custom ordering |
| added_at | TIMESTAMPTZ | Addition timestamp |
| updated_at | TIMESTAMPTZ | Last update |
| deleted_at | TIMESTAMPTZ | Soft delete |

Unique constraint: (user_id, candidate_id) WHERE deleted_at IS NULL

### Search & Alert Tables

#### 8. **saved_searches**
Stores user search criteria.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| name | TEXT | Search name |
| search_criteria | JSONB | Search parameters |
| notification_enabled | BOOLEAN | Alert flag |
| last_run_at | TIMESTAMPTZ | Last execution |
| results_count | INTEGER | Last result count |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |
| deleted_at | TIMESTAMPTZ | Soft delete |

#### 9. **search_alerts**
Manages email alerts for saved searches.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| saved_search_id | UUID | Foreign key to saved_searches |
| alert_frequency | TEXT | Frequency (instant/daily/weekly/monthly) |
| last_sent_at | TIMESTAMPTZ | Last alert sent |
| next_send_at | TIMESTAMPTZ | Next scheduled send |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMPTZ | Creation timestamp |

### Profile Components

#### 10. **work_experiences**
Work history for candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| candidate_id | UUID | Foreign key to candidate_profiles |
| company_name | TEXT | Company name |
| position | TEXT | Job title |
| description | TEXT | Role description |
| start_date | DATE | Start date |
| end_date | DATE | End date (NULL = current) |
| is_current | BOOLEAN | Current job flag |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### 11. **education**
Educational background for candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| candidate_id | UUID | Foreign key to candidate_profiles |
| institution | TEXT | Institution name |
| degree | TEXT | Degree obtained |
| field_of_study | TEXT | Field of study |
| start_date | DATE | Start date |
| end_date | DATE | End date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### 12. **tags**
Categorization system for skills and attributes.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Tag name (unique) |
| type | TEXT | Tag type (skill/industry/role/technology/certification) |
| created_at | TIMESTAMPTZ | Creation timestamp |

#### 13. **candidate_tags**
Many-to-many relationship between candidates and tags.

| Column | Type | Description |
|--------|------|-------------|
| candidate_id | UUID | Foreign key to candidate_profiles |
| tag_id | UUID | Foreign key to tags |
| created_at | TIMESTAMPTZ | Creation timestamp |

Primary key: (candidate_id, tag_id)

### Audit & Analytics Tables

#### 14. **user_activity_log**
Comprehensive activity tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| action_type | TEXT | Action performed |
| resource_type | TEXT | Resource type |
| resource_id | TEXT | Resource identifier |
| metadata | JSONB | Additional data |
| ip_address | INET | IP address |
| user_agent | TEXT | Browser user agent |
| session_id | TEXT | Session identifier |
| created_at | TIMESTAMPTZ | Action timestamp |

#### 15. **credit_expiry_log**
Tracks expired credits for auditing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| credits_expired | INTEGER | Number of credits expired |
| expiry_date | DATE | Expiry date |
| processed_at | TIMESTAMPTZ | Processing timestamp |

### Version History Tables

#### 16. **user_versions**
Maintains version history for user records (RLS enabled).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| version_number | INTEGER | Version number |
| email | VARCHAR | Historical email |
| first_name | VARCHAR | Historical first name |
| last_name | VARCHAR | Historical last name |
| role | VARCHAR | Historical role |
| is_active | BOOLEAN | Historical active status |
| image_url | TEXT | Historical image URL |
| public_metadata | JSONB | Historical public metadata |
| private_metadata | JSONB | Historical private metadata |
| created_by | TEXT | User who made change |
| created_at | TIMESTAMPTZ | Version timestamp |
| valid_from | TIMESTAMPTZ | Version validity start |
| valid_to | TIMESTAMPTZ | Version validity end |
| change_reason | TEXT | Reason for change |

#### 17. **candidate_profile_versions**
Maintains version history for candidate profiles (RLS enabled).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| profile_id | UUID | Foreign key to candidate_profiles |
| user_id | TEXT | Foreign key to users |
| version_number | INTEGER | Version number |
| [profile fields...] | Various | Historical profile data |
| created_by | TEXT | User who made change |
| created_at | TIMESTAMPTZ | Version timestamp |
| valid_from | TIMESTAMPTZ | Version validity start |
| valid_to | TIMESTAMPTZ | Version validity end |
| change_reason | TEXT | Reason for change |

#### 18. **user_audit_logs**
Detailed audit trail for compliance (RLS enabled).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | Foreign key to users |
| admin_id | TEXT | Foreign key to admin user |
| action | VARCHAR | Action performed |
| table_name | VARCHAR | Affected table |
| record_id | TEXT | Affected record ID |
| old_data | JSONB | Previous state |
| new_data | JSONB | New state |
| changes | JSONB | Diff of changes |
| ip_address | VARCHAR | IP address |
| user_agent | TEXT | Browser user agent |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMPTZ | Action timestamp |

## Views

### active_shortlist_items
Filters user_shortlists to show only non-deleted items.

```sql
SELECT * FROM user_shortlists WHERE deleted_at IS NULL;
```

### user_credit_summary
Shows user credits with expiry calculation.

```sql
SELECT
  uc.*,
  CASE
    WHEN credits_expiry_date IS NOT NULL AND credits_expiry_date < CURRENT_DATE
    THEN 0
    ELSE credits
  END as available_credits
FROM user_credits uc;
```

## Indexes

### Performance Indexes
- `idx_profile_unlocks_user_id` - Profile unlocks by user
- `idx_profile_unlocks_candidate_id` - Profile unlocks by candidate
- `idx_credit_transactions_user_id` - Transactions by user
- `idx_user_shortlists_user_id` - Shortlists by user
- `idx_saved_searches_user_id` - Saved searches by user
- `idx_user_activity_log_user_id` - Activity by user
- `idx_user_activity_log_created_at` - Activity by time

### Soft Delete Support
- `idx_user_shortlists_not_deleted` - Active shortlist items
- `idx_saved_searches_not_deleted` - Active saved searches

### Specialized Indexes
- `idx_user_credits_expiry` - Credits with expiry dates
- `idx_credit_transactions_reference` - Transaction references
- `idx_search_alerts_next_send` - Scheduled alerts

## Row Level Security (RLS)

The following tables have RLS enabled:
- `candidate_profile_versions`
- `user_audit_logs`
- `user_versions`

RLS policies should be implemented to ensure:
- Users can only view their own data
- Users can only modify their own records
- Admins have full access
- Public access to credit packages only

## Key Features

### Credit System
- Users purchase credits through credit packages
- Credits are deducted when unlocking profiles
- Support for credit expiry dates
- Complete transaction history
- Refund and bonus credit support

### Profile Management
- Anonymized profiles by default
- Profile versioning with full history
- Soft deletes with audit trail
- Work experience and education tracking
- Tag-based categorization

### User Features
- Shortlist management with folders
- Saved searches with alert notifications
- Activity tracking for analytics
- Profile unlock history

### Admin Features
- Complete audit logs
- User and profile version history
- Admin notes on users and profiles
- Soft delete with reasons

## Migration Notes

To apply the database schema:

1. Run the migration file: `supabase/migrations/20250103_add_credit_system_tables.sql`
2. Apply RLS policies as needed
3. Seed initial data for credit packages
4. Configure Stripe webhooks for payment processing

## Best Practices

1. **Always use soft deletes** for user data to maintain audit trails
2. **Record credit transactions** for every credit change
3. **Use JSONB fields** for flexible metadata storage
4. **Maintain version history** for sensitive data changes
5. **Index foreign keys** for query performance
6. **Use TIMESTAMPTZ** for all timestamps to handle timezones correctly