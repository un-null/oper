import { Avatar, buttonVariants, Chip, Typography } from "@heroui/react";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { MessageThread } from "@/components/message-thread";
import { PageShell } from "@/components/page-shell";
import { PickupPanel } from "@/components/pickup-panel";
import {
  findConversationPickup,
  findMyConversation,
  findRatablePickup,
  getConversationMessages,
  requireProfile,
} from "@/db/dal";
import { initialsFor } from "@/lib/initials";

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
  const ratable = await findRatablePickup(profile.id, conversation.id);

  return (
    <PageShell className="gap-6" width="focused">
      <div className="flex items-center gap-3">
        <Link
          aria-label="Back to messages"
          className={buttonVariants({ isIconOnly: true, variant: "outline" })}
          href="/messages"
        >
          <IconArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar>
          <Avatar.Fallback>{initialsFor(conversation.partnerDisplayName)}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <Typography.Heading level={1}>{conversation.partnerDisplayName}</Typography.Heading>
          <p className="text-muted truncate text-sm">{conversation.itemTitle}</p>
        </div>
        <Chip
          className="ml-auto shrink-0"
          color={conversation.itemStatus === "active" ? "success" : "default"}
        >
          {conversation.itemStatus}
        </Chip>
      </div>

      <MessageThread
        conversationId={conversation.id}
        initialMessages={messages}
        viewerId={profile.id}
      >
        <PickupPanel
          conversationId={conversation.id}
          itemId={conversation.itemId}
          partnerDisplayName={conversation.partnerDisplayName}
          pickup={pickup}
          pickupSpotDefault={conversation.itemPickupSpot}
          ratable={ratable}
          viewerId={profile.id}
        />
      </MessageThread>
    </PageShell>
  );
}
