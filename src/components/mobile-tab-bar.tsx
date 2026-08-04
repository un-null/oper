"use client";

import { IconHome, IconMessageCircle, IconPackage, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabClass = (active: boolean) =>
  `flex flex-col items-center gap-0.5 px-4 py-2 ${active ? "text-accent" : "text-muted"}`;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MobileTabBar({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname();

  const suppressed = pathname.startsWith("/items/") || pathname.startsWith("/messages/");
  if (!isSignedIn || suppressed) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-surface/95 fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 items-center border-t pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <Link
        aria-current={isActive(pathname, "/") ? "page" : undefined}
        className={tabClass(isActive(pathname, "/"))}
        href="/"
      >
        <IconHome className="h-5 w-5" />
        <span className="text-[11px] font-medium">Home</span>
      </Link>

      <Link
        aria-current={isActive(pathname, "/items") ? "page" : undefined}
        className={tabClass(isActive(pathname, "/items"))}
        href="/items"
      >
        <IconPackage className="h-5 w-5" />
        <span className="text-[11px] font-medium">My items</span>
      </Link>

      <Link
        aria-label="Give something away"
        className="bg-accent text-accent-foreground shadow-accent/30 -mt-4 flex items-center justify-center justify-self-center rounded-full px-4 py-2.5 shadow-lg"
        href="/items/new"
      >
        <IconPlus className="h-6 w-6" />
      </Link>

      <Link
        aria-current={isActive(pathname, "/messages") ? "page" : undefined}
        className={tabClass(isActive(pathname, "/messages"))}
        href="/messages"
      >
        <IconMessageCircle className="h-5 w-5" />
        <span className="text-[11px] font-medium">Messages</span>
      </Link>
    </nav>
  );
}
