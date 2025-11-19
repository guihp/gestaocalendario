import "@testing-library/jest-dom/vitest";

process.env.VER_AGENDA_WEBHOOK ||= "https://example.com/ver";
process.env.EDITAR_EVENTO_WEBHOOK ||= "https://example.com/editar";
process.env.DELETAR_EVENTO_WEBHOOK ||= "https://example.com/deletar";
process.env.ID_AGENDAS_WEBHOOK ||= "https://example.com/calendarios";
process.env.DEFAULT_TIMEZONE ||= "America/Sao_Paulo";
process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ||= "America/Sao_Paulo";

