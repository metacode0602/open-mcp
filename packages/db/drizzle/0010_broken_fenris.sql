CREATE TABLE "snapshots_monthly" (
	"id" text PRIMARY KEY NOT NULL,
	"repo_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"forks" integer,
	"stars" integer,
	"watchers" integer,
	"open_issues" integer,
	"subscribers" integer,
	"contributors" integer,
	"pull_requests" integer,
	"releases" integer,
	"commits" integer
);
--> statement-breakpoint
CREATE TABLE "snapshots_weekly" (
	"id" text PRIMARY KEY NOT NULL,
	"repo_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"year" integer NOT NULL,
	"week" integer NOT NULL,
	"forks" integer,
	"stars" integer,
	"watchers" integer,
	"open_issues" integer,
	"subscribers" integer,
	"contributors" integer,
	"pull_requests" integer,
	"releases" integer,
	"commits" integer
);
--> statement-breakpoint
CREATE INDEX "snapshots_monthly_repo_id_idx" ON "snapshots_monthly" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "snapshots_monthly_year_idx" ON "snapshots_monthly" USING btree ("year");--> statement-breakpoint
CREATE INDEX "snapshots_monthly_month_idx" ON "snapshots_monthly" USING btree ("month");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_monthly_unique_idx" ON "snapshots_monthly" USING btree ("repo_id","year","month");--> statement-breakpoint
CREATE INDEX "snapshots_weekly_repo_id_idx" ON "snapshots_weekly" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "snapshots_weekly_year_idx" ON "snapshots_weekly" USING btree ("year");--> statement-breakpoint
CREATE INDEX "snapshots_weekly_week_idx" ON "snapshots_weekly" USING btree ("week");--> statement-breakpoint
CREATE UNIQUE INDEX "snapshots_weekly_unique_idx" ON "snapshots_weekly" USING btree ("repo_id","year","week");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_source_unique_idx" ON "tags" USING btree ("name");