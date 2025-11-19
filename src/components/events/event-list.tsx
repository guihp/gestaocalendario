"use client";

import { CalendarEvent } from "@/types/schedule";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/date";
import {
  CalendarRange,
  MapPin,
  PencilLine,
  Trash2,
  Clock,
} from "lucide-react";

type EventListProps = {
  events: CalendarEvent[];
  loading?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
};

export function EventList({ events, loading, onEdit, onDelete }: EventListProps) {
  if (!loading && events.length === 0) {
    return (
      <Card className="p-10">
        <EmptyState
          title="Nenhum evento encontrado"
          description="Ajuste os filtros ou atualize a agenda para ver os compromissos."
          icon={<CalendarRange className="h-10 w-10" />}
        />
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">Eventos</p>
          <p className="text-lg font-semibold text-zinc-900">
            {events.length} registro{events.length === 1 ? "" : "s"}
          </p>
        </div>
        {loading && <Spinner size="sm" />}
      </div>
      <ul className="divide-y divide-zinc-100">
        {loading && events.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex animate-pulse gap-3">
                    <div className="h-4 w-32 rounded-full bg-zinc-200" />
                    <div className="h-4 w-48 rounded-full bg-zinc-100" />
                  </div>
                </div>
              </li>
            ))
          : events.map((event) => (
              <li key={event.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                {event ? (
                <>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-zinc-900">
                        {event.summary}
                      </h3>
                      {event.tipoEvento && (
                        <Badge variant="default">{event.tipoEvento}</Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-600">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>
                          {formatDateTime(event.start.dateTime, "dd/MM/yyyy HH:mm")}{" "}
                          até {formatDateTime(event.end.dateTime, "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      {event.location && (
                        <div className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                      onClick={() => onEdit?.(event)}
                    >
                      <PencilLine className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => onDelete?.(event)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full animate-pulse space-y-3">
                  <div className="h-4 w-48 rounded-full bg-zinc-200" />
                  <div className="h-3 w-72 rounded-full bg-zinc-100" />
                  <div className="h-3 w-64 rounded-full bg-zinc-100" />
                </div>
              )}
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}

