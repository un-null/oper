import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import {
  cancelPickup,
  completePickup,
  confirmPickup,
  createMessage,
  findConversationPickup,
  findItemDetail,
  findMyConversation,
  findRatablePickup,
  getConversationMessages,
  getMyItems,
  proposePickup,
  startConversation,
  submitRating,
  updateMyItem,
} from "@/db/dal";
import { conversations, items, profiles, ratings, user } from "@/db/schema";

const TEST_EMAIL_PREFIX = "oper-vitest-authz-";

async function createTestUser(label: string) {
  const email = `${TEST_EMAIL_PREFIX}${label}-${Date.now()}@example.com`;
  const [row] = await db.insert(user).values({ name: label, email }).returning();
  await db.insert(profiles).values({ id: row.id, displayName: label });
  return row.id;
}

async function createTestItem(giverId: string, status: (typeof items.$inferInsert)["status"]) {
  const [row] = await db
    .insert(items)
    .values({
      giverId,
      title: `authz test item (${status})`,
      category: "books",
      condition: "good",
      status,
      location: { x: 13.4105, y: 52.5225 },
      pickupSpot: "Dorm lobby — Block C",
    })
    .returning();
  return row.id;
}

describe("DAL authorization boundary", () => {
  let userA: string;
  let userB: string;
  let userC: string;
  let activeItemOfB: string;
  let removedItemOfB: string;

  beforeAll(async () => {
    userA = await createTestUser("user-a");
    userB = await createTestUser("user-b");
    userC = await createTestUser("user-c");
    activeItemOfB = await createTestItem(userB, "active");
    removedItemOfB = await createTestItem(userB, "removed");
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.id, userA));
    await db.delete(user).where(eq(user.id, userB));
    await db.delete(user).where(eq(user.id, userC));
  });

  it("updateMyItem does not update an item owned by another user", async () => {
    const updated = await updateMyItem(userA, activeItemOfB, { title: "hijacked" });
    expect(updated).toHaveLength(0);
  });

  it("updateMyItem updates an item the caller actually owns", async () => {
    const updated = await updateMyItem(userB, activeItemOfB, { title: "my own edit" });
    expect(updated).toHaveLength(1);
    expect(updated[0].title).toBe("my own edit");
  });

  it("findItemDetail shows another user's active item", async () => {
    const detail = await findItemDetail(userA, activeItemOfB, { lng: 13.4105, lat: 52.5225 });
    expect(detail?.id).toBe(activeItemOfB);
  });

  it("findItemDetail hides another user's non-active item", async () => {
    const detail = await findItemDetail(userA, removedItemOfB, { lng: 13.4105, lat: 52.5225 });
    expect(detail).toBeUndefined();
  });

  it("findItemDetail lets the owner see their own non-active item", async () => {
    const detail = await findItemDetail(userB, removedItemOfB, { lng: 13.4105, lat: 52.5225 });
    expect(detail?.id).toBe(removedItemOfB);
  });

  it("findItemDetail hides a non-active item from an anonymous viewer", async () => {
    const detail = await findItemDetail(null, removedItemOfB, { lng: 13.4105, lat: 52.5225 });
    expect(detail).toBeUndefined();
  });

  it("getMyItems does not include another user's items", async () => {
    const myItems = await getMyItems(userA);
    expect(myItems.find((item) => item.id === activeItemOfB)).toBeUndefined();
  });

  describe("conversations", () => {
    let conversationOfAAndB: string;

    it("startConversation creates a conversation with the caller as receiver", async () => {
      const result = await startConversation(userA, activeItemOfB);
      expect("id" in result).toBe(true);
      if ("id" in result) {
        conversationOfAAndB = result.id;
        const [row] = await db.select().from(conversations).where(eq(conversations.id, result.id));
        expect(row.receiverId).toBe(userA);
        expect(row.giverId).toBe(userB);
      }
    });

    it("startConversation refuses to let the owner message themselves about their own item", async () => {
      const result = await startConversation(userB, activeItemOfB);
      expect(result).toEqual({ error: "own-item" });
    });

    it("startConversation hides a non-active item as not-found", async () => {
      const result = await startConversation(userA, removedItemOfB);
      expect(result).toEqual({ error: "not-found" });
    });

    it("startConversation returns the existing conversation on a repeat call", async () => {
      const result = await startConversation(userA, activeItemOfB);
      expect(result).toEqual({ id: conversationOfAAndB });
    });

    it("findMyConversation hides the conversation from a non-participant", async () => {
      const detail = await findMyConversation(userC, conversationOfAAndB);
      expect(detail).toBeUndefined();
    });

    it("findMyConversation shows the conversation to the giver", async () => {
      const detail = await findMyConversation(userB, conversationOfAAndB);
      expect(detail?.id).toBe(conversationOfAAndB);
    });

    it("findMyConversation shows the conversation to the receiver", async () => {
      const detail = await findMyConversation(userA, conversationOfAAndB);
      expect(detail?.id).toBe(conversationOfAAndB);
    });

    it("createMessage refuses a non-participant", async () => {
      const message = await createMessage(userC, conversationOfAAndB, "hi");
      expect(message).toBeUndefined();
    });

    it("createMessage lets a participant send a message", async () => {
      const message = await createMessage(userB, conversationOfAAndB, "hi from giver");
      expect(message).toBeDefined();
    });

    it("getConversationMessages returns nothing for a non-participant", async () => {
      const messages = await getConversationMessages(userC, conversationOfAAndB);
      expect(messages).toHaveLength(0);
    });

    it("getConversationMessages returns messages for a participant", async () => {
      const messages = await getConversationMessages(userA, conversationOfAAndB);
      expect(messages.length).toBeGreaterThan(0);
    });
  });

  describe("pickups", () => {
    let conversationForPickup: string;
    let pickupId: string;

    beforeAll(async () => {
      const result = await startConversation(userA, activeItemOfB);
      if ("id" in result) {
        conversationForPickup = result.id;
      }
    });

    it("proposePickup refuses a non-participant", async () => {
      const result = await proposePickup(userC, conversationForPickup, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      expect(result).toEqual({ error: "not-participant" });
    });

    it("proposePickup creates a pickup proposed by the caller", async () => {
      const result = await proposePickup(userA, conversationForPickup, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      expect("id" in result).toBe(true);
      if ("id" in result) {
        pickupId = result.id;
      }
    });

    it("proposePickup refuses a second active proposal on the same conversation", async () => {
      const result = await proposePickup(userA, conversationForPickup, {
        time: new Date(Date.now() + 172_800_000),
        spot: "Faculty building entrance",
      });
      expect(result).toEqual({ error: "already-active" });
    });

    it("findConversationPickup hides the pickup from a non-participant", async () => {
      const pickup = await findConversationPickup(userC, conversationForPickup);
      expect(pickup).toBeUndefined();
    });

    it("findConversationPickup shows the pickup to the proposer", async () => {
      const pickup = await findConversationPickup(userA, conversationForPickup);
      expect(pickup?.id).toBe(pickupId);
    });

    it("findConversationPickup shows the pickup to the other participant", async () => {
      const pickup = await findConversationPickup(userB, conversationForPickup);
      expect(pickup?.id).toBe(pickupId);
    });

    it("confirmPickup refuses the proposer confirming their own proposal", async () => {
      const result = await confirmPickup(userA, pickupId);
      expect(result).toEqual({ error: "own-proposal" });
    });

    it("confirmPickup refuses a non-participant", async () => {
      const result = await confirmPickup(userC, pickupId);
      expect(result).toEqual({ error: "not-found" });
    });

    it("confirmPickup lets the other participant confirm, and moves the item to pending", async () => {
      const result = await confirmPickup(userB, pickupId);
      expect(result).toEqual({ ok: true });

      const [item] = await db.select().from(items).where(eq(items.id, activeItemOfB));
      expect(item.status).toBe("pending");
    });

    it("completePickup lets a participant mark it picked up, and moves the item to given", async () => {
      const result = await completePickup(userB, pickupId);
      expect(result).toEqual({ ok: true });

      const [item] = await db.select().from(items).where(eq(items.id, activeItemOfB));
      expect(item.status).toBe("given");
    });

    it("cancelPickup on a completed pickup does not resurrect it", async () => {
      const result = await cancelPickup(userA, pickupId);
      expect(result).toEqual({ error: "not-found" });
    });
  });

  describe("ratings", () => {
    let conversationForRatings: string;
    let ratablePickupId: string;
    let confirmedOnlyPickupId: string;
    let confirmedOnlyConversation: string;

    beforeAll(async () => {
      const item = await createTestItem(userB, "active");
      const started = await startConversation(userA, item);
      if ("id" in started) {
        conversationForRatings = started.id;
      }
      const proposed = await proposePickup(userA, conversationForRatings, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      if ("id" in proposed) {
        ratablePickupId = proposed.id;
      }
      await confirmPickup(userB, ratablePickupId);
      await completePickup(userB, ratablePickupId);

      const confirmedOnlyItem = await createTestItem(userB, "active");
      const confirmedOnlyStarted = await startConversation(userA, confirmedOnlyItem);
      if ("id" in confirmedOnlyStarted) {
        confirmedOnlyConversation = confirmedOnlyStarted.id;
      }
      const confirmedOnlyProposed = await proposePickup(userA, confirmedOnlyConversation, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      if ("id" in confirmedOnlyProposed) {
        confirmedOnlyPickupId = confirmedOnlyProposed.id;
      }
      await confirmPickup(userB, confirmedOnlyPickupId);
    });

    it("findRatablePickup hides the pickup from a non-participant", async () => {
      const result = await findRatablePickup(userC, conversationForRatings);
      expect(result).toBeUndefined();
    });

    it("findRatablePickup shows it to the giver with the receiver as ratee", async () => {
      const result = await findRatablePickup(userB, conversationForRatings);
      expect(result?.pickupId).toBe(ratablePickupId);
      expect(result?.rateeId).toBe(userA);
    });

    it("findRatablePickup shows it to the receiver with the giver as ratee", async () => {
      const result = await findRatablePickup(userA, conversationForRatings);
      expect(result?.pickupId).toBe(ratablePickupId);
      expect(result?.rateeId).toBe(userB);
    });

    it("submitRating refuses a non-participant, writing no row", async () => {
      const result = await submitRating(userC, ratablePickupId, { stars: 5 });
      expect(result).toEqual({ error: "not-ratable" });

      const rows = await db.select().from(ratings).where(eq(ratings.pickupId, ratablePickupId));
      expect(rows.find((row) => row.raterId === userC)).toBeUndefined();
    });

    it("submitRating refuses a pickup that is only confirmed, not completed", async () => {
      const result = await submitRating(userB, confirmedOnlyPickupId, { stars: 5 });
      expect(result).toEqual({ error: "not-ratable" });
    });

    it("submitRating lets the receiver rate the giver", async () => {
      const result = await submitRating(userA, ratablePickupId, { stars: 5 });
      expect(result).toEqual({ ok: true });

      const [row] = await db
        .select()
        .from(ratings)
        .where(and(eq(ratings.pickupId, ratablePickupId), eq(ratings.raterId, userA)));
      expect(row.rateeId).toBe(userB);
      expect(row.stars).toBe(5);
    });

    it("submitRating recomputes the ratee's cached average and count", async () => {
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userB));
      expect(Number(profile.avgRating)).toBe(5);
      expect(profile.ratingCount).toBe(1);
    });

    it("submitRating refuses a second rating from the same rater", async () => {
      const result = await submitRating(userA, ratablePickupId, { stars: 1 });
      expect(result).toEqual({ error: "already-rated" });

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userB));
      expect(profile.ratingCount).toBe(1);
    });

    it("findRatablePickup no longer shows it to a rater who already rated", async () => {
      const result = await findRatablePickup(userA, conversationForRatings);
      expect(result).toBeUndefined();
    });

    it("submitRating lets the giver also rate the receiver (mutual rating)", async () => {
      const result = await submitRating(userB, ratablePickupId, { stars: 3 });
      expect(result).toEqual({ ok: true });

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userA));
      expect(Number(profile.avgRating)).toBe(3);
      expect(profile.ratingCount).toBe(1);
    });

    it("recomputes the average correctly across multiple ratings for the same ratee", async () => {
      const secondItem = await createTestItem(userB, "active");
      const secondStarted = await startConversation(userA, secondItem);
      let secondConversation = "";
      if ("id" in secondStarted) {
        secondConversation = secondStarted.id;
      }
      const secondProposed = await proposePickup(userA, secondConversation, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      let secondPickupId = "";
      if ("id" in secondProposed) {
        secondPickupId = secondProposed.id;
      }
      await confirmPickup(userB, secondPickupId);
      await completePickup(userB, secondPickupId);

      await submitRating(userA, secondPickupId, { stars: 3 });

      const [profile] = await db.select().from(profiles).where(eq(profiles.id, userB));
      expect(Number(profile.avgRating)).toBe(4);
      expect(profile.ratingCount).toBe(2);
    });
  });

  describe("pickups cancel flow", () => {
    let conversationForCancel: string;
    let cancelPickupId: string;
    let activeItemForCancel: string;

    beforeAll(async () => {
      activeItemForCancel = await createTestItem(userB, "active");
      const result = await startConversation(userA, activeItemForCancel);
      if ("id" in result) {
        conversationForCancel = result.id;
      }
      const proposed = await proposePickup(userA, conversationForCancel, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      if ("id" in proposed) {
        cancelPickupId = proposed.id;
      }
    });

    it("cancelPickup refuses a non-participant", async () => {
      const result = await cancelPickup(userC, cancelPickupId);
      expect(result).toEqual({ error: "not-found" });
    });

    it("confirmPickup by the other participant moves the item to pending", async () => {
      const result = await confirmPickup(userB, cancelPickupId);
      expect(result).toEqual({ ok: true });

      const [item] = await db.select().from(items).where(eq(items.id, activeItemForCancel));
      expect(item.status).toBe("pending");
    });

    it("cancelPickup by a participant reverts the item to active", async () => {
      const result = await cancelPickup(userA, cancelPickupId);
      expect(result).toEqual({ ok: true });

      const [item] = await db.select().from(items).where(eq(items.id, activeItemForCancel));
      expect(item.status).toBe("active");
    });

    it("proposePickup allows a new proposal after the previous one was cancelled", async () => {
      const result = await proposePickup(userA, conversationForCancel, {
        time: new Date(Date.now() + 86_400_000),
        spot: "Dorm lobby",
      });
      expect("id" in result).toBe(true);
    });
  });
});
