"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, fromDateTimeLocalInput, getDateKey } from "@/lib/date";
import { clientConfig } from "@/lib/config";

const schema = z.object({
  title: z.string().min(3, "Informe um título"),
  contactName: z.string().min(2, "Informe o nome do contato"),
  description: z.string().min(5, "Descreva o atendimento"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Informe o horário inicial"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Informe o horário final"),
});

type QuickScheduleValues = z.infer<typeof schema>;

type QuickScheduleModalProps = {
  open: boolean;
  date: string | null;
  calendarName?: string;
  timezone?: string;
  onClose: () => void;
  onConfirm: (input: {
    start: string;
    end: string;
    title: string;
    contactName: string;
    description: string;
  }) => Promise<void> | void;
};

export function QuickScheduleModal({
  open,
  date,
  calendarName,
  timezone = clientConfig.timezone,
  onClose,
  onConfirm,
}: QuickScheduleModalProps) {
  const form = useForm<QuickScheduleValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "Atendimento rápido",
      contactName: "",
      description: "",
      startTime: "09:00",
      endTime: "09:30",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: "Atendimento rápido",
        contactName: "",
        description: "",
        startTime: "09:00",
        endTime: "09:30",
      });
    }
  }, [open, form]);

  if (!date) return null;

  const dateLabel = formatDateTime(date, "EEEE, dd 'de' MMMM", timezone);
  const dateKey = getDateKey(date, "yyyy-MM-dd", timezone);

  const handleSubmit = form.handleSubmit(async (values) => {
    const startIso = fromDateTimeLocalInput(`${dateKey}T${values.startTime}`, timezone);
    const endIso = fromDateTimeLocalInput(`${dateKey}T${values.endTime}`, timezone);
    await onConfirm({
      start: startIso,
      end: endIso,
      title: values.title,
      contactName: values.contactName,
      description: values.description,
    });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Marcar atendimento rápido"
      description={`Criar bloco em ${calendarName ?? "Calendário"} para ${dateLabel}`}
      size="sm"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Título</label>
          <Input placeholder="Ex.: Avaliação inicial" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Nome do cliente</label>
          <Input placeholder="Quem será atendido?" {...form.register("contactName")} />
          {form.formState.errors.contactName && (
            <p className="text-xs text-red-500">
              {form.formState.errors.contactName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Descrição</label>
          <Textarea
            rows={3}
            placeholder="Observações sobre o atendimento"
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-xs text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Início</label>
            <Input type="time" step={300} {...form.register("startTime")} />
            {form.formState.errors.startTime && (
              <p className="text-xs text-red-500">
                {form.formState.errors.startTime.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Fim</label>
            <Input type="time" step={300} {...form.register("endTime")} />
            {form.formState.errors.endTime && (
              <p className="text-xs text-red-500">{form.formState.errors.endTime.message}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting}>
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

