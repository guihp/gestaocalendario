import { describe, expect, it } from "vitest";
import {
  formatHourLabel,
  fromDateTimeLocalInput,
  getMonthRange,
  toDateTimeLocalInput,
} from "@/lib/date";

describe("date helpers", () => {
  it("retorna intervalo completo para um mês específico", () => {
    const range = getMonthRange(10, 2025);
    expect(range.start).toContain("2025");
    expect(range.end).toContain("2025");
    expect(range.startLabel).toBe("01/10/2025 00:00");
    expect(range.endLabel).toBe("31/10/2025 23:59");
    expect(range.label).toBe("01/10/2025 até 31/10/2025");
  });

  it("converte ISO para valor compatível com input datetime-local", () => {
    const value = toDateTimeLocalInput("2025-10-01T15:00:00.000Z");
    expect(value).toBe("2025-10-01T12:00");
  });

  it("converte valor local para ISO em UTC", () => {
    const iso = fromDateTimeLocalInput("2025-10-01T12:00");
    expect(iso).toBe("2025-10-01T15:00:00.000Z");
  });

  it("formata apenas a hora considerando timezone", () => {
    const hour = formatHourLabel("2025-10-01T15:00:00.000Z");
    expect(hour).toBe("12:00");
  });
});

