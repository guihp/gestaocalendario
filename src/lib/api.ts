import { env } from "@/lib/env";
import {
  CalendarEvent,
  CalendarMutationInput,
  CalendarRef,
  EventUpdateInput,
  ListEventsFilters,
  QuickScheduleInput,
} from "@/types/schedule";
import { formatDateTime, formatWithOffset, getDateKey, getDayRange, getDayRangeFromDateString } from "@/lib/date";
import { fromZonedTime } from "date-fns-tz";

type WebhookEnvelope<T> = {
  body?: T;
  data?: T;
  result?: T;
  eventos?: T;
  items?: T;
};

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export class WebhookError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "WebhookError";
    this.status = status;
    this.details = details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function unwrapWebhookPayload<T>(value: unknown): T {
  if (Array.isArray(value) && value.length === 1) {
    const [first] = value;
    if (isRecord(first)) {
      if ("body" in first) {
        return unwrapWebhookPayload(first.body);
      }
      if ("data" in first) {
        return unwrapWebhookPayload(first.data);
      }
    }
  }

  if (isRecord(value)) {
    const record = value as WebhookEnvelope<T>;
    if (record.body) return unwrapWebhookPayload(record.body);
    if (record.data) return unwrapWebhookPayload(record.data);
    if (record.result) return unwrapWebhookPayload(record.result);
    if (record.eventos) return unwrapWebhookPayload(record.eventos);
    if (record.items) return unwrapWebhookPayload(record.items);
  }

  return value as T;
}

function normalizeDateField(value: unknown): { dateTime: string; timeZone?: string } {
  if (typeof value === "string") {
    const dateStr = value.trim();
    
    // Se já tem timezone (Z ou +/-offset), usar como está mas adicionar timeZone
    if (dateStr.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(dateStr)) {
      return { dateTime: dateStr, timeZone: env.timezone };
    }
    
    // Se não tem timezone, assumir que está no timezone do sistema
    // Converter para ISO mantendo a data/hora no timezone correto
    try {
      // Se for formato "yyyy-MM-ddTHH:mm:ss" sem timezone, adicionar timezone
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateStr)) {
        // Converter do timezone do sistema para UTC/ISO
        const zonedDate = fromZonedTime(dateStr, env.timezone);
        return { dateTime: zonedDate.toISOString(), timeZone: env.timezone };
      }
      
      // Se for apenas data "yyyy-MM-dd", adicionar hora 00:00:00
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const zonedDate = fromZonedTime(`${dateStr}T00:00:00`, env.timezone);
        return { dateTime: zonedDate.toISOString(), timeZone: env.timezone };
      }
      
      return { dateTime: dateStr, timeZone: env.timezone };
    } catch {
      return { dateTime: dateStr, timeZone: env.timezone };
    }
  }

  if (isRecord(value) && typeof value.dateTime === "string") {
    return {
      dateTime: value.dateTime,
      timeZone: typeof value.timeZone === "string" ? value.timeZone : env.timezone,
    };
  }

  return { dateTime: new Date().toISOString(), timeZone: env.timezone };
}

