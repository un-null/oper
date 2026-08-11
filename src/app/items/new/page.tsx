import { Typography } from "@heroui/react";
import type { Metadata } from "next";

import { PageShell } from "@/components/page-shell";
import { PostItemForm } from "@/components/post-item-form";
import { requireProfile } from "@/db/dal";

export const metadata: Metadata = {
  title: "Give something away — Oper",
  description: "Post an item for neighbors nearby to pick up for free.",
};

export default async function NewItemPage() {
  await requireProfile();

  return (
    <PageShell width="focused">
      <Typography.Heading className="mb-1 text-2xl font-semibold" level={1}>
        Give something away
      </Typography.Heading>
      <p className="text-muted mb-8 text-sm">Someone nearby probably needs it. Posting is free.</p>
      <PostItemForm />
    </PageShell>
  );
}
