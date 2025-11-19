import { NextResponse } from "next/server";
import { z } from "zod";
import { deletarEvento, editarEvento, WebhookError } from "@/lib/api";

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

const deleteSchema = z.object({
  calendarId: z.string().min(1),
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

type RouteParams = {
  params: Promise<{
    eventoId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { eventoId } = await params;
    const body = await request.json();
    const payload = eventUpdateSchema.parse(body);
    const result = await editarEvento({ eventoId, update: payload });

    return NextResponse.json({ result });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { eventoId } = await params;
    const body = await request.json();
    const parsed = deleteSchema.parse(body);

    const result = await deletarEvento({
      calendarId: parsed.calendarId,
      eventoId,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return handleError(error);
  }
}

export const runtime = "nodejs";

