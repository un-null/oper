import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const pageShell = tv({
  base: "mx-auto flex w-full flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10",
  variants: {
    width: {
      feed: "max-w-6xl",
      focused: "max-w-2xl",
      form: "max-w-sm",
    },
    stickyCta: {
      true: "pb-32",
      false: "",
    },
    center: {
      true: "items-center justify-center",
      false: "",
    },
  },
  defaultVariants: { width: "feed", stickyCta: false, center: false },
});

type PageShellProps = {
  children: ReactNode;
  className?: string;
  width?: "feed" | "focused" | "form";
  stickyCta?: boolean;
  center?: boolean;
  as?: "main" | "div";
};

export function PageShell({
  as: Tag = "main",
  center,
  children,
  className,
  stickyCta,
  width,
}: PageShellProps) {
  return <Tag className={pageShell({ center, className, stickyCta, width })}>{children}</Tag>;
}
