"use client";

import { forwardRef } from "react";
import { clsx } from "clsx";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, hasError, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={clsx(
            "h-11 w-full appearance-none rounded-lg border bg-white px-3 text-left text-sm text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60",
            hasError ? "border-red-500" : "border-zinc-200",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
          ▾
        </span>
      </div>
    );
  },
);

Select.displayName = "Select";

