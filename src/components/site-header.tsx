import { linkVariants } from "@heroui/styles";
import Link from "next/link";

import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { auth } from "@/lib/auth";

const link = linkVariants();
const pill =
  "border-border text-foreground hover:border-foreground rounded-full border px-4 py-1.5 transition-colors";

type SiteHeaderProps = {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
};

export function SiteHeader({ session }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6">
      <Link className="font-display text-accent text-2xl font-black tracking-tight" href="/">
        Oper
      </Link>

      {session ? (
        <>
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <SignOutButton />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <Link className={link.base()} href="/">
              Home
            </Link>
            <Link className={link.base()} href="/items">
              My items
            </Link>
            <Link className={link.base()} href="/messages">
              Messages
            </Link>
            <Link className={pill} href="/items/new">
              Give something away
            </Link>
            <span className="text-muted">Signed in as {session.user.email}</span>
            <SignOutButton />
            <ThemeToggle />
          </nav>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm font-medium">
          <ThemeToggle />
          <Link className={pill} href="/sign-in">
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
