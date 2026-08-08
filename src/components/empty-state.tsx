import { EmptyState as HeroEmptyState } from "@heroui/react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ action, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <HeroEmptyState className="border-border rounded-stub flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center">
      <div className="bg-accent-soft text-accent-soft-foreground flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold tracking-tight">{title}</h3>
      <p className="text-muted max-w-xs text-sm">{description}</p>
      {action ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>
      ) : null}
    </HeroEmptyState>
  );
}
