-- 1. Create user_credits table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  credits_expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Create credit_transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'debit', 'refund', 'bonus', 'expired')),
  description TEXT,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create profile_unlocks table
CREATE TABLE profile_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credit_cost INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('direct', 'bulk', 'admin_grant', 'subscription')),
  UNIQUE(user_id, candidate_id)
);

-- 4. Create user_shortlists table
CREATE TABLE user_shortlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
  notes TEXT,
  folder_name TEXT DEFAULT 'Default',
  position INTEGER,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, candidate_id) WHERE deleted_at IS NULL
);

-- 5. Create saved_searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_criteria JSONB NOT NULL,
  notification_enabled BOOLEAN DEFAULT false,
  last_run_at TIMESTAMPTZ,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- 6. Create search_alerts table
CREATE TABLE search_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  saved_search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  alert_frequency TEXT NOT NULL CHECK (alert_frequency IN ('instant', 'daily', 'weekly', 'monthly')),
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Create credit_packages table
CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  validity_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT false,
  description TEXT,
  badge_text TEXT,
  badge_color TEXT DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Create user_activity_log table
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create credit_expiry_log table
CREATE TABLE credit_expiry_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_expired INTEGER NOT NULL,
  expiry_date DATE NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Create indexes
CREATE INDEX idx_profile_unlocks_user_id ON profile_unlocks(user_id);
CREATE INDEX idx_profile_unlocks_candidate_id ON profile_unlocks(candidate_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_user_shortlists_user_id ON user_shortlists(user_id);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Soft delete support
CREATE INDEX idx_user_shortlists_not_deleted ON user_shortlists(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_saved_searches_not_deleted ON saved_searches(user_id) WHERE deleted_at IS NULL;

-- Performance for expiry checks
CREATE INDEX idx_user_credits_expiry ON user_credits(credits_expiry_date) WHERE credits_expiry_date IS NOT NULL;

-- Transaction references
CREATE INDEX idx_credit_transactions_reference ON credit_transactions(reference_id, reference_type);

-- Alert scheduling
CREATE INDEX idx_search_alerts_next_send ON search_alerts(next_send_at) WHERE is_active = true;

-- 11. Create helper views
-- Active shortlist items
CREATE VIEW active_shortlist_items AS
SELECT * FROM user_shortlists WHERE deleted_at IS NULL;

-- User credit balance with expiry info
CREATE VIEW user_credit_summary AS
SELECT
  uc.*,
  CASE
    WHEN credits_expiry_date IS NOT NULL AND credits_expiry_date < CURRENT_DATE
    THEN 0
    ELSE credits
  END as available_credits
FROM user_credits uc;