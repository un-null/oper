import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { getMyProfile } from "@/db/dal";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set up your profile — Oper",
  description: "Add a display name so neighbors know who's giving things away.",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profile = await getMyProfile(session.user.id);
  if (profile) {
    redirect("/");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Set up your profile</h1>
        <p className="text-muted mb-6 text-sm">One more step before you can give and receive.</p>
        <OnboardingForm />
      </div>
    </div>
  );
}
