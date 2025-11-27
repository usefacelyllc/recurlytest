# 🔑 Chaves e Configurações Necessárias para Recurly

## Chaves de API Necessárias

Para que o projeto funcione corretamente com Recurly, você precisa das seguintes chaves:

### 1. **RECURLY_API_KEY** (Backend - Privada)
- **Onde obter**: https://app.recurly.com/go/integrations/api_keys
- **Uso**: Backend (API routes)
- **Formato**: Começa com sua subdomain (ex: `facely-1234567890abcdef`)
- **⚠️ IMPORTANTE**: Nunca exponha esta chave no frontend!

### 2. **VITE_RECURLY_PUBLIC_KEY** (Frontend - Pública)
- **Onde obter**: https://app.recurly.com/go/integrations/api_keys
- **Uso**: Frontend (Recurly.js)
- **Formato**: Começa com `ewr` (ex: `ewr-1234567890abcdef`)
- **Seguro**: Pode ser exposta no frontend

### 3. **RECURLY_WEBHOOK_SECRET** (Backend - Webhooks)
- **Onde obter**: https://app.recurly.com/go/integrations/webhooks
- **Uso**: Validar webhooks do Recurly
- **Formato**: String aleatória gerada pelo Recurly
- **⚠️ IMPORTANTE**: Mantenha em segredo!

### 4. **RECURLY_SUBDOMAIN** (Opcional - Informação)
- **Onde obter**: URL do seu dashboard Recurly
- **Uso**: Referência (ex: `facely.recurly.com`)
- **Formato**: `seu-subdomain.recurly.com`

## Como Configurar

### Passo 1: Criar Conta Recurly
1. Acesse: https://recurly.com
2. Crie uma conta (sandbox para testes)
3. Complete o onboarding

### Passo 2: Obter API Keys
1. Acesse: https://app.recurly.com/go/integrations/api_keys
2. Copie a **Private API Key** (para `RECURLY_API_KEY`)
3. Copie a **Public Key** (para `VITE_RECURLY_PUBLIC_KEY`)

### Passo 3: Configurar Webhooks
1. Acesse: https://app.recurly.com/go/integrations/webhooks
2. Adicione uma nova URL de webhook:
   - **URL**: `https://seu-dominio.com/api/recurly-webhook`
   - **Eventos**: Selecione os eventos que deseja receber:
     - `new_subscription_notification`
     - `updated_subscription_notification`
     - `canceled_subscription_notification`
     - `successful_payment_notification`
     - `failed_payment_notification`
3. Copie o **Webhook Secret** (para `RECURLY_WEBHOOK_SECRET`)

### Passo 4: Configurar Stripe como Gateway (IMPORTANTE)
**⚠️ CRÍTICO**: Sem configurar o Stripe como gateway, as transações não aparecerão no Stripe!

#### ⚠️ Problema com Integração OAuth

Se você conectou o Stripe via **OAuth** (login automático), o Recurly pode ter conectado à conta **LIVE** do Stripe, não à **TESTE/SANDBOX**. Por isso as transações de teste não aparecem no Stripe sandbox.

**Solução**: Mesmo com OAuth ativo, você precisa configurar as chaves de TESTE manualmente.

#### Passo a Passo:

1. Acesse: https://app.recurly.com/go/integrations/payment_gateways
2. Encontre o gateway Stripe já configurado (via OAuth)
3. Clique em **"Options"** (ou "Editar") no gateway Stripe
4. **Desconecte a integração OAuth** (se necessário) ou **adicione as chaves de teste manualmente**:
   - **Stripe Secret Key (TEST)**: `sk_test_...` 
     - Obtenha em: https://dashboard.stripe.com/test/apikeys
   - **Stripe Publishable Key (TEST)**: `pk_test_...`
     - Obtenha em: https://dashboard.stripe.com/test/apikeys
5. **Importante**: Certifique-se de usar chaves de **TESTE** (`sk_test_` e `pk_test_`), não de produção
6. Salve as configurações
7. **Verifique**: Certifique-se de que os planos estão usando este gateway

