import React from 'react';
import { Check } from 'lucide-react';

interface ThankYouPageProps {
  onHome: () => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ onHome }) => {
  return (
    <div className="bg-white text-apoio min-h-screen font-sen">
      <div className="max-w-lg mx-auto py-12 px-6">

        {/* Header */}
        <header className="text-center mb-8">
          <img
            src="/assets/logo-dressfy.webp"
            alt="Dressfy Logo"
            className="h-6 mx-auto mb-8"
          />

          {/* Check Icon in Black Circle */}
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>

          {/* Main Title */}
          <h1 className="font-docade text-4xl sm:text-5xl font-medium mb-3 text-gray-900 leading-tight">
            Bienvenida a tu Viaje
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 font-sen">
            Tu transformación comienza ahora
          </p>
        </header>

        {/* Card 1: Welcome Message */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <p className="text-gray-800 font-sen leading-relaxed">
            <span className="font-bold">¡Felicidades!</span> Has dado el primer paso hacia una versión más radiante y confiada de ti misma. Tus datos de acceso personalizados han sido enviados a tu correo electrónico.
          </p>
        </div>

        {/* Card 2: Instructions with Golden Border */}
        <div className="bg-white border-2 border-[#C59A44] rounded-xl p-6 mb-6">
          <h2 className="font-docade text-2xl font-medium mb-4 text-gray-900">
            Revisa Tu Correo
          </h2>

          <ul className="space-y-3 mb-4">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#C59A44] rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 font-sen text-sm leading-relaxed">
                <strong>Credenciales personalizadas</strong> para acceder a tu cuenta Dressfy
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#C59A44] rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 font-sen text-sm leading-relaxed">
                <strong>Enlaces de acceso directo</strong> a tu plan personalizado y ColorMatch
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#C59A44] rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 font-sen text-sm leading-relaxed">
                <strong>Guía paso a paso</strong> para comenzar tu transformación hoy mismo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-[#C59A44] rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-gray-700 font-sen text-sm leading-relaxed">
                <strong>Recursos y tutoriales</strong> exclusivos para aprovechar al máximo tu plan
              </span>
            </li>
          </ul>

          <p className="text-xs text-gray-500 italic font-sen">
            Nota: Si no ves el correo en tu bandeja de entrada, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        {/* Card 3: Thank You Message with Left Border */}
        <div className="bg-gradient-to-r from-gray-50 to-white border-l-4 border-[#C59A44] rounded-r-xl p-6 mb-8">
          <h3 className="font-docade text-xl font-medium mb-3 text-gray-900">
            Gracias por confiar en nosotros...
          </h3>
          <p className="text-gray-700 font-sen text-sm leading-relaxed">
            Es un honor acompañarte en este viaje de transformación. Estamos comprometidas a ayudarte a descubrir y potenciar tu belleza natural. Tu confianza significa todo para nosotras.
          </p>
        </div>

        {/* Support Footer */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 font-sen mb-2">
            ¿Tienes preguntas o necesitas ayuda?
          </p>
          <p className="text-sm font-sen">
            Contáctanos en <a href="mailto:support@dressfy.app" className="font-bold text-gray-900 underline decoration-[#C59A44] underline-offset-2">support@dressfy.app</a>
          </p>
        </div>

        {/* App Download Buttons */}
        <div className="mt-8 w-full">
          <p className="text-center font-sen text-sm text-gray-600 mb-4">
            Descarga nuestra app para acceder a tu plan:
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">

            {/* Apple App Store Button */}
            <a
              href="https://apps.apple.com/br/app/facely/id6749406062"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg w-full sm:w-auto min-w-[160px] justify-center hover:opacity-80 transition-opacity border border-transparent shadow-md"
            >
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 13.9c-.1-2.6 2.1-3.9 2.2-3.9-.1-.4-.4-1.4-.8-1.9-.7-.7-1.9-.8-2.6-.8-1.1 0-2.1.6-2.7.6-.6 0-1.6-.6-2.5-.6-1.3 0-2.5.7-3.2 1.9-1.4 2.4-.4 6 1 7.9.7 1 1.5 2.1 2.5 2.1.8 0 1.3-.6 2.4-.6 1.1 0 1.5.6 2.4.6.9 0 1.6-.9 2.4-2 .7-1 1-2 1-2.1 0 0-2.1-.8-2.1-3.1zM15.4 7.2c.6-.7 1-1.7.9-2.6-.8 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.5.9.1 1.9-.5 2.5-1.2z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] leading-none">Download on the</div>
                <div className="text-base font-bold leading-tight font-sans">App Store</div>
              </div>
            </a>

            {/* Google Play Button */}
            <a
              href="https://play.google.com/store/apps/details?id=com.facely.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-black text-white px-4 py-2 rounded-lg w-full sm:w-auto min-w-[160px] justify-center hover:opacity-80 transition-opacity border border-transparent shadow-md"
            >
              <svg className="w-7 h-7 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] leading-none">GET IT ON</div>
                <div className="text-base font-bold leading-tight font-sans">Google Play</div>
              </div>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ThankYouPage;
