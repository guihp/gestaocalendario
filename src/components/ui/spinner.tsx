import { clsx } from "clsx";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-4",
};

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <span
      className={clsx(
        "inline-flex animate-spin rounded-full border-t-transparent text-blue-600",
        sizeMap[size],
        className,
      )}
      role="status"
      aria-live="polite"
    />
  );
}

