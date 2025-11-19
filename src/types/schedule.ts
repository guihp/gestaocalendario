export type DateTimeValue = {
  dateTime: string;
  timeZone?: string;
};

export type CalendarEvent = {
  id: string;
  calendarId?: string;
  summary: string;
  description?: string;
  location?: string;
  start: DateTimeValue;
  end: DateTimeValue;
  tipoEvento?: string;
  dataEvento?: string;
  horaEvento?: string;
  raw?: Record<string, unknown>;
};

export type EventUpdateInput = {
  summary: string;
  description?: string;
  location?: string;
  start: DateTimeValue;
  end: DateTimeValue;
  tipo_evento?: string;
  data_evento?: string;
  hora_evento?: string;
  calendar_id?: string;
};

export type ListEventsFilters = {
  calendarId: string;
  start: string; // ISO date
  end: string; // ISO date
  month: number;
  year: number;
  tipoBusca?: "individual" | "mensal" | "periodo";
};

export type CalendarRef = {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  primary?: boolean;
  raw?: Record<string, unknown>;
};

export type CalendarMutationInput = {
  id?: string;
  calendar_id?: string;
  name: string;
  description?: string;
  timezone?: string;
  [key: string]: unknown;
};

export type QuickScheduleInput = {
  calendarId: string;
  calendarName: string;
  title: string;
  description: string;
  contactName: string;
  start: string;
  end: string;
  timezone?: string;
};

