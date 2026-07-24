"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SiteHeader() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
      <Link className="font-semibold" href="/">
        Oper
      </Link>
      <div className="flex h-9 items-center text-sm">
        {isPending ? null : session ? (
          <div className="flex items-center gap-3">
            <span className="text-foreground/70">Signed in as {session.user.email}</span>
            <button
              className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/4 dark:border-white/15 dark:hover:bg-white/8"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            className="rounded-md border border-black/10 px-3 py-1.5 hover:bg-black/4 dark:border-white/15 dark:hover:bg-white/8"
            href="/sign-in"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
