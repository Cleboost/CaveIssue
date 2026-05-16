CREATE TABLE "comment" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"is_corrective_action" boolean DEFAULT false,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_history" (
	"id" text PRIMARY KEY NOT NULL,
	"incident_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_incident_id_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incident"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_history" ADD CONSTRAINT "incident_history_incident_id_incident_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."incident"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_history" ADD CONSTRAINT "incident_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;