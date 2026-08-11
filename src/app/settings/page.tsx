import { Card, Chip, Typography } from "@heroui/react";
import { IconShieldCheck } from "@tabler/icons-react";
import Avatar from "boring-avatars";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { SettingsForm } from "@/components/settings-form";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireProfile } from "@/db/dal";
import { getCachedSession } from "@/lib/auth";
import { AVATAR_COLORS } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Settings — Oper",
  description: "Update your profile.",
  robots: { index: false },
};

export default async function SettingsPage() {
  const [profile, session] = await Promise.all([requireProfile(), getCachedSession()]);
  const email = session?.user?.email ?? "";

  return (
    <PageShell className="gap-8" width="focused">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Settings
      </Typography.Heading>

      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <Avatar colors={AVATAR_COLORS} name={profile.id} size={36} variant="beam" />
            <Typography.Heading className="text-sm leading-6 font-medium" level={2}>
              Profile
            </Typography.Heading>
          </div>
        </Card.Header>
        <Card.Content>
          <SettingsForm displayName={profile.displayName} />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.Heading className="text-sm leading-6 font-medium" level={2}>
            Appearance
          </Typography.Heading>
        </Card.Header>
        <Card.Content>
          <ThemeToggle />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Typography.Heading className="text-sm leading-6 font-medium" level={2}>
            Account
          </Typography.Heading>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm">{email}</span>
            {profile.studentVerified ? (
              <Chip color="accent">
                <IconShieldCheck className="h-3.5 w-3.5" />
                Verified Student
              </Chip>
            ) : null}
          </div>
        </Card.Content>
      </Card>

      <SignOutButton />
    </PageShell>
  );
}
