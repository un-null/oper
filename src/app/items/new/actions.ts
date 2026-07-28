"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createItem, getMyProfile, requireUserId } from "@/db/dal";
import { itemCategoryEnum, itemConditionEnum } from "@/db/schema";
import { findPickupSpot, PICKUP_SPOTS } from "@/lib/pickup-spots";

const postItemSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(80, "Keep the title under 80 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1000 characters.")
    .optional(),
  category: z.enum(itemCategoryEnum.enumValues, { message: "Choose a category." }),
  condition: z.enum(itemConditionEnum.enumValues, { message: "Choose a condition." }),
  pickupSpotId: z.enum(PICKUP_SPOTS.map((spot) => spot.id) as [string, ...string[]], {
    message: "Choose a pickup spot.",
  }),
});

export type PostItemState = { error: string | null };

export async function postItem(
  _prevState: PostItemState,
  formData: FormData,
): Promise<PostItemState> {
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

  const userId = await requireUserId();

  const profile = await getMyProfile(userId);
  if (!profile) {
    return { error: "Set up your profile before posting an item." };
  }

  const spot = findPickupSpot(parsed.data.pickupSpotId);
  if (!spot) {
    return { error: "Choose a pickup spot." };
  }

  await createItem(userId, {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickupSpot: spot.label,
    // x = longitude, y = latitude (PostGIS point order).
    location: { x: spot.lng, y: spot.lat },
  });

  redirect("/");
}
