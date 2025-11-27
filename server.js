import express from 'express';
import cors from 'cors';
import recurly from 'recurly';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carrega variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version']
}));
app.use(express.json());

// Inicializa o Recurly
const client = new recurly.Client(process.env.RECURLY_API_KEY);

// Rota da API para criar assinatura
app.post('/api/create-subscription', async (req, res) => {
  try {
    // Verifica se a chave da API está configurada
    if (!process.env.RECURLY_API_KEY) {
      console.error("RECURLY_API_KEY não está configurada!");
      return res.status(500).json({ 
        error: 'Chave da API do Recurly não configurada. Verifique o arquivo .env ou .env.local' 
      });
    }

    const { 
      billingInfoToken, 
      planCode, 
      accountCode, 
      email, 
      firstName, 
      lastName,
      threeDSecureActionResultTokenId // Token de resultado do 3DS (se disponível)
    } = req.body;

    // Extrai o valor do token
    const tokenValue = typeof billingInfoToken === 'string' 
      ? billingInfoToken 
      : (billingInfoToken?.id || billingInfoToken);
    
    console.log('📥 Dados recebidos:', {
      hasToken: !!tokenValue,
      tokenType: typeof billingInfoToken,
      tokenPreview: tokenValue && typeof tokenValue === 'string' ? tokenValue.substring(0, 20) + '...' : 'N/A',
      planCode,
      email,
      firstName,
      lastName,
      has3DSToken: !!threeDSecureActionResultTokenId,
    });

    // Validação
    if (!tokenValue) {
      return res.status(400).json({ error: 'billingInfoToken é obrigatório' });
    }

    if (!planCode) {
      return res.status(400).json({ error: 'planCode é obrigatório' });
    }

    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ 
        error: 'firstName é obrigatório',
        details: [{ field: 'first_name', messages: ["can't be blank"] }]
      });
    }
    
    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({ 
        error: 'lastName é obrigatório',
        details: [{ field: 'last_name', messages: ["can't be blank"] }]
      });
    }

    // Gera um código de conta único se não for fornecido
    const finalAccountCode = accountCode || `account_${Date.now()}`;

    // Monta o objeto billingInfo
    const billingInfo = {
      tokenId: tokenValue,
    };

    // Se tiver o token de resultado do 3DS, adiciona ao billingInfo
    if (threeDSecureActionResultTokenId) {
      billingInfo.threeDSecureActionResultTokenId = threeDSecureActionResultTokenId;
      console.log('🔐 Incluindo token 3DS no billingInfo');
    }

    // Estrutura da requisição
    const subscriptionRequest = {
      planCode: planCode,
      currency: 'USD',
      account: {
        code: finalAccountCode,
        email: email || `user_${Date.now()}@example.com`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        billingInfo: billingInfo,
      },
    };

    console.log('📦 Criando assinatura com estrutura:', {
      planCode: subscriptionRequest.planCode,
      currency: subscriptionRequest.currency,
      accountCode: subscriptionRequest.account.code,
      email: subscriptionRequest.account.email,
      firstName: subscriptionRequest.account.firstName,
      lastName: subscriptionRequest.account.lastName,
      hasBillingInfo: !!subscriptionRequest.account.billingInfo,
      hasTokenId: !!subscriptionRequest.account.billingInfo?.tokenId,
      has3DSResultToken: !!subscriptionRequest.account.billingInfo?.threeDSecureActionResultTokenId,
    });

    try {
      const subscription = await client.createSubscription(subscriptionRequest);

      console.log('✅ Assinatura criada com sucesso:', {
        uuid: subscription.uuid,
        state: subscription.state,
        accountCode: subscription.account?.code,
        planCode: subscription.plan?.code,
      });

      // Retorna os dados da assinatura
      return res.status(200).json({ 
        subscriptionUuid: subscription.uuid,
        accountCode: finalAccountCode,
        status: subscription.state,
        message: 'Assinatura criada com sucesso',
      });
    } catch (subscriptionError) {
      console.error('❌ Erro ao criar assinatura:', {
        message: subscriptionError.message,
        code: subscriptionError.code,
        type: subscriptionError.type,
        params: subscriptionError.params,
        transactionError: subscriptionError.transactionError,
      });

      // Verifica se é um erro de 3DS
      if (subscriptionError.transactionError) {
        const txError = subscriptionError.transactionError;
        
        // Se o erro contém um actionTokenId, significa que precisa de 3DS
        if (txError.threeDSecureActionTokenId) {
          console.log('🔐 3DS necessário! Retornando actionTokenId:', txError.threeDSecureActionTokenId);
          
          return res.status(402).json({
            error: 'Autenticação 3D Secure necessária',
            requires3DS: true,
            threeDSecureActionTokenId: txError.threeDSecureActionTokenId,
            message: 'Your card must be authenticated with 3-D Secure before continuing.',
          });
        }
      }

      // Verifica também na mensagem de erro
      if (subscriptionError.message && subscriptionError.message.includes('3-D Secure')) {
        // Tenta extrair o actionTokenId da mensagem ou do objeto de erro
        const actionTokenId = subscriptionError.params?.find(p => p.param === 'three_d_secure_action_token_id')?.value
          || subscriptionError.threeDSecureActionTokenId;

        if (actionTokenId) {
          console.log('🔐 3DS necessário (via mensagem)! Retornando actionTokenId:', actionTokenId);
          
          return res.status(402).json({
            error: 'Autenticação 3D Secure necessária',
            requires3DS: true,
            threeDSecureActionTokenId: actionTokenId,
            message: subscriptionError.message,
          });
        }
      }

      throw subscriptionError;
    }
  } catch (error) {
    console.error("❌ Erro Recurly:", {
      message: error.message,
      name: error.name,
      code: error.code,
      type: error.type,
      params: error.params,
      transactionError: error.transactionError,
    });

    // Verifica se é um erro de transação com 3DS
    if (error.transactionError?.threeDSecureActionTokenId) {
      return res.status(402).json({
        error: 'Autenticação 3D Secure necessária',
        requires3DS: true,
        threeDSecureActionTokenId: error.transactionError.threeDSecureActionTokenId,
        message: error.message,
      });
    }
    
    // Retorna erro mais detalhado para debug
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar assinatura',
      code: error.code,
      type: error.type,
      params: error.params,
    });
  }
});