function stringOrUndefined(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function normalizeEvent(raw: unknown): CalendarEvent {
  const record = isRecord(raw) ? raw : {};
  const idSource =
    stringOrUndefined(record.id) ??
    stringOrUndefined(record.evento_id) ??
    stringOrUndefined(record.eventId) ??
    crypto.randomUUID();

  // Buscar data de início - verificar vários campos possíveis
  // Prioridade: start.dateTime > start.date (all-day) > start > inicial > data_evento > outros
  let startCandidate: unknown;
  if (isRecord(record.start)) {
    if (typeof record.start.dateTime === "string") {
      startCandidate = record.start;
    } else if (typeof record.start.date === "string") {
      // Evento de dia inteiro - converter date para dateTime com 00:00:00 no timezone
      const zonedDate = fromZonedTime(`${record.start.date}T00:00:00`, env.timezone);
      startCandidate = { dateTime: zonedDate.toISOString(), timeZone: env.timezone };
    } else if (typeof record.start === "string") {
      startCandidate = record.start;
    } else {
      startCandidate = record.start;
    }
  } else if (typeof record.start === "string") {
    startCandidate = record.start;
  } else if (typeof record.inicial === "string") {
    startCandidate = record.inicial;
  } else if (typeof record.data_evento === "string") {
    startCandidate = record.data_evento;
  } else if (typeof record.startDate === "string") {
    startCandidate = record.startDate;
  } else if (typeof record.start_time === "string") {
    startCandidate = record.start_time;
  } else {
    startCandidate = new Date().toISOString();
  }

  // Buscar data de fim - verificar vários campos possíveis
  // Prioridade: end.dateTime > end.date (all-day) > end > final > data_final > outros
  let endCandidate: unknown;
  if (isRecord(record.end)) {
    if (typeof record.end.dateTime === "string") {
      endCandidate = record.end;
    } else if (typeof record.end.date === "string") {
      // Evento de dia inteiro - end.date é exclusivo (dia seguinte)
      // Se end.date = "2025-11-21", significa que termina no fim de "2025-11-20"
      // Converter para 23:59:59 do dia anterior no timezone
      const endDate = new Date(record.end.date + "T00:00:00");
      endDate.setUTCDate(endDate.getUTCDate() - 1);
      const endDateStr = endDate.toISOString().split('T')[0];
      const zonedDate = fromZonedTime(`${endDateStr}T23:59:59`, env.timezone);
      endCandidate = { dateTime: zonedDate.toISOString(), timeZone: env.timezone };
    } else if (typeof record.end === "string") {
      endCandidate = record.end;
    } else {
      endCandidate = record.end;
    }
  } else if (typeof record.end === "string") {
    endCandidate = record.end;
  } else if (typeof record.final === "string") {
    endCandidate = record.final;
  } else if (typeof record.data_final === "string") {
    endCandidate = record.data_final;
  } else if (typeof record.endDate === "string") {
    endCandidate = record.endDate;
  } else if (typeof record.end_time === "string") {
    endCandidate = record.end_time;
  } else {
    endCandidate = startCandidate;
  }

  return {
    id: idSource,
    calendarId: stringOrUndefined(record.calendar_id),
    summary: stringOrUndefined(record.summary) ?? stringOrUndefined(record.titulo) ?? "Evento sem título",
    description: stringOrUndefined(record.description) ?? stringOrUndefined(record.descricao),
    location: stringOrUndefined(record.location) ?? stringOrUndefined(record.localizacao),
    start: normalizeDateField(startCandidate),
    end: normalizeDateField(endCandidate),
    tipoEvento: stringOrUndefined(record.tipo_evento),
    dataEvento: stringOrUndefined(record.data_evento),
    horaEvento: stringOrUndefined(record.hora_evento),
    raw: record,
  };
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["yes", "true", "sim"].includes(value.toLowerCase());
  }
  return undefined;
}

function normalizeCalendar(raw: unknown): CalendarRef {
  const record = isRecord(raw) ? raw : {};
  const id =
    stringOrUndefined(record.id) ??
    stringOrUndefined(record.calendar_id) ??
    stringOrUndefined(record.calendarId) ??
    stringOrUndefined(record["Calendar ID"]) ??
    crypto.randomUUID();

  const name =
    stringOrUndefined(record.name) ??
    stringOrUndefined(record.summary) ??
    stringOrUndefined(record["Calendar Name"]) ??
    id;

  const timezone =
    stringOrUndefined(record.timezone) ??
    stringOrUndefined(record.timeZone) ??
    stringOrUndefined(record["Time Zone"]);

  const description =
    stringOrUndefined(record.description) ??
    stringOrUndefined(record["Default Reminders"]);

  return {
    id,
    name,
    description,
    timezone,
    primary:
      toBoolean(record.primary) ??
      toBoolean(record["Primary Calendar"]) ??
      undefined,
    raw: record,
  };
}

function extractCalendarsFromPayload(value: unknown): unknown[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractCalendarsFromPayload(item));
  }

  if (isRecord(value)) {
    if (Array.isArray(value.calendars)) {
      return value.calendars;
    }
    if (Array.isArray(value.items)) {
      return value.items;
    }
  }

  return [value];
}

async function postWebhook<T>(url: string, payload: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(payload),
    cache: "no-store",
    ...init,
  });

  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new WebhookError(
      `Falha ao chamar webhook ${url}`,
      response.status,
      data ?? payload,
    );
  }

  return (data ?? ({} as T)) as T;
}

