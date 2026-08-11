"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId, updateMyProfile } from "@/db/dal";
import { displayNameSchema } from "@/lib/validation";

export type SettingsState = { error: string | null };

export async function updateSettings(
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = displayNameSchema.safeParse(formData.get("displayName"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid display name." };
  }

  const userId = await requireUserId();
  await updateMyProfile(userId, { displayName: parsed.data });
  refresh();
  redirect("/settings");
}
