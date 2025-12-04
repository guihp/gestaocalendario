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
  onViewDayEvents?: (date: Date, events: CalendarEvent[]) => void;
};

export function EventCalendar({
  month,
  year,
  events,
  timezone,
  onSelectEvent,
  onCreateSlot,
  onViewDayEvents,
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
      <div className="border-b border-white/40 bg-gradient-to-r from-blue-50/50 to-white/80 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
              Calendário
            </p>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl">
              {formatDateTime(
                monthStart.toISOString(),
                "MMMM 'de' yyyy",
                timezone,
              )}
            </h2>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            <div className="flex items-center gap-2.5 rounded-xl bg-white/90 px-3.5 py-2.5 shadow-md ring-1 ring-blue-100/50 backdrop-blur-sm">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 leading-tight">
                  Fuso Horário
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  {timezone.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 border-b border-white/30 bg-white/40 px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 text-center">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wider text-slate-600"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 p-3 sm:gap-3 sm:p-4 md:gap-4 md:p-6 text-sm">
        {days.map((date) => {
          const key = getDateKey(date.toISOString(), "yyyy-MM-dd", timezone);
          const dayEvents = eventsByDay[key] ?? [];
          const isCurrentMonth = date.getUTCMonth() === monthStart.getUTCMonth();
          const isTodayDate = isToday(date);

          return (
            <div
              key={key}
              className={clsx(
                "group flex h-full min-h-[180px] sm:min-h-[200px] md:min-h-[220px] lg:min-h-[240px] flex-col rounded-2xl border p-2 sm:p-3 md:p-4 text-left transition-all duration-200",
                isCurrentMonth
                  ? "border-white/40 bg-white/70 text-slate-800"
                  : "border-transparent bg-white/30 text-slate-400",
                dayEvents.length > 0 && "border-blue-300 bg-blue-50/60 shadow-lg",
                "cursor-pointer hover:-translate-y-1 hover:border-blue-400 hover:bg-white hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500",
              )}
              role="button"
              tabIndex={0}
              onClick={() => onCreateSlot?.(date.toISOString())}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onCreateSlot?.(date.toISOString());
                }
              }}
            >
              <div
                className={clsx(
                  "flex items-center justify-between text-xs sm:text-sm font-semibold",
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

              <div 
                className={clsx(
                  "mt-2 space-y-1.5 overflow-hidden",
                  dayEvents.length > 0 && "cursor-pointer"
                )}
                onClick={(e) => {
                  if (dayEvents.length > 0 && onViewDayEvents) {
                    e.stopPropagation();
                    onViewDayEvents(date, dayEvents);
                  }
                }}
              >
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={(eventClick) => {
                      eventClick.stopPropagation();
                      onSelectEvent?.(event);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectEvent?.(event);
                      }
                    }}
                    className="flex w-full flex-col gap-1 rounded-xl bg-white/90 p-2 text-left shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 cursor-pointer"
                  >
                    <span className="line-clamp-1 text-xs font-semibold text-slate-900 sm:text-sm">
                      {event.summary}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 sm:text-xs">
                      <svg
                        className="h-3 w-3 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="whitespace-nowrap">
                        {formatDateTime(event.start.dateTime, "HH:mm", timezone)}
                      </span>
                      <span className="text-slate-400">-</span>
                      <span className="whitespace-nowrap">
                        {formatDateTime(event.end.dateTime, "HH:mm", timezone)}
                      </span>
                    </div>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDayEvents?.(date, dayEvents);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onViewDayEvents?.(date, dayEvents);
                      }
                    }}
                    className="w-full rounded-lg bg-blue-50/80 px-2 py-1.5 text-left text-[10px] font-semibold text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition sm:text-xs cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    +{dayEvents.length - 3} evento{dayEvents.length - 3 > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

