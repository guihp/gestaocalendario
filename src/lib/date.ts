import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { clientConfig } from "@/lib/config";

const BRAZILIAN_PATTERN = "dd/MM/yyyy HH:mm";

export function formatDateTime(
  dateIso: string,
  pattern = BRAZILIAN_PATTERN,
  timeZone = clientConfig.timezone,
) {
  return formatInTimeZone(dateIso, timeZone, pattern);
}

export function getMonthRange(month: number, year: number, timeZone = clientConfig.timezone) {
  const monthString = `${month}`.padStart(2, "0");
  const daysInMonth = new Date(year, month, 0).getDate();
  const rangeStart = fromZonedTime(
    `${year}-${monthString}-01T00:00:00`,
    timeZone,
  );
  const rangeEnd = fromZonedTime(
    `${year}-${monthString}-${daysInMonth}T23:59:59`,
    timeZone,
  );

  return {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    startLabel: formatDateTime(rangeStart.toISOString(), BRAZILIAN_PATTERN, timeZone),
    endLabel: formatDateTime(rangeEnd.toISOString(), BRAZILIAN_PATTERN, timeZone),
    label: `${formatDateTime(rangeStart.toISOString(), "dd/MM/yyyy", timeZone)} até ${formatDateTime(rangeEnd.toISOString(), "dd/MM/yyyy", timeZone)}`,
  };
}

export function ensureIsoDate(date: string | Date) {
  if (typeof date === "string") {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

export function toDateTimeLocalInput(
  dateIso: string,
  timeZone = clientConfig.timezone,
) {
  return formatInTimeZone(dateIso, timeZone, "yyyy-MM-dd'T'HH:mm");
}

export function fromDateTimeLocalInput(
  value: string,
  timeZone = clientConfig.timezone,
) {
  return fromZonedTime(value, timeZone).toISOString();
}

export function formatHourLabel(
  dateIso: string,
  timeZone = clientConfig.timezone,
) {
  return formatInTimeZone(dateIso, timeZone, "HH:mm");
}

export function getDateKey(
  dateIso: string,
  pattern = "yyyy-MM-dd",
  timeZone = clientConfig.timezone,
) {
  return formatInTimeZone(dateIso, timeZone, pattern);
}

export function formatWithOffset(
  dateIso: string,
  pattern = "yyyy-MM-dd'T'HH:mm:ssXXX",
  timeZone = clientConfig.timezone,
) {
  return formatInTimeZone(dateIso, timeZone, pattern);
}

export function getMonthYearFromDate(
  dateIso: string,
  timeZone = clientConfig.timezone,
) {
  const dateStr = formatInTimeZone(dateIso, timeZone, "yyyy-MM-dd");
  const [year, month] = dateStr.split("-").map(Number);
  return { month, year };
}

export function getRollingRange(
  baseDate: Date | string,
  days: number,
  timeZone = clientConfig.timezone,
) {
  const baseIso = typeof baseDate === "string" ? baseDate : baseDate.toISOString();
  const baseDateStr = formatInTimeZone(baseIso, timeZone, "yyyy-MM-dd");
  const start = fromZonedTime(`${baseDateStr}T00:00:00`, timeZone);
  
  const endDate = new Date(start);
  endDate.setUTCDate(endDate.getUTCDate() + days);
  const endDateStr = formatInTimeZone(endDate.toISOString(), timeZone, "yyyy-MM-dd");
  const end = fromZonedTime(`${endDateStr}T23:59:59`, timeZone);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startLabel: formatDateTime(start.toISOString(), BRAZILIAN_PATTERN, timeZone),
    endLabel: formatDateTime(end.toISOString(), BRAZILIAN_PATTERN, timeZone),
    label: `${formatDateTime(start.toISOString(), "dd/MM/yyyy", timeZone)} até ${formatDateTime(end.toISOString(), "dd/MM/yyyy", timeZone)}`,
  };
}

export function getDayRange(
  dateIso: string,
  timeZone = clientConfig.timezone,
) {
  // Extrair a data no timezone especificado, garantindo que usamos o dia correto
  const dateStr = formatInTimeZone(dateIso, timeZone, "yyyy-MM-dd");
  // Criar início e fim do dia no timezone especificado
  const start = fromZonedTime(`${dateStr}T00:00:00`, timeZone);
  const end = fromZonedTime(`${dateStr}T23:59:59`, timeZone);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export function getDayRangeFromDateString(
  dateString: string, // formato "yyyy-MM-dd"
  timeZone = clientConfig.timezone,
) {
  // Criar início e fim do dia diretamente da string de data
  const start = fromZonedTime(`${dateString}T00:00:00`, timeZone);
  const end = fromZonedTime(`${dateString}T23:59:59`, timeZone);

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export { fromZonedTime } from "date-fns-tz";

