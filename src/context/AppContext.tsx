import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'hi' | null;
type ExtractionConfidence = 'high' | 'medium' | 'low' | null;

type UserFocus = 'sugar' | 'salt' | 'fat' | 'none' | null;

export interface TranslatableString {
  normalized_english: string;
  localized_display: string;
  plain_name?: string;
  bounding_box?: { x: number, y: number, width: number, height: number } | null;
}

export interface ExtractionResult {
  front_of_pack: { 
    claims: TranslatableString[], 
    unverified_claim_notes?: { claim: string, concern: string | null }[],
    brand_name: string, 
    product_name: string, 
    net_weight_g?: number, 
    video_id?: string | null 
  };
  ingredients: { raw_list: TranslatableString[], order_index: boolean, detected_language: string };
  nutrition: { 
    serving_size: string, energy_kcal: number, total_fat_g: number,
    saturated_fat_g: number, trans_fat_g: number | null, sugar_g: number, 
    sodium_mg: number, protein_g: number 
  };
  extraction_confidence: ExtractionConfidence;
}

export interface SavedScan {
  id: string;
  timestamp: number;
  productName: string | null;
  brandName: string | null;
  extractionResult: ExtractionResult;
  userFocus: UserFocus;
}

interface AppContextType {
  userLanguage: Language;
  setUserLanguage: (lang: Language) => void;
  frontImage: string | null;
  setFrontImage: (img: string | null) => void;
  ingredientsImage: string | null;
  setIngredientsImage: (img: string | null) => void;
  extractionResult: ExtractionResult | null;
  setExtractionResult: React.Dispatch<React.SetStateAction<ExtractionResult | null>>;
  userFocus: UserFocus;
  setUserFocus: (focus: UserFocus) => void;
  
  // Saved Scans
  savedScans: SavedScan[];
  saveScan: () => void;
  deleteScan: (id: string) => void;
  clearScans: () => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  viewingSavedScanId: string | null;
  setViewingSavedScanId: (id: string | null) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLanguage, setUserLanguageState] = useState<Language>(localStorage.getItem('user_language') as Language);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [userFocus, setUserFocus] = useState<UserFocus>(null);

  const [savedScans, setSavedScans] = useState<SavedScan[]>(() => {
    try {
      const stored = localStorage.getItem('saved_scans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [viewingSavedScanId, setViewingSavedScanId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const setUserLanguage = (lang: Language) => {
    if (lang) {
      localStorage.setItem('user_language', lang);
    }
    setUserLanguageState(lang);
  };

  const resetApp = () => {
    setFrontImage(null);
    setIngredientsImage(null);
    setExtractionResult(null);
    setUserFocus(null);
    setIsHistoryOpen(false);
    setViewingSavedScanId(null);
    setIsScanning(false);
  };

  const saveScan = () => {
    if (!extractionResult) return;
    const newScan: SavedScan = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      productName: extractionResult.front_of_pack?.product_name || null,
      brandName: extractionResult.front_of_pack?.brand_name || null,
      extractionResult,
      userFocus
    };
    const updated = [newScan, ...savedScans];
    setSavedScans(updated);
    localStorage.setItem('saved_scans', JSON.stringify(updated));
  };

  const deleteScan = (id: string) => {
    const updated = savedScans.filter(s => s.id !== id);
    setSavedScans(updated);
    localStorage.setItem('saved_scans', JSON.stringify(updated));
  };

  const clearScans = () => {
    setSavedScans([]);
    localStorage.removeItem('saved_scans');
  };

  return (
    <AppContext.Provider value={{
      userLanguage, setUserLanguage,
      frontImage, setFrontImage,
      ingredientsImage, setIngredientsImage,
      extractionResult, setExtractionResult,
      userFocus, setUserFocus,
      savedScans, saveScan, deleteScan, clearScans,
      isHistoryOpen, setIsHistoryOpen,
      viewingSavedScanId, setViewingSavedScanId,
      isScanning, setIsScanning, resetApp
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
