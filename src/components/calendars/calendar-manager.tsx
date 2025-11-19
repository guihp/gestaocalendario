"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http-client";
import { CalendarMutationInput, CalendarRef } from "@/types/schedule";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarForm } from "@/components/calendars/calendar-form";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Plus, RefreshCcw, Trash2 } from "lucide-react";

async function fetchCalendars() {
  const data = await apiFetch<{ calendars: CalendarRef[] }>("/api/calendarios");
  return data.calendars ?? [];
}

export function CalendarManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setModalOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<CalendarRef | null>(null);

  const calendarsQuery = useQuery({
    queryKey: ["calendars"],
    queryFn: fetchCalendars,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CalendarMutationInput) => {
      return apiFetch("/api/calendarios", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendário salvo");
      setModalOpen(false);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível salvar calendário", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (calendarId: string) => {
      return apiFetch(`/api/calendarios/${calendarId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendars"] });
      toast.success("Calendário removido");
      setCalendarToDelete(null);
    },
    onError: (error: unknown) => {
      toast.error("Não foi possível remover calendário", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const calendars = calendarsQuery.data ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Administração
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Calendários conectados
        </h1>
        <p className="mt-2 text-base text-zinc-600">
          Cadastre novos calendários ou remova conexões não utilizadas.
        </p>
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <Card className="flex items-center gap-6">
          <div>
            <p className="text-sm text-zinc-500">Total sincronizado</p>
            <p className="text-3xl font-bold text-zinc-900">
              {calendars.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => calendarsQuery.refetch()}
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </Card>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo calendário
        </Button>
      </section>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <p className="text-base font-semibold text-zinc-900">
            Agendas configuradas
          </p>
          {calendarsQuery.isFetching && <Spinner size="sm" />}
        </div>
        {calendars.length === 0 && !calendarsQuery.isLoading ? (
          <div className="p-8">
            <EmptyState
              title="Nenhum calendário conectado"
              description="Cadastre o primeiro calendário para usar o painel."
              actionLabel="Adicionar"
              onAction={() => setModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Timezone</th>
                  <th className="px-6 py-3 font-medium">Descrição</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(calendarsQuery.isLoading ? Array.from({ length: 3 }) : calendars).map(
                  (calendar, index) =>
                    calendar ? (
                      <tr
                        key={calendar.id}
                        className="border-t border-zinc-100 text-sm text-zinc-600"
                      >
                        <td className="px-6 py-4 text-zinc-900">{calendar.name}</td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {calendar.id}
                        </td>
                        <td className="px-6 py-4">{calendar.timezone ?? "—"}</td>
                        <td className="px-6 py-4">{calendar.description ?? "—"}</td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setCalendarToDelete(calendar)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={index} className="border-t border-zinc-100">
                        <td className="px-6 py-4" colSpan={5}>
                          <div className="flex animate-pulse gap-3">
                            <div className="h-4 w-32 rounded-full bg-zinc-200" />
                            <div className="h-4 w-48 rounded-full bg-zinc-100" />
                          </div>
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

  <Modal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo calendário"
        description="Informe os dados para sincronizar o calendário com o painel."
      >
        <CalendarForm
          onSubmit={(values) => createMutation.mutateAsync(values)}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(calendarToDelete)}
        title="Remover calendário"
        description={
          <>
            Deseja remover{" "}
            <span className="font-semibold">{calendarToDelete?.name}</span>?
            Os usuários não verão mais esta agenda.
          </>
        }
        confirmLabel="Remover"
        variant="danger"
        loading={deleteMutation.isPending}
        onClose={() => setCalendarToDelete(null)}
        onConfirm={() =>
          calendarToDelete && deleteMutation.mutate(calendarToDelete.id)
        }
      />
    </div>
  );
}

