# Configuração Recurly para Localhost

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Conta Recurly** com chaves de API
3. **Vercel CLI** para rodar as API routes localmente

## 🚀 Passos para Configurar

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Vercel CLI (se ainda não tiver)

```bash
npm install -g vercel
```

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `env.example` para `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Abra o arquivo `.env.local` e configure as chaves do Recurly:
   ```
   RECURLY_API_KEY=sua_chave_privada_aqui
   VITE_RECURLY_PUBLIC_KEY=sua_chave_publica_aqui
   RECURLY_WEBHOOK_SECRET=seu_webhook_secret_aqui
   RECURLY_SUBDOMAIN=seu_subdomain.recurly.com
   ```

   **Como obter as chaves:**
   - Acesse: https://app.recurly.com/go/integrations/api_keys
   - **API Key (Privada)**: Use no backend (nunca exponha no frontend!)
   - **Public Key**: Use no frontend com Recurly.js
   - **Webhook Secret**: Configure em https://app.recurly.com/go/integrations/webhooks
   - **Subdomain**: Seu subdomain do Recurly (ex: `facely.recurly.com`)

### 4. Configurar Planos no Recurly

Antes de testar, você precisa criar os planos no Recurly:

1. Acesse: https://app.recurly.com/go/configure/plans
2. Crie planos com os seguintes `plan_code`:
   - `monthly-basic` (ou ajuste conforme seus preços)
   - `monthly-premium` (se necessário)
3. Configure os preços e ciclos de cobrança

### 5. Mapear Preços para Plan Codes

No arquivo `src/components/CheckoutPage.tsx`, ajuste a função `getPlanCode()` para mapear seus preços aos plan codes do Recurly:

```typescript
const getPlanCode = (price: string | null): string => {
  const priceMap: Record<string, string> = {
    '$13.67': 'monthly-basic',
    '$27.34': 'monthly-premium',
    // Adicione mais mapeamentos conforme necessário
  };
  
  return priceMap[price || ''] || 'monthly-basic';
};
```

### 6. Rodar o Servidor Local

#### Opção A: Usando Vercel CLI (Recomendado)

Em um terminal, rode:
```bash
npm run dev:api
```

Isso iniciará o servidor na porta **3001** (ou outra disponível) e você poderá acessar a API em:
```
http://localhost:3001/api/create-subscription
```

#### Opção B: Rodar Frontend e API Separadamente

**Terminal 1** - Frontend (Vite):
```bash
npm run dev
```

**Terminal 2** - API (Vercel):
```bash
npm run dev:api
```

O Vite está configurado para fazer proxy automático de `/api/*` para `http://localhost:3001`

## 🧪 Testar a API

Você pode testar a API usando curl ou Postman:

```bash
curl -X POST http://localhost:3001/api/create-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "billingInfoToken": "token_aqui",
    "planCode": "monthly-basic",
    "email": "test@example.com"
  }'
```

## 🔗 Integração com Frontend

O frontend já está configurado para:
1. Carregar Recurly.js via CDN no `index.html`
2. Inicializar Recurly com a chave pública
3. Tokenizar cartões usando Recurly.js
4. Enviar o `billingInfoToken` para a API

## ⚠️ Importante

- A **chave pública** (`VITE_RECURLY_PUBLIC_KEY`) pode ser usada no frontend
- A **chave privada** (`RECURLY_API_KEY`) **NUNCA** deve ser exposta no frontend
- Use sempre chaves de **sandbox** durante desenvolvimento
- Para produção, use chaves **live** e configure no Vercel Dashboard

## 🔧 Configuração de Webhooks

Para receber eventos do Recurly (ex: assinatura criada, pagamento processado):

1. Acesse: https://app.recurly.com/go/integrations/webhooks
2. Configure a URL do webhook: `https://seu-dominio.com/api/recurly-webhook`
3. Copie o **Webhook Secret** e adicione no `.env.local`
4. Crie o arquivo `api/recurly-webhook.ts` para processar os eventos

## 🐛 Troubleshooting

### Erro: "RECURLY_API_KEY is not defined"
- Verifique se o arquivo `.env.local` existe
- Confirme que a variável está definida corretamente
- Reinicie o servidor após criar/editar `.env.local`

### Erro: "Recurly.js não foi carregado"
- Verifique se o script do Recurly está no `index.html`
- Verifique o console do navegador para erros de carregamento
- Certifique-se de que a chave pública está configurada

### Erro: "Plan code not found"
- Verifique se o plano existe no Recurly
- Confirme que o `plan_code` está correto
- Verifique se está usando o ambiente correto (sandbox vs live)

### Porta já em uso
- O Vercel CLI tentará usar outra porta automaticamente
- Verifique no terminal qual porta está sendo usada

## 📚 Documentação

- [Recurly.js Documentation](https://developers.recurly.com/reference/recurly-js)
- [Recurly API Documentation](https://developers.recurly.com/api/v2021-02-25)
- [Recurly Webhooks Guide](https://developers.recurly.com/reference/webhooks)

