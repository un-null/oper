import { and, asc, desc, eq, getTableColumns, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import {
  conversations,
  itemPhotos,
  items,
  messages,
  pickups,
  profiles,
  ratings,
} from "@/db/schema";
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

const ITEM_ID_REF = sql.raw('"items"."id"');

const itemThumbnailUrl = sql<string | null>`(
  select url from item_photos
  where item_photos.item_id = ${ITEM_ID_REF}
  order by item_photos.sort_order
  limit 1
)`;

const itemCardColumns = {
  id: items.id,
  giverId: items.giverId,
  title: items.title,
  description: items.description,
  category: items.category,
  condition: items.condition,
  status: items.status,
  pickupSpot: items.pickupSpot,
  photoUrl: itemThumbnailUrl,
  createdAt: items.createdAt,
  updatedAt: items.updatedAt,
};

export function getMyItems(userId: string) {
  return db
    .select(itemCardColumns)
    .from(items)
    .where(eq(items.giverId, userId))
    .orderBy(desc(items.createdAt));
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
    photoUrls?: string[];
  },
) {
  const { photoUrls, ...itemValues } = values;

  return db.transaction(async (tx) => {
    const [item] = await tx
      .insert(items)
      .values({ ...itemValues, giverId: userId })
      .returning();

    if (photoUrls?.length) {
      await tx.insert(itemPhotos).values(
        photoUrls.map((url, sortOrder) => ({
          itemId: item.id,
          url,
          sortOrder,
        })),
      );
    }

    return item;
  });
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

export type ItemCard = Omit<typeof items.$inferSelect, "location" | "photoUrl"> & {
  photoUrl: string | null;
};

export type NearbyItem = ItemCard & { distanceKm: number };

export async function findNearbyItems(params: {
  lng: number;
  lat: number;
  radiusM: number;
  category?: (typeof items.$inferSelect)["category"];
}): Promise<NearbyItem[]> {
  const point = sql`ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)::geography`;
  const distance = sql<number>`(round((ST_Distance(${items.location}::geography, ${point}) / 100)::numeric) / 10)::float8`;

  return db
    .select({ ...itemCardColumns, distanceKm: distance })
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

export type ItemDetail = ItemCard & {
  distanceKm: number;
  photoUrls: string[];
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
  const photoUrls = sql<string[]>`coalesce((
    select array_agg(url order by item_photos.sort_order) from item_photos
    where item_photos.item_id = ${ITEM_ID_REF}
  ), '{}')`;

  const [row] = await db
    .select({
      ...itemCardColumns,
      photoUrls,
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

// conversations

export type ConversationSummary = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: (typeof items.$inferSelect)["status"];
  partnerDisplayName: string;
  isGiver: boolean;
  lastMessageBody: string | null;
  lastMessageAt: Date | null;
};

export async function getMyConversations(userId: string): Promise<ConversationSummary[]> {
  const isGiver = sql<boolean>`(${conversations.giverId} = ${userId})::boolean`;
  const lastMessage = db
    .select({
      conversationId: messages.conversationId,
      body: messages.body,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(1)
    .as("last_message");

  const rows = await db
    .select({
      id: conversations.id,
      itemId: conversations.itemId,
      itemTitle: items.title,
      itemStatus: items.status,
      isGiver,
      partnerDisplayName: sql<string>`
        case when ${isGiver}
          then (select display_name from profiles where id = ${conversations.receiverId})
          else (select display_name from profiles where id = ${conversations.giverId})
        end
      `,
      lastMessageBody: lastMessage.body,
      lastMessageAt: lastMessage.createdAt,
      createdAt: conversations.createdAt,
    })
    .from(conversations)
    .innerJoin(items, eq(items.id, conversations.itemId))
    .leftJoin(
      lastMessage,
      sql`${lastMessage.conversationId} = ${conversations.id} and ${lastMessage.createdAt} = (
        select max(created_at) from messages where conversation_id = ${conversations.id}
      )`,
    )
    .where(or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)))
    .orderBy(desc(sql`coalesce(${lastMessage.createdAt}, ${conversations.createdAt})`));

  return rows.map(({ createdAt: _createdAt, ...row }) => row);
}

export type ConversationDetail = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemStatus: (typeof items.$inferSelect)["status"];
  itemPickupSpot: string;
  giverId: string;
  receiverId: string;
  partnerDisplayName: string;
};

export async function findMyConversation(
  userId: string,
  conversationId: string,
): Promise<ConversationDetail | undefined> {
  const isGiver = eq(conversations.giverId, userId);

  const [row] = await db
    .select({
      id: conversations.id,
      itemId: conversations.itemId,
      itemTitle: items.title,
      itemStatus: items.status,
      itemPickupSpot: items.pickupSpot,
      giverId: conversations.giverId,
      receiverId: conversations.receiverId,
      partnerDisplayName: sql<string>`
        case when ${isGiver}
          then (select display_name from profiles where id = ${conversations.receiverId})
          else (select display_name from profiles where id = ${conversations.giverId})
        end
      `,
    })
    .from(conversations)
    .innerJoin(items, eq(items.id, conversations.itemId))
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)),
      ),
    )
    .limit(1);

  return row;
}

