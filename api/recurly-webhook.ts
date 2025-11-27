import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Valida webhook do Recurly usando HMAC
function validateWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('base64');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // -----------------------------------------------------------------
  // CONFIGURAÇÃO DO CORS
  // -----------------------------------------------------------------
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // -----------------------------------------------------------------
  // VALIDAÇÃO DO WEBHOOK
  // -----------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const webhookSecret = process.env.RECURLY_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        console.error("RECURLY_WEBHOOK_SECRET não está configurado!");
        return res.status(500).json({ 
          error: 'Webhook secret não configurado' 
        });
      }

      // O Recurly envia a assinatura no header X-Recurly-Signature
      const signature = req.headers['x-recurly-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ error: 'Assinatura não encontrada' });
      }

      // Valida a assinatura
      const payload = JSON.stringify(req.body);
      const isValid = validateWebhook(payload, signature, webhookSecret);

      if (!isValid) {
        console.error('Webhook inválido - assinatura não confere');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      // Processa o evento
      const event = req.body;
      console.log('Webhook recebido:', event.type);

      // Processa diferentes tipos de eventos
      switch (event.type) {
        case 'new_subscription_notification':
          console.log('Nova assinatura criada:', event.subscription);
          // Aqui você pode atualizar seu banco de dados
          // Exemplo: await updateSubscriptionInDatabase(event.subscription);
          break;

        case 'updated_subscription_notification':
          console.log('Assinatura atualizada:', event.subscription);
          break;

        case 'canceled_subscription_notification':
          console.log('Assinatura cancelada:', event.subscription);
          break;

        case 'successful_payment_notification':
          console.log('Pagamento bem-sucedido:', event.transaction);
          break;

        case 'failed_payment_notification':
          console.log('Pagamento falhou:', event.transaction);
          break;

        default:
          console.log('Evento não processado:', event.type);
      }

      return res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("Erro ao processar webhook:", error);
      return res.status(500).json({ 
        error: error.message || 'Erro ao processar webhook'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

