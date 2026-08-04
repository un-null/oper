import { Avatar, buttonVariants, Typography } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { getMyConversations, requireProfile } from "@/db/dal";
import { initialsFor } from "@/lib/initials";

export const metadata: Metadata = {
  title: "Messages — Oper",
  description: "Conversations with givers and receivers.",
};

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

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

      {conversations.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed px-6 py-16 text-center">
          <p className="text-muted text-sm">No conversations yet.</p>
          <Link className={buttonVariants({ className: "mt-4" })} href="/">
            Browse nearby items
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                className="border-border hover:bg-accent-soft flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
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
