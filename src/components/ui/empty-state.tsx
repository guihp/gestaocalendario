import { ReactNode } from "react";
import { Button } from "./button";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 px-6 py-12 text-center">
      {icon && <div className="mb-4 text-4xl text-blue-500">{icon}</div>}
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

