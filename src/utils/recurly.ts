// Recurly.js configuration
// Recurly.js é carregado via CDN no index.html
// Esta função retorna a instância global do Recurly

declare global {
  interface Window {
    recurly?: any;
  }
}

export const getRecurly = (): any => {
  if (typeof window !== 'undefined' && window.recurly) {
    return window.recurly;
  }
  throw new Error('Recurly.js não foi carregado. Verifique se o script está incluído no index.html');
};

// Chave pública do Recurly (deve ser configurada via variável de ambiente)
export const RECURLY_PUBLIC_KEY = import.meta.env.VITE_RECURLY_PUBLIC_KEY || '';

// Valida se a chave pública está configurada
if (!RECURLY_PUBLIC_KEY && typeof window !== 'undefined') {
  console.warn('⚠️ VITE_RECURLY_PUBLIC_KEY não está configurada. Configure no arquivo .env.local');
}

// Inicializa o Recurly quando disponível (para ambiente web)
export const initializeRecurly = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Verifica se está no browser (ambiente web)
    if (typeof window === 'undefined') {
      reject(new Error('Recurly só pode ser inicializado no browser (ambiente web)'));
      return;
    }

    // Valida chave pública
    if (!RECURLY_PUBLIC_KEY) {
      reject(new Error('VITE_RECURLY_PUBLIC_KEY não está configurada. Configure no arquivo .env.local'));
      return;
    }

    // Configuração do Recurly com 3DS controlado pelo gateway (Stripe)
    // preflightDeviceDataCollector.enabled: false = deixa o Stripe decidir quando pedir 3DS
    const recurlyConfig = {
      publicKey: RECURLY_PUBLIC_KEY,
      risk: {
        threeDSecure: {
          // Desabilita o preflight - deixa o Stripe/gateway decidir quando 3DS é necessário
          preflightDeviceDataCollector: {
            enabled: false
          }
        }
      }
    };

    // Se já estiver carregado
    if (window.recurly) {
      try {
        // Recurly.js v4: window.recurly já é uma instância, use configure()
        if (typeof window.recurly.configure === 'function') {
          window.recurly.configure(recurlyConfig);
          console.log('✅ Recurly configurado com 3DS controlado pelo gateway');
          resolve(window.recurly);
        } else {
          // Fallback para versões antigas (se necessário)
          reject(new Error('Recurly.js não está configurado corretamente. Verifique a versão.'));
        }
      } catch (error) {
        reject(error);
      }
      return;
    }

    // Aguarda o script carregar (Recurly.js via CDN)
    let attempts = 0;
    const maxAttempts = 100; // 10 segundos (100 * 100ms)

    const checkRecurly = setInterval(() => {
      attempts++;
      
      if (window.recurly) {
        clearInterval(checkRecurly);
        try {
          // Recurly.js v4: window.recurly já é uma instância, use configure()
          if (typeof window.recurly.configure === 'function') {
            window.recurly.configure(recurlyConfig);
            console.log('✅ Recurly configurado com 3DS controlado pelo gateway');
            resolve(window.recurly);
          } else {
            reject(new Error('Recurly.js não está configurado corretamente. Verifique a versão.'));
          }
        } catch (error) {
          reject(error);
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkRecurly);
        reject(new Error('Timeout ao carregar Recurly.js. Verifique se o script está no index.html'));
      }
    }, 100);
  });
};

