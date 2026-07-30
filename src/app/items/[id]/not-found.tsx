import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Item not found — Oper",
};

export default function ItemNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">This item is no longer available</h1>
      <p className="text-muted text-sm">
        It may have been taken already, or the link is out of date.
      </p>
      <Link className={buttonVariants()} href="/">
        Browse nearby items
      </Link>
    </main>
  );
}
