# 🚀 Como Rodar a Aplicação - Guia Rápido

## ✅ Pré-requisitos

1. **Node.js** instalado (versão 18 ou superior)
2. **Conta Recurly** em modo Sandbox
3. **Chaves do Recurly** configuradas

## 📋 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` existe e contém:

```env
RECURLY_API_KEY=sua_chave_privada_aqui
VITE_RECURLY_PUBLIC_KEY=sua_chave_publica_aqui
RECURLY_WEBHOOK_SECRET=seu_webhook_secret_aqui (opcional)
RECURLY_SUBDOMAIN=seu-subdomain.recurly.com
```

**Onde obter as chaves:**
- Acesse: https://app.recurly.com/go/integrations/api_keys
- Copie a **Private API Key** → `RECURLY_API_KEY`
- Copie a **Public Key** → `VITE_RECURLY_PUBLIC_KEY`

### 2. Instalar Dependências (se necessário)

```bash
npm install
```

### 3. Rodar a Aplicação

Você precisa de **2 terminais**:

#### Terminal 1 - API (Backend)
```bash
npm run dev:api
```

Isso iniciará a API em: `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
npm run dev
```

Isso iniciará o frontend em: `http://localhost:3000`

### 4. Acessar a Aplicação

Abra seu navegador em: **http://localhost:3000**

## 🧪 Testar a Integração

1. Navegue pelo quiz até chegar na página de checkout
2. Selecione um plano
3. Preencha os dados do cartão de teste:
   - **Número**: `4111 1111 1111 1111`
   - **CVV**: Qualquer 3 dígitos (ex: `123`)
   - **Data**: Qualquer data futura (ex: `12/25`)
4. Complete o pagamento

## ✅ Verificar se Está Funcionando

### No Terminal da API:
- Deve aparecer: `✅ RECURLY_API_KEY configurada`
- Deve aparecer: `🚀 Servidor API rodando em http://localhost:3001`

### No Navegador:
- Abra o Console (F12)
- Não deve haver erros relacionados ao Recurly
- Os campos de cartão devem aparecer

### No Recurly Dashboard:
- Acesse: https://app.recurly.com
- Vá em **Subscriptions** → Deve aparecer a nova assinatura
- Vá em **Transactions** → Deve aparecer a transação

### No Stripe Dashboard (se configurado):
- Acesse: https://dashboard.stripe.com/test/payments
- Deve aparecer a transação (se Stripe estiver configurado como gateway)

## 🐛 Problemas Comuns

### Erro: "RECURLY_API_KEY não está configurada"
- Verifique se o arquivo `.env.local` existe
- Verifique se a variável está escrita corretamente
- Reinicie o servidor após modificar `.env.local`

### Erro: "Recurly.js não foi carregado"
- Verifique se o script está no `index.html`
- Verifique o console do navegador para erros
- Certifique-se de que `VITE_RECURLY_PUBLIC_KEY` está configurada

### Porta já em uso
- O Vite tentará usar outra porta automaticamente
- Verifique no terminal qual porta está sendo usada

### API não responde
- Verifique se o Terminal 1 (API) está rodando
- Verifique se a porta 3001 está livre
- Teste diretamente: `http://localhost:3001/api/health`

## 📚 Próximos Passos

1. Configure os planos no Recurly: https://app.recurly.com/go/configure/plans
2. Configure o Stripe como gateway (se necessário)
3. Configure webhooks (opcional): https://app.recurly.com/go/integrations/webhooks

## 🔗 Links Úteis

- **Recurly Dashboard**: https://app.recurly.com
- **API Keys**: https://app.recurly.com/go/integrations/api_keys
- **Planos**: https://app.recurly.com/go/configure/plans
- **Webhooks**: https://app.recurly.com/go/integrations/webhooks
- **Documentação**: https://developers.recurly.com

