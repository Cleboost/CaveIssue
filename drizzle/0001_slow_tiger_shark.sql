CREATE TYPE "public"."role" AS ENUM('employe', 'responsable', 'administrateur');--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'employe' NOT NULL;