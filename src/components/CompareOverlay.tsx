import React from 'react';
import type { ExtractionResult, SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import type { Flag } from '../utils/ruleEngine';

interface CompareOverlayProps {
  currentScan: ExtractionResult;
  savedScans: SavedScan[];
  onClose: () => void;
  isEn: boolean;
}

export const CompareOverlay: React.FC<CompareOverlayProps> = ({ currentScan, savedScans, onClose, isEn }) => {
  // calculate verdicts
  const currentFlags = evaluateRules(currentScan, null);
  const savedFlagsArray = savedScans.map(s => evaluateRules(s.extractionResult, s.userFocus));

  const getOverallVerdict = (flagsList: Flag[]) => {
    if (flagsList.length === 0) return isEn ? "Grade A" : "ग्रेड ए";
    const isMostlyFine = flagsList.length === 1 && ['G1', 'G2', 'G3'].includes(flagsList[0].ruleId);
    if (flagsList.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) {
      return isEn ? "Flagged" : "फ़्लैग किया गया";
    }
    if (isMostlyFine) {
      return isEn ? "Mostly Fine" : "ज़्यादातर ठीक है";
    }
    if (flagsList.some(f => f.type === 'needs_verification')) {
      return isEn ? "Needs Verification" : "सत्यापन की आवश्यकता है";
    }
    return isEn ? "Minor Issues" : "मामूली समस्याएँ";
  };

  const currentVerdict = getOverallVerdict(currentFlags);
  const savedVerdicts = savedFlagsArray.map(getOverallVerdict);

  const currentIsFlagged = currentFlags.length > 0;
  const savedIsFlaggedArray = savedFlagsArray.map(flags => flags.length > 0);

  // G1-G4 values
  const getValues = (res: ExtractionResult) => {
    const n = res.nutrition;
    const hasEnergy = n.energy_kcal > 0;
    const sugar = hasEnergy ? Math.round(((n.total_sugar_g * 4) / n.energy_kcal) * 100) : null;
    const fat = hasEnergy ? Math.round(((n.total_fat_g * 9) / n.energy_kcal) * 100) : null;
    const salt = Number(((n.sodium_mg * 2.5) / 1000).toFixed(2));
    const transFat = (n.trans_fat_g !== null && n.total_fat_g > 0) ? Math.round((n.trans_fat_g / n.total_fat_g) * 100) : null;
    return { sugar, fat, salt, transFat };
  };

  const currV = getValues(currentScan);
  const savedVArray = savedScans.map(s => getValues(s.extractionResult));

  const currentName = currentScan.front_of_pack?.product_name || currentScan.front_of_pack?.brand_name || (isEn ? "Current Scan" : "वर्तमान स्कैन");
  const savedNames = savedScans.map((s, idx) => s.productName || s.brandName || (isEn ? `Saved Scan ${idx + 1}` : `सहेजा गया स्कैन ${idx + 1}`));

  // row render helper for numeric values
  const renderNumericRow = (labelEn: string, labelHi: string, currVal: number | null, savedVals: (number | null)[], unit: string) => {
    const allVals = [currVal, ...savedVals];
    const validVals = allVals.filter(v => v !== null) as number[];
    const maxVal = validVals.length > 0 ? Math.max(...validVals) : null;
    const minVal = validVals.length > 0 ? Math.min(...validVals) : null;
    
    // Only highlight if there's a clear "worst" value (meaning not all valid values are identical)
    const hasClearWorst = maxVal !== null && minVal !== null && maxVal > minVal;

    return (
      <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
        <td style={{ padding: '0.75rem', fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'var(--color-bg)', zIndex: 2 }}>
          {isEn ? labelEn : labelHi}
        </td>
        {allVals.map((val, idx) => {
          const valStr = val === null ? (isEn ? "Not available" : "उपलब्ध नहीं") : `${val}${unit}`;
          const isWorst = hasClearWorst && val === maxVal;
          return (
            <td key={idx} style={{ padding: '0.75rem', textAlign: 'center', backgroundColor: isWorst ? 'rgba(122, 46, 46, 0.1)' : 'transparent', fontWeight: isWorst ? 'bold' : 'normal', minWidth: '120px' }}>
              {valStr}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', color: 'var(--color-text)', zIndex: 100, display: 'flex', flexDirection: 'column', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button onClick={onClose} className="effect-elevated" style={{ background: 'var(--color-bg)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)', fontSize: '1.2rem', fontWeight: 'bold' }}>
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

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', overflowX: 'auto', position: 'relative', zIndex: 1 }}>
        <table className="effect-elevated" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, backgroundColor: 'var(--color-bg)', borderRadius: '16px', overflow: 'hidden', border: 'none' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', minWidth: '120px', position: 'sticky', left: 0, backgroundColor: 'var(--color-text)', zIndex: 3 }}></th>
              <th style={{ padding: '0.75rem', textAlign: 'center', minWidth: '120px' }}>{currentName}</th>
              {savedNames.map((name, idx) => (
                <th key={idx} style={{ padding: '0.75rem', textAlign: 'center', minWidth: '120px' }}>{name}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ color: 'var(--color-text)' }}>
            <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold', position: 'sticky', left: 0, backgroundColor: 'var(--color-bg)', zIndex: 2 }}>
                {isEn ? "Overall Verdict" : "समग्र निर्णय"}
              </td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                <span style={{ 
                  display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                  backgroundColor: currentIsFlagged ? 'var(--color-fail)' : 'var(--color-pass)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {currentVerdict}
                </span>
              </td>
              {savedVerdicts.map((verdict, idx) => (
                <td key={idx} style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <span style={{ 
                    display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                    backgroundColor: savedIsFlaggedArray[idx] ? 'var(--color-fail)' : 'var(--color-pass)', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {verdict}
                  </span>
                </td>
              ))}
            </tr>
            {renderNumericRow("Sugar (% Cal)", "चीनी (% Cal)", currV.sugar, savedVArray.map(v => v.sugar), "%")}
            {renderNumericRow("Fat (% Cal)", "वसा (% Cal)", currV.fat, savedVArray.map(v => v.fat), "%")}
            {renderNumericRow("Salt (g/100g)", "नमक (g/100g)", currV.salt, savedVArray.map(v => v.salt), "g")}
            {renderNumericRow("Trans Fat (%)", "ट्रांस फैट (%)", currV.transFat, savedVArray.map(v => v.transFat), "%")}
          </tbody>
        </table>
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', opacity: 0.8, textAlign: 'center', fontStyle: 'italic', padding: '0 1rem' }}>
          {isEn ? "This comparison covers nutrient thresholds only — check each product's full verdict for claim accuracy." : "यह तुलना केवल पोषक तत्वों की सीमा को कवर करती है — दावों की सटीकता के लिए प्रत्येक उत्पाद के पूर्ण निर्णय की जांच करें।"}
        </p>
      </div>
    </div>
  );
};
