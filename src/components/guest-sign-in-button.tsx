"use client";

import { Button, Spinner } from "@heroui/react";
import { useActionState } from "react";

import { signInAsGuest } from "@/app/sign-in/actions";

export function GuestSignInButton() {
  const [state, formAction, isPending] = useActionState(signInAsGuest, { error: null });

  return (
    <form action={formAction}>
      {state.error ? <p className="text-danger mb-2 text-sm">{state.error}</p> : null}
      <Button className="w-full" isPending={isPending} type="submit" variant="outline">
        {({ isPending: pending }) => (
          <>
            {pending ? <Spinner color="current" size="sm" /> : null}
            {pending ? "Signing in…" : "Continue as guest"}
          </>
        )}
      </Button>
    </form>
  );
}
