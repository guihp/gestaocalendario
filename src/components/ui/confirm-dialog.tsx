"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading,
  variant = "default",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && (
        <div className="text-sm text-zinc-600">{description}</div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-600 hover:bg-zinc-100"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === "danger" ? "danger" : "primary"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

