import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Item not found — Oper",
};

export default function ItemNotFound() {
  return (
    <PageShell center className="gap-4 text-center" width="focused">
      <h1 className="text-2xl font-semibold">This item is no longer available</h1>
      <p className="text-muted text-sm">
        It may have been taken already, or the link is out of date.
      </p>
      <Link className={buttonVariants()} href="/">
        Browse nearby items
      </Link>
    </PageShell>
  );
}
