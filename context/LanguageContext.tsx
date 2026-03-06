'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '@/lib/types';

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
    es: string;
  };
}

const translations: Translations = {
  home_search_title: { pt: 'Onde vamos hoje?', en: 'Where are we going today?', es: '¿A dónde vamos hoy?' },
  home_search_placeholder: { pt: 'Ex: Cataratas, Parque das Aves...', en: 'Ex: Waterfalls, Bird Park...', es: 'Ej: Cataratas, Parque de las Aves...' },
  search_btn: { pt: 'Pesquisar', en: 'Search', es: 'Buscar' },
  menu_home: { pt: 'Home', en: 'Home', es: 'Inicio' },
  menu_destinations: { pt: 'Passeios', en: 'Tours', es: 'Paseos' },
  menu_about: { pt: 'Foz Turismo SM', en: 'About Us', es: 'Sobre Nosotros' },
  footer_desc: { pt: 'Foz Turismo SM: As melhores experiências de Foz do Iguaçu.', en: 'Foz Turismo SM: The best experiences in Foz do Iguaçu.', es: 'Foz Turismo SM: Las mejores experiencias de Foz de Iguazú.' },
  from: { pt: 'A partir de', en: 'From', es: 'Desde' },
  buy_btn: { pt: 'Reservar Agora', en: 'Book Now', es: 'Reservar Ahora' },
  installments: { pt: '10x de', en: '10x of', es: '10x de' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};