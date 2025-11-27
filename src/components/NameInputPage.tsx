
import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';

interface NameInputPageProps {
  onBack: () => void;
  onContinue: () => void;
}

const NameInputPage: React.FC<NameInputPageProps> = ({ onBack, onContinue }) => {
  const { quizData, updateQuizData } = useQuiz();
  const [name, setName] = useState(quizData.name || '');
  const [error, setError] = useState<string | null>(null);

  // Valida se o nome tem pelo menos nome e sobrenome
  const isValidName = (fullName: string): boolean => {
    const trimmed = fullName.trim();
    if (trimmed === '') return false;
    const parts = trimmed.split(/\s+/).filter(part => part.length > 0);
    return parts.length >= 2; // Pelo menos nome e sobrenome
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    
    // Limpa o erro quando o usuário começa a digitar
    if (error) {
      setError(null);
    }
  };

  const handleContinue = () => {
    const trimmed = name.trim();
    
    if (trimmed === '') {
      setError('Por favor, preencha seu nome completo.');
      return;
    }

    if (!isValidName(trimmed)) {
      setError('Por favor, preencha seu nome e sobrenome.');
      return;
    }

    updateQuizData({ name: trimmed });
    onContinue();
  };

  return (
    <div className="bg-complementar text-apoio min-h-screen font-sen flex flex-col">
      <div className="max-w-sm mx-auto py-6 px-4 flex-grow w-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <button onClick={onBack} className="text-3xl p-2 -ml-2 hover:opacity-75 transition-opacity" aria-label="Voltar">
            &lt;
          </button>
          <img 
            src="/assets/logo-dressfy.webp" 
            alt="Dressfy Logo"
            className="h-6"
          />
          <div className="w-8"></div> {/* Spacer */}
        </header>

        {/* Main Content */}
        <div className="text-left flex-grow">
          <h1 className="text-4xl font-playfair font-bold mb-4">
            Por favor, cuéntanos más sobre ti.
          </h1>
          <h2 className="text-3xl font-playfair mb-8">
            ¿Cuál es tu nombre?
          </h2>

          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Nombre y Apellido"
            className={`w-full p-4 bg-complementar text-apoio placeholder-gray-500 border rounded-xl text-lg font-sen focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-complementar ${
              error 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-apoio focus:ring-principal'
            }`}
          />

          {error && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <span>⚠️</span>
              {error}
            </p>
          )}

          <p className="text-xs text-gray-500 mt-4">
            <span role="img" aria-label="lock">🔒</span> Respetamos su privacidad y estamos comprometidos en proteger sus datos personales.
          </p>
        </div>

        {/* Footer */}
        <div className="w-full">
            <button 
              onClick={handleContinue}
              disabled={!isValidName(name)}
              className="w-full bg-apoio text-complementar py-4 px-6 rounded-xl text-lg font-sen font-bold shadow-md transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-complementar focus:ring-apoio disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed enabled:hover:bg-opacity-90 enabled:hover:scale-105">
              CONTINUAR
            </button>
        </div>
      </div>
    </div>
  );
};

export default NameInputPage;