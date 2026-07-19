ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pickups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ratings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "conversations_select_participant" ON "conversations" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("conversations"."giver_id" = (select auth.uid()) OR "conversations"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "conversations_insert_as_receiver" ON "conversations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("conversations"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "conversations_update_participant" ON "conversations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("conversations"."giver_id" = (select auth.uid()) OR "conversations"."receiver_id" = (select auth.uid())) WITH CHECK ("conversations"."giver_id" = (select auth.uid()) OR "conversations"."receiver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "items_select_active_or_own" ON "items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("items"."status" = 'active' OR "items"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "items_insert_own" ON "items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("items"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "items_update_own" ON "items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("items"."giver_id" = (select auth.uid())) WITH CHECK ("items"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "items_delete_own" ON "items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("items"."giver_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "messages_select_participant" ON "messages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "messages"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      ));--> statement-breakpoint
CREATE POLICY "messages_insert_as_participant_sender" ON "messages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("messages"."sender_id" = (select auth.uid()) AND EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "messages"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      ));--> statement-breakpoint
CREATE POLICY "pickups_select_participant" ON "pickups" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "pickups"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      ));--> statement-breakpoint
CREATE POLICY "pickups_insert_as_participant" ON "pickups" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("pickups"."proposed_by" = (select auth.uid()) AND EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "pickups"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      ));--> statement-breakpoint
CREATE POLICY "pickups_update_participant" ON "pickups" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "pickups"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      )) WITH CHECK (EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c.id = "pickups"."conversation_id"
        AND (c.giver_id = (select auth.uid()) OR c.receiver_id = (select auth.uid()))
      ));--> statement-breakpoint
CREATE POLICY "profiles_select_all" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "profiles_insert_own" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "profiles_update_own" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "profiles_delete_own" ON "profiles" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) = id);--> statement-breakpoint
CREATE POLICY "ratings_select_all" ON "ratings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "ratings_insert_after_confirmed_pickup" ON "ratings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("ratings"."rater_id" = (select auth.uid()) AND "ratings"."rater_id" != "ratings"."ratee_id" AND EXISTS (
        SELECT 1 FROM "pickups" p
        WHERE p.id = "ratings"."pickup_id"
        AND p.status IN ('confirmed', 'completed')
      ));