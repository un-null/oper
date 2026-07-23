CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "items" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pickups" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
-- NOTE: drizzle-kit emitted `ALTER TABLE "auth"."users" DISABLE ROW LEVEL
-- SECURITY;` and `DROP TABLE "auth"."users" CASCADE;` here. Both were removed
-- by hand: `auth.users` is Supabase-managed and the app role cannot (and must
-- not) drop it. Dropping the FK constraint below is enough to detach from it.
-- See local_memo/db-migrate-fix.md for the same class of gotcha.
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP POLICY "conversations_select_participant" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "conversations_insert_as_receiver" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "conversations_update_participant" ON "conversations" CASCADE;--> statement-breakpoint
DROP POLICY "items_select_active_or_own" ON "items" CASCADE;--> statement-breakpoint
DROP POLICY "items_insert_own" ON "items" CASCADE;--> statement-breakpoint
DROP POLICY "items_update_own" ON "items" CASCADE;--> statement-breakpoint
DROP POLICY "items_delete_own" ON "items" CASCADE;--> statement-breakpoint
DROP POLICY "messages_select_participant" ON "messages" CASCADE;--> statement-breakpoint
DROP POLICY "messages_insert_as_participant_sender" ON "messages" CASCADE;--> statement-breakpoint
DROP POLICY "pickups_select_participant" ON "pickups" CASCADE;--> statement-breakpoint
DROP POLICY "pickups_insert_as_participant" ON "pickups" CASCADE;--> statement-breakpoint
DROP POLICY "pickups_update_participant" ON "pickups" CASCADE;--> statement-breakpoint
DROP POLICY "profiles_select_all" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "profiles_insert_own" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "profiles_update_own" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "profiles_delete_own" ON "profiles" CASCADE;--> statement-breakpoint
DROP POLICY "ratings_select_all" ON "ratings" CASCADE;--> statement-breakpoint
DROP POLICY "ratings_insert_after_confirmed_pickup" ON "ratings" CASCADE;--> statement-breakpoint
-- Supabase auto-enables RLS on newly created public tables. This project does
-- not use RLS (authorization lives in the DAL), so disable it on better-auth's
-- tables too, keeping every public table consistent. Added by hand -- not
-- emitted by drizzle-kit, which does not track these tables' RLS flag.
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;