export function getConversationMessages(userId: string, conversationId: string) {
  return db
    .select(getTableColumns(messages))
    .from(messages)
    .innerJoin(
      conversations,
      and(
        eq(conversations.id, messages.conversationId),
        or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)),
      ),
    )
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function startConversation(
  userId: string,
  itemId: string,
): Promise<{ id: string } | { error: "not-found" | "own-item" }> {
  const [item] = await db
    .select({ giverId: items.giverId })
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.status, "active")))
    .limit(1);

  if (!item) {
    return { error: "not-found" };
  }
  if (item.giverId === userId) {
    return { error: "own-item" };
  }

  const [inserted] = await db
    .insert(conversations)
    .values({ itemId, giverId: item.giverId, receiverId: userId })
    .onConflictDoNothing({ target: [conversations.itemId, conversations.receiverId] })
    .returning({ id: conversations.id });

  if (inserted) {
    return { id: inserted.id };
  }

  const [existing] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(and(eq(conversations.itemId, itemId), eq(conversations.receiverId, userId)))
    .limit(1);

  return { id: existing.id };
}

export async function createMessage(
  userId: string,
  conversationId: string,
  body: string,
): Promise<{ id: string } | undefined> {
  const [row] = await db.execute<{ id: string }>(sql`
    insert into messages (conversation_id, sender_id, body)
    select ${conversationId}, ${userId}, ${body}
    from conversations
    where id = ${conversationId}
      and (${userId} = giver_id or ${userId} = receiver_id)
    returning id
  `);

  return row;
}

// pickups

export type ActivePickup = {
  id: string;
  conversationId: string;
  proposedBy: string;
  time: Date;
  spot: string;
  status: (typeof pickups.$inferSelect)["status"];
};

export async function findConversationPickup(
  userId: string,
  conversationId: string,
): Promise<ActivePickup | undefined> {
  const [row] = await db
    .select({
      id: pickups.id,
      conversationId: pickups.conversationId,
      proposedBy: pickups.proposedBy,
      time: pickups.time,
      spot: pickups.spot,
      status: pickups.status,
    })
    .from(pickups)
    .innerJoin(
      conversations,
      and(
        eq(conversations.id, pickups.conversationId),
        or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)),
      ),
    )
    .where(
      and(
        eq(pickups.conversationId, conversationId),
        or(eq(pickups.status, "proposed"), eq(pickups.status, "confirmed")),
      ),
    )
    .orderBy(desc(pickups.createdAt))
    .limit(1);

  return row;
}

export async function proposePickup(
  userId: string,
  conversationId: string,
  values: { time: Date; spot: string },
): Promise<{ id: string } | { error: "not-participant" | "already-active" }> {
  const [row] = await db.execute<{ id: string }>(sql`
    insert into pickups (conversation_id, proposed_by, time, spot)
    select ${conversationId}, ${userId}, ${values.time.toISOString()}, ${values.spot}
    from conversations
    where id = ${conversationId}
      and (${userId} = giver_id or ${userId} = receiver_id)
      and not exists (
        select 1 from pickups p
        where p.conversation_id = ${conversationId}
          and p.status in ('proposed', 'confirmed')
      )
    returning id
  `);

  if (row) {
    return { id: row.id };
  }

  const [conversation] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)),
      ),
    )
    .limit(1);

  return { error: conversation ? "already-active" : "not-participant" };
}

export async function confirmPickup(
  userId: string,
  pickupId: string,
): Promise<{ ok: true } | { error: "not-found" | "own-proposal" }> {
  return db.transaction(async (tx) => {
    const [confirmed] = await tx.execute<{ conversation_id: string }>(sql`
      update pickups
      set status = 'confirmed'
      where id = ${pickupId}
        and status = 'proposed'
        and proposed_by <> ${userId}
        and exists (
          select 1 from conversations c
          where c.id = pickups.conversation_id
            and (${userId} = c.giver_id or ${userId} = c.receiver_id)
        )
      returning conversation_id
    `);

    if (!confirmed) {
      const [pickup] = await tx
        .select({ proposedBy: pickups.proposedBy })
        .from(pickups)
        .where(eq(pickups.id, pickupId))
        .limit(1);

      return { error: pickup?.proposedBy === userId ? "own-proposal" : "not-found" } as const;
    }

    await tx.execute(sql`
      update items
      set status = 'pending'
      from conversations c
      where c.id = ${confirmed.conversation_id}
        and items.id = c.item_id
        and items.status = 'active'
    `);

    return { ok: true } as const;
  });
}

