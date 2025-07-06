ALTER TABLE "email_subscriptions" ADD COLUMN "referring_site" varchar(255);--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD COLUMN "utm_source" varchar(255) DEFAULT 'openmcp';--> statement-breakpoint
ALTER TABLE "email_subscriptions" ADD COLUMN "utm_campaign" varchar DEFAULT 'organic';