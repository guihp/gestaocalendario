import { NextResponse } from "next/server";
import { z } from "zod";
import { marcarFeriado, WebhookError } from "@/lib/api";

const holidaySchema = z.object({
  calendarId: z.string().min(1),
  calendarName: z.string().min(1),
  date: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = holidaySchema.parse(body);

    const result = await marcarFeriado({
      calendarId: payload.calendarId,
      calendarName: payload.calendarName,
      date: payload.date,
    });

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
      { error: "Erro inesperado ao adicionar feriado" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";

