# Configuração de Métodos de Pagamento

Este documento explica como configurar os métodos de pagamento disponíveis no checkout.

---

## 📱 Google Pay

### ⚠️ Importante: Usando Stripe como Gateway

Quando você usa **Stripe como gateway** através do Recurly:
- ✅ **NÃO é necessário** configurar Merchant ID do Google Pay
- ✅ **NÃO é necessário** criar conta no Google Pay & Wallet Console
- ✅ A Stripe gerencia a integração com Google Pay automaticamente
- ✅ Você paga as mesmas taxas (2.9% + $0.30)

### Pré-requisitos
1. Gateway Stripe configurado no Recurly
2. Chrome browser (ou navegador compatível)
3. Conta Google com cartão cadastrado

### Configuração no Recurly

1. Acesse **Configuration → Payment Gateways → Stripe**
2. Marque a opção **"Enable Google Pay"**
3. Salve as alterações

### Configuração no Código

O Google Pay já está implementado em `CheckoutPage.tsx`. **Não é necessário** passar `googleMerchantId` quando usando Stripe:
```javascript
const googlePay = recurly.GooglePay({
  currency: 'USD',
  country: 'US',
  total: priceAmount.toFixed(2),
  label: 'Dressfy - Trial',
  // Não precisa de googleMerchantId quando usando Stripe
});
```

### Testando
- Em modo sandbox, o Google Pay funciona com qualquer cartão de teste
- Em produção, apenas dispositivos com Google Pay configurado verão o botão
- O botão só aparece em navegadores compatíveis (Chrome, Edge, etc.)

---

## 🍎 Apple Pay

### ⚠️ Importante: Usando Stripe como Gateway

Quando você usa **Stripe como gateway** através do Recurly:
- ✅ **NÃO é necessário** configurar certificados Apple Pay manualmente
- ✅ **NÃO é necessário** criar Merchant ID no Apple Developer Portal
- ✅ **NÃO é necessário** verificar domínio manualmente
- ✅ A Stripe gerencia a integração com Apple Pay automaticamente
- ✅ Você paga as mesmas taxas (2.9% + $0.30)

### Pré-requisitos
1. Gateway Stripe configurado no Recurly
2. Safari no macOS/iOS (ou navegador compatível)
3. Dispositivo Apple com Apple Pay configurado

### Configuração no Recurly

1. Acesse **Configuration → Payment Gateways → Stripe**
2. Marque a opção **"Enable Apple Pay"**
3. Salve as alterações

### Configuração no Código

O Apple Pay já está implementado em `CheckoutPage.tsx`. **Não é necessário** configurar certificados quando usando Stripe:
```javascript
const applePay = recurly.ApplePay({
  country: 'US',
  currency: 'USD',
  total: priceAmount.toFixed(2),
  label: 'Dressfy - Trial',
  recurring: true,
  // Não precisa de certificados quando usando Stripe
});
```

### Testando
- Apple Pay só funciona em dispositivos Apple (Safari no Mac/iOS)
- Em sandbox, use cartões de teste do Stripe
- O botão só aparece se o dispositivo suportar Apple Pay

---

### 📝 Nota: Configuração Manual (Apenas se NÃO usar Stripe)

Se você **não usar Stripe** como gateway, então será necessário:
1. Contatar suporte do Recurly para ativar feature flag
2. Criar Merchant ID no Apple Developer Portal
3. Gerar e fazer upload de certificados
4. Verificar domínio

Mas como você está usando Stripe, **não precisa fazer nada disso**.

---

## 💳 Cartão de Crédito

Já configurado automaticamente via Recurly.js Elements.

### Cartões de Teste (Sandbox)

| Número | Resultado |
|--------|-----------|
| 4111 1111 1111 1111 | Sucesso |
| 4000 0000 0000 0002 | Recusado |
| 4000 0027 6000 3184 | Requer 3DS |

---

## 🔐 3D Secure (3DS)

### Comportamento Atual

O código está configurado para solicitar 3DS **apenas quando o gateway solicitar**.

### Problema Conhecido

O Recurly está enviando `request_three_d_secure: "automatic"` para a Stripe, fazendo com que suas regras do Stripe Radar sejam ignoradas.

### Solução

Contate o suporte do Recurly e solicite:

```
Assunto: Alterar configuração de 3D Secure

Por favor, alterem a configuração de 3D Secure do meu site de 
"automatic" para "any", para que as regras do Stripe Radar 
sejam respeitadas.

Site: facely.recurly.com
```

### Configuração do Stripe Radar

Após a alteração no Recurly, configure no Stripe:
1. Acesse: https://dashboard.stripe.com/settings/radar/rules
2. Configure: `Request 3D Secure if :risk_score: >= 60`

---

## 📋 Checklist de Configuração

### Google Pay (via Stripe)
- [x] Habilitar Google Pay no gateway (Recurly → Payment Gateways → Stripe → Enable Google Pay)
- [x] Código já configurado (não precisa de `googleMerchantId` quando usando Stripe)
- [ ] Testar em navegador compatível (Chrome)

### Apple Pay (via Stripe)
- [x] Habilitar Apple Pay no gateway (Recurly → Payment Gateways → Stripe → Enable Apple Pay)
- [x] Código já configurado (não precisa de certificados quando usando Stripe)
- [ ] Testar em dispositivo Apple (Safari)

### 3DS
- [ ] Contatar suporte do Recurly para alterar configuração de `"automatic"` para `"any"`
- [ ] Configurar regras no Stripe Radar (`Request 3D Secure if :risk_score: >= 60`)

---

### ⚠️ Nota Importante

**Quando usando Stripe como gateway:**
- ✅ Não precisa configurar Merchant ID do Google Pay
- ✅ Não precisa configurar certificados do Apple Pay
- ✅ Não precisa criar conta no Google Pay & Wallet Console
- ✅ Não precisa criar Merchant ID no Apple Developer Portal
- ✅ A Stripe gerencia tudo automaticamente

**Apenas habilite os métodos no gateway Stripe no Recurly e está pronto!**

---

## 🆘 Suporte

- **Recurly**: support@recurly.com
- **Stripe**: https://support.stripe.com
- **Apple Developer**: https://developer.apple.com/contact/

