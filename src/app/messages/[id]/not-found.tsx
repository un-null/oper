import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Conversation not found — Oper",
};

export default function ConversationNotFound() {
  return (
    <PageShell center className="gap-4 text-center" width="focused">
      <h1 className="text-2xl font-semibold">This conversation isn't available</h1>
      <p className="text-muted text-sm">It may not exist, or you don't have access to it.</p>
      <Link className={buttonVariants()} href="/messages">
        Back to messages
      </Link>
    </PageShell>
  );
}
