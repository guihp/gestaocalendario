import { NextResponse } from "next/server";
import { z } from "zod";
import { bloquearMes, WebhookError } from "@/lib/api";

const blockMonthSchema = z.object({
  calendarId: z.string().min(1),
  calendarName: z.string().min(1),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1970),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = blockMonthSchema.parse(body);

    const result = await bloquearMes({
      calendarId: payload.calendarId,
      calendarName: payload.calendarName,
      month: payload.month,
      year: payload.year,
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
      { error: "Erro inesperado ao bloquear mês" },
      { status: 500 },
    );
  }
}

export const runtime = "nodejs";

