"use client";

import { Button } from "@heroui/react";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know the user's stored/OS theme, so rendering the real
  // icon before mount would be a hydration mismatch. Render a same-sized
  // placeholder instead of null, so the header doesn't shift when it appears.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="size-9" />;
  }

  // `resolvedTheme`, not `theme`: with defaultTheme="system", `theme` is the
  // literal string "system" until the user picks one, so it can't tell us
  // which palette is actually on screen.
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      isIconOnly
      onPress={() => setTheme(isDark ? "light" : "dark")}
      variant="ghost"
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </Button>
  );
}
