ALTER TABLE "apps" ADD COLUMN "watchers" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "primary_language" varchar(200);--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "languages" text[];--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "commits" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "releases" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "last_analyzed_at" timestamp;