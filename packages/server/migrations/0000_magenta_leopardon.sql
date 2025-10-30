-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TYPE "public"."user_roles" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
	"registration_enabled" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid DEFAULT uuid_generate_v4() NOT NULL PRIMARY KEY,
	"email" varchar(100) NOT NULL,
	"display_name" varchar(50) NOT NULL,
	"password_hash" varchar(100) NOT NULL,
	"verified_at" timestamp with time zone,
	"first_verified_at" timestamp with time zone,
	"role" "user_roles" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaults" (
	"owner_id" uuid NOT NULL,
	"id" uuid NOT NULL PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"protected_encryption_key" varchar(500) NOT NULL,
	"protected_data" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "files" (
	"vault_id" uuid NOT NULL,
	"version_id" uuid NOT NULL PRIMARY KEY,
	"previous_version_id" uuid,
	"file_id" uuid NOT NULL,
	"parent_file_id" uuid,
	"is_directory" boolean NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_hash" text NOT NULL,
	"file_size" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" varchar(100) NOT NULL,
	"updated_by" varchar(100) NOT NULL,
	"deleted_by" varchar(100),
	"committed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "files_chunks" (
	"version_id" uuid NOT NULL,
	"chunk_hash" text NOT NULL PRIMARY KEY,
	"file_position" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "vault_owner" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_vault" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files_chunks" ADD CONSTRAINT "files_chunks_file" FOREIGN KEY ("version_id") REFERENCES "public"."files"("version_id") ON DELETE cascade ON UPDATE no action;
