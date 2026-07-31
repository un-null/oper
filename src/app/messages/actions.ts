"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createMessage, getMyProfile, requireUserId, startConversation } from "@/db/dal";
import { messageBodySchema } from "@/lib/validation";

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