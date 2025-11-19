# Deploy no Coolify

Este projeto está configurado para deploy no Coolify.

## Pré-requisitos

- Conta no Coolify configurada
- Repositório Git configurado

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Coolify:

### Webhooks (obrigatórias)
- `VER_AGENDA_WEBHOOK` - Webhook para listar eventos
- `EDITAR_EVENTO_WEBHOOK` - Webhook para criar/editar eventos
- `DELETAR_EVENTO_WEBHOOK` - Webhook para deletar eventos
- `ID_AGENDAS_WEBHOOK` - Webhook para gerenciar calendários
- `MARCAR_EVENTO_WEBHOOK` - Webhook para agendar horários
- `MARCAR_FERIADO_WEBHOOK` - Webhook para marcar feriados

### Timezone (opcional)
- `DEFAULT_TIMEZONE` - Fuso horário padrão (padrão: `America/Sao_Paulo`)
- `NEXT_PUBLIC_DEFAULT_TIMEZONE` - Fuso horário público (padrão: `America/Sao_Paulo`)

## Passos para Deploy

1. **Conecte o repositório no Coolify**
   - Vá para seu projeto no Coolify
   - Conecte o repositório Git

2. **Configure as variáveis de ambiente**
   - Adicione todas as variáveis listadas acima
   - Use os valores padrão ou configure conforme necessário

3. **Configure o build**
   - O Coolify detectará automaticamente o Dockerfile
   - Porta padrão: 3000

4. **Deploy**
   - Clique em "Deploy"
   - O Coolify fará o build e iniciará a aplicação

## Estrutura do Dockerfile

O Dockerfile está otimizado para produção:
- Usa Node.js 20 Alpine (imagem leve)
- Build multi-stage para reduzir tamanho final
- Output standalone do Next.js
- Executa como usuário não-root por segurança

## Troubleshooting

### Build falha
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique os logs do build no Coolify

### Aplicação não inicia
- Verifique se a porta 3000 está configurada corretamente
- Verifique os logs da aplicação no Coolify
- Confirme que as variáveis de ambiente estão definidas

### Erros de webhook
- Verifique se as URLs dos webhooks estão corretas
- Confirme que os webhooks estão acessíveis publicamente

