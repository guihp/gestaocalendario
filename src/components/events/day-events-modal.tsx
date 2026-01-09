"use client";

import { CalendarEvent } from "@/types/schedule";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/date";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PencilLine, Trash2 } from "lucide-react";

type DayEventsModalProps = {
  open: boolean;
  date: Date | null;
  events: CalendarEvent[];
  timezone: string;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
};

export function DayEventsModal({
  open,
  date,
  events,
  timezone,
  onClose,
  onEdit,
  onDelete,
}: DayEventsModalProps) {
  if (!date) return null;

  const dateFormatted = formatDateTime(date.toISOString(), "dd/MM/yyyy", timezone);
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.start.dateTime).getTime();
    const timeB = new Date(b.start.dateTime).getTime();
    return timeA - timeB;
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Eventos do dia ${dateFormatted}`}
      description={`${events.length} evento${events.length === 1 ? "" : "s"} encontrado${events.length === 1 ? "" : "s"}`}
      size="lg"
    >
      <div className="max-h-[60vh] overflow-y-auto">
        {sortedEvents.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            Nenhum evento encontrado para este dia.
          </div>
        ) : (
          <ul className="space-y-3">
            {sortedEvents.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition hover:border-blue-300 hover:bg-blue-50/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {event.summary}
                    </h3>
                    {event.description && (
                      <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-600">
                      <div className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span>
                          {formatDateTime(event.start.dateTime, "HH:mm", timezone)}{" "}
                          - {formatDateTime(event.end.dateTime, "HH:mm", timezone)}
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
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          onEdit(event);
                          onClose();
                        }}
                      >
                        <PencilLine className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          onDelete(event);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}






