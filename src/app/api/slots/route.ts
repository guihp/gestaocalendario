import { NextResponse } from "next/server";
import { z } from "zod";
import { agendarHorario, WebhookError } from "@/lib/api";

const slotSchema = z.object({
  calendarId: z.string().min(1),
  calendarName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  contactName: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = slotSchema.parse(body);

    const result = await agendarHorario(payload);

    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
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
      { error: "Erro inesperado ao agendar horário" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";

