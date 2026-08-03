"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  cancelPickup,
  completePickup,
  confirmPickup,
  createMessage,
  getMyProfile,
  proposePickup,
  requireUserId,
  startConversation,
  submitRating,
} from "@/db/dal";
import {
  messageBodySchema,
  parsePickupTime,
  pickupProposalSchema,
  ratingSchema,
} from "@/lib/validation";

export type StartConversationState = { error: string | null };

export async function startConversationAction(
  _prevState: StartConversationState,
  formData: FormData,
): Promise<StartConversationState> {
  const parsed = z.uuid().safeParse(formData.get("itemId"));
  if (!parsed.success) {
    return { error: "Invalid item." };
  }

  const userId = await requireUserId();

  const profile = await getMyProfile(userId);
  if (!profile) {
    return { error: "Set up your profile before messaging." };
  }

  const result = await startConversation(userId, parsed.data);
  if ("error" in result) {
    return {
      error:
        result.error === "own-item"
          ? "You can't message yourself about your own item."
          : "This item is no longer available.",
    };
  }

  redirect(`/messages/${result.id}`);
}

export type SendMessageState = { error: string | null };

export async function sendMessage(
  _prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  const bodyResult = messageBodySchema.safeParse(formData.get("body"));
  if (!bodyResult.success) {
    return { error: bodyResult.error.issues[0]?.message ?? "Write a message." };
  }

  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  if (!conversationIdResult.success) {
    return { error: "Invalid conversation." };
  }

  const userId = await requireUserId();

  const message = await createMessage(userId, conversationIdResult.data, bodyResult.data);
  if (!message) {
    return { error: "You can't send messages in this conversation." };
  }

  revalidatePath(`/messages/${conversationIdResult.data}`);
  return { error: null };
}

export type PickupState = { error: string | null };

function revalidatePickupPaths(conversationId: string, itemId: string) {
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/");
  revalidatePath(`/items/${itemId}`);
}

export async function proposePickupAction(
  _prevState: PickupState,
  formData: FormData,
): Promise<PickupState> {
  const parsed = pickupProposalSchema.safeParse({
    date: formData.get("date"),
    time: formData.get("time"),
    spot: formData.get("spot"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the pickup details." };
  }

  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  const itemIdResult = z.uuid().safeParse(formData.get("itemId"));
  if (!conversationIdResult.success || !itemIdResult.success) {
    return { error: "Invalid conversation." };
  }

  const time = parsePickupTime(parsed.data.date, parsed.data.time);
  if (!time) {
    return { error: "Choose a time in the future." };
  }

  const userId = await requireUserId();

  const result = await proposePickup(userId, conversationIdResult.data, {
    time,
    spot: parsed.data.spot,
  });
  if ("error" in result) {
    return {
      error:
        result.error === "already-active"
          ? "There's already an active pickup proposal for this conversation."
          : "You can't propose a pickup in this conversation.",
    };
  }

  revalidatePickupPaths(conversationIdResult.data, itemIdResult.data);
  return { error: null };
}

export async function confirmPickupAction(
  _prevState: PickupState,
  formData: FormData,
): Promise<PickupState> {
  const pickupIdResult = z.uuid().safeParse(formData.get("pickupId"));
  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  const itemIdResult = z.uuid().safeParse(formData.get("itemId"));
  if (!pickupIdResult.success || !conversationIdResult.success || !itemIdResult.success) {
    return { error: "Invalid pickup." };
  }

  const userId = await requireUserId();

  const result = await confirmPickup(userId, pickupIdResult.data);
  if ("error" in result) {
    return {
      error:
        result.error === "own-proposal"
          ? "You can't confirm your own pickup proposal."
          : "This pickup can't be confirmed.",
    };
  }

  revalidatePickupPaths(conversationIdResult.data, itemIdResult.data);
  return { error: null };
}

export async function cancelPickupAction(
  _prevState: PickupState,
  formData: FormData,
): Promise<PickupState> {
  const pickupIdResult = z.uuid().safeParse(formData.get("pickupId"));
  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  const itemIdResult = z.uuid().safeParse(formData.get("itemId"));
  if (!pickupIdResult.success || !conversationIdResult.success || !itemIdResult.success) {
    return { error: "Invalid pickup." };
  }

  const userId = await requireUserId();

  const result = await cancelPickup(userId, pickupIdResult.data);
  if ("error" in result) {
    return { error: "This pickup can't be cancelled." };
  }

  revalidatePickupPaths(conversationIdResult.data, itemIdResult.data);
  return { error: null };
}

export async function completePickupAction(
  _prevState: PickupState,
  formData: FormData,
): Promise<PickupState> {
  const pickupIdResult = z.uuid().safeParse(formData.get("pickupId"));
  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  const itemIdResult = z.uuid().safeParse(formData.get("itemId"));
  if (!pickupIdResult.success || !conversationIdResult.success || !itemIdResult.success) {
    return { error: "Invalid pickup." };
  }

  const userId = await requireUserId();

  const result = await completePickup(userId, pickupIdResult.data);
  if ("error" in result) {
    return { error: "This pickup can't be marked as picked up." };
  }

  revalidatePickupPaths(conversationIdResult.data, itemIdResult.data);
  return { error: null };
}

export type RatingState = { error: string | null };

export async function submitRatingAction(
  _prevState: RatingState,
  formData: FormData,
): Promise<RatingState> {
  const parsed = ratingSchema.safeParse({
    stars: formData.get("stars"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Choose a rating." };
  }

  const pickupIdResult = z.uuid().safeParse(formData.get("pickupId"));
  const conversationIdResult = z.uuid().safeParse(formData.get("conversationId"));
  const itemIdResult = z.uuid().safeParse(formData.get("itemId"));
  if (!pickupIdResult.success || !conversationIdResult.success || !itemIdResult.success) {
    return { error: "Invalid pickup." };
  }

  const userId = await requireUserId();

  const result = await submitRating(userId, pickupIdResult.data, {
    stars: parsed.data.stars,
    comment: parsed.data.comment,
  });
  if ("error" in result) {
    return {
      error:
        result.error === "already-rated"
          ? "You've already rated this pickup."
          : "You can't rate this pickup.",
    };
  }

  revalidatePickupPaths(conversationIdResult.data, itemIdResult.data);
  return { error: null };
}
