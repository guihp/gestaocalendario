import { NextResponse } from "next/server";
import { z } from "zod";
import {
  criarCalendario,
  listarCalendarios,
  WebhookError,
} from "@/lib/api";

const calendarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  timezone: z.string().optional(),
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

export async function GET() {
  try {
    const items = await listarCalendarios();
    return NextResponse.json({ calendars: items });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = calendarSchema.parse(body);
    const result = await criarCalendario(payload);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export const runtime = "nodejs";

