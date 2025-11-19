"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarEvent, EventUpdateInput } from "@/types/schedule";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  formatDateTime,
  formatHourLabel,
  fromDateTimeLocalInput,
  toDateTimeLocalInput,
} from "@/lib/date";
import { clientConfig } from "@/lib/config";

const eventFormSchema = z.object({
  summary: z.string().min(1, "Informe um título"),
  description: z.string().optional(),
  location: z.string().optional(),
  tipo_evento: z.string().optional(),
  start: z.string().min(1),
  end: z.string().min(1),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

type EventFormProps = {
  calendarId: string;
  event?: CalendarEvent | null;
  onSubmit: (payload: EventUpdateInput) => Promise<void> | void;
  onCancel?: () => void;
};

function buildDefaultValues(event?: CalendarEvent | null): EventFormValues {
  const now = new Date().toISOString();
  return {
    summary: event?.summary ?? "",
    description: event?.description ?? "",
    location: event?.location ?? "",
    tipo_evento: event?.tipoEvento ?? "",
    start: toDateTimeLocalInput(event?.start.dateTime ?? now),
    end: toDateTimeLocalInput(event?.end.dateTime ?? now),
  };
}

export function EventForm({ calendarId, event, onSubmit, onCancel }: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: useMemo(() => buildDefaultValues(event), [event]),
  });

  const isEditing = Boolean(event);

  useEffect(() => {
    form.reset(buildDefaultValues(event));
  }, [event, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const startIso = fromDateTimeLocalInput(values.start);
    const endIso = fromDateTimeLocalInput(values.end);
    const payload: EventUpdateInput = {
      summary: values.summary,
      description: values.description,
      location: values.location,
      start: {
        dateTime: startIso,
        timeZone: clientConfig.timezone,
      },
      end: {
        dateTime: endIso,
        timeZone: clientConfig.timezone,
      },
      tipo_evento: values.tipo_evento,
      data_evento: startIso,
      hora_evento: formatHourLabel(startIso),
      calendar_id: calendarId,
    };

    await onSubmit(payload);
    form.reset(values);
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">
          Título do evento
        </label>
        <Input placeholder="Ex.: Reunião de briefing" {...form.register("summary")} />
        {form.formState.errors.summary && (
          <p className="text-xs text-red-500">
            {form.formState.errors.summary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-600">Descrição</label>
        <Textarea
          rows={4}
          placeholder="Detalhes adicionais"
          {...form.register("description")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">
            Localização
          </label>
          <Input placeholder="Endereço ou link" {...form.register("location")} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">
            Tipo de evento
          </label>
          <Input placeholder="Ex.: Visita técnica" {...form.register("tipo_evento")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">
            Início ({clientConfig.timezone})
          </label>
          <Input type="datetime-local" {...form.register("start")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">
            Fim ({clientConfig.timezone})
          </label>
          <Input type="datetime-local" {...form.register("end")} />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          className="text-zinc-600 hover:bg-zinc-100"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={form.formState.isSubmitting}>
          {isEditing ? "Salvar alterações" : "Criar evento"}
        </Button>
      </div>
      {event && (
        <p className="text-xs text-zinc-500">
          Última atualização:{" "}
          {formatDateTime(event.start.dateTime, "dd/MM/yyyy HH:mm")}
        </p>
      )}
    </form>
  );
}

