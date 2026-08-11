import { Separator, Typography } from "@heroui/react";
import type { Metadata } from "next";

import { GuestSignInButton } from "@/components/guest-sign-in-button";
import { PageShell } from "@/components/page-shell";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Oper",
  description: "Sign in to Oper with your student email.",
};

export default function SignInPage() {
  return (
    <PageShell center className="gap-6" width="form">
      <Typography.Heading className="text-2xl font-semibold" level={1}>
        Sign in
      </Typography.Heading>
      <SignInForm />
      <div className="flex w-full items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted text-xs uppercase">or</span>
        <Separator className="flex-1" />
      </div>
      <GuestSignInButton />
    </PageShell>
  );
}
