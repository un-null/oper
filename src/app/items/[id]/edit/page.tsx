import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { EditItemForm } from "@/components/edit-item-form";
import { PageShell } from "@/components/page-shell";
import { findMyItem, requireProfile } from "@/db/dal";

export const metadata: Metadata = {
  title: "Edit item — Oper",
  description: "Update your posted item.",
  robots: { index: false },
};

type EditItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params;
  const idResult = z.uuid().safeParse(id);
  if (!idResult.success) {
    notFound();
  }

  const profile = await requireProfile();
  const item = await findMyItem(profile.id, idResult.data);
  if (!item) {
    notFound();
  }

  return (
    <PageShell width="focused">
      <h1 className="mb-1 text-2xl font-semibold">Edit item</h1>
      <p className="text-muted mb-8 text-sm">Photos can't be changed here yet.</p>
      <EditItemForm
        category={item.category}
        condition={item.condition}
        description={item.description}
        itemId={item.id}
        pickupSpot={item.pickupSpot}
        title={item.title}
      />
    </PageShell>
  );
}
