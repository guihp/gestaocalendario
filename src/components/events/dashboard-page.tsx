"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http-client";
import {
  CalendarEvent,
  CalendarRef,
  EventUpdateInput,
} from "@/types/schedule";
import {
  fromDateTimeLocalInput,
  getDateKey,
  getDayRange,
  getMonthYearFromDate,
  getRollingRange,
} from "@/lib/date";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/events/event-list";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { CalendarRange, RefreshCcw, Trash2, Calendar } from "lucide-react";
import { clientConfig } from "@/lib/config";
import { EventModal } from "@/components/events/event-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EventCalendar } from "@/components/events/event-calendar";
import { QuickScheduleModal } from "@/components/events/quick-schedule-modal";
import { CreateCalendarModal } from "@/components/calendars/create-calendar-modal";
import { Modal } from "@/components/ui/modal";
import { DayEventsModal } from "@/components/events/day-events-modal";
import { BlockMonthModal } from "@/components/events/block-month-modal";

type FiltersState = {
  calendarId?: string;
  baseDate: string;
};

async function fetchCalendars() {
  const data = await apiFetch<{ calendars: CalendarRef[] }>("/api/calendarios");
  return data.calendars ?? [];
}

async function fetchEvents(filters: {
  calendarId: string;
  start: string;
  end: string;
  month: number;
  year: number;
}) {
  const params = new URLSearchParams({
    calendarId: filters.calendarId,
    start: filters.start,
    end: filters.end,
    month: String(filters.month),
    year: String(filters.year),
    tipoBusca: "individual",
  });

  const data = await apiFetch<{ events: CalendarEvent[] }>(
    `/api/events?${params.toString()}`,
  );
  return data.events ?? [];
}

