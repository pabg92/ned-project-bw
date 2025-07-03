import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
  varchar,
  decimal,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Users table - synced with Clerk
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  role: text('role').notNull().default('candidate'), // candidate, company, admin
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastLogin: timestamp('last_login'),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
  activeIdx: index('users_active_idx').on(table.isActive),
}));

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  website: text('website'),
  logo: text('logo'),
  size: text('size'), // startup, small, medium, large, enterprise
  industry: text('industry'),
  location: text('location'),
  tier: text('tier').notNull().default('basic'), // basic, premium, enterprise
  searchQuota: integer('search_quota').notNull().default(10),
  searchesUsed: integer('searches_used').notNull().default(0),
  subscriptionStatus: text('subscription_status').notNull().default('trial'), // trial, active, inactive
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: index('companies_name_idx').on(table.name),
  tierIdx: index('companies_tier_idx').on(table.tier),
  subscriptionIdx: index('companies_subscription_idx').on(table.subscriptionStatus),
}));

// Company users relationship
export const companyUsers = pgTable('company_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, member
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userCompanyIdx: uniqueIndex('company_users_user_company_idx').on(table.userId, table.companyId),
  companyIdx: index('company_users_company_idx').on(table.companyId),
}));

// Tags table for skills and experiences
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  category: text('category').notNull(), // skill, experience, industry, location
  description: text('description'),
  color: text('color').default('#3B82F6'),
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  nameIdx: uniqueIndex('tags_name_idx').on(table.name),
  categoryIdx: index('tags_category_idx').on(table.category),
  verifiedIdx: index('tags_verified_idx').on(table.isVerified),
}));

// Candidate profiles
export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  title: text('title'), // Job title/role
  summary: text('summary'),
  experience: text('experience'), // junior, mid, senior, lead, executive
  location: text('location'),
  remotePreference: text('remote_preference'), // remote, hybrid, onsite, flexible
  salaryMin: decimal('salary_min', { precision: 10, scale: 2 }),
  salaryMax: decimal('salary_max', { precision: 10, scale: 2 }),
  salaryCurrency: text('salary_currency').default('USD'),
  availability: text('availability'), // immediately, 2weeks, 1month, 3months
  isAnonymized: boolean('is_anonymized').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  profileCompleted: boolean('profile_completed').notNull().default(false),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  resumeUrl: text('resume_url'),
  // Private metadata (only visible to admins and after payment)
  privateMetadata: jsonb('private_metadata'), // Contains sensitive info
  // Public metadata (searchable but anonymized)
  publicMetadata: jsonb('public_metadata'), // Contains searchable but anonymous info
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex('candidate_profiles_user_idx').on(table.userId),
  experienceIdx: index('candidate_profiles_experience_idx').on(table.experience),
  locationIdx: index('candidate_profiles_location_idx').on(table.location),
  remoteIdx: index('candidate_profiles_remote_idx').on(table.remotePreference),
  anonymizedIdx: index('candidate_profiles_anonymized_idx').on(table.isAnonymized),
  activeIdx: index('candidate_profiles_active_idx').on(table.isActive),
  availabilityIdx: index('candidate_profiles_availability_idx').on(table.availability),
}));

// Candidate tags relationship
export const candidateTags = pgTable('candidate_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  proficiency: text('proficiency'), // beginner, intermediate, advanced, expert
  yearsExperience: integer('years_experience'),
  isEndorsed: boolean('is_endorsed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  candidateTagIdx: uniqueIndex('candidate_tags_candidate_tag_idx').on(table.candidateId, table.tagId),
  tagIdx: index('candidate_tags_tag_idx').on(table.tagId),
  proficiencyIdx: index('candidate_tags_proficiency_idx').on(table.proficiency),
}));

// Work experiences
export const workExperiences = pgTable('work_experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  company: text('company').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  isCurrent: boolean('is_current').notNull().default(false),
  isRemote: boolean('is_remote').notNull().default(false),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  candidateIdx: index('work_experiences_candidate_idx').on(table.candidateId),
  companyIdx: index('work_experiences_company_idx').on(table.company),
  currentIdx: index('work_experiences_current_idx').on(table.isCurrent),
  orderIdx: index('work_experiences_order_idx').on(table.order),
}));

