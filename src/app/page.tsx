import { buttonVariants, Typography } from "@heroui/react";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <Typography.Heading level={1}>Oper</Typography.Heading>
      <Typography.Paragraph className="mt-3 max-w-md text-lg" color="muted">
        Oper — give away the things you don't need to neighbors nearby.
      </Typography.Paragraph>
      {session ? (
        <p className="text-muted mt-8 text-sm">
          Signed in as <span className="text-foreground font-medium">{session.user.email}</span>.
        </p>
      ) : (
        <Link className={buttonVariants({ className: "mt-8" })} href="/sign-in">
          Sign in
        </Link>
      )}
    </main>
  );
}
