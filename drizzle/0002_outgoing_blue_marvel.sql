CREATE TYPE "public"."priority" AS ENUM('basse', 'moyenne', 'haute', 'critique');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('nouveau', 'en_cours', 'en_attente', 'resolu', 'cloture');--> statement-breakpoint
CREATE TABLE "assignment_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"assigned_to" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "incident" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"original_description" text NOT NULL,
	"title" text,
	"zone_id" text,
	"category_id" text,
	"priority" "priority" DEFAULT 'moyenne',
	"status" "status" DEFAULT 'nouveau' NOT NULL,
	"assigned_to" text,
	"ai_summary" text,
	"ai_suggested_actions" text,
	"ai_missing_info" text,
	"ai_confidence" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zone" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "zone_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "assignment_rule" ADD CONSTRAINT "assignment_rule_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_zone_id_zone_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zone"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident" ADD CONSTRAINT "incident_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;