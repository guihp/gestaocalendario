"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CreateCalendarModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
};

export function CreateCalendarModal({
  open,
  onClose,
  onSubmit,
}: CreateCalendarModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName("");
      onClose();
    } catch (error) {
      console.error("Erro ao criar calendário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo calendário"
      description="Informe o nome do calendário para criar uma nova agenda."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="calendar-name" className="text-sm font-medium text-slate-600">
            Nome do calendário
          </label>
          <Input
            id="calendar-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Agenda pessoal"
            required
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Criar calendário
          </Button>
        </div>
      </form>
    </Modal>
  );
}


