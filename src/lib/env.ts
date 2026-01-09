import { z } from "zod";

const serverSchema = z.object({
  VER_AGENDA_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/ver-agenda_pl_ia",
    ),
  EDITAR_EVENTO_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/editar-evento_pl_ia",
    ),
  DELETAR_EVENTO_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/deletar-evento",
    ),
  ID_AGENDAS_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/id_agendas",
    ),
  MARCAR_EVENTO_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/marcar-agendamento-andressa-painel",
    ),
  MARCAR_FERIADO_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/marcar-feriado-andressa-painel",
    ),
  BLOQUEAR_MES_WEBHOOK: z
    .string()
    .url()
    .default(
      "https://n8n-vkg840wg44kg4040oooo0csk.medmasters.ai/webhook/marcar-mes-andressa-painel",
    ),
  DEFAULT_TIMEZONE: z.string().optional().default("America/Sao_Paulo"),
});

const publicSchema = z.object({
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().optional(),
});

const parsedServer = serverSchema.safeParse({
  VER_AGENDA_WEBHOOK: process.env.VER_AGENDA_WEBHOOK,
  EDITAR_EVENTO_WEBHOOK: process.env.EDITAR_EVENTO_WEBHOOK,
  DELETAR_EVENTO_WEBHOOK: process.env.DELETAR_EVENTO_WEBHOOK,
  ID_AGENDAS_WEBHOOK: process.env.ID_AGENDAS_WEBHOOK,
  MARCAR_EVENTO_WEBHOOK: process.env.MARCAR_EVENTO_WEBHOOK,
  MARCAR_FERIADO_WEBHOOK: process.env.MARCAR_FERIADO_WEBHOOK,
  BLOQUEAR_MES_WEBHOOK: process.env.BLOQUEAR_MES_WEBHOOK,
  DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE,
});

if (!parsedServer.success) {
  const message = parsedServer.error.message;
  throw new Error(`Variáveis de ambiente inválidas: ${message}`);
}

const parsedPublic = publicSchema.parse({
  NEXT_PUBLIC_DEFAULT_TIMEZONE: process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE,
});

export const env = {
  ...parsedServer.data,
  public: parsedPublic,
  timezone:
    parsedPublic.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? parsedServer.data.DEFAULT_TIMEZONE,
};

