"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          "h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

