import React, { useState, useEffect } from 'react';
import { Check, Lock, Star, Clock, Sparkles, ShoppingBag, Palette, BookOpen, Zap } from 'lucide-react';
import { UPSELL_CONFIG } from '../config/plans';

interface UpsellPageProps {
  onAccept: () => void;
  onSkip: () => void;
  accountCode: string;
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'
          }`}
      >
        <p className="text-gray-600 font-sen text-sm sm:text-base leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const OfferCard: React.FC<{ onPurchase: () => void; isProcessing: boolean }> = ({ onPurchase, isProcessing }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-black">
      {/* Badge */}
      <div className="inline-block bg-[#C59A44] text-white text-xs font-bold px-4 py-2 rounded-full mb-4">
        ¡OFERTA EXCLUSIVA!
      </div>

      {/* Title */}
      <h3 className="font-docade text-2xl font-medium mb-4 text-gray-900">
        ¡Agrega ColorMatch a tu plan Dressfy!
      </h3>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-gray-400 line-through text-2xl">$189.99</span>
        <span className="text-5xl font-bold text-[#C59A44]">$37</span>
        <span className="text-gray-600 text-sm">Pago único</span>
      </div>

      {/* Benefits */}
      <ul className="space-y-3 mb-6">
        <li className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#C59A44] mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm font-sen">Tu paleta de colores personalizada basada en tu tono de piel y ojos</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#C59A44] mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm font-sen">Guía de compras inteligente para nunca más equivocarte</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#C59A44] mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm font-sen">Combinaciones de maquillaje que realzan tu belleza natural</span>
        </li>
        <li className="flex items-start gap-3">
          <Check className="w-5 h-5 text-[#C59A44] mt-0.5 flex-shrink-0" />
          <span className="text-gray-700 text-sm font-sen">Acceso inmediato y de por vida</span>
        </li>
      </ul>

      {/* CTA Button */}
      <button
        onClick={onPurchase}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-[#C59A44] to-[#D4A855] text-white py-4 px-6 rounded-xl text-lg font-sen font-bold shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
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
            <Lock className="w-5 h-5 mr-2" />
            Añadir a mi plan
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Pago seguro y encriptado</span>
      </div>
    </div>
  );
};

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 35 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-black text-white py-3 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-sen">
        <Clock className="w-4 h-4 text-[#C59A44]" />
        <span>Esta oferta expira en:</span>
        <span className="font-bold text-[#C59A44] text-lg">
          {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
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
      answer: "¡Sí! El análisis de colores personales es una ciencia probada utilizada por consultores de imagen en todo el mundo para realzar la belleza natural. Miles de mujeres ya han transformado su imagen con ColorMatch."
    },
    {
      question: "¿Es complicado de usar?",
      answer: "¡Para nada! Recibirás una guía práctica y visual que es fácil de consultar siempre que lo necesites, ya sea comprando ropa o maquillándote. Todo está diseñado para ser simple e intuitivo."
    },
    {
      question: "¿Vale la pena la inversión?",
      answer: "Considera cuánto ya has gastado en ropa y maquillaje que no te hacen lucir radiante. ColorMatch se paga a sí mismo con la primera compra confiada que hagas. Además, es un pago único de $37 vs. $189.99 del precio regular."
    },
    {
      question: "¿Cuándo recibiré mi ColorMatch?",
      answer: "¡Inmediatamente! Tendrás acceso instantáneo a tu paleta personalizada y todas las guías en cuanto completes tu compra. Podrás empezar a usarlo hoy mismo."
    }
  ];

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
      {/* Countdown Timer */}
      <CountdownTimer />

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 pb-32">
        {/* Header Logo */}
        <header className="text-center mb-8">
          <img
            src="/assets/logo-dressfy.webp"
            alt="Dressfy Logo"
            className="h-6 mx-auto"
          />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-[#C59A44]" />
          </div>
          <h1 className="font-docade text-4xl sm:text-5xl font-medium mb-4 text-gray-900 leading-tight">
            Estás a UNA Descubrimiento de Transformar Completamente Tu Imagen
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl font-sen leading-relaxed max-w-xl mx-auto">
            Descubre los colores que te hacen brillar de forma natural — y deja de sentirte "opaca" incluso cuando estás toda arreglada.
          </p>
        </div>

        {/* Offer Card - Top */}
        <div className="mb-12">
          <OfferCard onPurchase={handleOneClickPurchase} isProcessing={isProcessing} />
        </div>

        {/* Congratulations Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-6 h-6 text-[#C59A44]" />
            <h2 className="font-docade text-2xl font-medium text-gray-900">
              ¡Felicidades por invertir en tu Dressfy!
            </h2>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6 border-l-4 border-[#C59A44]">
            <p className="text-gray-700 font-sen text-base leading-relaxed italic">
              "¿Alguna vez te has preguntado por qué algunos colores te hacen lucir opaca, cansada o incluso enferma... mientras que otros te hacen brillar instantáneamente?"
            </p>
          </div>

          <p className="text-gray-700 font-sen text-base leading-relaxed mb-4">
            La verdad es que <strong>no todos los colores te favorecen por igual</strong>. Y cada vez que compras ropa o maquillaje en el tono equivocado, estás literalmente apagando tu belleza natural.
          </p>

          <p className="text-gray-700 font-sen text-base leading-relaxed">
            Piensa en cuánto dinero ya has gastado en prendas que "te gustaban en la tienda" pero que nunca te hicieron sentir realmente radiante. <strong>Eso termina hoy.</strong>
          </p>
        </div>

        {/* Science Section */}
        <div className="mb-12">
          <h2 className="font-docade text-3xl font-medium text-center mb-8 text-gray-900">
            La Ciencia Detrás de Tu Belleza Natural
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-[#C59A44] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#C59A44]" />
              </div>
              <h3 className="font-sen font-bold text-lg mb-2 text-gray-900">Tu rostro cobra vida</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Los colores correctos iluminan tu piel y realzan tus rasgos naturales.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-[#C59A44] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-[#C59A44]" />
              </div>
              <h3 className="font-sen font-bold text-lg mb-2 text-gray-900">Imperfecciones menos visibles</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Tu paleta personalizada minimiza ojeras, manchas y líneas de expresión.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-[#C59A44] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-[#C59A44]" />
              </div>
              <h3 className="font-sen font-bold text-lg mb-2 text-gray-900">Ahorras tiempo y dinero</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Nunca más compres ropa o maquillaje que termine olvidado en tu armario.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-[#C59A44] bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#C59A44]" />
              </div>
              <h3 className="font-sen font-bold text-lg mb-2 text-gray-900">Tu autoestima se eleva</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sentirte radiante todos los días transforma tu confianza y presencia.
              </p>
            </div>
          </div>
        </div>

        {/* ColorMatch Presentation */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-12 border border-gray-200">
          <div className="text-center mb-8">
            <div className="inline-block bg-[#C59A44] bg-opacity-10 rounded-full p-4 mb-4">
              <Palette className="w-12 h-12 text-[#C59A44]" />
            </div>
            <h2 className="font-docade text-3xl font-medium mb-4 text-gray-900">
              Presentamos: ColorMatch
            </h2>
            <p className="text-gray-600 font-sen text-lg leading-relaxed max-w-2xl mx-auto">
              Tu guía personalizada de colores que te acompaña en cada decisión de estilo — desde el supermercado hasta tu rutina de maquillaje.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C59A44] rounded-lg flex items-center justify-center flex-shrink-0">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-sen font-bold text-base mb-1 text-gray-900">Paleta de colores exclusiva</h4>
                <p className="text-gray-600 text-sm">Basada en tu tono de piel, ojos y características únicas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C59A44] rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-sen font-bold text-base mb-1 text-gray-900">Guía inteligente</h4>
                <p className="text-gray-600 text-sm">Consulta rápida para compras de ropa y accesorios.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C59A44] rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-sen font-bold text-base mb-1 text-gray-900">Combinaciones de maquillaje</h4>
                <p className="text-gray-600 text-sm">Tonos perfectos para labios, ojos y mejillas.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#C59A44] rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-sen font-bold text-base mb-1 text-gray-900">Fórmula de armonía visual</h4>
                <p className="text-gray-600 text-sm">Crea looks completos que fluyen naturalmente.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="font-docade text-3xl font-medium text-center mb-8 text-gray-900">
            Lo Que Dicen Nuestras Clientas
          </h2>

          <div className="space-y-6">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C59A44] to-[#D4A855] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div>
                  <h4 className="font-sen font-bold text-base text-gray-900">Marina S., 34</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C59A44] text-[#C59A44]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 font-sen text-sm leading-relaxed italic">
                "Siempre me sentí un poco apagada, incluso con maquillaje. ColorMatch me mostró que estaba usando los tonos completamente equivocados. Ahora recibo cumplidos TODO EL TIEMPO. ¡Valió cada centavo!"
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C59A44] to-[#D4A855] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  F
                </div>
                <div>
                  <h4 className="font-sen font-bold text-base text-gray-900">Fernanda L., 28</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C59A44] text-[#C59A44]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 font-sen text-sm leading-relaxed italic">
                "¡Ahorré una fortuna! Antes compraba ropa que nunca usaba. Ahora sé exactamente qué me queda bien antes de comprar. Mi armario es más pequeño pero TODO me encanta."
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C59A44] to-[#D4A855] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div>
                  <h4 className="font-sen font-bold text-base text-gray-900">Carolina R., 42</h4>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C59A44] text-[#C59A44]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 font-sen text-sm leading-relaxed italic">
                "Pensé que era 'demasiado mayor' para esto, pero ColorMatch me hizo sentir joven y vibrante otra vez. Los colores correctos realmente hacen magia."
              </p>
            </div>
          </div>
        </div>

        {/* Offer Card - Repeat */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="font-docade text-3xl font-medium mb-2 text-gray-900">
              Asegura Tu Transformación Hoy
            </h2>
            <p className="text-gray-600 font-sen text-lg">
              Oferta especial por tiempo limitado
            </p>
          </div>
          <OfferCard onPurchase={handleOneClickPurchase} isProcessing={isProcessing} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center font-sen">
            {error}
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl px-6 py-2 mb-12">
          <h2 className="font-docade text-2xl font-medium text-center mb-6 text-gray-900 pt-6">
            Preguntas Frecuentes
          </h2>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Final CTA Section */}
        <div className="text-center mb-8">
          <p className="font-docade text-xl font-normal text-gray-800 italic mb-6 leading-relaxed">
            "Tus colores te están esperando. ¿Qué te parece conocerlos hoy?"
          </p>
          <p className="text-sm text-gray-600 font-sen mb-8 max-w-lg mx-auto leading-relaxed">
            P.D.: Tu viaje de transformación ya ha comenzado con Dressfy. ColorMatch es el siguiente paso para convertirte en la versión más radiante y confiada de ti misma. ¡No dejes pasar esta oportunidad!
          </p>

          {/* Skip Link */}
          <button
            onClick={onSkip}
            disabled={isProcessing}
            className="text-gray-400 text-xs underline hover:text-gray-600 transition-colors disabled:opacity-50 font-sen"
          >
            No, estoy bien sin saber qué realmente me favorece. Omite esta oferta y continúa.
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 py-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Lock className="w-4 h-4" />
            <span>Pago Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Check className="w-4 h-4" />
            <span>Acceso Inmediato</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <Star className="w-4 h-4" />
            <span>Garantía 30 días</span>
          </div>
        </div>
      </div>

      {/* Floating Sticky CTA Button - Optimized for Conversion */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-md mx-auto flex flex-col gap-3">

          {/* Error Message in Sticky Bar */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center font-sen">
              {error}
            </div>
          )}

          {/* Botão Principal */}
          <button
            onClick={handleOneClickPurchase}
            disabled={isProcessing}
            className="w-full bg-[#C59A44] text-white py-4 px-6 rounded-xl text-lg font-bold shadow-lg transition-all hover:bg-[#b0893b] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2"
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
                <span className="text-xl">✨</span>
                ¡SÍ, QUIERO DESCUBRIR MIS COLORES AHORA!
              </>
            )}
          </button>

          {/* Texto de Apoio (Preço) */}
          <p className="text-center text-[11px] text-gray-500 font-medium">
            Al hacer clic, aseguras tu oferta por {UPSELL_CONFIG.displayPrice}.
          </p>

          {/* Link de Recusa */}
          <button
            onClick={onSkip}
            disabled={isProcessing}
            className="text-center text-sm text-gray-800 font-medium underline decoration-gray-400 underline-offset-2 hover:text-black transition-colors py-1 disabled:opacity-50"
          >
            Omite esta oferta y continúa.
          </button>

        </div>
      </div>
    </div>
  );
};

export default UpsellPage;
