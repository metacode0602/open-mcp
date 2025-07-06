CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"start" varchar(256),
	"prefix" varchar(256),
	"key" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"refill_interval" numeric,
	"refill_amount" numeric,
	"last_refill_at" timestamp,
	"enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_enabled" boolean DEFAULT true NOT NULL,
	"rate_limit_time_window" numeric NOT NULL,
	"rate_limit_max" numeric NOT NULL,
	"request_count" numeric NOT NULL,
	"remaining" numeric NOT NULL,
	"last_request" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"permissions" text,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "phone_verification_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" varchar(20) NOT NULL,
	"code" varchar(6) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"impersonated_by" text,
	"impersonated_at" timestamp,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"password" text,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"phone_number" text,
	"phone_number_verified" boolean DEFAULT false NOT NULL,
	"role" varchar(64) DEFAULT 'user',
	"banned" boolean DEFAULT false NOT NULL,
	"banned_reason" text,
	"ban_expires" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"location" text,
	"bio" text,
	"company" text,
	"position" text,
	"website" text,
	"github" text,
	"twitter" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"resource_id" text,
	"resource_type" varchar(50),
	"resource_name" varchar(255),
	"status" varchar(50) NOT NULL,
	"details" jsonb,
	"summary" varchar,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"duration" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"url" text NOT NULL,
	"image_url" text,
	"placement" varchar DEFAULT 'bottom' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"budget" real NOT NULL,
	"spent" real DEFAULT 0 NOT NULL,
	"cpc" real DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0,
	"clicks" integer DEFAULT 0,
	"ctr" real DEFAULT 0,
	"app_id" text,
	"approved_at" timestamp,
	"approved_by" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_analysis_history" (
	"id" text PRIMARY KEY NOT NULL,
	"type" varchar(20) NOT NULL,
	"app_id" text NOT NULL,
	"url" text NOT NULL,
	"version" varchar(50),
	"analysis_result" jsonb NOT NULL,
	"features" text[],
	"tools" jsonb,
	"readme" text,
	"tags" text[],
	"categories" text[],
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"message" text,
	"error" text,
	"start_time" timestamp DEFAULT now() NOT NULL,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"category_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_rss" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"feed_url" text NOT NULL,
	"last_fetched" timestamp,
	"last_updated" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"long_description" text,
	"type" varchar(20) NOT NULL,
	"website" text,
	"github" text,
	"docs" text,
	"favicon" text,
	"logo" text,
	"app_id" text,
	"version" varchar(50),
	"license" varchar(255),
	"scenario" varchar(50),
	"features" text[],
	"tags" text[],
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"rejection_reason" text,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"approved_app_id" text,
	"approved_at" timestamp,
	"approved_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_tags" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category_id" text,
	"description" text NOT NULL,
	"long_description" text,
	"readme" text,
	"type" varchar(20) NOT NULL,
	"deployable" boolean DEFAULT false,
	"source" varchar(20) NOT NULL,
	"status" varchar(20) NOT NULL,
	"publish_status" varchar(20) NOT NULL,
	"analysed" boolean DEFAULT false NOT NULL,
	"icon" text,
	"banner" varchar(255),
	"pics" text[],
	"website" text,
	"github" text,
	"docs" text,
	"version" varchar(50),
	"license" varchar(255),
	"stars" integer DEFAULT 0,
	"featured" boolean DEFAULT false NOT NULL,
	"scenario" varchar(50),
	"forks" integer DEFAULT 0,
	"issues" integer DEFAULT 0,
	"pull_requests" integer DEFAULT 0,
	"contributors" integer DEFAULT 0,
	"last_commit" timestamp,
	"supported_servers" text[],
	"features" text[],
	"tools" jsonb,
	"owner_id" text,
	"user_id" text,
	"owner_name" varchar(255),
	"verified" boolean DEFAULT false,
	"deleted" boolean DEFAULT false,
	"created_by" varchar(255),
	"updated_by" varchar(255),
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apps_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"asset_type" varchar(20) NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"url" text,
	"bookmark_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"parent_id" text,
	"name" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"apps_count" integer DEFAULT 0,
	"icon" text,
	"status" varchar(20) DEFAULT 'offline' NOT NULL,
	"deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"title" varchar(255),
	"user_email" varchar(255) NOT NULL,
	"app_name" varchar(255) NOT NULL,
	"app_slug" varchar(255) NOT NULL,
	"reason" text,
	"app_type" varchar(20) NOT NULL,
	"app_icon" text,
	"proof_url" text NOT NULL,
	"proof_type" varchar(20) NOT NULL,
	"additional_info" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by" text,
	"updated_by" text,
	"review_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"is_verified" boolean DEFAULT false,
	"verification_token" text,
	"verification_expires" timestamp,
	"last_email_sent" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"tax_number" varchar(255),
	"address" text,
	"email" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"issued_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"related_id" text,
	"amount" real NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY',
	"method" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"invoice_number" text,
	"completed_at" timestamp,
	"refunded_at" timestamp,
	"refund_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"recommendation_id" text NOT NULL,
	"app_id" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"app_id" text,
	"type" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"app_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "related_apps" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"type" varchar(20) DEFAULT 'related' NOT NULL,
	"related_app_id" text NOT NULL,
	"similarity" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_items" (
	"id" text PRIMARY KEY NOT NULL,
	"rss_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"content" text,
	"link" text NOT NULL,
	"guid" text NOT NULL,
	"pub_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestions" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"app_name" varchar(255) NOT NULL,
	"app_slug" varchar(255) NOT NULL,
	"app_type" varchar(20) NOT NULL,
	"user_id" text NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"upvotes" integer DEFAULT 0,
	"priority" varchar(20),
	"reproducible" boolean,
	"steps_to_reproduce" text,
	"expected_behavior" text,
	"actual_behavior" text,
	"attachment_url" text,
	"response_text" text,
	"response_user_id" text,
	"response_user_name" varchar(255),
	"response_at" timestamp,
	"implemented_at" timestamp,
	"image_url" text,
	"admin_remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"source" varchar(20) NOT NULL,
	"description" text,
	"type" varchar(20) DEFAULT 'all',
	"total_apps" integer DEFAULT 0,
	"deleted" boolean DEFAULT false,
	"slug" varchar(255) NOT NULL,
	"created_by" text,
	"deleted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_user_id_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ads_user_id_idx" ON "ads" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ads_status_idx" ON "ads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ads_dates_idx" ON "ads" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "app_analysis_history_app_id_idx" ON "app_analysis_history" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "app_analysis_history_status_idx" ON "app_analysis_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_categories_app_id_idx" ON "app_categories" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "app_categories_category_id_idx" ON "app_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_categories_unique_idx" ON "app_categories" USING btree ("app_id","category_id");--> statement-breakpoint
