"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-zinc-900",
  ghost:
    "bg-transparent text-zinc-900 hover:bg-zinc-100 focus-visible:outline-zinc-900",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
  outline:
    "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus-visible:outline-blue-600",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

