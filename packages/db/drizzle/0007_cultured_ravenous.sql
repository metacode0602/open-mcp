ALTER TABLE "ranking_records" ALTER COLUMN "rank" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ranking_records" ALTER COLUMN "rank" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "link" varchar(255) NOT NULL;