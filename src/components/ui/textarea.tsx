"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

