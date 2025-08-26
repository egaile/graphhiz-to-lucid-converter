import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConversionResult {
  fileName: string;
  success: boolean;
  data?: Blob | string;
  error?: string;
}

interface ConversionContextType {
  results: ConversionResult[];
  addResult: (result: ConversionResult) => void;
  clearResults: () => void;
}

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

export const useConversion = () => {
  const context = useContext(ConversionContext);
  if (!context) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};

interface ConversionProviderProps {
  children: ReactNode;
}

export const ConversionProvider: React.FC<ConversionProviderProps> = ({ children }) => {
  const [results, setResults] = useState<ConversionResult[]>([]);

  const addResult = (result: ConversionResult) => {
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <ConversionContext.Provider value={{ results, addResult, clearResults }}>
      {children}
    </ConversionContext.Provider>
  );
};