CREATE TABLE "creator_balances" (
	"id" text PRIMARY KEY NOT NULL,
	"creator_id" text NOT NULL,
	"balance_cents" integer DEFAULT 0 NOT NULL,
	"currency" varchar(10) DEFAULT 'CNY',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_balances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_balances" CASCADE;--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "scenario" SET DATA TYPE varchar(300);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "requires_purchase" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "price_cents" integer;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "price_currency" varchar(10);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "price_kind" varchar(30);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "tags_cache" jsonb DEFAULT 'null'::jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_fee_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_balances" ADD CONSTRAINT "creator_balances_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creator_balances_creator_id_currency_unique_idx" ON "creator_balances" USING btree ("creator_id","currency");