import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { findItemDetail, getMyItems, updateMyItem } from "@/db/dal";
import { items, profiles, user } from "@/db/schema";

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
  let activeItemOfB: string;
  let removedItemOfB: string;

  beforeAll(async () => {
    userA = await createTestUser("user-a");
    userB = await createTestUser("user-b");
    activeItemOfB = await createTestItem(userB, "active");
    removedItemOfB = await createTestItem(userB, "removed");
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.id, userA));
    await db.delete(user).where(eq(user.id, userB));
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
});
