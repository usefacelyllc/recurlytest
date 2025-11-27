
import React, { useState } from 'react';
import { UPSELL_CONFIG } from '../config/plans';

interface UpsellPageProps {
  onAccept: () => void;
  onSkip: () => void;
  accountCode: string; // Código da conta criada no checkout anterior
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-sen font-bold text-gray-800 text-base sm:text-lg">{question}</span>
        <span className="ml-4 text-2xl leading-none text-gray-400 font-light">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-600 font-sen text-sm sm:text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const UpsellPage: React.FC<UpsellPageProps> = ({ onAccept, onSkip, accountCode }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const faqs = [
    {
      question: "¿Esto realmente funciona?",
      answer: "¡Sí! El análisis de colores personales es una ciencia probada utilizada por consultores de imagen en todo el mundo para realzar la belleza natural."
    },
    {
      question: "¿Es complicado de usar?",
      answer: "¡Para nada! Recibirás una guía práctica y visual que es fácil de consultar siempre que lo necesites, ya sea comprando ropa o maquillándote."
    },
    {
      question: "¿Vale la pena la inversión?",
      answer: "Considera cuánto ya has gastado en ropa y maquillaje que no te hacen lucir radiante. ColorMatch se paga a sí mismo con la primera compra confiada que hagas."
    }
  ];

  // Função para processar o upsell one-click
  const handleOneClickPurchase = async () => {
    if (!accountCode) {
      setError('Erro: Conta não encontrada. Por favor, tente novamente.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/create-upsell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountCode: accountCode,
          itemCode: UPSELL_CONFIG.itemCode,
          amount: UPSELL_CONFIG.amount,
          description: UPSELL_CONFIG.productName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar compra');
      }

      console.log('✅ Upsell processado com sucesso:', data);
      onAccept();
    } catch (err: any) {
      console.error('❌ Erro no upsell:', err);
      setError(err.message || 'Ocorreu um erro. Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white text-apoio min-h-screen font-sen">
      <div className="max-w-md mx-auto py-8 px-6">
        {/* Header */}
        <header className="text-center mb-8">
          <img 
            src="/assets/logo-dressfy.webp" 
            alt="Dressfy Logo"
            className="h-6 mx-auto"
          />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-6">
           <span className="text-4xl mb-2 block">🎨</span>
           <h1 className="font-playfair text-3xl font-bold mb-4 text-gray-900">
             Estás a UNA Descubrimiento de Transformar Completamente Tu Imagen
           </h1>
           <p className="text-gray-600 text-sm">
             Descubre los colores que te hacen brillar de forma natural — y deja de sentirte "opaca/o" incluso cuando estás toda/o arreglada/o.
           </p>
        </div>

        {/* Product Card */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sen font-bold text-lg">¡Agrega {UPSELL_CONFIG.productName} a tu plan Dressfy!</h2>
          </div>
          
          <div className="inline-block bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            Pago único
          </div>
          
          <div className="flex items-baseline gap-2 mb-4">
            {UPSELL_CONFIG.originalPrice && (
              <span className="text-gray-400 line-through text-lg">{UPSELL_CONFIG.originalPrice}</span>
            )}
            <span className="text-2xl font-bold text-gray-900">{UPSELL_CONFIG.displayPrice}</span>
          </div>

          <ul className="space-y-3">
            {UPSELL_CONFIG.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-gray-700 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-gray-50 rounded-2xl px-6 py-2 mb-8 shadow-sm border border-gray-100">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Closing Statement */}
        <div className="text-center mb-8">
            <p className="font-playfair text-lg text-gray-800 italic">
                "Tus colores te están esperando. ¿Qué te parece conocerlos hoy?"
            </p>
            <p className="text-xs text-gray-500 mt-4 px-4">
                P.D.: Tu viaje de transformación ya ha comenzado con Dressfy. ColorMatch es el siguiente paso para convertirte en la versión más radiante y confiada de ti misma/o. ¡No dejes pasar esta oportunidad!
            </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* One-Click Upsell CTA */}
        <div className="text-center sticky bottom-4 z-10">
            <button
                onClick={handleOneClickPurchase}
                disabled={isProcessing}
                className="w-full bg-[#C59A44] text-white py-4 px-6 rounded-xl text-lg font-sen font-bold shadow-lg transition-all duration-300 ease-in-out hover:bg-[#b0893b] hover:scale-105 uppercase tracking-wide mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
            >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎨</span> ¡SÍ, QUIERO DESCUBRIR MIS COLORES AHORA!
                  </>
                )}
            </button>
            <p className="text-[10px] text-gray-500 mb-4">
                Al hacer clic, aseguras tu oferta por {UPSELL_CONFIG.displayPrice} ({UPSELL_CONFIG.paymentType === 'one_time' ? 'Pago único' : 'Recurrente'}).
            </p>

            <button
                onClick={onSkip}
                disabled={isProcessing}
                className="text-gray-400 text-sm underline hover:text-gray-600 transition-colors disabled:opacity-50"
            >
                Omite esta oferta y continúa
            </button>
        </div>

      </div>
    </div>
  );
};

export default UpsellPage;
