"use client";

import { Button, Form, Spinner } from "@heroui/react";
import { useActionState } from "react";

import { startConversationAction, type StartConversationState } from "@/app/messages/actions";

type MessageGiverButtonProps = {
  itemId: string;
};

const initialState: StartConversationState = { error: null };

export function MessageGiverButton({ itemId }: MessageGiverButtonProps) {
  const [state, formAction, isPending] = useActionState(startConversationAction, initialState);

  return (
    <Form action={formAction} className="flex items-center gap-3">
      <input name="itemId" type="hidden" value={itemId} />
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button isPending={isPending} type="submit">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Starting…" : "Message giver"}
          </>
        )}
      </Button>
    </Form>
  );
}