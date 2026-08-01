import { buttonVariants, Chip, Typography } from "@heroui/react";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { MessageThread } from "@/components/message-thread";
import { PickupPanel } from "@/components/pickup-panel";
import {
  findConversationPickup,
  findMyConversation,
  getConversationMessages,
  requireProfile,
} from "@/db/dal";

export const metadata: Metadata = {
  title: "Conversation — Oper",
};

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;
  const idResult = z.uuid().safeParse(id);
  if (!idResult.success) {
    notFound();
  }

  const profile = await requireProfile();
  const conversation = await findMyConversation(profile.id, idResult.data);
  if (!conversation) {
    notFound();
  }

  const messages = await getConversationMessages(profile.id, conversation.id);
  const pickup = await findConversationPickup(profile.id, conversation.id);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex items-center gap-3">
        <Link
          aria-label="Back to messages"
          className={buttonVariants({ isIconOnly: true, variant: "outline" })}
          href="/messages"
        >
          <IconArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <Typography.Heading level={1}>{conversation.itemTitle}</Typography.Heading>
          <p className="text-muted text-sm">With {conversation.partnerDisplayName}</p>
        </div>
        <Chip
          className="ml-auto"
          color={conversation.itemStatus === "active" ? "success" : "default"}
        >
          {conversation.itemStatus}
        </Chip>
      </div>

      <MessageThread
        conversationId={conversation.id}
        initialMessages={messages}
        viewerId={profile.id}
      />

      <PickupPanel
        conversationId={conversation.id}
        itemId={conversation.itemId}
        partnerDisplayName={conversation.partnerDisplayName}
        pickup={pickup}
        pickupSpotDefault={conversation.itemPickupSpot}
        viewerId={profile.id}
      />
    </main>
  );
}