CREATE INDEX "app_rss_app_id_idx" ON "app_rss" USING btree ("app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_rss_feed_url_idx" ON "app_rss" USING btree ("feed_url");--> statement-breakpoint
CREATE INDEX "app_submissions_user_id_idx" ON "app_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "app_submissions_status_idx" ON "app_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_submissions_reviewed_by_idx" ON "app_submissions" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "app_submissions_approved_app_id_idx" ON "app_submissions" USING btree ("approved_app_id");--> statement-breakpoint
CREATE INDEX "app_tags_app_id_idx" ON "app_tags" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "app_tags_tag_id_idx" ON "app_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_tags_unique_idx" ON "app_tags" USING btree ("app_id","tag_id");--> statement-breakpoint
CREATE INDEX "apps_slug_idx" ON "apps" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "apps_type_idx" ON "apps" USING btree ("type");--> statement-breakpoint
CREATE INDEX "apps_owner_id_idx" ON "apps" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "apps_name_type_unique_idx" ON "apps" USING btree ("name","type");--> statement-breakpoint
CREATE UNIQUE INDEX "apps_website_idx" ON "apps" USING btree ("website");--> statement-breakpoint
CREATE UNIQUE INDEX "apps_github_idx" ON "apps" USING btree ("github");--> statement-breakpoint
CREATE INDEX "assets_user_id_idx" ON "assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "assets_asset_type_idx" ON "assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "assets_bookmark_id_idx" ON "assets" USING btree ("bookmark_id");--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ownership_requests_app_id_idx" ON "claims" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "ownership_requests_user_id_idx" ON "claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ownership_requests_status_idx" ON "claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_subscriptions_user_id_idx" ON "email_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_subscriptions_email_idx" ON "email_subscriptions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "invoices_user_id_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_payment_id_idx" ON "invoices" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_user_id_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_type_idx" ON "payments" USING btree ("type");--> statement-breakpoint
CREATE INDEX "recommendation_apps_app_id_idx" ON "recommendation_apps" USING btree ("app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_apps_unique_idx" ON "recommendation_apps" USING btree ("recommendation_id","app_id");--> statement-breakpoint
CREATE INDEX "recommendations_type_idx" ON "recommendations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "related_apps_app_id_idx" ON "related_apps" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "related_apps_related_app_id_idx" ON "related_apps" USING btree ("related_app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "related_apps_unique_idx" ON "related_apps" USING btree ("app_id","related_app_id");--> statement-breakpoint
CREATE INDEX "rss_items_rss_id_idx" ON "rss_items" USING btree ("rss_id");--> statement-breakpoint
CREATE INDEX "rss_items_pub_date_idx" ON "rss_items" USING btree ("pub_date");--> statement-breakpoint
CREATE UNIQUE INDEX "rss_items_guid_idx" ON "rss_items" USING btree ("guid");--> statement-breakpoint
CREATE INDEX "suggestions_app_id_idx" ON "suggestions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "suggestions_user_id_idx" ON "suggestions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "suggestions_status_idx" ON "suggestions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");