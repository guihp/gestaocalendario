import { NextResponse } from "next/server";
import { removerCalendario, WebhookError } from "@/lib/api";

type RouteParams = {
  params: Promise<{
    calendarId: string;
  }>;
};

function handleError(error: unknown) {
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

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { calendarId } = await params;
    const result = await removerCalendario(calendarId);
    return NextResponse.json({ result });
  } catch (error) {
    return handleError(error);
  }
}

export const runtime = "nodejs";

