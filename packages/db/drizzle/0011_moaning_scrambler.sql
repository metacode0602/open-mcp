CREATE TABLE "creators" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" varchar(200) NOT NULL,
	"username" varchar(100) NOT NULL,
	"avatar" text,
	"avatar_url" text,
	"description" text,
	"bio" text,
	"website" text,
	"twitter" text,
	"linkedin" text,
	"github" text,
	"verified" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"payout_settings" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creators_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creators_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text,
	"app_meta" jsonb,
	"product_type" varchar(30) NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY',
	"platform_fee_cents" integer DEFAULT 0 NOT NULL,
	"creator_earnings_cents" integer DEFAULT 0 NOT NULL,
	"creator_id" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona_mcp_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"persona_id" text NOT NULL,
	"mcp_app_id" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"persona_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_mcp_tools" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"mcp_app_id" text NOT NULL,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY',
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_id" text,
	"reject_reason" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "type" SET DATA TYPE varchar(30);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_creator" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_mcp_tools" ADD CONSTRAINT "persona_mcp_tools_persona_id_apps_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_mcp_tools" ADD CONSTRAINT "persona_mcp_tools_mcp_app_id_apps_id_fk" FOREIGN KEY ("mcp_app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_skills" ADD CONSTRAINT "persona_skills_persona_id_apps_id_fk" FOREIGN KEY ("persona_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona_skills" ADD CONSTRAINT "persona_skills_skill_id_apps_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mcp_tools" ADD CONSTRAINT "skill_mcp_tools_skill_id_apps_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mcp_tools" ADD CONSTRAINT "skill_mcp_tools_mcp_app_id_apps_id_fk" FOREIGN KEY ("mcp_app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_balances" ADD CONSTRAINT "user_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "authors_username_idx" ON "creators" USING btree ("username");--> statement-breakpoint
CREATE INDEX "authors_status_idx" ON "creators" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_app_id_idx" ON "orders" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "orders_creator_id_idx" ON "orders" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_product_type_idx" ON "orders" USING btree ("product_type");--> statement-breakpoint
CREATE INDEX "persona_mcp_tools_persona_id_idx" ON "persona_mcp_tools" USING btree ("persona_id");--> statement-breakpoint
CREATE INDEX "persona_mcp_tools_mcp_app_id_idx" ON "persona_mcp_tools" USING btree ("mcp_app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "persona_mcp_tools_unique_idx" ON "persona_mcp_tools" USING btree ("persona_id","mcp_app_id");--> statement-breakpoint
CREATE INDEX "persona_skills_persona_id_idx" ON "persona_skills" USING btree ("persona_id");--> statement-breakpoint
CREATE INDEX "persona_skills_skill_id_idx" ON "persona_skills" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "persona_skills_unique_idx" ON "persona_skills" USING btree ("persona_id","skill_id");--> statement-breakpoint
CREATE INDEX "skill_mcp_tools_skill_id_idx" ON "skill_mcp_tools" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "skill_mcp_tools_mcp_app_id_idx" ON "skill_mcp_tools" USING btree ("mcp_app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_mcp_tools_unique_idx" ON "skill_mcp_tools" USING btree ("skill_id","mcp_app_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_balances_user_id_unique_idx" ON "user_balances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "location";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "bio";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "position";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "github";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "twitter";