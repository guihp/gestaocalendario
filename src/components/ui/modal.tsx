"use client";

import { ReactNode, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { clsx } from "clsx";

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
};

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const isBrowser = typeof window !== "undefined";

  useEffect(() => {
    if (!open || !isBrowser) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, isBrowser]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open || !isBrowser) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, open, isBrowser]);

  if (!isBrowser || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={clsx(
          "w-full rounded-2xl bg-white shadow-xl",
          sizeMap[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-500">{description}</p>
            )}
          </div>
          <button
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="border-t border-zinc-100 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}

