"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarMutationInput, CalendarRef } from "@/types/schedule";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { clientConfig } from "@/lib/config";

const calendarSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  calendar_id: z.string().optional(),
  timezone: z.string().optional(),
  description: z.string().optional(),
});

type CalendarFormValues = z.infer<typeof calendarSchema>;

type CalendarFormProps = {
  calendar?: CalendarRef | null;
  onSubmit: (payload: CalendarMutationInput) => Promise<void> | void;
  onCancel?: () => void;
};

export function CalendarForm({ calendar, onSubmit, onCancel }: CalendarFormProps) {
  const form = useForm<CalendarFormValues>({
    resolver: zodResolver(calendarSchema),
    defaultValues: {
      name: calendar?.name ?? "",
      calendar_id: calendar?.id ?? "",
      description: calendar?.description ?? "",
      timezone: calendar?.timezone ?? clientConfig.timezone,
    },
  });

  useEffect(() => {
    form.reset({
      name: calendar?.name ?? "",
      calendar_id: calendar?.id ?? "",
      description: calendar?.description ?? "",
      timezone: calendar?.timezone ?? clientConfig.timezone,
    });
  }, [calendar, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      calendar_id: values.calendar_id,
      description: values.description,
      timezone: values.timezone,
    });
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">Nome</label>
        <Input placeholder="Nome amigável" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-xs text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">
          Calendar ID (opcional)
        </label>
        <Input placeholder="ex: xxx@group.calendar.google.com" {...form.register("calendar_id")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">Fuso horário</label>
        <Input placeholder="America/Sao_Paulo" {...form.register("timezone")} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">Descrição</label>
        <Textarea rows={3} {...form.register("description")} />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-600 hover:bg-zinc-100"
          onClick={onCancel}
          disabled={form.formState.isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={form.formState.isSubmitting}>
          Salvar calendário
        </Button>
      </div>
    </form>
  );
}

