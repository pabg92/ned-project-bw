CREATE TABLE IF NOT EXISTS "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"summary" text,
	"experience" text,
	"location" text,
	"remote_preference" text,
	"salary_min" numeric(10, 2),
	"salary_max" numeric(10, 2),
	"salary_currency" text DEFAULT 'USD',
	"availability" text,
	"is_anonymized" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"profile_completed" boolean DEFAULT false NOT NULL,
	"linkedin_url" text,
	"github_url" text,
	"portfolio_url" text,
	"resume_url" text,
	"private_metadata" jsonb,
	"public_metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidate_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "candidate_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"proficiency" text,
	"years_experience" integer,
	"is_endorsed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"website" text,
	"logo" text,
	"size" text,
	"industry" text,
	"location" text,
	"tier" text DEFAULT 'basic' NOT NULL,
	"search_quota" integer DEFAULT 10 NOT NULL,
	"searches_used" integer DEFAULT 0 NOT NULL,
	"subscription_status" text DEFAULT 'trial' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_id" uuid NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_ingestion_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"records_success" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"field" text,
	"gpa" numeric(3, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"company_id" uuid NOT NULL,
	"viewed_by_user_id" text NOT NULL,
	"view_type" text NOT NULL,
	"payment_id" text,
	"payment_amount" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "search_queries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"query" jsonb NOT NULL,
	"results_count" integer DEFAULT 0 NOT NULL,
	"filters_tags" text[],
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3B82F6',
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"image_url" text,
	"role" text DEFAULT 'candidate' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "work_experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"is_current" boolean DEFAULT false NOT NULL,
	"is_remote" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "candidate_tags" ADD CONSTRAINT "candidate_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_users" ADD CONSTRAINT "company_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_users" ADD CONSTRAINT "company_users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "education" ADD CONSTRAINT "education_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_viewed_by_user_id_users_id_fk" FOREIGN KEY ("viewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "candidate_profiles_user_idx" ON "candidate_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_experience_idx" ON "candidate_profiles" USING btree ("experience");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_location_idx" ON "candidate_profiles" USING btree ("location");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_remote_idx" ON "candidate_profiles" USING btree ("remote_preference");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_anonymized_idx" ON "candidate_profiles" USING btree ("is_anonymized");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_active_idx" ON "candidate_profiles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_profiles_availability_idx" ON "candidate_profiles" USING btree ("availability");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "candidate_tags_candidate_tag_idx" ON "candidate_tags" USING btree ("candidate_id","tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_tags_tag_idx" ON "candidate_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "candidate_tags_proficiency_idx" ON "candidate_tags" USING btree ("proficiency");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companies_tier_idx" ON "companies" USING btree ("tier");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "companies_subscription_idx" ON "companies" USING btree ("subscription_status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "company_users_user_company_idx" ON "company_users" USING btree ("user_id","company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "company_users_company_idx" ON "company_users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_ingestion_logs_source_idx" ON "data_ingestion_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_ingestion_logs_status_idx" ON "data_ingestion_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "data_ingestion_logs_date_idx" ON "data_ingestion_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "education_candidate_idx" ON "education" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "education_institution_idx" ON "education" USING btree ("institution");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "education_degree_idx" ON "education" USING btree ("degree");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "education_order_idx" ON "education" USING btree ("order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_date_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_views_candidate_idx" ON "profile_views" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_views_company_idx" ON "profile_views" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_views_viewer_idx" ON "profile_views" USING btree ("viewed_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_views_type_idx" ON "profile_views" USING btree ("view_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profile_views_payment_idx" ON "profile_views" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_company_idx" ON "search_queries" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_user_idx" ON "search_queries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_queries_date_idx" ON "search_queries" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_category_idx" ON "tags" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tags_verified_idx" ON "tags" USING btree ("is_verified");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_experiences_candidate_idx" ON "work_experiences" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_experiences_company_idx" ON "work_experiences" USING btree ("company");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_experiences_current_idx" ON "work_experiences" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "work_experiences_order_idx" ON "work_experiences" USING btree ("order");