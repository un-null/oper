"use server";

import { redirect } from "next/navigation";

import { requireUserId, updateMyItem } from "@/db/dal";
import { findPickupSpot } from "@/lib/pickup-spots";
import { postItemSchema } from "@/lib/validation";

export type EditItemState = { error: string | null };

export async function editItem(
  itemId: string,
  _prevState: EditItemState,
  formData: FormData,
): Promise<EditItemState> {
  const parsed = postItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    condition: formData.get("condition"),
    pickupSpotId: formData.get("pickupSpotId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const spot = findPickupSpot(parsed.data.pickupSpotId);
  if (!spot) {
    return { error: "Choose a pickup spot." };
  }

  const userId = await requireUserId();

  const updated = await updateMyItem(userId, itemId, {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickupSpot: spot.label,
    location: { x: spot.lng, y: spot.lat },
  });

  if (updated.length === 0) {
    return { error: "Couldn't save your changes. Try again." };
  }

  redirect(`/items/${itemId}`);
}