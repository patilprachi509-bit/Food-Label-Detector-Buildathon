import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'hi' | null;
type ExtractionConfidence = 'high' | 'medium' | 'low' | null;

type UserFocus = 'sugar' | 'salt' | 'fat' | 'none' | null;

export interface TranslatableString {
  normalized_english: string;
  localized_display: string;
}

export interface ExtractionResult {
  front_of_pack: { claims: TranslatableString[], brand_name: string, product_name: string };
  ingredients: { raw_list: TranslatableString[], order_index: boolean, detected_language: string };
  nutrition: { 
    serving_size: string, energy_kcal: number, total_fat_g: number,
    saturated_fat_g: number, trans_fat_g: number | null, sugar_g: number, 
    sodium_mg: number, protein_g: number 
  };
  extraction_confidence: ExtractionConfidence;
}

interface AppContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  userLanguage: Language;
  setUserLanguage: (lang: Language) => void;
  frontImage: string | null;
  setFrontImage: (img: string | null) => void;
  ingredientsImage: string | null;
  setIngredientsImage: (img: string | null) => void;
  extractionResult: ExtractionResult | null;
  setExtractionResult: (res: ExtractionResult | null) => void;
  userFocus: UserFocus;
  setUserFocus: (focus: UserFocus) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(sessionStorage.getItem('gemini_api_key'));
  const [userLanguage, setUserLanguageState] = useState<Language>(localStorage.getItem('user_language') as Language);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [userFocus, setUserFocus] = useState<UserFocus>(null);

  const setApiKey = (key: string) => {
    sessionStorage.setItem('gemini_api_key', key);
    setApiKeyState(key);
  };

  const setUserLanguage = (lang: Language) => {
    if (lang) {
      localStorage.setItem('user_language', lang);
    }
    setUserLanguageState(lang);
  };

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      userLanguage, setUserLanguage,
      frontImage, setFrontImage,
      ingredientsImage, setIngredientsImage,
      extractionResult, setExtractionResult,
      userFocus, setUserFocus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
