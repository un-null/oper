import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/db";
import { findItemDetail, findNearbyItems } from "@/db/dal";
import { itemPhotos, items, profiles, user } from "@/db/schema";
import { PICKUP_SPOTS } from "@/lib/pickup-spots";

const TEST_EMAIL_PREFIX = "oper-vitest-photos-";
const SPOT = PICKUP_SPOTS[0];
const PHOTO_A = "https://example.test/item_photos/a.jpg";
const PHOTO_B = "https://example.test/item_photos/b.jpg";

async function createTestUser(label: string) {
  const email = `${TEST_EMAIL_PREFIX}${label}-${Date.now()}@example.com`;
  const [row] = await db.insert(user).values({ name: label, email }).returning();
  await db.insert(profiles).values({ id: row.id, displayName: label });
  return row.id;
}

async function createTestItem(giverId: string, title: string) {
  const [row] = await db
    .insert(items)
    .values({
      giverId,
      title,
      category: "books",
      condition: "good",
      status: "active",
      location: { x: SPOT.lng, y: SPOT.lat },
      pickupSpot: SPOT.label,
    })
    .returning();
  return row.id;
}

describe("DAL item photos", () => {
  let giverId: string;
  let itemWithPhotos: string;
  let itemWithoutPhotos: string;

  beforeAll(async () => {
    giverId = await createTestUser("giver");
    itemWithPhotos = await createTestItem(giverId, "photos test with");
    itemWithoutPhotos = await createTestItem(giverId, "photos test without");

    await db.insert(itemPhotos).values([
      { itemId: itemWithPhotos, url: PHOTO_B, sortOrder: 1 },
      { itemId: itemWithPhotos, url: PHOTO_A, sortOrder: 0 },
    ]);
  });

  afterAll(async () => {
    await db.delete(user).where(eq(user.id, giverId));
  });

  it("findNearbyItems returns the first photo as the thumbnail", async () => {
    const rows = await findNearbyItems({
      lng: SPOT.lng,
      lat: SPOT.lat,
      radiusM: 1000,
    });

    const row = rows.find((item) => item.id === itemWithPhotos);
    expect(row).toBeDefined();
    expect(row?.photoUrl).toBe(PHOTO_A);
  });

  it("findNearbyItems returns null for an item with no photos", async () => {
    const rows = await findNearbyItems({
      lng: SPOT.lng,
      lat: SPOT.lat,
      radiusM: 1000,
    });

    const row = rows.find((item) => item.id === itemWithoutPhotos);
    expect(row).toBeDefined();
    expect(row?.photoUrl).toBeNull();
  });

  it("findItemDetail returns the thumbnail and every photo in sort order", async () => {
    const detail = await findItemDetail(giverId, itemWithPhotos, {
      lng: SPOT.lng,
      lat: SPOT.lat,
    });

    expect(detail?.photoUrl).toBe(PHOTO_A);
    expect(detail?.photoUrls).toEqual([PHOTO_A, PHOTO_B]);
  });

  it("findItemDetail returns an empty array for an item with no photos", async () => {
    const detail = await findItemDetail(giverId, itemWithoutPhotos, {
      lng: SPOT.lng,
      lat: SPOT.lat,
    });

    expect(detail?.photoUrl).toBeNull();
    expect(detail?.photoUrls).toEqual([]);
  });
});
