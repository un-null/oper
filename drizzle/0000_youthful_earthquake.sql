CREATE TYPE "public"."item_category" AS ENUM('furniture', 'electronics', 'books', 'baby', 'clothing');--> statement-breakpoint
CREATE TYPE "public"."item_condition" AS ENUM('new', 'good', 'fair');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('active', 'pending', 'given', 'removed');--> statement-breakpoint
CREATE TYPE "public"."pickup_status" AS ENUM('proposed', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"giver_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_item_receiver_unique" UNIQUE("item_id","receiver_id")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"giver_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" "item_category" NOT NULL,
	"condition" "item_condition" NOT NULL,
	"status" "item_status" DEFAULT 'active' NOT NULL,
	"location" geometry(point) NOT NULL,
	"pickup_spot" text NOT NULL,
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pickups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"proposed_by" uuid NOT NULL,
	"time" timestamp with time zone NOT NULL,
	"spot" text NOT NULL,
	"status" "pickup_status" DEFAULT 'proposed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"student_verified" boolean DEFAULT false NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"avg_rating" numeric(3, 2),
	"rating_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pickup_id" uuid NOT NULL,
	"rater_id" uuid NOT NULL,
	"ratee_id" uuid NOT NULL,
	"stars" smallint NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ratings_pickup_rater_unique" UNIQUE("pickup_id","rater_id"),
	CONSTRAINT "ratings_stars_range" CHECK ("ratings"."stars" >= 1 AND "ratings"."stars" <= 5)
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_giver_id_profiles_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_receiver_id_profiles_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_giver_id_profiles_id_fk" FOREIGN KEY ("giver_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_proposed_by_profiles_id_fk" FOREIGN KEY ("proposed_by") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_pickup_id_pickups_id_fk" FOREIGN KEY ("pickup_id") REFERENCES "public"."pickups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_rater_id_profiles_id_fk" FOREIGN KEY ("rater_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ratee_id_profiles_id_fk" FOREIGN KEY ("ratee_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_giver_id_idx" ON "conversations" USING btree ("giver_id");--> statement-breakpoint
CREATE INDEX "conversations_receiver_id_idx" ON "conversations" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "items_location_gist" ON "items" USING gist ("location");--> statement-breakpoint
CREATE INDEX "items_status_idx" ON "items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "items_giver_id_idx" ON "items" USING btree ("giver_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "pickups_conversation_id_idx" ON "pickups" USING btree ("conversation_id");