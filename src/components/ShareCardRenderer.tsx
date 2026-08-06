import { forwardRef } from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';
import { IconShield, IconCandy, IconFlask, IconDroplet } from './Icons';

interface ShareCardRendererProps {
  extractionResult: ExtractionResult | null;
  flags: Flag[];
  isEn: boolean;
}

export const ShareCardRenderer = forwardRef<HTMLDivElement, ShareCardRendererProps>(({ extractionResult, flags, isEn }, ref) => {
  if (!extractionResult) return null;

  // Determine Overall State
  const tierFlags = flags.filter(f => f.ruleId !== 'PROV_OIL' && f.ruleId !== 'PROV_150' && f.ruleId !== 'INFO1');
  const isMostlyFine = tierFlags.length === 1 && ['G1', 'G2', 'G3'].includes(tierFlags[0].ruleId);
  const isFlagged = tierFlags.length > 0 && !isMostlyFine;
  const isGradeA = tierFlags.length === 0;
  const isNeedsVerification = tierFlags.some(f => f.type === 'needs_verification');
  
  let headlineColor = '#33473E'; // Sage green default (Grade A)
  let headlineEn = "GRADE A";
  let headlineHi = "ग्रेड ए";
  
  if (isFlagged || isNeedsVerification) {
    headlineColor = '#d95328'; // Terracotta
    headlineEn = isNeedsVerification ? "VERIFICATION NEEDED" : "NOT RECOMMENDED";
    headlineHi = isNeedsVerification ? "सत्यापन आवश्यक" : "अनुशंसित नहीं";
  } else if (isMostlyFine) {
    headlineColor = '#d95328'; // Use terracotta for "mostly fine" but maybe slightly softer? Let's stick to terracotta for any issue
    headlineEn = "MOSTLY FINE";
    headlineHi = "ज़्यादातर ठीक है";
  }

  const pName = extractionResult.front_of_pack?.product_name || extractionResult.front_of_pack?.brand_name || (isEn ? "Unknown Product" : "अज्ञात उत्पाद");

  // Nutrient Circles Logic
  const hasEnergy = typeof extractionResult.nutrition.energy_kcal === 'number' && extractionResult.nutrition.energy_kcal > 0;
  
  const getCircleColor = (val: number | null, threshold: number) => {
    if (val === null) return '#e0e0e0';
    return val > threshold ? '#d95328' : '#33473E';
  };

  const sugarPer = (hasEnergy && typeof extractionResult.nutrition.total_sugar_g === 'number' && !isNaN(extractionResult.nutrition.total_sugar_g)) 
    ? Math.round(((extractionResult.nutrition.total_sugar_g * 4) / extractionResult.nutrition.energy_kcal) * 100) 
    : null;
  
  const fatPer = (hasEnergy && typeof extractionResult.nutrition.total_fat_g === 'number' && !isNaN(extractionResult.nutrition.total_fat_g)) 
    ? Math.round(((extractionResult.nutrition.total_fat_g * 9) / extractionResult.nutrition.energy_kcal) * 100) 
    : null;
  
  const saltVal = (typeof extractionResult.nutrition.sodium_mg === 'number' && !isNaN(extractionResult.nutrition.sodium_mg)) 
    ? Number(((extractionResult.nutrition.sodium_mg * 2.5) / 1000).toFixed(2)) 
    : null;
  
  const transFatPer = (typeof extractionResult.nutrition.trans_fat_g === 'number' && typeof extractionResult.nutrition.total_fat_g === 'number' && extractionResult.nutrition.total_fat_g > 0) 
    ? Math.round((extractionResult.nutrition.trans_fat_g / extractionResult.nutrition.total_fat_g) * 100) 
    : null;

  const circles = [
    { labelEn: "Sugar", labelHi: "चीनी", val: sugarPer, unit: "%", thresh: 10, icon: IconCandy },
    { labelEn: "Fat", labelHi: "वसा", val: fatPer, unit: "%", thresh: 30, icon: IconFlask },
    { labelEn: "Salt", labelHi: "नमक", val: saltVal, unit: "g", thresh: 1, icon: IconShield },
    { labelEn: "Trans Fat", labelHi: "ट्रांस फैट", val: transFatPer, unit: "%", thresh: 1, icon: IconDroplet }
  ];

  // Dynamic Callout Quote
  let quoteEn = `Checked against 10 sourced rules — nothing flagged.`;
  let quoteHi = `10 स्रोतों वाले नियमों के विरुद्ध जाँचा गया — कुछ भी फ़्लैग नहीं किया गया।`;
  
  if (!isGradeA) {
    if (tierFlags.length === 1) {
      if (tierFlags[0].ruleId === 'G1') {
        quoteEn = `Sugar levels outweigh everything else — that's why this is flagged.`;
        quoteHi = `चीनी का स्तर बाकी सब पर भारी है — इसलिए इसे फ़्लैग किया गया है।`;
      } else if (tierFlags[0].ruleId === 'G2') {
        quoteEn = `Fat/Oil content outweighs everything else — that's why this is flagged.`;
        quoteHi = `वसा/तेल की मात्रा बाकी सब पर भारी है — इसलिए इसे फ़्लैग किया गया है।`;
      } else if (tierFlags[0].ruleId === 'G3') {
        quoteEn = `Salt levels outweigh everything else — that's why this is flagged.`;
        quoteHi = `नमक का स्तर बाकी सब पर भारी है — इसलिए इसे फ़्लैग किया गया है।`;
      } else {
        quoteEn = `Specific ingredients outweigh everything else — that's why this is flagged.`;
        quoteHi = `विशिष्ट सामग्रियां बाकी सब पर भारी हैं — इसलिए इसे फ़्लैग किया गया है।`;
      }
    } else {
      quoteEn = `Multiple factors like sugar, salt or additives outweigh everything else — that's why this is flagged.`;
      quoteHi = `चीनी, नमक या एडिटिव्स जैसे कई कारक बाकी सब पर भारी हैं — इसलिए इसे फ़्लैग किया गया है।`;
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        zIndex: -1,
        pointerEvents: 'none'
      }}
    >
      <div 
        ref={ref}
        style={{
          width: '1080px',
          height: '1080px',
          backgroundImage: `url('/cardshare-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#F7F2E9', // Fallback
          color: '#2A2622',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header: Logo + Product Name */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Logo Mark */}
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'transparent', border: '3px solid #2A2622', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
               <IconShield size={32} color="#2A2622" />
            </div>
            {/* Wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span className="headline-en" style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>LABEL</span>
              <span className="headline-en" style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>TRUTH</span>
            </div>
          </div>
          
          {/* Smart Choice Badge for Grade A */}
          {isGradeA && (
             <div style={{
               backgroundColor: '#33473E',
               color: '#F7F2E9',
               padding: '20px',
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center',
               clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)',
               width: '160px',
               height: '220px',
               position: 'absolute',
               top: '0',
               right: '100px'
             }}>
               <IconShield size={48} color="#F7F2E9" />
               <span style={{ marginTop: '20px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '2px', lineHeight: '1.4' }}>SMART CHOICE<br/>UNLOCKED</span>
             </div>
          )}
        </div>

        {/* Product Name - using standard headline font instead of cursive */}
        <div style={{ marginTop: '10px', marginBottom: '10px' }}>
          <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '40px', fontWeight: '700', margin: '0 0 10px 0', color: '#33473E', maxWidth: '80%' }}>
            {pName}
          </h2>
          <div style={{ height: '3px', width: '200px', backgroundColor: '#B08D57', opacity: 0.5 }}></div>
        </div>

        {/* Massive Verdict Headline */}
        <div style={{ marginTop: '10px', marginBottom: '40px' }}>
          <h1 className={isEn ? 'headline-en' : 'headline-hi'} style={{ 
            fontSize: isGradeA ? '160px' : (isEn ? '140px' : '120px'), 
            fontWeight: '900', 
            margin: '0', 
            color: headlineColor,
            lineHeight: '0.9',
            textTransform: 'uppercase',
            letterSpacing: isEn ? '-2px' : '0'
          }}>
            {isEn ? headlineEn : headlineHi}
          </h1>
          {/* Faux texture effect via text-shadow - optional, but keeps it clean */}
        </div>

        {/* Four Nutrient Circles */}
        <div style={{ display: 'flex', gap: '30px', marginBottom: '40px', alignItems: 'flex-start' }}>
          {circles.map((c, i) => {
            const color = getCircleColor(c.val, c.thresh);
            const Icon = c.icon;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px' }}>
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  backgroundColor: color, color: '#fff',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <Icon size={24} color="#fff" />
                  <span style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>
                    {c.val !== null ? `${c.val}${c.unit}` : '-'}
                  </span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '12px', color: '#2A2622', textAlign: 'center', lineHeight: '1.2' }}>
                  {isEn ? c.labelEn : c.labelHi}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Quote Callout */}
        <div style={{ 
          marginTop: 'auto', 
          marginBottom: '40px', 
          display: 'flex', 
          gap: '15px',
          alignItems: 'flex-start',
          padding: '0 20px'
        }}>
          <span style={{ fontSize: '80px', color: '#B08D57', opacity: 0.6, lineHeight: '0.6', fontFamily: 'serif' }}>"</span>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ 
            fontSize: '32px', 
            fontWeight: '500', 
            fontStyle: 'italic', 
            color: '#33473E', 
            margin: '0', 
            lineHeight: '1.4',
            flex: 1
          }}>
            {isEn ? quoteEn : quoteHi}
          </p>
          <span style={{ fontSize: '100px', color: '#B08D57', opacity: 0.6, lineHeight: '0.6', fontFamily: 'serif', marginTop: 'auto' }}>"</span>
        </div>

        {/* Footer Pill */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '3px solid #33473E',
          borderRadius: '100px',
          padding: '20px 40px',
          backgroundColor: 'transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '60px', justifyContent: 'space-between' }}>
                <span style={{ width: '15px', height: '15px', border: '3px solid #33473E', borderRadius: '50%' }}></span>
                <span style={{ width: '15px', height: '15px', border: '3px solid #33473E' }}></span>
                <span style={{ width: '15px', height: '15px', border: '3px solid #33473E' }}></span>
                <span style={{ width: '15px', height: '15px', border: '3px solid #33473E', borderRadius: '50%' }}></span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '20px', fontStyle: 'italic', color: '#33473E' }}>Scanned with</span>
               <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '2px', color: '#33473E' }}>LABEL TRUTH</span>
             </div>
          </div>
          <span style={{ fontSize: '22px', fontStyle: 'italic', color: '#33473E', fontWeight: '500' }}>
            Scan. Know. Choose Better.
          </span>
        </div>

      </div>
    </div>
  );
});
