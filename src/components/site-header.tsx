"use client";

import { Button } from "@heroui/react";
import { linkVariants } from "@heroui/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

const link = linkVariants();

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-border flex items-center justify-between border-b px-6 py-4">
      <Link className="font-semibold" href="/">
        Oper
      </Link>
      <div className="flex h-9 items-center gap-3 text-sm">
        <ThemeToggle />
        {isPending ? null : session ? (
          <div className="flex items-center gap-3">
            <span className="text-muted">Signed in as {session.user.email}</span>
            <Button onPress={handleSignOut} variant="outline">
              Sign out
            </Button>
          </div>
        ) : (
          <Link className={link.base()} href="/sign-in">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
