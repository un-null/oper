import { buttonVariants } from "@heroui/react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conversation not found — Oper",
};

export default function ConversationNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">This conversation isn't available</h1>
      <p className="text-muted text-sm">It may not exist, or you don't have access to it.</p>
      <Link className={buttonVariants()} href="/messages">
        Back to messages
      </Link>
    </main>
  );
}
