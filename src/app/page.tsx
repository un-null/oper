import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Oper</h1>
      <p className="mt-3 max-w-md text-lg text-foreground/70">
        Oper — give away the things you don't need to neighbors nearby.
      </p>
      {session ? (
        <p className="mt-8 text-sm text-foreground/70">
          Signed in as <span className="font-medium text-foreground">{session.user.email}</span>.
        </p>
      ) : (
        <Link
          className="mt-8 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
          href="/sign-in"
        >
          Sign in
        </Link>
      )}
    </main>
  );
}