export async function listarEventos(filters: ListEventsFilters): Promise<CalendarEvent[]> {
  const payload = {
    tipo_busca: filters.tipoBusca ?? "individual",
    calendar_id: filters.calendarId,
    data_inicial: filters.start,
    data_final: filters.end,
    mes: filters.month,
    ano: filters.year,
    data_inicial_formatada: formatDateTime(filters.start),
    data_final_formatada: formatDateTime(filters.end),
    periodo: `${formatDateTime(filters.start, "dd/MM/yyyy")} até ${formatDateTime(filters.end, "dd/MM/yyyy")}`,
  };

  const response = await postWebhook<unknown>(env.VER_AGENDA_WEBHOOK, payload);
  const content = unwrapWebhookPayload<unknown>(response);

  const list = Array.isArray(content)
    ? content
    : isRecord(content)
      ? (Object.values(content).find(Array.isArray) as unknown[]) ?? [content]
      : [content];

  return list.filter(Boolean).map((item) => normalizeEvent(item));
}

export async function editarEvento(input: {
  eventoId?: string;
  update: EventUpdateInput;
}) {
  const payload = {
    ...(input.eventoId ? { evento_id: input.eventoId } : {}),
    update: input.update,
  };

  const response = await postWebhook<unknown>(env.EDITAR_EVENTO_WEBHOOK, payload);
  return unwrapWebhookPayload(response);
}

export async function deletarEvento(input: {
  calendarId: string;
  eventoId: string;
}) {
  const payload = {
    calendar_id: input.calendarId,
    evento_id: input.eventoId,
  };

  const response = await postWebhook<unknown>(env.DELETAR_EVENTO_WEBHOOK, payload);
  return unwrapWebhookPayload(response);
}

export async function listarCalendarios(
  payload: Record<string, unknown> = { action: "listar" },
): Promise<CalendarRef[]> {
  const response = await postWebhook<unknown>(env.ID_AGENDAS_WEBHOOK, payload);
  const content = unwrapWebhookPayload<unknown>(response);
  const list = extractCalendarsFromPayload(content);
  return list.filter(Boolean).map((item) => normalizeCalendar(item));
}

export async function criarCalendario(input: CalendarMutationInput) {
  const payload = {
    action: "criar",
    ...input,
  };
  const response = await postWebhook<unknown>(env.ID_AGENDAS_WEBHOOK, payload);
  return unwrapWebhookPayload(response);
}

export async function removerCalendario(calendarId: string) {
  const payload = {
    action: "remover",
    calendar_id: calendarId,
  };
  const response = await postWebhook<unknown>(env.ID_AGENDAS_WEBHOOK, payload);
  return unwrapWebhookPayload(response);
}

export async function agendarHorario(input: QuickScheduleInput) {
  const timezone = input.timezone ?? env.timezone;
  const slot = {
    calendar_id: input.calendarId,
    calendar_name: input.calendarName,
    titulo: input.title,
    descricao: input.description,
    nome: input.contactName,
    inicial: formatWithOffset(input.start, "yyyy-MM-dd'T'HH:mm:ssXXX", timezone),
    final: formatWithOffset(input.end, "yyyy-MM-dd'T'HH:mm:ssXXX", timezone),
  };

  const response = await postWebhook<unknown>(env.MARCAR_EVENTO_WEBHOOK, [slot]);
  return unwrapWebhookPayload(response);
}

export async function marcarFeriado(input: {
  calendarId: string;
  calendarName: string;
  date: string; // ISO string ou date string "yyyy-MM-dd"
  timezone?: string;
}) {
  const timezone = input.timezone ?? env.timezone;
  
  // Se a data já está no formato "yyyy-MM-dd", usar diretamente
  // Caso contrário, extrair a data do ISO usando getDateKey
  let dateStr: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    dateStr = input.date;
  } else {
    dateStr = getDateKey(input.date, "yyyy-MM-dd", timezone);
  }
  
  const { start, end } = getDayRangeFromDateString(dateStr, timezone);
  
  const feriado = {
    calendar_id: input.calendarId,
    calendar_name: input.calendarName,
    titulo: "Feriado",
    inicial: formatWithOffset(start, "yyyy-MM-dd'T'HH:mm:ssXXX", timezone),
    final: formatWithOffset(end, "yyyy-MM-dd'T'HH:mm:ssXXX", timezone),
  };

  const response = await postWebhook<unknown>(env.MARCAR_FERIADO_WEBHOOK, [feriado]);
  return unwrapWebhookPayload(response);
}