export function DashboardPage() {
  const now = new Date();
  const initialBaseDate = now.toISOString();
  const [filters, setFilters] = useState<FiltersState>({
    baseDate: initialBaseDate,
  });
  const timezone = clientConfig.timezone;

  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({
    baseDate: initialBaseDate,
  });

  const calendarsQuery = useQuery({
    queryKey: ["calendars"],
    queryFn: fetchCalendars,
    staleTime: 1000 * 60 * 5,
  });

  const defaultCalendarId = calendarsQuery.data?.[0]?.id;
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [slotDate, setSlotDate] = useState<string | null>(null);
  const [isCreateCalendarModalOpen, setCreateCalendarModalOpen] = useState(false);
  const [isDeleteCalendarModalOpen, setDeleteCalendarModalOpen] = useState(false);
  const [selectedCalendarToDelete, setSelectedCalendarToDelete] = useState<string>("");
  const [calendarToDelete, setCalendarToDelete] = useState<CalendarRef | null>(null);
  const [isHolidayModalOpen, setHolidayModalOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState<string>("");
  const [holidayCalendarId, setHolidayCalendarId] = useState<string>("");
  const [dayEventsModalDate, setDayEventsModalDate] = useState<Date | null>(null);
  const [dayEventsModalEvents, setDayEventsModalEvents] = useState<CalendarEvent[]>([]);
  const [isBlockMonthModalOpen, setBlockMonthModalOpen] = useState(false);

  const saveEventMutation = useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId?: string;
      data: EventUpdateInput;
    }) => {
      const endpoint = eventId ? `/api/events/${eventId}` : "/api/events";
      const method = eventId ? "PATCH" : "POST";

      return apiFetch(endpoint, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento sincronizado com sucesso");
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível salvar o evento", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async ({
      event,
      calendarId,
    }: {
      event: CalendarEvent;
      calendarId: string;
    }) => {
      return apiFetch(`/api/events/${event.id}`, {
        method: "DELETE",
        body: JSON.stringify({ calendarId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Evento removido com sucesso");
      setEventToDelete(null);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível remover o evento", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const quickScheduleMutation = useMutation({
    mutationFn: async ({
      start,
      end,
      calendarId,
      calendarName,
      title,
      contactName,
      description,
    }: {
      start: string;
      end: string;
      calendarId: string;
      calendarName: string;
      title: string;
      contactName: string;
      description: string;
    }) => {
      return apiFetch("/api/slots", {
        method: "POST",
        body: JSON.stringify({
          calendarId,
          calendarName,
          title,
          contactName,
          description,
          start,
          end,
        }),
      });
    },
    onSuccess: () => {
      toast.success("Horário reservado com sucesso");
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["events"] });
        queryClient.refetchQueries({ queryKey: ["events"] });
      }, 2000);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível reservar o horário", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const createCalendarMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiFetch("/api/calendarios", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendário criado com sucesso");
      setCreateCalendarModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível criar o calendário", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: async ({ date, calendarId }: { date: string; calendarId: string }) => {
      const calendar = calendarsQuery.data?.find((cal) => cal.id === calendarId);
      if (!calendar) {
        throw new Error("Calendário não encontrado");
      }

      return apiFetch("/api/holidays", {
        method: "POST",
        body: JSON.stringify({
          calendarId,
          calendarName: calendar.name,
          date,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Feriado adicionado com sucesso");
      setHolidayModalOpen(false);
      setHolidayDate("");
      setHolidayCalendarId("");
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível adicionar o feriado", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const blockMonthMutation = useMutation({
    mutationFn: async ({
      month,
      year,
      calendarId,
    }: {
      month: number;
      year: number;
      calendarId: string;
    }) => {
      const calendar = calendarsQuery.data?.find((cal) => cal.id === calendarId);
      if (!calendar) {
        throw new Error("Calendário não encontrado");
      }

      return apiFetch("/api/block-month", {
        method: "POST",
        body: JSON.stringify({
          calendarId,
          calendarName: calendar.name,
          month,
          year,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Mês bloqueado com sucesso");
      setBlockMonthModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível bloquear o mês", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const deleteCalendarMutation = useMutation({
    mutationFn: async (calendarId: string) => {
      return apiFetch(`/api/calendarios/${calendarId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_, calendarId) => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Calendário removido com sucesso");
      setCalendarToDelete(null);
      // Limpar o filtro se o calendário removido era o selecionado
      if (filters.calendarId === calendarId || defaultCalendarId === calendarId) {
        setFilters((prev) => ({ ...prev, calendarId: undefined }));
        setAppliedFilters((prev) => ({ ...prev, calendarId: undefined }));
      }
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível remover o calendário", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const effectiveFilters = {
    calendarId: (filters.calendarId ?? defaultCalendarId) as string,
    baseDate: filters.baseDate,
  };

  const effectiveAppliedFilters = {
    calendarId: (appliedFilters.calendarId ??
      defaultCalendarId ??
      "") as string,
    baseDate: appliedFilters.baseDate,
  };

  const hasCalendarSelected = Boolean(effectiveAppliedFilters.calendarId);
  const appliedRange = getRollingRange(appliedFilters.baseDate, 30, timezone);
  const { month: baseMonth, year: baseYear } = getMonthYearFromDate(
    appliedFilters.baseDate,
    timezone,
  );

  const selectedRange = getRollingRange(filters.baseDate, 30, timezone);
  const eventsQuery = useQuery({
    queryKey: [
      "events",
      effectiveAppliedFilters.calendarId,
      appliedRange.start,
      appliedRange.end,
    ],
    queryFn: () =>
      fetchEvents({
        calendarId: effectiveAppliedFilters.calendarId,
        start: appliedRange.start,
        end: appliedRange.end,
        month: baseMonth,
        year: baseYear,
      }),
    enabled: hasCalendarSelected,
  });

  function handleApplyFilters() {
    if (!effectiveFilters.calendarId) {
      toast.error("Selecione um calendário para continuar");
      return;
    }
    setFilters((prev) => ({
      ...prev,
      calendarId: effectiveFilters.calendarId,
    }));
    setAppliedFilters({
      calendarId: effectiveFilters.calendarId,
      baseDate: filters.baseDate,
    });
  }

  function handleCalendarChange(value: string) {
    setFilters((prev) => ({ ...prev, calendarId: value || undefined }));
  }

  function handleBaseDateChange(value: string) {
    if (!value) return;
    const iso = fromDateTimeLocalInput(`${value}T00:00`, timezone);
    setFilters((prev) => ({ ...prev, baseDate: iso }));
  }

  function handleCreateEvent() {
    setSelectedEvent(null);
    setModalOpen(true);
  }

  function handleEditEvent(event: CalendarEvent) {
    setSelectedEvent(event);
    setModalOpen(true);
  }

  function handleDeleteEvent(event: CalendarEvent) {
    setEventToDelete(event);
  }

  const activeCalendar =
    calendarsQuery.data?.find(
      (calendar) => calendar.id === effectiveFilters.calendarId,
    ) ?? calendarsQuery.data?.find((calendar) => calendar.id === defaultCalendarId);

  function handleCreateSlot(dateIso: string) {
    if (!effectiveFilters.calendarId) {
      toast.error("Selecione um calendário para criar um agendamento");
      return;
    }
    setSlotDate(dateIso);
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_70%_10%,_rgba(236,72,153,0.3),transparent_50%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 text-slate-900 lg:py-16">
        <section className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur">
          <div className="flex flex-wrap items-start gap-8">
            <div className="min-w-[240px] flex-1 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-500">
                Agenda integrada
              </p>
              <h1 className="text-4xl font-bold text-slate-900">
                Painel de Agendamentos
              </h1>
              <p className="text-base text-slate-600">
                Acompanhe compromissos do Google Calendar com visão mensal,
                edição rápida e sincronização em tempo real no fuso{" "}
                <span className="font-semibold text-slate-900">{timezone}</span>.
              </p>
            </div>
            <div className="min-w-[260px] flex-1 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-2xl">
              <p className="text-sm uppercase tracking-wide text-white/75">
                Calendário ativo
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {activeCalendar?.name ?? "Selecione um calendário"}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {activeCalendar ? activeCalendar.id : "Nenhum calendário selecionado"}
              </p>
              <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/80">
                <div>
                  <p className="text-xs uppercase tracking-wide">Período</p>
                  <p className="text-base font-semibold text-white">
                    {appliedRange.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide">Eventos</p>
                  <p className="text-base font-semibold text-white">
                    {eventsQuery.data?.length ?? 0}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="mt-6 border border-white/30 bg-white/20 text-white hover:bg-white/30"
                onClick={handleCreateEvent}
                disabled={!effectiveFilters.calendarId}
              >
                Agendar novo compromisso
              </Button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr]">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Calendários conectados
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {calendarsQuery.data?.length ?? 0}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => calendarsQuery.refetch()}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
              <div className="mt-6 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span>Filtro em edição: {selectedRange.label}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Última sincronização: {appliedRange.label}
                </div>
              </div>
            </Card>

            <Card variant="muted" className="flex flex-col gap-2">
              <p className="text-sm font-medium text-white/80">Status da agenda</p>
              <p className="text-3xl font-semibold text-white">
                {eventsQuery.data?.length ?? 0} evento
                {(eventsQuery.data?.length ?? 0) === 1 ? "" : "s"}
              </p>
              <p className="text-sm text-white/70">
                {eventsQuery.isFetching
                  ? "Sincronizando com o Google Calendar..."
                  : "Dados atualizados via webhook."}
              </p>
            </Card>
          </div>
        </section>

        <Card>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Calendário
              </label>
              {calendarsQuery.isLoading ? (
                <div className="flex h-11 items-center rounded-lg border border-white/40 bg-white/70 px-3 text-sm text-slate-500">
                  <Spinner size="sm" className="mr-2 border-slate-400" />
                  Carregando agendas...
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={filters.calendarId ?? defaultCalendarId ?? ""}
                      onChange={(event) => handleCalendarChange(event.target.value)}
                    >
                      <option value="">Selecione um calendário</option>
                      {calendarsQuery.data?.map((calendar) => (
                        <option key={calendar.id} value={calendar.id}>
                          {calendar.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => setDeleteCalendarModalOpen(true)}
                    disabled={deleteCalendarMutation.isPending}
                    loading={deleteCalendarMutation.isPending}
                    title="Remover calendário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">
                Data inicial
              </label>
              <Input
                type="date"
                value={getDateKey(filters.baseDate, "yyyy-MM-dd", timezone)}
                onChange={(event) => handleBaseDateChange(event.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              Filtro atual: <span className="font-semibold">{selectedRange.label}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setCreateCalendarModalOpen(true)}
              >
                Novo calendário
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setHolidayModalOpen(true);
                  setHolidayCalendarId(effectiveFilters.calendarId || defaultCalendarId || "");
                }}
                title="Adicionar feriado"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Adicionar feriado
              </Button>
              <Button
                variant="outline"
                onClick={() => setBlockMonthModalOpen(true)}
                disabled={!effectiveFilters.calendarId}
                title="Bloquear mês"
              >
                Bloqueia Mês
              </Button>
              <Button
                onClick={handleApplyFilters}
                disabled={!effectiveFilters.calendarId || eventsQuery.isFetching}
                loading={eventsQuery.isFetching}
              >
                Buscar eventos
              </Button>
              <Button
                variant="secondary"
                disabled={!effectiveFilters.calendarId}
                onClick={handleCreateEvent}
              >
                Novo evento
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <EventCalendar
            month={baseMonth}
            year={baseYear}
            events={eventsQuery.data ?? []}
            timezone={timezone}
            onSelectEvent={handleEditEvent}
            onCreateSlot={handleCreateSlot}
            onViewDayEvents={(date, events) => {
              setDayEventsModalDate(date);
              setDayEventsModalEvents(events);
            }}
          />
          <EventList
            events={eventsQuery.data ?? []}
            loading={eventsQuery.isLoading || eventsQuery.isFetching}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        </div>
      </div>

      <EventModal
        open={isModalOpen}
        calendarId={effectiveFilters.calendarId}
        event={selectedEvent}
        onClose={() => setModalOpen(false)}
        onSubmit={async ({ eventId, data }) => {
          await saveEventMutation.mutateAsync({ eventId, data });
        }}
      />

      <ConfirmDialog
        open={Boolean(eventToDelete)}
        title="Excluir evento"
        description={
          <>
            Tem certeza que deseja excluir{" "}
            <span className="font-semibold">{eventToDelete?.summary}</span>? Esta ação
            removerá o compromisso do Google Calendar.
          </>
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleteEventMutation.isPending}
        onClose={() => setEventToDelete(null)}
        onConfirm={() =>
          eventToDelete &&
          deleteEventMutation.mutate({
            event: eventToDelete,
            calendarId:
              eventToDelete.calendarId ?? effectiveAppliedFilters.calendarId,
          })
        }
      />

      <QuickScheduleModal
        open={Boolean(slotDate)}
        date={slotDate}
        calendarName={activeCalendar?.name}
        onClose={() => setSlotDate(null)}
        onConfirm={async ({ start, end, title, contactName, description }) => {
          await quickScheduleMutation.mutateAsync({
            start,
            end,
            calendarId: effectiveFilters.calendarId,
            calendarName: activeCalendar?.name ?? "Calendário",
            title,
            contactName,
            description,
          });
        }}
      />

      <CreateCalendarModal
        open={isCreateCalendarModalOpen}
        onClose={() => setCreateCalendarModalOpen(false)}
        onSubmit={async (name) => {
          await createCalendarMutation.mutateAsync(name);
        }}
      />

      <Modal
        open={isDeleteCalendarModalOpen}
        onClose={() => {
          setDeleteCalendarModalOpen(false);
          setSelectedCalendarToDelete("");
        }}
        title="Remover calendário"
        description="Selecione o calendário que deseja remover."
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Selecione o calendário
            </label>
            {calendarsQuery.isLoading ? (
              <div className="flex h-11 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">
                <Spinner size="sm" className="mr-2 border-zinc-400" />
                Carregando agendas...
              </div>
            ) : calendarsQuery.data && calendarsQuery.data.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                Nenhum calendário disponível
              </div>
            ) : (
              <Select
                value={selectedCalendarToDelete}
                onChange={(event) => setSelectedCalendarToDelete(event.target.value)}
              >
                <option value="">Selecione um calendário</option>
                {calendarsQuery.data?.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeleteCalendarModalOpen(false);
                setSelectedCalendarToDelete("");
              }}
              disabled={deleteCalendarMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const calendar = calendarsQuery.data?.find(
                  (cal) => cal.id === selectedCalendarToDelete
                );
                if (calendar) {
                  setCalendarToDelete(calendar);
                  setDeleteCalendarModalOpen(false);
                  setSelectedCalendarToDelete("");
                } else {
                  toast.error("Selecione um calendário para remover");
                }
              }}
              disabled={!selectedCalendarToDelete || deleteCalendarMutation.isPending}
              loading={deleteCalendarMutation.isPending}
            >
              Sim, excluir
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(calendarToDelete)}
        title="Confirmar exclusão"
        description={
          <>
            Tem certeza que deseja remover{" "}
            <span className="font-semibold">{calendarToDelete?.name}</span>?
            Os usuários não verão mais esta agenda e todos os eventos associados serão removidos.
          </>
        }
        confirmLabel="Sim, excluir"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleteCalendarMutation.isPending}
        onClose={() => setCalendarToDelete(null)}
        onConfirm={() =>
          calendarToDelete && deleteCalendarMutation.mutate(calendarToDelete.id)
        }
      />

      <Modal
        open={isHolidayModalOpen}
        onClose={() => {
          setHolidayModalOpen(false);
          setHolidayDate("");
          setHolidayCalendarId("");
        }}
        title="Adicionar feriado"
        description="Selecione o calendário e a data do feriado. O evento será criado para o dia todo."
        size="sm"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Calendário
            </label>
            {calendarsQuery.isLoading ? (
              <div className="flex h-11 items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500">
                <Spinner size="sm" className="mr-2 border-zinc-400" />
                Carregando agendas...
              </div>
            ) : calendarsQuery.data && calendarsQuery.data.length === 0 ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
                Nenhum calendário disponível
              </div>
            ) : (
              <Select
                value={holidayCalendarId}
                onChange={(event) => setHolidayCalendarId(event.target.value)}
              >
                <option value="">Selecione um calendário</option>
                {calendarsQuery.data?.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {calendar.name}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Data do feriado
            </label>
            <Input
              type="date"
              value={holidayDate}
              onChange={(event) => setHolidayDate(event.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setHolidayModalOpen(false);
                setHolidayDate("");
                setHolidayCalendarId("");
              }}
              disabled={createHolidayMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!holidayCalendarId) {
                  toast.error("Selecione um calendário");
                  return;
                }
                if (!holidayDate) {
                  toast.error("Selecione uma data para o feriado");
                  return;
                }
                // Usar a data selecionada diretamente no formato "yyyy-MM-dd"
                // Isso evita problemas de conversão de timezone
                createHolidayMutation.mutate({
                  date: holidayDate, // já está no formato "yyyy-MM-dd"
                  calendarId: holidayCalendarId,
                });
              }}
              disabled={!holidayDate || !holidayCalendarId || createHolidayMutation.isPending}
              loading={createHolidayMutation.isPending}
            >
              Adicionar feriado
            </Button>
          </div>
        </div>
      </Modal>

      <DayEventsModal
        open={dayEventsModalDate !== null}
        date={dayEventsModalDate}
        events={dayEventsModalEvents}
        timezone={timezone}
        onClose={() => {
          setDayEventsModalDate(null);
          setDayEventsModalEvents([]);
        }}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />

      <BlockMonthModal
        open={isBlockMonthModalOpen}
        calendarId={effectiveFilters.calendarId || defaultCalendarId}
        calendarName={activeCalendar?.name}
        onClose={() => setBlockMonthModalOpen(false)}
        onConfirm={async ({ month, year }) => {
          await blockMonthMutation.mutateAsync({
            month,
            year,
            calendarId: effectiveFilters.calendarId || defaultCalendarId || "",
          });
        }}
      />
    </div>
  );
}