export async function cancelPickup(
  userId: string,
  pickupId: string,
): Promise<{ ok: true } | { error: "not-found" }> {
  return db.transaction(async (tx) => {
    const [cancelled] = await tx.execute<{ conversation_id: string }>(sql`
      update pickups
      set status = 'cancelled'
      where id = ${pickupId}
        and status in ('proposed', 'confirmed')
        and exists (
          select 1 from conversations c
          where c.id = pickups.conversation_id
            and (${userId} = c.giver_id or ${userId} = c.receiver_id)
        )
      returning conversation_id
    `);

    if (!cancelled) {
      return { error: "not-found" } as const;
    }

    await tx.execute(sql`
      update items
      set status = 'active'
      from conversations c
      where c.id = ${cancelled.conversation_id}
        and items.id = c.item_id
        and items.status = 'pending'
    `);

    return { ok: true } as const;
  });
}

export async function completePickup(
  userId: string,
  pickupId: string,
): Promise<{ ok: true } | { error: "not-found" }> {
  return db.transaction(async (tx) => {
    const [completed] = await tx.execute<{ conversation_id: string }>(sql`
      update pickups
      set status = 'completed'
      where id = ${pickupId}
        and status = 'confirmed'
        and exists (
          select 1 from conversations c
          where c.id = pickups.conversation_id
            and (${userId} = c.giver_id or ${userId} = c.receiver_id)
        )
      returning conversation_id
    `);

    if (!completed) {
      return { error: "not-found" } as const;
    }

    await tx.execute(sql`
      update items
      set status = 'given'
      from conversations c
      where c.id = ${completed.conversation_id}
        and items.id = c.item_id
        and items.status = 'pending'
    `);

    return { ok: true } as const;
  });
}

// ratings

export type RatablePickup = {
  pickupId: string;
  conversationId: string;
  time: Date;
  spot: string;
  rateeId: string;
  rateeDisplayName: string;
};

export async function findRatablePickup(
  userId: string,
  conversationId: string,
): Promise<RatablePickup | undefined> {
  const isGiver = eq(conversations.giverId, userId);

  const [row] = await db
    .select({
      pickupId: pickups.id,
      conversationId: pickups.conversationId,
      time: pickups.time,
      spot: pickups.spot,
      rateeId: sql<string>`
        case when ${isGiver} then ${conversations.receiverId} else ${conversations.giverId} end
      `,
      rateeDisplayName: sql<string>`
        case when ${isGiver}
          then (select display_name from profiles where id = ${conversations.receiverId})
          else (select display_name from profiles where id = ${conversations.giverId})
        end
      `,
    })
    .from(pickups)
    .innerJoin(
      conversations,
      and(
        eq(conversations.id, pickups.conversationId),
        or(eq(conversations.giverId, userId), eq(conversations.receiverId, userId)),
      ),
    )
    .where(
      and(
        eq(pickups.conversationId, conversationId),
        eq(pickups.status, "completed"),
        sql`not exists (
          select 1 from ratings r
          where r.pickup_id = ${pickups.id} and r.rater_id = ${userId}
        )`,
      ),
    )
    .orderBy(desc(pickups.createdAt))
    .limit(1);

  return row;
}

export async function submitRating(
  userId: string,
  pickupId: string,
  values: { stars: number; comment?: string },
): Promise<{ ok: true } | { error: "not-ratable" | "already-rated" }> {
  return db.transaction(async (tx) => {
    const [inserted] = await tx.execute<{ ratee_id: string }>(sql`
      insert into ratings (pickup_id, rater_id, ratee_id, stars, comment)
      select ${pickupId}, ${userId},
             case when c.giver_id = ${userId} then c.receiver_id else c.giver_id end,
             ${values.stars}, ${values.comment ?? null}
      from pickups p
      join conversations c on c.id = p.conversation_id
      where p.id = ${pickupId}
        and p.status = 'completed'
        and (${userId} = c.giver_id or ${userId} = c.receiver_id)
      on conflict on constraint ratings_pickup_rater_unique do nothing
      returning ratee_id
    `);

    if (!inserted) {
      const [existing] = await tx
        .select({ id: ratings.id })
        .from(ratings)
        .where(and(eq(ratings.pickupId, pickupId), eq(ratings.raterId, userId)))
        .limit(1);

      return { error: existing ? "already-rated" : "not-ratable" } as const;
    }

    await tx.execute(sql`
      update profiles p
      set avg_rating = agg.avg_stars,
          rating_count = agg.n
      from (
        select round(avg(stars)::numeric, 2) as avg_stars, count(*)::int as n
        from ratings where ratee_id = ${inserted.ratee_id}
      ) agg
      where p.id = ${inserted.ratee_id}
    `);

    return { ok: true } as const;
  });
}
