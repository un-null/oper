import { buttonVariants, Typography } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Conversation not found — Oper",
};

export default function ConversationNotFound() {
  return (
    <PageShell center className="gap-4 text-center" width="focused">
      <Typography.Heading className="text-2xl font-semibold" level={1}>
        This conversation isn't available
      </Typography.Heading>
      <p className="text-muted text-sm">It may not exist, or you don't have access to it.</p>
      <Link className={buttonVariants()} href="/messages">
        Back to messages
      </Link>
    </PageShell>
  );
}
