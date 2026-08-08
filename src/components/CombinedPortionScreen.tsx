import React, { useMemo } from 'react';
import type { SavedScan } from '../context/AppContext';
import { getDailyLimitInfo } from '../utils/dailyLimits';
import { Citation } from './Citation';
import { RichText } from './RichText';

interface Props {
  scans: SavedScan[];
  onClose: () => void;
  isEn: boolean;
  userGender: 'standard' | 'male' | 'female';
}

export const CombinedPortionScreen: React.FC<Props> = ({ scans, onClose, isEn, userGender }) => {
  // 1. Calculate Limiting Nutrient across ALL selected products
  const combinedInfo = useMemo(() => {
    let totalSugarFraction = 0;
    let totalFatFraction = 0;
    let totalSaltFraction = 0;

    let sugarDailyLimit = 0;
    let fatDailyLimit = 0;
    let saltDailyLimit = 0;

    const productDetails: any[] = [];

    scans.forEach(scan => {
      const ext = scan.extractionResult;

      const packWeight = ext.front_of_pack?.net_weight_g;
      const format = ext.front_of_pack?.consumption_format || 'other';
      const extractedServingStr = ext.nutrition.serving_size;

      let refWeight = 100;
      let weightUnit = 'g';
      let isPack = false;

      if (format === 'solid_snack' && packWeight) {
        refWeight = packWeight;
        isPack = true;
      } else if (format === 'beverage') {
        refWeight = 200;
        weightUnit = 'ml';
      } else if (format === 'spoonable') {
        refWeight = 15;
      } else if (extractedServingStr) {
        const match = extractedServingStr.match(/(\d+(?:\.\d+)?)\s*(g|ml)/i);
        if (match && match[1]) {
          refWeight = parseFloat(match[1]);
          if (match[2].toLowerCase() === 'ml') weightUnit = 'ml';
        }
      }

      let sugarPer100g = 0;
      let fatPer100g = 0;
      let saltPer100g = 0;

      // Extract limit info by simulating flags, or just calling getDailyLimitInfo directly.
      // Since we know the ruleIds, we can fetch them.
      ['G1', 'G2', 'G3'].forEach(ruleId => {
        // Create a dummy flag just to get the limit info
        const dummyFlag = { ruleId, type: 'general_health', nutrientFocus: ruleId === 'G1' ? 'sugar' : ruleId === 'G2' ? 'fat' : 'salt' } as any;
        const limitInfo = getDailyLimitInfo(dummyFlag, ext, userGender);
        if (limitInfo) {
          const totalInFullConsume = (limitInfo.nutrientPer100g / 100) * refWeight;
          const fraction = totalInFullConsume / limitInfo.dailyLimitGrams;
          
          if (ruleId === 'G1') {
            totalSugarFraction += fraction;
            sugarDailyLimit = limitInfo.dailyLimitGrams;
            sugarPer100g = limitInfo.nutrientPer100g;
          } else if (ruleId === 'G2') {
            totalFatFraction += fraction;
            fatDailyLimit = limitInfo.dailyLimitGrams;
            fatPer100g = limitInfo.nutrientPer100g;
          } else if (ruleId === 'G3') {
            totalSaltFraction += fraction;
            saltDailyLimit = limitInfo.dailyLimitGrams;
            saltPer100g = limitInfo.nutrientPer100g;
          }
        }
      });

      productDetails.push({
        scan,
        refWeight,
        weightUnit,
        isPack,
        sugarPer100g,
        fatPer100g,
        saltPer100g
      });
    });

    if (sugarDailyLimit === 0 && fatDailyLimit === 0 && saltDailyLimit === 0) return null;

    // Calculate individual portions
    productDetails.forEach(p => {
      let targetGrams = Infinity;
      let bottleneckNutrient = '';

      if (p.sugarPer100g > 0 && sugarDailyLimit > 0) {
        const sugarBudget = (sugarDailyLimit * 0.25) / scans.length;
        const g = (sugarBudget / p.sugarPer100g) * 100;
        if (g < targetGrams) { targetGrams = g; bottleneckNutrient = 'sugar'; }
      }
      if (p.fatPer100g > 0 && fatDailyLimit > 0) {
        const fatBudget = (fatDailyLimit * 0.25) / scans.length;
        const g = (fatBudget / p.fatPer100g) * 100;
        if (g < targetGrams) { targetGrams = g; bottleneckNutrient = 'fat'; }
      }
      if (p.saltPer100g > 0 && saltDailyLimit > 0) {
        const saltBudget = (saltDailyLimit * 0.25) / scans.length;
        const g = (saltBudget / p.saltPer100g) * 100;
        if (g < targetGrams) { targetGrams = g; bottleneckNutrient = 'salt'; }
      }

      if (targetGrams === Infinity) {
        p.targetGrams = -1;
      } else {
        p.targetGrams = Math.round(targetGrams);
        p.bottleneckNutrient = bottleneckNutrient;
      }
    });

    return {
      productDetails
    };

  }, [scans, userGender]);

  if (!combinedInfo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text)' }}>&times;</button>
          <h3 style={{ margin: '0 0 0 1rem' }}>{isEn ? 'COMBINED VIEW' : 'संयुक्त दृश्य'}</h3>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>{isEn ? "No clear limiting nutrient found across these products." : "इन उत्पादों में कोई स्पष्ट सीमित पोषक तत्व नहीं मिला।"}</p>
        </div>
      </div>
    );
  }

  const numProducts = scans.length;

  const getNutrientLabelEn = (n: string) => n === 'sugar' ? 'Sugar' : n === 'fat' ? 'Fat' : n === 'salt' ? 'Salt' : '';
  const getNutrientLabelHi = (n: string) => n === 'sugar' ? 'चीनी' : n === 'fat' ? 'वसा' : n === 'salt' ? 'नमक' : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, overflowY: 'auto' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text)' }}>&times;</button>
        <h3 style={{ margin: '0 0 0 1rem', fontSize: '1rem', letterSpacing: '1px' }}>
          {isEn ? 'COMBINED SUGGESTED PORTION' : 'संयुक्त सुझाया गया हिस्सा'}
        </h3>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div className="effect-elevated" style={{ backgroundColor: 'var(--color-bg)', backgroundImage: "url('/suggestion-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '24px', padding: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text)', margin: '0 0 1rem 0', lineHeight: 1.3 }}>
            {isEn 
              ? `Your 25% daily safety budget (for Sugar, Fat, and Salt) is split evenly across these ${numProducts} products.`
              : `आपका 25% दैनिक सुरक्षित बजट (चीनी, वसा और नमक के लिए) इन ${numProducts} उत्पादों में समान रूप से विभाजित किया गया है।`}
          </p>
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '0.25rem' }}>
            <Citation 
              shortLabel={<RichText text="ICMR-NIN" isEn={isEn} />}
              textEn={<>Adult reference, <RichText text="ICMR-NIN" isEn={isEn} /></>}
              textHi={<>वयस्क संदर्भ, <RichText text="ICMR-NIN" isEn={isEn} /></>}
              isEn={isEn}
            />
          </div>
        </div>

        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', opacity: 0.8 }}>
          {isEn ? 'To stay under 25% combined, eat only:' : '25% संयुक्त सीमा के भीतर रहने के लिए, केवल खाएं:'}
        </h4>

        {combinedInfo.productDetails.map((p, idx) => (
          <div key={idx} style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                {p.scan.brandName} {p.scan.productName}
              </h5>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
                {isEn 
                  ? (p.bottleneckNutrient ? `Restricted by ${getNutrientLabelEn(p.bottleneckNutrient)} limit` : 'Safe amount')
                  : (p.bottleneckNutrient ? `${getNutrientLabelHi(p.bottleneckNutrient)} सीमा द्वारा प्रतिबंधित` : 'सुरक्षित मात्रा')
                }
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-pass)' }}>
                {p.targetGrams === -1 ? (isEn ? 'Safe' : 'सुरक्षित') : `${p.targetGrams}${p.weightUnit}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
