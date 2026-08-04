import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Oper",
  description: "Sign in to Oper with your student email.",
};

export default function SignInPage() {
  return (
    <PageShell center width="form">
      <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-foreground/70">
        We'll email you a one-time code — no password needed.
      </p>
      <SignInForm />
    </PageShell>
  );
}