// ============================================
// ROTA DE UPSELL ONE-CLICK
// ============================================
// Esta rota cria uma cobrança única usando o billing_info já cadastrado na conta
app.post('/api/create-upsell', async (req, res) => {
  try {
    if (!process.env.RECURLY_API_KEY) {
      console.error("RECURLY_API_KEY não está configurada!");
      return res.status(500).json({ 
        error: 'Chave da API do Recurly não configurada.' 
      });
    }

    const { accountCode, itemCode, amount, description } = req.body;

    console.log('📥 Dados do Upsell recebidos:', {
      accountCode,
      itemCode,
      amount,
      description,
    });

    // Validação
    if (!accountCode) {
      return res.status(400).json({ error: 'accountCode é obrigatório' });
    }

    if (!itemCode) {
      return res.status(400).json({ error: 'itemCode é obrigatório' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount deve ser maior que zero' });
    }

    try {
      // Verifica se a conta existe e tem billing_info
      const account = await client.getAccount(`code-${accountCode}`);
      console.log('✅ Conta encontrada:', {
        code: account.code,
        email: account.email,
        hasBillingInfo: !!account.billingInfo,
      });

      // Cria uma Purchase (compra única) usando o billing_info existente
      const purchaseRequest = {
        currency: 'USD',
        account: {
          code: accountCode,
        },
        lineItems: [
          {
            type: 'charge',
            currency: 'USD',
            unitAmount: amount,
            quantity: 1,
            description: description || 'Upsell Purchase',
            productCode: itemCode,
          }
        ],
        // Coleta o pagamento imediatamente
        collectionMethod: 'automatic',
      };

      console.log('📦 Criando Purchase (Upsell):', {
        accountCode: purchaseRequest.account.code,
        amount: amount,
        itemCode: itemCode,
      });

      const invoiceCollection = await client.createPurchase(purchaseRequest);

      console.log('✅ Upsell processado com sucesso:', {
        chargeInvoice: invoiceCollection.chargeInvoice?.number,
        state: invoiceCollection.chargeInvoice?.state,
      });

      return res.status(200).json({
        success: true,
        invoiceNumber: invoiceCollection.chargeInvoice?.number,
        state: invoiceCollection.chargeInvoice?.state,
        message: 'Upsell processado com sucesso',
      });

    } catch (purchaseError) {
      console.error('❌ Erro ao processar upsell:', {
        message: purchaseError.message,
        code: purchaseError.code,
        type: purchaseError.type,
      });

      // Verifica se é erro de billing_info não encontrado
      if (purchaseError.message?.includes('billing_info') || 
          purchaseError.message?.includes('payment method')) {
        return res.status(400).json({
          error: 'Método de pagamento não encontrado. Por favor, adicione um cartão.',
          code: 'no_billing_info',
        });
      }

      throw purchaseError;
    }

  } catch (error) {
    console.error("❌ Erro no Upsell:", {
      message: error.message,
      name: error.name,
      code: error.code,
      type: error.type,
    });
    
    return res.status(500).json({ 
      error: error.message || 'Erro ao processar upsell',
      code: error.code,
      type: error.type,
    });
  }
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Rota GET para debug
app.get('/api/create-subscription', (req, res) => {
  res.status(405).json({ 
    error: 'Method Not Allowed',
    message: 'Esta rota aceita apenas requisições POST. Use POST para criar uma assinatura.',
    allowedMethods: ['POST']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor API rodando em http://localhost:${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/create-subscription`);
  if (!process.env.RECURLY_API_KEY) {
    console.warn('⚠️  AVISO: RECURLY_API_KEY não encontrada!');
  } else {
    console.log('✅ RECURLY_API_KEY configurada');
  }
});
