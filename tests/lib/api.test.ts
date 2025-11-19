import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deletarEvento,
  editarEvento,
  listarCalendarios,
  listarEventos,
  WebhookError,
} from "@/lib/api";
import { EventUpdateInput } from "@/types/schedule";

const baseFilters = {
  calendarId: "cal-123",
  start: "2025-10-01T00:00:00.000Z",
  end: "2025-10-31T23:59:59.999Z",
  month: 10,
  year: 2025,
};

const updatePayload: EventUpdateInput = {
  summary: "Reunião de teste",
  description: "Detalhes",
  location: "Sala 1",
  start: {
    dateTime: "2025-10-10T10:00:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
  end: {
    dateTime: "2025-10-10T11:00:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
  tipo_evento: "Reunião",
  data_evento: "2025-10-10T10:00:00.000Z",
  hora_evento: "10:00",
  calendar_id: "cal-123",
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("lib/api", () => {
  it("normaliza eventos vindos do webhook", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: "evt-1",
          summary: "Visita técnica",
          start: { dateTime: "2025-10-10T10:00:00.000Z" },
          end: { dateTime: "2025-10-10T11:00:00.000Z" },
          tipo_evento: "Visita",
        },
      ],
    } as Response);

    const events = await listarEventos(baseFilters);
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe("Visita técnica");
    expect(events[0].tipoEvento).toBe("Visita");
    expect(mockFetch).toHaveBeenCalledWith(process.env.VER_AGENDA_WEBHOOK, expect.any(Object));
  });

  it("lança WebhookError quando o serviço retorna status inválido", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ error: "fail" }),
    } as Response);

    await expect(listarEventos(baseFilters)).rejects.toBeInstanceOf(WebhookError);
  });

  it("envia payload correto ao editar evento", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await editarEvento({ eventoId: "evt-1", update: updatePayload });
    expect(mockFetch).toHaveBeenCalledWith(
      process.env.EDITAR_EVENTO_WEBHOOK,
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Reunião de teste"),
      }),
    );
  });

  it("envia dados necessários ao deletar evento", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    await deletarEvento({ calendarId: "cal-123", eventoId: "evt-1" });
    expect(mockFetch).toHaveBeenCalledWith(
      process.env.DELETAR_EVENTO_WEBHOOK,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          calendar_id: "cal-123",
          evento_id: "evt-1",
        }),
      }),
    );
  });

  it("normaliza calendários vindos do webhook com chave calendars", async () => {
    const mockFetch = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => [
        {
          count: 1,
          calendars: [
            {
              "Calendar Name": "Agenda iClinic",
              "Calendar ID": "agenda@group.calendar.google.com",
              "Time Zone": "America/Sao_Paulo",
              "Primary Calendar": "Yes",
            },
          ],
        },
      ],
    } as Response);

    const items = await listarCalendarios();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "agenda@group.calendar.google.com",
      name: "Agenda iClinic",
      timezone: "America/Sao_Paulo",
      primary: true,
    });
    expect(mockFetch).toHaveBeenCalledWith(
      process.env.ID_AGENDAS_WEBHOOK,
      expect.any(Object),
    );
  });
});