// Education
export const education = pgTable('education', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  field: text('field'),
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  description: text('description'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  candidateIdx: index('education_candidate_idx').on(table.candidateId),
  institutionIdx: index('education_institution_idx').on(table.institution),
  degreeIdx: index('education_degree_idx').on(table.degree),
  orderIdx: index('education_order_idx').on(table.order),
}));

// Profile views/purchases
export const profileViews = pgTable('profile_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: uuid('candidate_id').notNull().references(() => candidateProfiles.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  viewedByUserId: text('viewed_by_user_id').notNull().references(() => users.id),
  viewType: text('view_type').notNull(), // anonymous, purchased, admin
  paymentId: text('payment_id'), // Stripe payment ID if purchased
  paymentAmount: decimal('payment_amount', { precision: 10, scale: 2 }),
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  candidateIdx: index('profile_views_candidate_idx').on(table.candidateId),
  companyIdx: index('profile_views_company_idx').on(table.companyId),
  viewerIdx: index('profile_views_viewer_idx').on(table.viewedByUserId),
  typeIdx: index('profile_views_type_idx').on(table.viewType),
  paymentIdx: index('profile_views_payment_idx').on(table.paymentId),
}));

// Search queries for analytics
export const searchQueries = pgTable('search_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  query: jsonb('query').notNull(), // Search parameters
  resultsCount: integer('results_count').notNull().default(0),
  filtersTags: text('filters_tags').array(), // For indexing
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('search_queries_company_idx').on(table.companyId),
  userIdx: index('search_queries_user_idx').on(table.userId),
  dateIdx: index('search_queries_date_idx').on(table.createdAt),
}));

// Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // profile_viewed, payment_received, admin_alert
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'), // Additional notification data
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  typeIdx: index('notifications_type_idx').on(table.type),
  readIdx: index('notifications_read_idx').on(table.isRead),
  dateIdx: index('notifications_date_idx').on(table.createdAt),
}));

// Data ingestion logs
export const dataIngestionLogs = pgTable('data_ingestion_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(), // champions_ecosystem, manual, api
  type: text('type').notNull(), // candidate, company, tag
  status: text('status').notNull(), // pending, success, failed
  recordsProcessed: integer('records_processed').notNull().default(0),
  recordsSuccess: integer('records_success').notNull().default(0),
  recordsFailed: integer('records_failed').notNull().default(0),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  sourceIdx: index('data_ingestion_logs_source_idx').on(table.source),
  statusIdx: index('data_ingestion_logs_status_idx').on(table.status),
  dateIdx: index('data_ingestion_logs_date_idx').on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  candidateProfile: one(candidateProfiles, {
    fields: [users.id],
    references: [candidateProfiles.userId],
  }),
  companyUsers: many(companyUsers),
  profileViews: many(profileViews),
  searchQueries: many(searchQueries),
  notifications: many(notifications),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  companyUsers: many(companyUsers),
  profileViews: many(profileViews),
  searchQueries: many(searchQueries),
}));

export const companyUsersRelations = relations(companyUsers, ({ one }) => ({
  user: one(users, {
    fields: [companyUsers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [companyUsers.companyId],
    references: [companies.id],
  }),
}));

export const candidateProfilesRelations = relations(candidateProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [candidateProfiles.userId],
    references: [users.id],
  }),
  candidateTags: many(candidateTags),
  workExperiences: many(workExperiences),
  education: many(education),
  profileViews: many(profileViews),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  candidateTags: many(candidateTags),
}));

export const candidateTagsRelations = relations(candidateTags, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [candidateTags.candidateId],
    references: [candidateProfiles.id],
  }),
  tag: one(tags, {
    fields: [candidateTags.tagId],
    references: [tags.id],
  }),
}));

export const workExperiencesRelations = relations(workExperiences, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [workExperiences.candidateId],
    references: [candidateProfiles.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [education.candidateId],
    references: [candidateProfiles.id],
  }),
}));

export const profileViewsRelations = relations(profileViews, ({ one }) => ({
  candidate: one(candidateProfiles, {
    fields: [profileViews.candidateId],
    references: [candidateProfiles.id],
  }),
  company: one(companies, {
    fields: [profileViews.companyId],
    references: [companies.id],
  }),
  viewedBy: one(users, {
    fields: [profileViews.viewedByUserId],
    references: [users.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  company: one(companies, {
    fields: [searchQueries.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));