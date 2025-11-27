import React, { ReactNode, useEffect, useState } from 'react';
import { initializeRecurly } from '../utils/recurly';

interface RecurlyWrapperProps {
  children: ReactNode;
  onRecurlyReady?: (recurly: any) => void;
}

interface RecurlyContextType {
  recurly: any | null;
  isReady: boolean;
}

export const RecurlyContext = React.createContext<RecurlyContextType>({
  recurly: null,
  isReady: false,
});

const RecurlyWrapper: React.FC<RecurlyWrapperProps> = ({ children, onRecurlyReady }) => {
  const [recurly, setRecurly] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeRecurly()
      .then((recurlyInstance) => {
        setRecurly(recurlyInstance);
        setIsReady(true);
        if (onRecurlyReady) {
          onRecurlyReady(recurlyInstance);
        }
      })
      .catch((err) => {
        console.error('Erro ao inicializar Recurly:', err);
        setError(err.message || 'Erro ao carregar Recurly');
      });
  }, [onRecurlyReady]);

  if (error) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-red-50 rounded-xl border border-red-200">
        <p className="text-red-600 font-sen text-sm text-center px-4">{error}</p>
      </div>
    );
  }

  if (!isReady || !recurly) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 border-dashed">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apoio mb-4"></div>
        <p className="text-gray-500 font-sen text-sm">Iniciando pagamento seguro...</p>
      </div>
    );
  }

  return (
    <RecurlyContext.Provider value={{ recurly, isReady }}>
      {children}
    </RecurlyContext.Provider>
  );
};

export const useRecurly = () => {
  const context = React.useContext(RecurlyContext);
  if (!context) {
    throw new Error('useRecurly deve ser usado dentro de RecurlyWrapper');
  }
  return context;
};

export default RecurlyWrapper;

