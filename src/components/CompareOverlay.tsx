import React from 'react';
import type { ExtractionResult, SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';

interface CompareOverlayProps {
  currentScan: ExtractionResult;
  savedScan: SavedScan;
  onClose: () => void;
  isEn: boolean;
}

export const CompareOverlay: React.FC<CompareOverlayProps> = ({ currentScan, savedScan, onClose, isEn }) => {
  // calculate verdicts
  const currentFlags = evaluateRules(currentScan, null);
  const savedFlags = evaluateRules(savedScan.extractionResult, savedScan.userFocus);

  const currentVerdict = currentFlags.length > 0 ? (isEn ? "Flagged" : "फ़्लैग किया गया") : (isEn ? "Grade A" : "ग्रेड ए");
  const savedVerdict = savedFlags.length > 0 ? (isEn ? "Flagged" : "फ़्लैग किया गया") : (isEn ? "Grade A" : "ग्रेड ए");

  const currentIsFlagged = currentFlags.length > 0;
  const savedIsFlagged = savedFlags.length > 0;

  // G1-G4 values
  const getValues = (res: ExtractionResult) => {
    const n = res.nutrition;
    const hasEnergy = n.energy_kcal > 0;
    const sugar = hasEnergy ? Math.round(((n.sugar_g * 4) / n.energy_kcal) * 100) : null;
    const fat = hasEnergy ? Math.round(((n.total_fat_g * 9) / n.energy_kcal) * 100) : null;
    const salt = Number(((n.sodium_mg * 2.5) / 1000).toFixed(2));
    const transFat = (n.trans_fat_g !== null && n.total_fat_g > 0) ? Math.round((n.trans_fat_g / n.total_fat_g) * 100) : null;
    return { sugar, fat, salt, transFat };
  };

  const currV = getValues(currentScan);
  const savedV = getValues(savedScan.extractionResult);

  const currentName = currentScan.front_of_pack?.product_name || currentScan.front_of_pack?.brand_name || (isEn ? "Current Scan" : "वर्तमान स्कैन");
  const savedName = savedScan.productName || savedScan.brandName || (isEn ? "Saved Scan" : "सहेजा गया स्कैन");

  // row render helper
  const renderRow = (labelEn: string, labelHi: string, currVal: number | null, savedVal: number | null, unit: string) => {
    // Check if either is null
    const isNull = currVal === null || savedVal === null;
    const valCurrStr = currVal === null ? (isEn ? "Not available" : "उपलब्ध नहीं") : `${currVal}${unit}`;
    const valSavedStr = savedVal === null ? (isEn ? "Not available" : "उपलब्ध नहीं") : `${savedVal}${unit}`;

    const currWorse = !isNull && currVal > savedVal;
    const savedWorse = !isNull && savedVal > currVal;

    return (
      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{isEn ? labelEn : labelHi}</td>
        <td style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: currWorse ? 'rgba(122, 46, 46, 0.1)' : 'transparent', fontWeight: currWorse ? 'bold' : 'normal' }}>
          {valCurrStr}
        </td>
        <td style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: savedWorse ? 'rgba(122, 46, 46, 0.1)' : 'transparent', fontWeight: savedWorse ? 'bold' : 'normal' }}>
          {valSavedStr}
        </td>
      </tr>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', color: 'var(--color-text)', zIndex: 100, display: 'flex', flexDirection: 'column', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)' }}>
          &times;
        </button>
        <div style={{ textAlign: 'center' }}>
          <h3 className="headline-en" style={{ margin: 0, fontSize: '1rem', letterSpacing: '2px', color: 'var(--color-text)' }}>
            {isEn ? "COMPARE" : "तुलना करें"}
          </h3>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-text)', margin: '4px auto 0' }}></div>
        </div>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'transparent', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-divider)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', width: '30%' }}></th>
              <th style={{ padding: '0.75rem', textAlign: 'center', width: '35%' }}>{currentName}</th>
              <th style={{ padding: '0.75rem', textAlign: 'center', width: '35%' }}>{savedName}</th>
            </tr>
          </thead>
          <tbody style={{ color: 'var(--color-text)' }}>
            <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{isEn ? "Overall Verdict" : "समग्र निर्णय"}</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase',
                  backgroundColor: currentIsFlagged ? 'var(--color-fail)' : 'var(--color-pass)', color: 'var(--color-bg)'
                }}>
                  {currentVerdict}
                </span>
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase',
                  backgroundColor: savedIsFlagged ? 'var(--color-fail)' : 'var(--color-pass)', color: 'var(--color-bg)'
                }}>
                  {savedVerdict}
                </span>
              </td>
            </tr>
            {renderRow("Sugar (% Cal)", "चीनी (% Cal)", currV.sugar, savedV.sugar, "%")}
            {renderRow("Fat (% Cal)", "वसा (% Cal)", currV.fat, savedV.fat, "%")}
            {renderRow("Salt (g/100g)", "नमक (g/100g)", currV.salt, savedV.salt, "g")}
            {renderRow("Trans Fat (%)", "ट्रांस फैट (%)", currV.transFat, savedV.transFat, "%")}
          </tbody>
        </table>
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.8, textAlign: 'center', fontStyle: 'italic', padding: '0 1rem' }}>
          {isEn ? "This comparison covers nutrient thresholds only — check each product's full verdict for claim accuracy." : "यह तुलना केवल पोषक तत्वों की सीमा को कवर करती है — दावों की सटीकता के लिए प्रत्येक उत्पाद के पूर्ण निर्णय की जांच करें।"}
        </p>
      </div>
    </div>
  );
};
