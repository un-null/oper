import Image from "next/image";
import Link from "next/link";

import { ThemeToggleButton } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import type { auth } from "@/lib/auth";

const pill =
  "border-border text-foreground hover:border-foreground rounded-full border px-4 py-1.5 transition-colors";
const ctaPill =
  "bg-accent text-accent-foreground rounded-full px-4 py-1.5 transition-opacity hover:opacity-90";

type SiteHeaderProps = {
  session: Awaited<ReturnType<typeof auth.api.getSession>>;
  displayName?: string;
};

export function SiteHeader({ displayName, session }: SiteHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6">
      <Link href="/">
        <Image
          alt="Oper"
          className="h-10 w-auto sm:h-14"
          height={250}
          priority
          src="/logo-text.svg"
          width={500}
        />
      </Link>

      {session ? (
        <>
          <div className="sm:hidden">
            <ThemeToggleButton />
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <Link className={ctaPill} href="/items/new">
              Give something away
            </Link>
            <UserMenu
              displayName={displayName ?? session.user.name}
              userId={session.user.id}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm font-medium">
          <ThemeToggleButton />
          <Link className={pill} href="/sign-in">
            Sign in
          </Link>
        </div>
      )}
    </header>
  );
}