#### Como Verificar se Está Usando Test Mode:

- No dashboard do Recurly, verifique se está no ambiente **Sandbox**
- No Stripe, verifique se as transações aparecem em: https://dashboard.stripe.com/test/payments
- Se aparecer em https://dashboard.stripe.com/payments (sem `/test`), está usando LIVE - **corrija imediatamente!**

### Passo 5: Criar Planos
1. Acesse: https://app.recurly.com/go/configure/plans
2. Crie planos com os seguintes `plan_code`:
   - `monthly-basic` (ou ajuste conforme necessário)
   - `monthly-premium` (se necessário)
3. Configure preços e ciclos de cobrança
4. **Importante**: Associe cada plano ao gateway Stripe configurado

### Passo 6: Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Recurly Configuration
RECURLY_API_KEY=sua_chave_privada_aqui
VITE_RECURLY_PUBLIC_KEY=sua_chave_publica_aqui
RECURLY_WEBHOOK_SECRET=seu_webhook_secret_aqui
RECURLY_SUBDOMAIN=seu-subdomain.recurly.com
```

### Passo 7: Configurar no Vercel (Produção)

Se estiver usando Vercel, adicione as variáveis de ambiente no dashboard:

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** > **Environment Variables**
3. Adicione todas as variáveis acima
4. **⚠️ IMPORTANTE**: Para `VITE_RECURLY_PUBLIC_KEY`, marque como "Available for Preview and Production"

## Ambiente Sandbox vs Live

### Sandbox (Desenvolvimento)
- Use chaves de **sandbox** durante desenvolvimento
- Teste com cartões de teste do Recurly
- Não processa pagamentos reais

### Live (Produção)
- Use chaves **live** em produção
- Processa pagamentos reais
- Configure no Vercel Dashboard

## Cartões de Teste

Para testar no ambiente sandbox, use estes cartões:

- **Sucesso**: `4111 1111 1111 1111`
- **Falha**: `4000 0000 0000 0002`
- **CVV**: Qualquer 3 dígitos
- **Data**: Qualquer data futura

Mais cartões de teste: https://docs.recurly.com/docs/test-payment-methods

## Verificação

Para verificar se está tudo configurado:

1. ✅ Chaves no `.env.local`
2. ✅ **Stripe configurado como gateway no Recurly** (CRÍTICO!)
3. ✅ Planos criados no Recurly e associados ao gateway Stripe
4. ✅ Webhook configurado
5. ✅ Mapeamento de preços no código (`CheckoutPage.tsx`)

## ⚠️ Problemas Comuns

### Problema 1: Transação não aparece no Stripe

**Sintoma**: Transação aprovada no Recurly, mas não aparece no Stripe sandbox.

**Causa 1**: Stripe não está configurado como gateway no Recurly.

**Causa 2** (Mais comum): Stripe foi conectado via OAuth e está usando conta **LIVE** ao invés de **TESTE**.

**Solução**: 
1. Acesse https://app.recurly.com/go/integrations/payment_gateways
2. Edite o gateway Stripe
3. Configure as chaves de **TESTE** manualmente (`sk_test_...` e `pk_test_...`)
4. Certifique-se de estar no ambiente **Sandbox** do Recurly
5. Associe os planos ao gateway Stripe
6. Teste novamente - a transação deve aparecer em ambos os dashboards

### Problema 2: Transações aparecem no Stripe LIVE ao invés de TEST

**Sintoma**: Transações aparecem em https://dashboard.stripe.com/payments (sem `/test`)

**Causa**: Integração OAuth conectou à conta LIVE do Stripe.

**Solução**:
1. Edite o gateway Stripe no Recurly
2. Substitua as credenciais OAuth por chaves de TESTE manuais
3. Use `sk_test_...` e `pk_test_...` (obtenha em https://dashboard.stripe.com/test/apikeys)
4. Salve e teste novamente

## Suporte

- **Documentação**: https://developers.recurly.com
- **Suporte**: https://support.recurly.com
- **Status**: https://status.recurly.com

