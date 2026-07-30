import { linkVariants } from "@heroui/styles";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { auth } from "@/lib/auth";

const link = linkVariants();

type SiteHeaderProps = {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
};

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="border-border flex items-center justify-between border-b px-6 py-4">
      <Link className="font-semibold" href="/">
        Oper
      </Link>
      <div className="flex h-9 items-center gap-3 text-sm">
        <ThemeToggle />
        {session ? (
          <div className="flex items-center gap-3">
            <Link className={link.base()} href="/items">
              My items
            </Link>
            <Link className={link.base()} href="/items/new">
              Give something away
            </Link>
            <span className="text-muted">Signed in as {session.user.email}</span>
            <SignOutButton />
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
