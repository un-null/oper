import { and, desc, eq, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { items, profiles } from "@/db/schema";
import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}

export async function getViewerId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

// items

export function getMyItems(userId: string) {
  return db.select().from(items).where(eq(items.giverId, userId)).orderBy(desc(items.createdAt));
}

export async function createItem(
  userId: string,
  values: {
    title: string;
    description?: string;
    category: (typeof items.$inferInsert)["category"];
    condition: (typeof items.$inferInsert)["condition"];
    pickupSpot: string;
    location: { x: number; y: number };
  },
) {
  const [item] = await db
    .insert(items)
    .values({ ...values, giverId: userId })
    .returning();
  return item;
}

export function updateMyItem(
  userId: string,
  itemId: string,
  values: Partial<typeof items.$inferInsert>,
) {
  return db
    .update(items)
    .set(values)
    .where(and(eq(items.id, itemId), eq(items.giverId, userId)))
    .returning();
}

type NearbyItem = Omit<typeof items.$inferSelect, "location"> & { distanceKm: number };

export async function findNearbyItems(params: {
  lng: number;
  lat: number;
  radiusM: number;
  category?: (typeof items.$inferSelect)["category"];
}): Promise<NearbyItem[]> {
  const point = sql`ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography`;
  const distance = sql<number>`(round((ST_Distance(${items.location}::geography, ${point}) / 100)::numeric) / 10)::float8`;

  return db
    .select({
      id: items.id,
      giverId: items.giverId,
      title: items.title,
      description: items.description,
      category: items.category,
      condition: items.condition,
      status: items.status,
      pickupSpot: items.pickupSpot,
      photoUrl: items.photoUrl,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
      distanceKm: distance,
    })
    .from(items)
    .where(
      and(
        eq(items.status, "active"),
        sql`ST_DWithin(${items.location}::geography, ${point}, ${params.radiusM})`,
        params.category ? eq(items.category, params.category) : undefined,
      ),
    )
    .orderBy(sql`${items.location} <-> ${point}`, desc(items.createdAt));
}

export type ItemDetail = Omit<typeof items.$inferSelect, "location"> & {
  distanceKm: number;
  giver: {
    id: string;
    displayName: string;
    studentVerified: boolean;
    phoneVerified: boolean;
    avgRating: number | null;
    ratingCount: number;
  };
};

export async function findItemDetail(
  viewerId: string | null,
  itemId: string,
  origin: { lng: number; lat: number },
): Promise<ItemDetail | undefined> {
  const point = sql`ST_SetSRID(ST_MakePoint(${origin.lng}, ${origin.lat}), 4326)::geography`;
  const distance = sql<number>`(round((ST_Distance(${items.location}::geography, ${point}) / 100)::numeric) / 10)::float8`;
  const avgRating = sql<number | null>`${profiles.avgRating}::float8`;

  const [row] = await db
    .select({
      id: items.id,
      giverId: items.giverId,
      title: items.title,
      description: items.description,
      category: items.category,
      condition: items.condition,
      status: items.status,
      pickupSpot: items.pickupSpot,
      photoUrl: items.photoUrl,
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
      distanceKm: distance,
      giver: {
        id: profiles.id,
        displayName: profiles.displayName,
        studentVerified: profiles.studentVerified,
        phoneVerified: profiles.phoneVerified,
        avgRating,
        ratingCount: profiles.ratingCount,
      },
    })
    .from(items)
    .innerJoin(profiles, eq(profiles.id, items.giverId))
    .where(
      and(
        eq(items.id, itemId),
        viewerId
          ? or(eq(items.status, "active"), eq(items.giverId, viewerId))
          : eq(items.status, "active"),
      ),
    )
    .limit(1);

  return row;
}

export async function countGivenItems(giverId: string): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(items)
    .where(and(eq(items.giverId, giverId), eq(items.status, "given")));
  return row?.count ?? 0;
}

// profiles

export async function getMyProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile;
}

export async function createMyProfile(userId: string, displayName: string) {
  const [profile] = await db.insert(profiles).values({ id: userId, displayName }).returning();
  return profile;
}

export function updateMyProfile(userId: string, values: { displayName: string }) {
  return db.update(profiles).set(values).where(eq(profiles.id, userId)).returning();
}

export async function requireProfile() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  const profile = await getMyProfile(session.user.id);
  if (!profile) {
    redirect("/onboarding");
  }
  return profile;
}
