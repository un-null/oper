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
    <PageShell center width="form">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Sign in
      </Typography.Heading>
      <p className="mb-6 text-sm text-foreground/70">
        We'll email you a one-time code — no password needed.
      </p>
      <SignInForm />
      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted text-xs uppercase">or</span>
        <Separator className="flex-1" />
      </div>
      <GuestSignInButton />
      <p className="text-muted mt-2 text-center text-xs">
        Try Oper instantly with a demo account — no email required.
      </p>
    </PageShell>
  );
}
