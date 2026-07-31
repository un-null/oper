"use server";

import { redirect } from "next/navigation";

import { createMyProfile, requireUserId } from "@/db/dal";
import { displayNameSchema } from "@/lib/validation";

export type OnboardingState = { error: string | null };

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid display name." };
  }

  const userId = await requireUserId();
  await createMyProfile(userId, parsed.data);
  redirect("/");
}
