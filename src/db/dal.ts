import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { items, profiles } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * Data Access Layer.
 *
 * This project does NOT use Postgres RLS (see local_memo/rls-design.md and
 * migrate-better-auth-and-rls.md): all traffic goes through Server Actions on
 * a single trusted DB connection, so authorization is enforced HERE, in one
 * place, instead of at the database boundary.
 *
 * The rule this file exists to enforce: **every query that touches
 * user-owned rows takes the acting user's id and folds it into the WHERE
 * clause.** Callers should go through these helpers rather than reaching for
 * the raw `db` client, so an ownership check can never be forgotten at a call
 * site.
 */

export class UnauthorizedError extends Error {
  constructor(message = "Not authenticated") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Resolve the acting user's id from the better-auth session, or throw.
 * Server Actions / DAL functions call this first and pass the returned id
 * into the ownership-scoped queries below.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}

// --- items (representative ownership-scoped accessors) --------------------

/** Items owned by `userId`. The giver_id filter is the authorization. */
export function getMyItems(userId: string) {
  return db.select().from(items).where(eq(items.giverId, userId));
}

/**
 * Update an item, but only if `userId` owns it. The `giver_id = userId`
 * predicate is in the WHERE, so a caller cannot edit someone else's row even
 * with a valid item id. Returns the updated rows (empty if not owned).
 */
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

// --- profiles ---------------------------------------------------------------

/** The acting user's own profile, or undefined if they haven't onboarded yet. */
export async function getMyProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return profile;
}

/** Create the acting user's profile. `id` is the better-auth user id (no default). */
export async function createMyProfile(userId: string, displayName: string) {
  const [profile] = await db.insert(profiles).values({ id: userId, displayName }).returning();
  return profile;
}

/** Update the acting user's own profile. The `id = userId` predicate is the authorization. */
export function updateMyProfile(userId: string, values: { displayName: string }) {
  return db.update(profiles).set(values).where(eq(profiles.id, userId)).returning();
}

/**
 * Session + profile gate for protected pages: redirects to /sign-in if not
 * authenticated, or /onboarding if authenticated but without a profile row
 * yet. This is UX routing, not the security boundary -- every Server Action
 * that touches profile-owned data must independently call requireUserId()
 * (or an equivalent check) itself, since pages can be bypassed by hitting
 * Server Actions directly. See local_memo/onboarding.md for the reasoning.
 */
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
