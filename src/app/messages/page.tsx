import { Avatar, buttonVariants, Typography } from "@heroui/react";
import { IconMessageOff } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageShell } from "@/components/page-shell";
import { getMyConversations, requireProfile } from "@/db/dal";
import { dayTimeFormatter as timeFormatter } from "@/lib/date-format";
import { initialsFor } from "@/lib/initials";

export const metadata: Metadata = {
  title: "Messages — Oper",
  description: "Conversations with givers and receivers.",
};

export default async function MessagesPage() {
  const profile = await requireProfile();
  const conversations = await getMyConversations(profile.id);

  return (
    <PageShell className="gap-8" width="focused">
      <div>
        <Typography.Heading level={1}>Messages</Typography.Heading>
        <Typography.Paragraph className="mt-1" color="muted">
          Conversations about items you're giving or receiving.
        </Typography.Paragraph>
      </div>

      <h2 className="sr-only">Conversations</h2>
      {conversations.length === 0 ? (
        <EmptyState
          action={
            <Link className={buttonVariants()} href="/">
              Browse nearby items
            </Link>
          }
          description="Find something you'd like and message the giver to get started."
          icon={IconMessageOff}
          title="No conversations yet"
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                className="border-border hover:bg-accent-soft rounded-stub flex items-center gap-3 border px-4 py-3 transition-colors"
                href={`/messages/${conversation.id}`}
              >
                <Avatar>
                  <Avatar.Fallback>{initialsFor(conversation.partnerDisplayName)}</Avatar.Fallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium">
                      {conversation.partnerDisplayName}
                    </span>
                    {conversation.lastMessageAt ? (
                      <span className="text-muted shrink-0 text-xs">
                        {timeFormatter.format(conversation.lastMessageAt)}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-muted truncate text-xs">
                    {conversation.isGiver ? "Giving" : "Receiving"} · {conversation.itemTitle}
                  </span>
                  {conversation.lastMessageBody ? (
                    <p className="text-muted truncate text-sm">{conversation.lastMessageBody}</p>
                  ) : (
                    <p className="text-muted text-sm italic">No messages yet</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
