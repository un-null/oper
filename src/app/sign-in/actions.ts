"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { createMyProfile } from "@/db/dal";
import { auth } from "@/lib/auth";

export async function signInAsGuest(): Promise<{ error: string | null }> {
  const { user } = await auth.api.signInAnonymous();
  const displayName = `Guest ${user.id.slice(0, 4).toUpperCase()}`;
  await createMyProfile(user.id, displayName);
  refresh();
  redirect("/");
}
