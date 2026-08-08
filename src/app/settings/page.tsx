import { Typography } from "@heroui/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { SettingsForm } from "@/components/settings-form";
import { requireProfile } from "@/db/dal";

export const metadata: Metadata = {
  title: "Settings — Oper",
  description: "Update your profile.",
  robots: { index: false },
};

export default async function SettingsPage() {
  const profile = await requireProfile();

  return (
    <PageShell center width="form">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Settings
      </Typography.Heading>
      <p className="text-muted mb-6 text-sm">Update how neighbors see you.</p>
      <SettingsForm displayName={profile.displayName} />
    </PageShell>
  );
}
