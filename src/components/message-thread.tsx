"use client";

import { Button, FieldError, Form, Input, Label, Spinner, TextField } from "@heroui/react";
import { useActionState, useOptimistic } from "react";

import { type SendMessageState, sendMessage } from "@/app/messages/actions";
import { PollRefresh } from "@/components/poll-refresh";
import type { messages } from "@/db/schema";

type Message = typeof messages.$inferSelect;

type MessageThreadProps = {
  conversationId: string;
  viewerId: string;
  initialMessages: Message[];
  children?: React.ReactNode;
};

const initialState: SendMessageState = { error: null };

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

export function MessageThread({
  conversationId,
  viewerId,
  initialMessages,
  children,
}: MessageThreadProps) {
  const [state, formAction, isPending] = useActionState(sendMessage, initialState);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    initialMessages,
    (current, body: string) => [
      ...current,
      {
        id: `optimistic-${current.length}`,
        conversationId,
        senderId: viewerId,
        body,
        createdAt: new Date(),
      },
    ],
  );

  async function handleSubmit(formData: FormData) {
    const body = formData.get("body");
    if (typeof body === "string" && body.trim()) {
      addOptimisticMessage(body);
    }
    formAction(formData);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PollRefresh />
      <ul aria-label="Messages" className="flex flex-1 flex-col gap-3">
        {optimisticMessages.map((message) => {
          const isOwn = message.senderId === viewerId;
          return (
            <li className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`} key={message.id}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  isOwn ? "bg-accent text-accent-foreground" : "bg-accent-soft"
                }`}
              >
                {message.body}
              </div>
              <span className="text-muted mt-1 text-xs">
                {timeFormatter.format(message.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>

      {children}

      <Form action={handleSubmit} className="flex items-end gap-2">
        <input name="conversationId" type="hidden" value={conversationId} />
        <TextField className="flex-1" isDisabled={isPending} isRequired name="body">
          <Label className="sr-only">Message</Label>
          <Input aria-label="Message" placeholder="Write a message…" />
          <FieldError />
        </TextField>
        {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
        <Button isPending={isPending} type="submit">
          {({ isPending: pending }) => (
            <>
              {pending ? <Spinner color="current" size="sm" /> : null}
              Send
            </>
          )}
        </Button>
      </Form>
    </div>
  );
}
