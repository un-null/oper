import { Avatar, Card, Chip, Typography } from "@heroui/react";
import { IconShieldCheck } from "@tabler/icons-react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { SettingsForm } from "@/components/settings-form";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireProfile } from "@/db/dal";
import { getCachedSession } from "@/lib/auth";
import { initialsFor } from "@/lib/initials";

export const metadata: Metadata = {
  title: "Settings — Oper",
  description: "Update your profile.",
  robots: { index: false },
};

export default async function SettingsPage() {
  const [profile, session] = await Promise.all([requireProfile(), getCachedSession()]);
  const email = session?.user?.email ?? "";

  return (
    <PageShell className="gap-8" width="form">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Settings
      </Typography.Heading>

      <Card>
        <Card.Header>
          <div className="flex items-center gap-3">
            <Avatar>
              <Avatar.Fallback>{initialsFor(profile.displayName)}</Avatar.Fallback>
            </Avatar>
            <Card.Title render={(props) => <h2 {...props} />}>Profile</Card.Title>
          </div>
          <Card.Description>Update how neighbors see you.</Card.Description>
        </Card.Header>
        <Card.Content>
          <SettingsForm displayName={profile.displayName} />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title render={(props) => <h2 {...props} />}>Appearance</Card.Title>
          <Card.Description>Choose how Oper looks on this device.</Card.Description>
        </Card.Header>
        <Card.Content>
          <ThemeToggle />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title render={(props) => <h2 {...props} />}>Account</Card.Title>
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
