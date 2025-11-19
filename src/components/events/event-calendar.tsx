"use client";

import { CalendarEvent } from "@/types/schedule";
import { clsx } from "clsx";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { getDateKey, formatDateTime, fromZonedTime } from "@/lib/date";
import { clientConfig } from "@/lib/config";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type EventCalendarProps = {
  month: number;
  year: number;
  events: CalendarEvent[];
  timezone: string;
  onSelectEvent?: (event: CalendarEvent) => void;
  onCreateSlot?: (dateIso: string) => void;
};

export function EventCalendar({
  month,
  year,
  events,
  timezone,
  onSelectEvent,
  onCreateSlot,
}: EventCalendarProps) {
  // Criar data no timezone correto
  const monthDateStr = `${year}-${String(month).padStart(2, "0")}-01T00:00:00`;
  const monthStart = fromZonedTime(monthDateStr, timezone);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsByDay = events.reduce<Record<string, CalendarEvent[]>>(
    (acc, event) => {
      // Usar o timezone do evento se disponível, senão usar o timezone padrão
      const eventTimezone = event.start.timeZone ?? timezone;
      const key = getDateKey(event.start.dateTime, "yyyy-MM-dd", eventTimezone);
      acc[key] = acc[key] ? [...acc[key], event] : [event];
      return acc;
    },
    {},
  );

  return (
    <div className="rounded-3xl border border-white/30 bg-gradient-to-b from-white/95 via-white/90 to-blue-50/60 shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/40 px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-500">Calendário</p>
          <p className="text-2xl font-semibold text-slate-900">
            {formatDateTime(
              monthStart.toISOString(),
              "MMMM 'de' yyyy",
              timezone,
            )}
          </p>
        </div>
        <p className="text-xs text-slate-600">
          Fuso: <span className="font-semibold">{timezone}</span>
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1 border-b border-white/30 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-4 text-sm">
        {days.map((date) => {
          const key = getDateKey(date.toISOString(), "yyyy-MM-dd", timezone);
          const dayEvents = eventsByDay[key] ?? [];
          const isCurrentMonth = date.getUTCMonth() === monthStart.getUTCMonth();
          const isTodayDate = isToday(date);

          return (
            <button
              key={key}
              className={clsx(
                "group flex h-full min-h-[120px] flex-col rounded-2xl border p-3 text-left transition-all duration-200",
                isCurrentMonth
                  ? "border-white/40 bg-white/70 text-slate-800"
                  : "border-transparent bg-white/30 text-slate-400",
                dayEvents.length > 0 && "border-blue-300 bg-blue-50/60 shadow-lg",
                "cursor-pointer hover:-translate-y-1 hover:border-blue-400 hover:bg-white hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
              )}
              type="button"
              onClick={() => onCreateSlot?.(date.toISOString())}
            >
              <div
                className={clsx(
                  "flex items-center justify-between text-xs font-semibold",
                  isTodayDate ? "text-blue-600" : "text-slate-500",
                )}
              >
                <div className="flex items-center gap-2">
                  {isTodayDate && (
                    <span className="h-2 w-2 rounded-full bg-orange-500 shadow-sm" />
                  )}
                  <span>{date.getUTCDate()}</span>
                </div>
                {isTodayDate && (
                  <span className="rounded-full bg-blue-100/80 px-2 py-0.5 text-[10px] uppercase text-blue-700 shadow-sm">
                    Hoje
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={(eventClick) => {
                      eventClick.stopPropagation();
                      onSelectEvent?.(event);
                    }}
                    className="flex w-full flex-col rounded-xl bg-white/90 p-2 text-left text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <span className="font-semibold text-slate-900">
                      {event.summary}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(event.start.dateTime, "HH:mm", timezone)}{" "}
                      - {formatDateTime(event.end.dateTime, "HH:mm", timezone)}
                    </span>
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-medium text-blue-600">
                    +{dayEvents.length - 3} evento(s)
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

