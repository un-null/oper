"use server";

import { redirect } from "next/navigation";

import { createItem, getMyProfile, requireUserId } from "@/db/dal";
import { findPickupSpot } from "@/lib/pickup-spots";
import { uploadItemPhotos } from "@/lib/storage";
import { checkItemPhotos, postItemSchema } from "@/lib/validation";

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

  const photos = checkItemPhotos(formData.getAll("photos"));
  if (photos.kind === "error") {
    return { error: photos.message };
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

  let photoUrls: string[] | undefined;
  if (photos.kind === "ok") {
    const upload = await uploadItemPhotos(userId, photos.files);
    if (!upload.ok) {
      return { error: "Couldn't upload your photos. Try again, or post without photos." };
    }
    photoUrls = upload.urls;
  }

  await createItem(userId, {
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    condition: parsed.data.condition,
    pickupSpot: spot.label,
    location: { x: spot.lng, y: spot.lat },
    photoUrls,
  });

  redirect("/");
}
