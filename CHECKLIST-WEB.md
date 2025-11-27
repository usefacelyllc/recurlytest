# ✅ Checklist - Projeto Web com Recurly

## 🔑 Chaves Necessárias

Você precisa das seguintes chaves do Recurly:

- [ ] **RECURLY_API_KEY** (Privada) - Para backend
  - Onde obter: https://app.recurly.com/go/integrations/api_keys
  - Formato: `facely-1234567890abcdef`

- [ ] **VITE_RECURLY_PUBLIC_KEY** (Pública) - Para frontend web
  - Onde obter: https://app.recurly.com/go/integrations/api_keys
  - Formato: `ewr-1234567890abcdef`

- [ ] **RECURLY_WEBHOOK_SECRET** (Opcional) - Para webhooks
  - Onde obter: https://app.recurly.com/go/integrations/webhooks

## 📝 Configuração Local

- [ ] Criar arquivo `.env.local` na raiz do projeto
- [ ] Adicionar todas as chaves no `.env.local`
- [ ] Verificar que `VITE_RECURLY_PUBLIC_KEY` está configurada

## 🎯 Configuração no Recurly Dashboard

- [ ] Criar planos no Recurly com `plan_code`:
  - [ ] `monthly-basic` (ou ajustar conforme necessário)
  - [ ] Outros planos conforme necessário
- [ ] Configurar preços e ciclos de cobrança
- [ ] Configurar webhook (opcional):
  - [ ] URL: `https://seu-dominio.com/api/recurly-webhook`
  - [ ] Eventos selecionados
  - [ ] Webhook secret copiado

## 💻 Código

- [ ] Ajustar mapeamento de preços em `CheckoutPage.tsx`:
  ```typescript
  const getPlanCode = (price: string | null): string => {
    const priceMap: Record<string, string> = {
      '$13.67': 'monthly-basic', // Ajuste conforme seus planos
      // Adicione mais mapeamentos
    };
    return priceMap[price || ''] || 'monthly-basic';
  };
  ```

## 🧪 Teste Local

- [ ] Instalar dependências: `npm install`
- [ ] Rodar API: `npm run dev:api` (Terminal 1)
- [ ] Rodar Frontend: `npm run dev` (Terminal 2)
- [ ] Acessar: `http://localhost:3000`
- [ ] Testar checkout com cartão de teste: `4111 1111 1111 1111`

## 🚀 Deploy (Vercel)

- [ ] Conectar repositório ao Vercel
- [ ] Adicionar variáveis de ambiente no Vercel:
  - [ ] `RECURLY_API_KEY` (Production only)
  - [ ] `VITE_RECURLY_PUBLIC_KEY` (Preview + Production)
  - [ ] `RECURLY_WEBHOOK_SECRET` (Production only)
  - [ ] `RECURLY_SUBDOMAIN` (Production only)
- [ ] Fazer deploy
- [ ] Testar em produção

## ✅ Verificação Final

- [ ] Recurly.js carrega no navegador (verificar console)
- [ ] Campos de cartão aparecem no checkout
- [ ] Tokenização funciona
- [ ] Assinatura é criada no Recurly
- [ ] Webhook recebe eventos (se configurado)

## 📚 Documentação

- [ ] Ler `README-RECURLY.md` para detalhes
- [ ] Ler `CHAVES-NECESSARIAS.md` para obter chaves
- [ ] Ler `CONFIGURACAO-WEB.md` para configuração web

