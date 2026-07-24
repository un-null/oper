import type { Metadata } from "next";

import { SignInForm } from "@/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Oper",
  description: "Sign in to Oper with your student email.",
};

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-foreground/70">
          We'll email you a one-time code — no password needed.
        </p>
        <SignInForm />
      </div>
    </div>
  );
}
