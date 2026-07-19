import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  geometry,
  index,
  numeric,
  pgEnum,
  pgPolicy,
  pgSchema,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole, authUid } from "drizzle-orm/supabase";

// auth
const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// enum

export const itemCategoryEnum = pgEnum("item_category", [
  "furniture",
  "electronics",
  "books",
  "baby",
  "clothing",
]);

export const itemConditionEnum = pgEnum("item_condition", ["new", "good", "fair"]);

export const itemStatusEnum = pgEnum("item_status", ["active", "pending", "given", "removed"]);

export const pickupStatusEnum = pgEnum("pickup_status", [
  "proposed",
  "confirmed",
  "cancelled",
  "completed",
]);

// profiles

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    studentVerified: boolean("student_verified").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    // Cached rating, recomputed by a trigger or scheduled job from `ratings`.
    avgRating: numeric("avg_rating", { precision: 3, scale: 2 }),
    ratingCount: smallint("rating_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  () => [
    pgPolicy("profiles_select_all", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("profiles_insert_own", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${authUid} = id`,
    }),
    pgPolicy("profiles_update_own", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
      withCheck: sql`${authUid} = id`,
    }),
    pgPolicy("profiles_delete_own", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`${authUid} = id`,
    }),
  ],
).enableRLS();

// items

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    giverId: uuid("giver_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: itemCategoryEnum("category").notNull(),
    condition: itemConditionEnum("condition").notNull(),
    status: itemStatusEnum("status").notNull().default("active"),
    // SRID 4326 (WGS84), planar distance. Good enough at a 5km neighborhood
    // scale; see the "geometry vs geography" note in the decision log.
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }).notNull(),
    pickupSpot: text("pickup_spot").notNull(),
    photoUrl: text("photo_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("items_location_gist").using("gist", table.location),
    index("items_status_idx").on(table.status),
    index("items_giver_id_idx").on(table.giverId),
    pgPolicy("items_select_active_or_own", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${table.status} = 'active' OR ${table.giverId} = ${authUid}`,
    }),
    pgPolicy("items_insert_own", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.giverId} = ${authUid}`,
    }),
    pgPolicy("items_update_own", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${table.giverId} = ${authUid}`,
      withCheck: sql`${table.giverId} = ${authUid}`,
    }),
    pgPolicy("items_delete_own", {
      as: "permissive",
      for: "delete",
      to: authenticatedRole,
      using: sql`${table.giverId} = ${authUid}`,
    }),
  ],
).enableRLS();

// conversations

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    giverId: uuid("giver_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One conversation thread per (item, receiver) pair.
    unique("conversations_item_receiver_unique").on(table.itemId, table.receiverId),
    index("conversations_giver_id_idx").on(table.giverId),
    index("conversations_receiver_id_idx").on(table.receiverId),
    pgPolicy("conversations_select_participant", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`${table.giverId} = ${authUid} OR ${table.receiverId} = ${authUid}`,
    }),
    pgPolicy("conversations_insert_as_receiver", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.receiverId} = ${authUid}`,
    }),
    pgPolicy("conversations_update_participant", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`${table.giverId} = ${authUid} OR ${table.receiverId} = ${authUid}`,
      withCheck: sql`${table.giverId} = ${authUid} OR ${table.receiverId} = ${authUid}`,
    }),
  ],
).enableRLS();

// messages

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Polling reads "messages newer than X for this conversation" -- this is
    // the one query that must stay fast.
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    pgPolicy("messages_select_participant", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
    }),
    pgPolicy("messages_insert_as_participant_sender", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.senderId} = ${authUid} AND EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
    }),
  ],
).enableRLS();

// pickups

export const pickups = pgTable(
  "pickups",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    proposedBy: uuid("proposed_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    time: timestamp("time", { withTimezone: true }).notNull(),
    spot: text("spot").notNull(),
    status: pickupStatusEnum("status").notNull().default("proposed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("pickups_conversation_id_idx").on(table.conversationId),
    pgPolicy("pickups_select_participant", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
    }),
    pgPolicy("pickups_insert_as_participant", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.proposedBy} = ${authUid} AND EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
    }),
    pgPolicy("pickups_update_participant", {
      as: "permissive",
      for: "update",
      to: authenticatedRole,
      using: sql`EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
      withCheck: sql`EXISTS (
        SELECT 1 FROM ${conversations} c
        WHERE c.id = ${table.conversationId}
        AND (c.giver_id = ${authUid} OR c.receiver_id = ${authUid})
      )`,
    }),
  ],
).enableRLS();

// ratings

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    pickupId: uuid("pickup_id")
      .notNull()
      .references(() => pickups.id, { onDelete: "cascade" }),
    raterId: uuid("rater_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    rateeId: uuid("ratee_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    stars: smallint("stars").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One rating per rater, per pickup -- stops double-rating the same exchange.
    unique("ratings_pickup_rater_unique").on(table.pickupId, table.raterId),
    check("ratings_stars_range", sql`${table.stars} >= 1 AND ${table.stars} <= 5`),
    pgPolicy("ratings_select_all", {
      as: "permissive",
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("ratings_insert_after_confirmed_pickup", {
      as: "permissive",
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`${table.raterId} = ${authUid} AND ${table.raterId} != ${table.rateeId} AND EXISTS (
        SELECT 1 FROM ${pickups} p
        WHERE p.id = ${table.pickupId}
        AND p.status IN ('confirmed', 'completed')
      )`,
    }),
  ],
).enableRLS();
