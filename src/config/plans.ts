/**
 * Configuração centralizada de planos e preços do Recurly
 * 
 * Para alterar os planos ou preços, basta modificar este arquivo.
 * Os componentes PricingPage, CheckoutPage e UpsellPage usarão estas configurações.
 */

// ============================================
// CONFIGURAÇÃO DOS PLANOS DE TRIAL
// ============================================

export interface TrialPlan {
  /** ID do plano no Recurly */
  planCode: string;
  /** Preço exibido para o usuário (ex: "$5") */
  displayPrice: string;
  /** Valor numérico do trial */
  trialAmount: number;
  /** Se é o plano padrão/selecionado inicialmente */
  isDefault?: boolean;
}

/**
 * Planos de trial disponíveis
 * 
 * Cada plano tem:
 * - Setup Fee: O valor do trial (cobrado imediatamente)
 * - Trial Period: 7 dias
 * - Preço Recorrente: $67 (cobrado após o trial)
 */
export const TRIAL_PLANS: TrialPlan[] = [
  {
    planCode: 'trial-5',
    displayPrice: '$5',
    trialAmount: 5,
  },
  {
    planCode: 'trial-7-50',
    displayPrice: '$7.50',
    trialAmount: 7.50,
  },
  {
    planCode: 'trial-9',
    displayPrice: '$9',
    trialAmount: 9.00,
  },
  {
    planCode: 'trial-13-67',
    displayPrice: '$13.67',
    trialAmount: 13.67,
    isDefault: true,
  },
];

/**
 * Preço total após o trial (usado para exibição)
 */
export const FULL_PRICE_AFTER_TRIAL = 67.00;

/**
 * Duração do trial em dias
 */
export const TRIAL_DURATION_DAYS = 7;

// ============================================
// CONFIGURAÇÃO DO UPSELL
// ============================================

export interface UpsellConfig {
  /** ID do item/plano no Recurly */
  itemCode: string;
  /** Preço exibido para o usuário */
  displayPrice: string;
  /** Valor numérico */
  amount: number;
  /** Preço original (riscado) */
  originalPrice?: string;
  /** Tipo de pagamento */
  paymentType: 'one_time' | 'recurring';
  /** Nome do produto */
  productName: string;
  /** Descrição curta */
  description: string;
  /** Benefícios listados */
  benefits: string[];
}

/**
 * Configuração do Upsell One-Click
 * 
 * Este upsell é cobrado usando o billing_info já cadastrado do cliente.
 * Não requer entrada de dados do cartão novamente.
 */
export const UPSELL_CONFIG: UpsellConfig = {
  itemCode: 'upsell-37',
  displayPrice: '$37',
  amount: 37.00,
  originalPrice: '$189.99',
  paymentType: 'one_time',
  productName: 'Color Match',
  description: 'Análisis personalizado de tu paleta de colores ideal',
  benefits: [
    'Análisis personalizado de tu paleta de colores ideal',
    'Asesoría de color para maquillaje y vestuario.',
    'Apoyo de profesionales especializados',
    'Garantía de devolución de dinero si cambia de opinión',
    'Sin renovación automática, sin cargos inesperados',
  ],
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém o planCode a partir do preço exibido
 */
export const getPlanCodeByPrice = (displayPrice: string): string => {
  const plan = TRIAL_PLANS.find(p => p.displayPrice === displayPrice);
  return plan?.planCode || TRIAL_PLANS.find(p => p.isDefault)?.planCode || TRIAL_PLANS[0].planCode;
};

/**
 * Obtém o plano padrão
 */
export const getDefaultPlan = (): TrialPlan => {
  return TRIAL_PLANS.find(p => p.isDefault) || TRIAL_PLANS[TRIAL_PLANS.length - 1];
};

/**
 * Obtém todos os preços para exibição
 */
export const getDisplayPrices = (): string[] => {
  return TRIAL_PLANS.map(p => p.displayPrice);
};

