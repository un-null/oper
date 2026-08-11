import { Typography } from "@heroui/react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { PageShell } from "@/components/page-shell";
import { getMyProfile } from "@/db/dal";
import { getCachedSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set up your profile — Oper",
  description: "Add a display name so neighbors know who's giving things away.",
};

export default async function OnboardingPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const profile = await getMyProfile(session.user.id);
  if (profile) {
    redirect("/");
  }

  return (
    <PageShell center width="form">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Set up your profile
      </Typography.Heading>
      <p className="text-muted mb-6 text-sm">One more step before you can give and receive.</p>
      <OnboardingForm />
    </PageShell>
  );
}
