import { clsx } from "clsx";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
};

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-blue-50 text-blue-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

