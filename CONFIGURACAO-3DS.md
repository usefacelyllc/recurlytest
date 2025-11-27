# Configuração do 3D Secure (3DS)

## ⚠️ PROBLEMA IDENTIFICADO

O Recurly está enviando `request_three_d_secure: "automatic"` para a Stripe em todas as transações.
Isso faz com que as regras do Stripe Radar sejam **IGNORADAS**.

### Por que isso acontece?

Quando o Recurly envia `request_three_d_secure: "automatic"`, a Stripe usa um algoritmo interno
que pode decidir pedir 3DS mesmo para transações de baixo risco, **ignorando suas regras do Radar**.

## 🔧 SOLUÇÃO: Configurar no Recurly

Você precisa alterar essa configuração **no painel do Recurly** ou **contatar o suporte**.

### Opção 1: Procurar no Painel do Recurly

Tente encontrar em:
- `Configuration → Site Settings → Security`
- `Configuration → Site Settings → Payment Settings`
- `Configuration → Payment Gateways → Stripe → Advanced Settings`

Procure por opções como:
- "3D Secure Mode"
- "Strong Customer Authentication"
- "SCA Settings"

Altere de **"Automatic"** para **"When Required"** ou **"Defer to Gateway"**.

### Opção 2: Contatar Suporte do Recurly (RECOMENDADO)

Envie um email para o suporte do Recurly solicitando:

```
Assunto: Alterar configuração de 3D Secure para "any" em vez de "automatic"

Olá,

Gostaria de solicitar uma alteração na configuração de 3D Secure do meu site.

Atualmente, as transações estão sendo enviadas para a Stripe com 
`request_three_d_secure: "automatic"`, o que faz com que o 3DS seja 
solicitado mesmo para transações de baixo risco.

Por favor, alterem para `request_three_d_secure: "any"` ou removam 
esse parâmetro completamente, para que as regras do Stripe Radar 
sejam respeitadas.

Site: [SEU_SUBDOMAIN].recurly.com
```

### Valores possíveis do `request_three_d_secure`:

| Valor | Comportamento |
|-------|---------------|
| `"automatic"` | Stripe decide internamente (**ignora regras do Radar**) |
| `"any"` | 3DS apenas quando o banco emissor **exigir** (mínimo de 3DS) |
| `"challenge"` | 3DS apenas quando exigido por SCA/PSD2 |
| (não enviado) | Stripe usa as **regras do Radar** para decidir |

---

## Configuração no Stripe Radar (Após corrigir no Recurly)

Depois que o Recurly estiver configurado corretamente, suas regras do Radar serão respeitadas:

## Notas Importantes

### Por que o 3DS aparece mesmo com baixo risco?

1. **Stripe está configurado para sempre pedir 3DS** - Verifique as regras do Radar
2. **Emissores do cartão podem solicitar 3DS** - Alguns bancos exigem 3DS para todas as transações online
3. **Transações internacionais** - Cartões de certos países podem exigir 3DS
4. **Regulamentação PSD2/SCA** - Na Europa, 3DS é obrigatório para a maioria das transações

### Cartões de Teste do Stripe com 3DS

| Número do Cartão | Comportamento |
|------------------|---------------|
| 4000 0027 6000 3184 | Sempre requer 3DS (autenticação bem-sucedida) |
| 4000 0082 6000 3178 | Sempre requer 3DS (autenticação falha) |
| 4242 4242 4242 4242 | 3DS opcional (depende das regras do Radar) |

### Fluxo do 3DS no Código

1. Frontend envia os dados do cartão → Recurly gera token
2. Backend tenta criar assinatura com o token
3. Se Stripe solicitar 3DS, Recurly retorna `threeDSecureActionTokenId`
4. Frontend detecta e abre o modal 3DS
5. Usuário completa autenticação
6. Frontend recebe `threeDSecureActionResultTokenId`
7. Backend re-envia a requisição com o token 3DS
8. Assinatura é criada com sucesso

## Links Úteis

- [Documentação Recurly 3DS](https://docs.recurly.com/recurly-subscriptions/docs/3d-secure)
- [Stripe Radar Rules](https://stripe.com/docs/radar/rules)
- [Stripe 3D Secure](https://stripe.com/docs/payments/3d-secure)

