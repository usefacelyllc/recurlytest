import type { VercelRequest, VercelResponse } from '@vercel/node';
import Recurly from 'recurly';

// Inicializa o Recurly
const recurly = new Recurly(process.env.RECURLY_API_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // -----------------------------------------------------------------
  // CONFIGURAÇÃO DO CORS (Liberar acesso para o AI Studio)
  // -----------------------------------------------------------------
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // '*' libera pra qualquer site (Perfeito para testes)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Se for apenas o navegador perguntando "posso usar?", a gente diz SIM (200 OK)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // -----------------------------------------------------------------
  // LÓGICA DE CRIAÇÃO DE ASSINATURA
  // -----------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      // Verifica se a chave da API está configurada
      if (!process.env.RECURLY_API_KEY) {
        console.error("RECURLY_API_KEY não está configurada!");
        return res.status(500).json({ 
          error: 'Chave da API do Recurly não configurada. Verifique o arquivo .env.local' 
        });
      }

      const { billingInfoToken, planCode, accountCode } = req.body;

      // Validação
      if (!billingInfoToken) {
        return res.status(400).json({ error: 'billingInfoToken é obrigatório' });
      }

      if (!planCode) {
        return res.status(400).json({ error: 'planCode é obrigatório' });
      }

      // Cria ou busca a conta
      let account;
      if (accountCode) {
        try {
          account = await recurly.getAccount(accountCode);
        } catch (error: any) {
          if (error.statusCode === 404) {
            // Conta não existe, será criada abaixo
            account = null;
          } else {
            throw error;
          }
        }
      }

      // Se não tiver conta, cria uma nova
      if (!account) {
        account = await recurly.createAccount({
          code: accountCode || `account_${Date.now()}`,
          email: req.body.email || `user_${Date.now()}@example.com`, // Você deve passar o email do usuário
          firstName: req.body.firstName,
          lastName: req.body.lastName,
        });
      }

      // Cria a assinatura
      const subscription = await recurly.createSubscription({
        accountCode: account.code,
        planCode: planCode,
        currency: 'USD',
        billingInfo: {
          token: billingInfoToken,
        },
      });

      // Retorna os dados da assinatura
      return res.status(200).json({ 
        subscriptionUuid: subscription.uuid,
        accountCode: account.code,
        status: subscription.state,
      });
    } catch (error: any) {
      console.error("Erro Recurly:", error);
      return res.status(500).json({ 
        error: error.message || 'Erro ao processar assinatura',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Qualquer outro método (GET, etc) não é permitido
  return res.status(405).json({ error: 'Method Not Allowed' });
}