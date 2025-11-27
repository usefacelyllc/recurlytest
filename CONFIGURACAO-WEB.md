# 🌐 Configuração Específica para Ambiente Web

Este projeto está configurado para funcionar como uma **aplicação web** (não mobile). Todas as configurações abaixo são específicas para ambiente web.

## ✅ Configurações Web Aplicadas

### 1. **Recurly.js via CDN**
- ✅ Carregado diretamente no `index.html` via CDN
- ✅ Script com `defer` para não bloquear o carregamento
- ✅ Disponível globalmente via `window.recurly`

### 2. **Variáveis de Ambiente (Vite)**
- ✅ `VITE_RECURLY_PUBLIC_KEY` - Exposta para o frontend web
- ✅ Configurada no `vite.config.ts` para ser acessível via `import.meta.env`

### 3. **Proxy de API (Desenvolvimento)**
- ✅ Vite configurado para fazer proxy de `/api/*` para `http://localhost:3001`
- ✅ Funciona automaticamente em desenvolvimento local

### 4. **Build para Produção**
- ✅ Build otimizado para web com Vite
- ✅ Assets estáticos servidos corretamente
- ✅ API routes funcionam via Vercel Serverless Functions

## 🔧 Configuração para Produção (Vercel)

### Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá em **Settings** > **Environment Variables**
3. Adicione as seguintes variáveis:

```
RECURLY_API_KEY=sua_chave_privada
VITE_RECURLY_PUBLIC_KEY=sua_chave_publica
RECURLY_WEBHOOK_SECRET=seu_webhook_secret
RECURLY_SUBDOMAIN=seu-subdomain.recurly.com
```

**⚠️ IMPORTANTE**: 
- `VITE_RECURLY_PUBLIC_KEY` deve estar disponível para **Preview e Production**
- `RECURLY_API_KEY` e `RECURLY_WEBHOOK_SECRET` devem estar disponíveis apenas para **Production**

### Build e Deploy

O Vercel automaticamente:
1. Instala dependências (`npm install`)
2. Executa build (`npm run build`)
3. Serve os arquivos estáticos
4. Configura as API routes em `/api/*`

## 🌍 URLs de Produção

Após o deploy, você terá:
- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api/create-subscription`
- **Webhook**: `https://seu-projeto.vercel.app/api/recurly-webhook`

## 🔒 Segurança Web

### CORS
- ✅ Configurado para permitir requisições do frontend
- ✅ Headers CORS configurados no `vercel.json`
- ✅ API routes com CORS habilitado

### HTTPS
- ✅ Obrigatório em produção (Vercel fornece automaticamente)
- ✅ Recurly.js requer HTTPS para funcionar corretamente

### Variáveis de Ambiente
- ✅ Chave privada nunca exposta no frontend
- ✅ Apenas chave pública no código cliente
- ✅ Validação de webhooks com HMAC

## 🧪 Testando Localmente (Web)

### 1. Desenvolvimento Local

```bash
# Terminal 1 - API
npm run dev:api

# Terminal 2 - Frontend
npm run dev
```

Acesse: `http://localhost:3000`

### 2. Build Local

```bash
npm run build
npm run preview
```

## 📱 Responsividade

O projeto já está configurado com:
- ✅ Tailwind CSS para responsividade
- ✅ Mobile-first design
- ✅ Breakpoints configurados
- ✅ Componentes adaptáveis

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outros Provedores

Para outros provedores (Netlify, etc.):
- Configure as variáveis de ambiente
- Ajuste o build command se necessário
- Configure redirects para `/api/*` se usar serverless functions

## ⚠️ Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `VITE_RECURLY_PUBLIC_KEY` disponível para Preview e Production
- [ ] Planos criados no Recurly
- [ ] Webhook configurado com URL de produção
- [ ] Testado localmente
- [ ] HTTPS configurado (automático no Vercel)

## 🐛 Problemas Comuns (Web)

### "Recurly.js não foi carregado"
- Verifique se o script está no `index.html`
- Verifique o console do navegador para erros de carregamento
- Certifique-se de que está usando HTTPS em produção

### "VITE_RECURLY_PUBLIC_KEY não está configurada"
- Configure no `.env.local` (desenvolvimento)
- Configure no Vercel Dashboard (produção)
- Reinicie o servidor após configurar

### Erro de CORS
- Verifique se as headers CORS estão configuradas
- Verifique se a API está respondendo corretamente
- Teste com `curl` ou Postman

### API não responde
- Verifique se o Vercel CLI está rodando (desenvolvimento)
- Verifique logs do Vercel (produção)
- Verifique se as variáveis de ambiente estão configuradas

