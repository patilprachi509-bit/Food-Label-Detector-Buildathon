import React, { useState } from 'react';
import { IconShield, IconCandy, IconFlask, IconPalette, IconLeaf } from './Icons';

interface IngredientPillProps {
  rawName: string;
  plainName: string;
  isExpandable: boolean;
  isFaded: boolean;
  isEn: boolean;
}

export const IngredientPill: React.FC<IngredientPillProps> = ({ rawName, plainName, isExpandable, isFaded, isEn }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isAdditiveCategory = /preservative|emulsifier|sweetener|colorant|antioxidant|stabilizer|acidity regulator|flavoring|thickener|humectant/i.test(plainName) || /INS|E\s?\d+/i.test(rawName);

  let CategoryIcon = null;
  if (/preservative/i.test(plainName)) CategoryIcon = IconShield;
  else if (/sweetener/i.test(plainName)) CategoryIcon = IconCandy;
  else if (/color|colour/i.test(plainName)) CategoryIcon = IconPalette;
  else if (/antioxidant/i.test(plainName)) CategoryIcon = IconLeaf;
  else if (/emulsifier|stabilizer|acidity regulator|thickener/i.test(plainName)) CategoryIcon = IconFlask;

  const lowerRaw = rawName.toLowerCase();
  let restrictionEn = "";
  let restrictionHi = "";
  let maidaEn = "";
  let maidaHi = "";
  
  if (lowerRaw.includes("red dye 3") || lowerRaw.includes("erythrosine") || lowerRaw.includes("ins 127") || lowerRaw.includes("e127") || lowerRaw.includes("e 127")) {
    restrictionEn = "This ingredient is banned in food in the US (since January 2025) and strictly restricted in the EU, though permitted in India. (verified 30 July 2026)";
    restrictionHi = "यह सामग्री अमेरिका में भोजन में प्रतिबंधित है (जनवरी 2025 से) और यूरोपीय संघ में सख्ती से प्रतिबंधित है, हालांकि भारत में इसकी अनुमति है। (सत्यापित 30 जुलाई 2026)";
  } else if (lowerRaw.includes("potassium iodate")) {
    restrictionEn = "This ingredient is banned in the EU, though permitted in India. (verified 30 July 2026)";
    restrictionHi = "यह सामग्री यूरोपीय संघ में प्रतिबंधित है, हालांकि भारत में इसकी अनुमति है। (सत्यापित 30 जुलाई 2026)";
  }

  // Preserve maida context note
  if (lowerRaw.includes("maida") || lowerRaw.includes("refined wheat flour")) {
    maidaEn = "Refined wheat flour has its fiber and nutrients stripped away compared to whole wheat.";
    maidaHi = "मैदा (रिफाइंड गेहूं का आटा) में साबुत गेहूं की तुलना में फाइबर और पोषक तत्व नहीं होते हैं।";
  }

  return (
    <div 
      onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      style={{ 
        padding: '0.5rem 1rem', 
        border: '1px solid var(--color-divider)', 
        borderRadius: isExpanded ? '12px' : '50px', 
        fontSize: '0.9rem', 
        opacity: isFaded ? 0.6 : 1,
        cursor: isExpandable ? 'pointer' : 'default',
        backgroundColor: isExpandable && isExpanded ? 'rgba(0,0,0,0.05)' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transition: 'all 0.2s ease',
        userSelect: isExpandable ? 'none' : 'auto',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
        <span>{rawName}</span>
        {isExpandable && (
          <span style={{ fontSize: '0.6rem', opacity: 0.6, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            ▼
          </span>
        )}
      </div>
      {isExpandable && isExpanded && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-divider)', fontSize: '0.85rem', color: 'var(--color-text)', fontWeight: 'bold', width: '100%' }}>
          {plainName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {CategoryIcon && <CategoryIcon size={14} color="var(--color-text)" />}
              {plainName}
            </div>
          )}
          {isAdditiveCategory && (
            <div style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.8, marginTop: '0.25rem' }}>
              {isEn ? "Permitted for use in food by FSSAI (FSSAI regulates how much can be used, not just whether it's allowed)." : "FSSAI द्वारा भोजन में उपयोग के लिए अनुमत (FSSAI यह नियंत्रित करता है कि कितना उपयोग किया जा सकता है, न कि केवल इसकी अनुमति है)।"}
            </div>
          )}
          {restrictionEn && (
            <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-fail)', marginTop: '0.5rem', padding: '0.4rem 0.6rem', backgroundColor: 'rgba(233,116,81,0.1)', borderRadius: '4px' }}>
              <strong>{isEn ? 'Global Context:' : 'वैश्विक संदर्भ:'}</strong> {isEn ? restrictionEn : restrictionHi}
            </div>
          )}
          {maidaEn && (
            <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--color-text)', marginTop: '0.5rem', padding: '0.4rem 0.6rem', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
              {isEn ? maidaEn : maidaHi}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
