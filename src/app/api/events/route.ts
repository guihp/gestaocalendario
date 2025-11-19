import { NextResponse } from "next/server";
import { z } from "zod";
import { editarEvento, listarEventos, WebhookError } from "@/lib/api";

const eventsFilterSchema = z.object({
  calendarId: z.string().min(1, "calendarId é obrigatório"),
  start: z.string().datetime({ message: "start deve estar em ISO 8601" }),
  end: z.string().datetime({ message: "end deve estar em ISO 8601" }),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(1970),
  tipoBusca: z.enum(["individual", "mensal", "periodo"]).optional(),
});

const eventUpdateSchema = z.object({
  summary: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  start: z.object({
    dateTime: z.string().datetime(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime(),
    timeZone: z.string().optional(),
  }),
  tipo_evento: z.string().optional(),
  data_evento: z.string().optional(),
  hora_evento: z.string().optional(),
  calendar_id: z.string().optional(),
});

function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.flatten() }, { status: 400 });
  }

  if (error instanceof WebhookError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status ?? 502 },
    );
  }

  return NextResponse.json(
    { error: "Erro inesperado ao processar solicitação" },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = Object.fromEntries(url.searchParams.entries());
    const filters = eventsFilterSchema.parse(query);
    const events = await listarEventos({
      calendarId: filters.calendarId,
      start: filters.start,
      end: filters.end,
      month: filters.month,
      year: filters.year,
      tipoBusca: filters.tipoBusca,
    });

    return NextResponse.json({ events });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = eventUpdateSchema.parse(body);
    const result = await editarEvento({ update: payload });
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export const runtime = "nodejs";

