CREATE TABLE "ranking_records" (
	"id" text PRIMARY KEY NOT NULL,
	"ranking_id" text,
	"entity_id" text NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"score" integer NOT NULL,
	"rank" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"source" varchar(100) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" boolean DEFAULT true,
	"period_key" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ranking_records" ADD CONSTRAINT "ranking_records_ranking_id_rankings_id_fk" FOREIGN KEY ("ranking_id") REFERENCES "public"."rankings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_ranking_records_key" ON "ranking_records" USING btree ("ranking_id","entity_id","entity_type");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_source_type_period_key" ON "rankings" USING btree ("source","type","period_key");