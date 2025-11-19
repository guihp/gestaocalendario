import { clsx } from "clsx";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "glass" | "muted";
};

const variants: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border-white/30 bg-white/90 shadow-xl backdrop-blur",
  glass:
    "border-white/20 bg-gradient-to-br from-white/20 to-white/5 text-white shadow-2xl backdrop-blur-xl",
  muted: "border-transparent bg-slate-900 text-white shadow-xl",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-3xl p-6 transition-all",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

