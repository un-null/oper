"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type PollRefreshProps = {
  intervalMs?: number;
};

export function PollRefresh({ intervalMs = 5000 }: PollRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const refreshIfVisible = () => {
      if (!document.hidden) {
        router.refresh();
      }
    };

    const id = setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [router, intervalMs]);

  return null;
}