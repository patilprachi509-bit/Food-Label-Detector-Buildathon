import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'hi' | null;
type ExtractionConfidence = 'high' | 'medium' | 'low' | null;
type UserGender = 'standard' | 'male' | 'female';

type UserFocus = 'sugar' | 'salt' | 'fat' | 'none' | null;
type ResultType = 'ingredients' | 'full' | null;

export interface TranslatableString {
  normalized_english: string;
  localized_display: string;
  plain_name?: string;
}
}

export interface ExtractionResult {
  front_of_pack: { 
    claims: TranslatableString[], 
    unverified_claim_notes?: { claim: string, concern: string | null }[],
    brand_name: string, 
    product_name: string, 
    net_weight_g?: number, 
    video_id?: string | null,
    consumption_format?: 'solid_snack' | 'spoonable' | 'beverage' | 'other'
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

export type BatchStatus = 'pending' | 'processing' | 'done' | 'error';
export interface BatchItem {
  id: string;
  frontImage: string | null;
  ingredientsImage: string | null;
  thirdImage?: string | null;
  status: BatchStatus;
  result?: ExtractionResult | null;
}

export type ThirdImageStatus = 'pending' | 'skipped' | 'done' | null;

interface AppContextType {
  userLanguage: Language;
  setUserLanguage: (lang: Language) => void;
  frontImage: string | null;
  setFrontImage: (img: string | null) => void;
  ingredientsImage: string | null;
  setIngredientsImage: (img: string | null) => void;
  thirdImage: string | null;
  setThirdImage: (img: string | null) => void;
  thirdImageStatus: ThirdImageStatus;
  setThirdImageStatus: (status: ThirdImageStatus) => void;
  extractionResult: ExtractionResult | null;
  setExtractionResult: (val: ExtractionResult | null) => void;
  pendingExtractionResult: ExtractionResult | null;
  setPendingExtractionResult: (val: ExtractionResult | null) => void;
  userFocus: UserFocus;
  setUserFocus: (focus: UserFocus) => void;
  userGender: UserGender;
  setUserGender: (gender: UserGender) => void;
  hasChosenResultType: ResultType;
  setHasChosenResultType: (type: ResultType) => void;
  
  // Saved Scans
  savedScans: SavedScan[];
  saveScan: () => void;
  saveMultipleScans: (scans: SavedScan[]) => void;
  deleteScan: (id: string) => void;
  clearScans: () => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isHowItWorksOpen: boolean;
  setIsHowItWorksOpen: (open: boolean) => void;
  isIngredientsOpen: boolean;
  setIsIngredientsOpen: (open: boolean) => void;
  viewingSavedScanId: string | null;
  setViewingSavedScanId: (id: string | null) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  resetApp: () => void;
  
  // Batch Scanning
  isBatchMode: boolean;
  setIsBatchMode: (val: boolean) => void;
  batchItems: BatchItem[];
  setBatchItems: React.Dispatch<React.SetStateAction<BatchItem[]>>;
  isCapturingBatchItem: boolean;
  setIsCapturingBatchItem: (val: boolean) => void;
  isBatchProcessing: boolean;
  setIsBatchProcessing: (val: boolean) => void;
  isBatchFinished: boolean;
  setIsBatchFinished: (val: boolean) => void;
  viewingBatchResultId: string | null;
  setViewingBatchResultId: (id: string | null) => void;
  clearBatchMode: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLanguage, setUserLanguageState] = useState<Language>(localStorage.getItem('user_language') as Language);
  const [userGender, setUserGenderState] = useState<UserGender>((localStorage.getItem('user_gender') as UserGender) || 'standard');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [thirdImage, setThirdImage] = useState<string | null>(null);
  const [thirdImageStatus, setThirdImageStatus] = useState<ThirdImageStatus>(null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [pendingExtractionResult, setPendingExtractionResult] = useState<ExtractionResult | null>(null);
  const [userFocus, setUserFocus] = useState<UserFocus>(null);
  const [hasChosenResultType, setHasChosenResultType] = useState<ResultType>(null);

  // Batch states
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isCapturingBatchItem, setIsCapturingBatchItem] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isBatchFinished, setIsBatchFinished] = useState(false);
  const [viewingBatchResultId, setViewingBatchResultId] = useState<string | null>(null);

  const [savedScans, setSavedScans] = useState<SavedScan[]>(() => {
    try {
      const stored = localStorage.getItem('saved_scans');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isIngredientsOpen, setIsIngredientsOpen] = useState(false);
  const [viewingSavedScanId, setViewingSavedScanId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const setUserLanguage = (lang: Language) => {
    if (lang) {
      localStorage.setItem('user_language', lang);
    }
    setUserLanguageState(lang);
  };

  const setUserGender = (gender: UserGender) => {
    localStorage.setItem('user_gender', gender);
    setUserGenderState(gender);
  };

  const clearBatchMode = () => {
    setIsBatchMode(false);
    setBatchItems([]);
    setIsCapturingBatchItem(false);
    setIsBatchProcessing(false);
    setIsBatchFinished(false);
    setViewingBatchResultId(null);
    setFrontImage(null);
    setIngredientsImage(null);
    setThirdImage(null);
    setThirdImageStatus(null);
    setExtractionResult(null);
  };

  const resetApp = () => {
    setFrontImage(null);
    setIngredientsImage(null);
    setThirdImage(null);
    setThirdImageStatus(null);
    setExtractionResult(null);
    setUserFocus(null);
    setIsHistoryOpen(false);
    setIsHowItWorksOpen(false);
    setIsIngredientsOpen(false);
    setViewingSavedScanId(null);
    setIsScanning(false);
    setHasChosenResultType(null);
    clearBatchMode();
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

  const saveMultipleScans = (newScans: SavedScan[]) => {
    const updated = [...newScans, ...savedScans];
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
      userGender, setUserGender,
      frontImage, setFrontImage,
      ingredientsImage, setIngredientsImage,
      thirdImage, setThirdImage,
      thirdImageStatus, setThirdImageStatus,
      extractionResult,
      setExtractionResult,
      pendingExtractionResult,
      setPendingExtractionResult,
      userFocus, setUserFocus,
      savedScans, saveScan, saveMultipleScans, deleteScan, clearScans,
      isHistoryOpen, setIsHistoryOpen,
      isHowItWorksOpen, setIsHowItWorksOpen,
      isIngredientsOpen, setIsIngredientsOpen,
      viewingSavedScanId, setViewingSavedScanId,
      isScanning, setIsScanning, resetApp,
      hasChosenResultType, setHasChosenResultType,
      isBatchMode, setIsBatchMode,
      batchItems, setBatchItems,
      isCapturingBatchItem, setIsCapturingBatchItem,
      isBatchProcessing, setIsBatchProcessing,
      isBatchFinished, setIsBatchFinished,
      viewingBatchResultId, setViewingBatchResultId,
      clearBatchMode
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
