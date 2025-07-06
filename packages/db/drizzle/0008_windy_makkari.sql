CREATE TABLE "hall_of_fame" (
	"username" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"followers" integer,
	"bio" text,
	"homepage" text,
	"twitter" text,
	"github" text,
	"discord" text,
	"avatar" text,
	"npm_username" text,
	"npm_package_count" integer,
	"status" text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hall_of_fame_to_repos" (
	"username" text NOT NULL,
	"repo_id" text NOT NULL,
	CONSTRAINT "hall_of_fame_to_repos_username_repo_id_pk" PRIMARY KEY("username","repo_id")
);
--> statement-breakpoint
CREATE TABLE "repos" (
	"id" text PRIMARY KEY NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"archived" boolean,
	"default_branch" text,
	"description" text,
	"homepage" text,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"owner" text NOT NULL,
	"owner_id" integer NOT NULL,
	"stargazers_count" integer,
	"topics" jsonb,
	"pushed_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"last_commit" timestamp,
	"commit_count" integer,
	"contributor_count" integer,
	"mentionable_users_count" integer,
	"watchers_count" integer,
	"license_spdx_id" text,
	"pull_requests_count" integer,
	"releases_count" integer,
	"languages" jsonb,
	"open_graph_image_url" text,
	"uses_custom_open_graph_image" boolean,
	"latest_release_name" text,
	"latest_release_tag_name" text,
	"latest_release_published_at" timestamp,
	"latest_release_url" text,
	"latest_release_description" text,
	"forks" integer,
	"readme_content" text,
	"readme_content_zh" text,
	"description_zh" text,
	"icon_url" text,
	"open_graph_image_oss_url" text,
	"latest_release_description_zh" text
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"repo_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	"year" integer NOT NULL,
	"months" jsonb,
	"day" integer NOT NULL,
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
ALTER TABLE "apps" ADD COLUMN "readme_zh" text;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "repo_id" text;--> statement-breakpoint
ALTER TABLE "hall_of_fame_to_repos" ADD CONSTRAINT "hall_of_fame_to_repos_username_hall_of_fame_username_fk" FOREIGN KEY ("username") REFERENCES "public"."hall_of_fame"("username") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hall_of_fame_to_repos" ADD CONSTRAINT "hall_of_fame_to_repos_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "name_owner_index" ON "repos" USING btree ("owner","name");--> statement-breakpoint
CREATE INDEX "snapshots_repo_id_idx" ON "snapshots" USING btree ("repo_id");--> statement-breakpoint
CREATE INDEX "snapshots_year_idx" ON "snapshots" USING btree ("year");