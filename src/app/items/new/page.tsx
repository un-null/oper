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
      <h1 className="mb-1 text-2xl font-semibold">Give something away</h1>
      <p className="text-muted mb-8 text-sm">Someone nearby probably needs it. Posting is free.</p>
      <PostItemForm />
    </PageShell>
  );
}
