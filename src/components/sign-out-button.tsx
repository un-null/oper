"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button onPress={handleSignOut} variant="outline">
      Sign out
    </Button>
  );
}
