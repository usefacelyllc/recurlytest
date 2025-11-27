
import React, { useState, useEffect, useRef } from 'react';
import RecurlyWrapper, { useRecurly } from './RecurlyWrapper';
import { useQuiz } from '../context/QuizContext';
import { getPlanCodeByPrice, TRIAL_PLANS } from '../config/plans';

interface CheckoutPageProps {
  onBack: () => void;
  selectedPrice: string | null;
  onSuccess: (accountCode: string) => void; // Retorna o accountCode para o upsell
}

// Gera um código de conta único baseado no email ou timestamp
const generateAccountCode = (email?: string): string => {
  if (email) {
    // Usa o email como base para o código (remove caracteres especiais)
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
    return `account_${sanitizedEmail}_${Date.now()}`;
  }
  return `account_${Date.now()}`;
};

// Obtém o valor numérico do preço selecionado
const getPriceAmount = (displayPrice: string | null): number => {
  if (!displayPrice) return 0;
  const plan = TRIAL_PLANS.find(p => p.displayPrice === displayPrice);
  return plan?.trialAmount || 0;
};

// 1. COMPONENTE INTERNO DO FORMULÁRIO
const CheckoutForm = ({ onSuccess, planCode, priceAmount }: { onSuccess: (accountCode: string) => void; planCode: string; priceAmount: number }) => {
  const { recurly, isReady } = useRecurly();
  const { quizData } = useQuiz();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [is3DSProcessing, setIs3DSProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'google' | 'apple'>('card');
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isGooglePayAvailable, setIsGooglePayAvailable] = useState(false);
  const cardElementRef = useRef<HTMLDivElement>(null);
  const threeDSecureContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cardElementInstanceRef = useRef<any>(null);
  const googlePayInstanceRef = useRef<any>(null);
  const applePayInstanceRef = useRef<any>(null);
  const [cardElement, setCardElement] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  
  // Armazena o accountCode para reutilizar após 3DS
  const accountCodeRef = useRef<string | null>(null);

  // Separa o nome completo em firstName e lastName
  const getFirstNameAndLastName = (fullName: string | undefined): { firstName: string; lastName: string } => {
    if (!fullName || fullName.trim() === '') {
      return { firstName: '', lastName: '' };
    }
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) {
      return { firstName: '', lastName: '' };
    }
    
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: nameParts[0] };
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return { firstName, lastName };
  };

  // Inicializa o CardElement
  useEffect(() => {
    if (!recurly || !isReady || !cardElementRef.current) return;

    try {
      const elementsInstance = recurly.Elements();
      setElements(elementsInstance);
      
      const cardElementInstance = elementsInstance.CardElement({
        style: {
          fontSize: '16px',
          fontFamily: '"Sen", sans-serif',
          color: '#000000',
          placeholder: {
            color: '#9CA3AF'
          }
        }
      });

      cardElementInstance.attach('#recurly-card-container');
      cardElementInstanceRef.current = cardElementInstance;
      setCardElement(cardElementInstance);
    } catch (error) {
      console.error('Erro ao criar elemento de cartão:', error);
      setMessage('Erro ao inicializar formulário de pagamento');
    }

    return () => {
      if (cardElementInstanceRef.current) {
        try {
          cardElementInstanceRef.current.remove?.();
        } catch (e) {
          // Ignora erros ao remover
        }
      }
    };
  }, [recurly, isReady]);

  // Inicializa Google Pay
  // Nota: Quando usando Stripe como gateway através do Recurly:
  // - NÃO é necessário configurar googleMerchantId
  // - A Stripe gerencia a integração com Google Pay automaticamente
  // Requisitos:
  // 1. Google Pay habilitado no gateway Stripe (Recurly → Payment Gateways → Stripe → Enable Google Pay)
  // 2. Chrome browser (ou navegador compatível)
  // 3. Conta Google com cartão cadastrado
  useEffect(() => {
    if (!recurly || !isReady || priceAmount <= 0) return;

    try {
      console.log('🔄 Inicializando Google Pay...');
      
      // Configuração do Google Pay via Stripe (não precisa de merchant ID)
      const googlePay = recurly.GooglePay({
        currency: 'USD',
        country: 'US',
        total: priceAmount.toFixed(2),
        label: 'Dressfy - Trial',
        // Não precisa de googleMerchantId quando usando Stripe como gateway
      });

      googlePay.on('ready', () => {
        console.log('✅ Google Pay disponível e pronto');
        console.log('🔍 Métodos do googlePay:', Object.getOwnPropertyNames(Object.getPrototypeOf(googlePay)));
        
        // Tenta anexar o botão nativo do Google Pay ao container
        const container = document.getElementById('google-pay-native-button');
        if (container && typeof googlePay.attach === 'function') {
          console.log('📎 Anexando botão nativo do Google Pay...');
          googlePay.attach(container);
        }
        
        setIsGooglePayAvailable(true);
      });

      googlePay.on('token', async (token: { id: string }) => {
        console.log('🎉 Google Pay Token:', token.id);
        await processPaymentWithToken(token.id, 'google');
      });

      googlePay.on('error', (error: any) => {
        console.log('⚠️ Evento error do Google Pay:', error.code, error.message);
        const ignoredErrors = [
          'google-pay-not-available',
          'google-pay-not-configured',
          'google-pay-config-missing',
          'google-pay-not-supported',
        ];
        
        if (!ignoredErrors.includes(error.code)) {
          setMessage(error.message || 'Erro ao processar Google Pay');
        }
      });

      // Armazena a instância - o botão será renderizado via botão customizado
      googlePayInstanceRef.current = googlePay;
      console.log('✅ Google Pay instância criada');
    } catch (error: any) {
      console.log('ℹ️ Google Pay erro na inicialização:', error?.message);
    }

    return () => {
      if (googlePayInstanceRef.current) {
        try {
          googlePayInstanceRef.current.destroy?.();
        } catch (e) {
          // Ignora erros
        }
      }
    };
  }, [recurly, isReady, priceAmount]);

  // Função para iniciar o Google Pay
  const handleGooglePay = () => {
    if (!googlePayInstanceRef.current) {
      setMessage('Google Pay não está disponível no momento.');
      return;
    }

    try {
      const instance = googlePayInstanceRef.current;
      
      // Log detalhado para debug
      console.log('🔍 Google Pay Instance:', instance);
      console.log('🔍 Propriedades:', Object.keys(instance));
      console.log('🔍 Protótipo:', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
      
      // Verifica todos os métodos disponíveis no protótipo
      const proto = Object.getPrototypeOf(instance);
      const protoMethods = Object.getOwnPropertyNames(proto).filter(
        name => typeof proto[name] === 'function' && name !== 'constructor'
      );
      console.log('🔍 Métodos do protótipo:', protoMethods);
      
      // Tenta métodos conhecidos do Recurly.js
      if (typeof instance.start === 'function') {
        console.log('▶️ Chamando start()');
        instance.start();
      } else if (typeof instance.begin === 'function') {
        console.log('▶️ Chamando begin()');
        instance.begin();
      } else if (typeof proto.start === 'function') {
        console.log('▶️ Chamando proto.start()');
        proto.start.call(instance);
      } else if (typeof proto.begin === 'function') {
        console.log('▶️ Chamando proto.begin()');
        proto.begin.call(instance);
      } else {
        // Tenta encontrar qualquer método que possa iniciar o pagamento
        const possibleMethods = protoMethods.filter(m => 
          ['start', 'begin', 'open', 'show', 'trigger', 'emit', 'pay', 'checkout'].includes(m.toLowerCase())
        );
        
        if (possibleMethods.length > 0) {
          console.log('▶️ Tentando método:', possibleMethods[0]);
          proto[possibleMethods[0]].call(instance);
        } else {
          console.log('❌ Nenhum método de início encontrado');
          console.log('📋 Todos os métodos disponíveis:', protoMethods);
          setMessage('Google Pay: método de pagamento não encontrado. Verifique o console.');
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao iniciar Google Pay:', error);
      setMessage(error.message || 'Erro ao iniciar Google Pay');
    }
  };

  // Inicializa Apple Pay
  // Nota: Quando usando Stripe como gateway através do Recurly:
  // - NÃO é necessário configurar certificados Apple Pay manualmente
  // - A Stripe gerencia a integração com Apple Pay automaticamente
  // Requisitos:
  // 1. Apple Pay habilitado no gateway Stripe (Recurly → Payment Gateways → Stripe → Enable Apple Pay)
  // 2. Safari no macOS/iOS (ou navegador compatível)
  // 3. Dispositivo Apple com Apple Pay configurado
  useEffect(() => {
    if (!recurly || !isReady || priceAmount <= 0) return;

    try {
      console.log('🔄 Inicializando Apple Pay...');
      
      // Configuração do Apple Pay via Stripe (não precisa de certificados quando usando Stripe)
      const applePay = recurly.ApplePay({
        country: 'US',
        currency: 'USD',
        total: priceAmount.toFixed(2),
        label: 'Dressfy - Trial',
        recurring: true, // Para assinaturas recorrentes
      });

      applePay.on('ready', () => {
        console.log('✅ Apple Pay disponível');
        setIsApplePayAvailable(true);
      });

      applePay.on('token', async (token: { id: string }) => {
        console.log('🎉 Apple Pay Token:', token.id);
        await processPaymentWithToken(token.id, 'apple');
      });

      applePay.on('error', (error: any) => {
        console.log('⚠️ Evento error do Apple Pay:', error.code, error.message);
        const ignoredErrors = [
          'apple-pay-not-available',
          'apple-pay-not-configured',
          'apple-pay-not-supported',
          'apple-pay-config-missing',
        ];
        
        if (!ignoredErrors.includes(error.code)) {
          setMessage(error.message || 'Erro ao processar Apple Pay');
        }
      });

      applePayInstanceRef.current = applePay;
      console.log('✅ Apple Pay instância criada');
    } catch (error) {
      console.log('Apple Pay não disponível neste dispositivo');
    }

    return () => {
      if (applePayInstanceRef.current) {
        try {
          applePayInstanceRef.current.destroy?.();
        } catch (e) {
          // Ignora erros
        }
      }
    };
  }, [recurly, isReady, priceAmount]);

  // Função para processar pagamento com token (Google Pay / Apple Pay)
  const processPaymentWithToken = async (token: string, method: 'google' | 'apple') => {
    setIsLoading(true);
    setMessage(null);

    try {
      const { firstName: firstNameValue, lastName: lastNameValue } = getFirstNameAndLastName(quizData.name);

      if (!firstNameValue || !lastNameValue) {
        throw new Error('Por favor, preencha seu nome completo antes de continuar.');
      }

      if (!accountCodeRef.current) {
        accountCodeRef.current = generateAccountCode(quizData.email);
      }
      const accountCode = accountCodeRef.current;

      console.log(`📤 Processando ${method === 'google' ? 'Google Pay' : 'Apple Pay'}:`, {
        tokenId: token,
        accountCode,
        planCode,
      });

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingInfoToken: token,
          accountCode,
          planCode,
          email: quizData.email || '',
          firstName: firstNameValue,
          lastName: lastNameValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Verifica se precisa de 3DS
        if (data.threeDSecureActionTokenId) {
          console.log('🔐 3DS necessário para pagamento digital');
          await handle3DSecure(
            data.threeDSecureActionTokenId,
            token,
            accountCode,
            firstNameValue,
            lastNameValue
          );
          setMessage('Pagamento processado com sucesso!');
          setIsLoading(false);
          const successAccountCode = accountCode;
          accountCodeRef.current = null;
          onSuccess(successAccountCode);
          return;
        }
        accountCodeRef.current = null;
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      setMessage('Pagamento processado com sucesso!');
      const successAccountCode = accountCode;
      accountCodeRef.current = null;
      onSuccess(successAccountCode);
    } catch (error: any) {
      console.error(`Erro no ${method === 'google' ? 'Google Pay' : 'Apple Pay'}:`, error);
      setMessage(error.message || 'Ocorreu um erro inesperado.');
      setIsLoading(false);
    }
  };

  // Função para executar o fluxo 3DS
  const handle3DSecure = async (
    actionTokenId: string,
    billingInfoToken: string,
    accountCode: string,
    firstNameValue: string,
    lastNameValue: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!recurly) {
        reject(new Error('Recurly não está pronto'));
        return;
      }

      setIs3DSProcessing(true);
      setMessage('Autenticação de segurança necessária. Por favor, complete a verificação...');

      try {
        // Cria a instância do Risk para 3DS
        const risk = recurly.Risk();
        const threeDSecure = risk.ThreeDSecure({
          actionTokenId: actionTokenId
        });

        // Evento: Token 3DS gerado com sucesso
        threeDSecure.on('token', async (token: { id: string }) => {
          console.log('✅ 3DS Token gerado:', token.id);
          setMessage('Verificação concluída. Processando pagamento...');

          try {
            // Envia a requisição novamente com o token 3DS
            // IMPORTANTE: Usar o MESMO accountCode da primeira requisição
            const response = await fetch('/api/create-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                billingInfoToken: billingInfoToken,
                threeDSecureActionResultTokenId: token.id,
                accountCode: accountCode, // Mesmo accountCode da primeira requisição
                planCode: planCode,
                email: quizData.email || '',
                firstName: firstNameValue,
                lastName: lastNameValue,
              }),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error || 'Erro ao processar pagamento após 3DS');
            }

            setIs3DSProcessing(false);
            resolve();
          } catch (error: any) {
            setIs3DSProcessing(false);
            reject(error);
          }
        });

        // Evento: Erro no 3DS
        threeDSecure.on('error', (error: any) => {
          console.error('❌ Erro 3DS:', error);
          setIs3DSProcessing(false);
          reject(new Error(error.message || 'Erro na autenticação 3D Secure'));
        });

        // Anexa o iframe 3DS ao container
        if (threeDSecureContainerRef.current) {
          threeDSecure.attach(threeDSecureContainerRef.current);
        } else {
          threeDSecure.attach(document.body);
        }
      } catch (error: any) {
        setIs3DSProcessing(false);
        reject(error);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recurly || !cardElement) {
      setMessage('Formulário ainda não está pronto. Aguarde...');
      return;
    }

    if (!quizData.name || quizData.name.trim() === '') {
      setMessage('Por favor, preencha seu nome antes de continuar.');
      return;
    }

    if (!quizData.email || quizData.email.trim() === '') {
      setMessage('Por favor, preencha seu email antes de continuar.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      if (!elements || !formRef.current) {
        throw new Error('Elements ou formulário não está pronto');
      }

      // Gera o token do cartão
      const tokenResult = await new Promise<{ id: string; type: string }>((resolve, reject) => {
        recurly.token(elements, formRef.current, (err: any, token: { id: string; type: string }) => {
          if (err) {
            console.error('Erro ao gerar token:', err);
            reject(err);
          } else {
            console.log('Token gerado:', { id: token.id, type: token.type });
            resolve(token);
          }
        });
      });

      const billingInfoToken = tokenResult.id;
      const { firstName: firstNameValue, lastName: lastNameValue } = getFirstNameAndLastName(quizData.name);

      if (!firstNameValue || firstNameValue.trim() === '') {
        throw new Error('Nome inválido. Por favor, preencha seu nome completo.');
      }

      if (!lastNameValue || lastNameValue.trim() === '') {
        throw new Error('Sobrenome inválido. Por favor, preencha seu nome completo.');
      }

      // Gera o accountCode uma vez e armazena para reutilização
      // Se já tiver um accountCode (de uma tentativa anterior), usa o mesmo
      if (!accountCodeRef.current) {
        accountCodeRef.current = generateAccountCode(quizData.email);
      }
      const accountCode = accountCodeRef.current;

      console.log('📤 Enviando dados:', {
        hasToken: !!billingInfoToken,
        tokenId: billingInfoToken,
        accountCode,
        planCode,
        email: quizData.email,
        firstName: firstNameValue,
        lastName: lastNameValue,
      });

      // Primeira tentativa de criar a assinatura
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingInfoToken: billingInfoToken,
          accountCode: accountCode,
          planCode: planCode,
          email: quizData.email || '',
          firstName: firstNameValue,
          lastName: lastNameValue,
        }),
      });

      const data = await response.json();

      // Verifica se precisa de 3DS
      if (!response.ok) {
        // Verifica se o erro é relacionado a 3DS
        if (data.threeDSecureActionTokenId) {
          console.log('🔐 3DS necessário, iniciando autenticação...');
          console.log('📌 Usando accountCode:', accountCode);
          
          // Executa o fluxo 3DS com o MESMO accountCode
          await handle3DSecure(
            data.threeDSecureActionTokenId,
            billingInfoToken,
            accountCode, // Passa o mesmo accountCode
            firstNameValue,
            lastNameValue
          );

          setMessage('Pagamento processado com sucesso!');
          setIsLoading(false);
          // Guarda o accountCode antes de limpar
          const successAccountCode = accountCode;
          accountCodeRef.current = null;
          onSuccess(successAccountCode);
          return;
        }

        // Outro tipo de erro - limpa o accountCode para gerar um novo na próxima tentativa
        accountCodeRef.current = null;
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      // Sucesso sem 3DS
      setMessage('Pagamento processado com sucesso!');
      // Guarda o accountCode antes de limpar
      const successAccountCode = accountCode;
      accountCodeRef.current = null;
      onSuccess(successAccountCode);
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      setMessage(error.message || 'Ocorreu um erro inesperado.');
      setIsLoading(false);
      setIs3DSProcessing(false);
    }
  };

  const { firstName, lastName } = getFirstNameAndLastName(quizData.name);

  return (
    <>
      {/* Container para botão nativo do Google Pay (renderizado pelo Recurly.js) */}
      <div 
        id="google-pay-native-button" 
        className={`mb-4 flex justify-center ${isGooglePayAvailable ? '' : 'hidden'}`}
        style={{ minHeight: '48px' }}
      />
      
      {/* Botões de pagamento digital (Google Pay / Apple Pay) - Fallback customizado */}
      {(isGooglePayAvailable || isApplePayAvailable) && (
        <div className="mb-6">
          {/* Botão customizado do Google Pay (caso o nativo não seja renderizado) */}
          <div className="flex gap-3 justify-center flex-wrap">
            {isGooglePayAvailable && (
              <button
                type="button"
                onClick={handleGooglePay}
                disabled={isLoading || is3DSProcessing}
                className="flex-1 min-w-[140px] bg-white text-gray-800 py-3 px-4 rounded-xl font-sen font-bold shadow-md border border-gray-300 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google Pay
              </button>
            )}
          </div>
          
          {/* Divisor */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">ou pague com cartão</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Campos hidden para o Recurly.js */}
        <input 
          type="hidden" 
          data-recurly="first_name" 
          value={firstName || ''} 
        />
        <input 
          type="hidden" 
          data-recurly="last_name" 
          value={lastName || ''} 
        />
        
        <div className="space-y-4">
          <div>
            <label htmlFor="recurly-card-container" className="block text-sm font-medium text-gray-700 mb-2">
              Dados do Cartão
            </label>
            <div 
              id="recurly-card-container" 
              ref={cardElementRef}
              className="w-full min-h-[48px] px-4 py-3 border border-gray-300 rounded-xl focus-within:border-apoio focus-within:ring-2 focus-within:ring-apoio focus-within:ring-opacity-20 transition-all"
            />
          </div>
        </div>
        
        <button 
          disabled={isLoading || is3DSProcessing || !recurly || !cardElement}
          type="submit"
          className="w-full bg-apoio text-complementar py-4 px-6 rounded-xl text-lg font-sen font-bold shadow-md transition-all duration-300 ease-in-out hover:bg-opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex justify-center items-center"
        >
          {isLoading || is3DSProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {is3DSProcessing ? 'Verificando...' : 'Processando...'}
            </>
          ) : "Finalizar Compra Segura"}
        </button>

        {message && (
          <div className={`p-3 rounded border text-sm text-center ${
            message.includes('sucesso') 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : message.includes('Autenticação') || message.includes('Verificação')
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="flex items-center justify-center text-xs text-gray-400 mt-4">
          <span className="mr-1">🔒</span>
          Pagamento 100% seguro e criptografado
        </div>
      </form>

      {/* Container para o iframe 3DS */}
      <div 
        ref={threeDSecureContainerRef}
        id="three-d-secure-container"
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${is3DSProcessing ? 'block' : 'hidden'}`}
      >
        {/* O Recurly.js vai inserir o iframe aqui */}
      </div>
    </>
  );
};

// 2. COMPONENTE PRINCIPAL DA PÁGINA
const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, selectedPrice, onSuccess }) => {
  const planCode = getPlanCodeByPrice(selectedPrice || '');
  const priceAmount = getPriceAmount(selectedPrice);

  return (
    <div className="bg-gray-100 text-apoio min-h-screen font-sen">
      <div className="max-w-sm mx-auto py-6 px-4">
        <header className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-3xl p-2 -ml-2 hover:opacity-75 transition-opacity" aria-label="Voltar">
              &lt;
          </button>
          <img 
              src="/assets/logo-dressfy.webp" 
              alt="Dressfy Logo"
              className="h-6"
          />
          <div className="w-8"></div>
        </header>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-playfair font-bold mb-1">Finalizar Pedido</h2>
                <p className="text-gray-500 text-sm">
                    Total a pagar: <span className="font-bold text-apoio text-lg">{selectedPrice || '$0.00'}</span>
                </p>
            </div>

            <RecurlyWrapper>
              <CheckoutForm onSuccess={onSuccess} planCode={planCode} priceAmount={priceAmount} />
            </RecurlyWrapper>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
