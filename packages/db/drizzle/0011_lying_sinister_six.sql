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
ALTER TABLE "users" ADD COLUMN "payout_settings" jsonb;--> statement-breakpoint
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
CREATE INDEX "withdrawals_status_idx" ON "withdrawals" USING btree ("status");