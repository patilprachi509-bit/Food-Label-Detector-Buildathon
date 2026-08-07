import { forwardRef } from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';
import { IconShield } from './Icons';

interface ShareCardRendererProps {
  extractionResult: ExtractionResult | null;
  flags: Flag[];
  isEn: boolean;
  frontImage?: string | null;
}

export const ShareCardRenderer = forwardRef<HTMLDivElement, ShareCardRendererProps>(({ extractionResult, flags, isEn, frontImage }, ref) => {
  if (!extractionResult) return null;

  // Determine Overall State
  const tierFlags = flags.filter(f => f.ruleId !== 'PROV_OIL' && f.ruleId !== 'PROV_150' && f.ruleId !== 'INFO1');
  const isMostlyFine = tierFlags.length === 1 && ['G1', 'G2', 'G3'].includes(tierFlags[0].ruleId);
  const isFlagged = tierFlags.length > 0 && !isMostlyFine;
  const isGradeA = tierFlags.length === 0;
  const isNeedsVerification = tierFlags.some(f => f.type === 'needs_verification');
  
  let headlineEn = "GRADE A";
  let headlineHi = "ग्रेड ए";
  
  if (isFlagged || isNeedsVerification) {
    if (isNeedsVerification) {
      headlineEn = "VERIFICATION NEEDED";
      headlineHi = "सत्यापन आवश्यक";
    } else {
      headlineEn = "NOT RECOMMENDED";
      headlineHi = "अनुशंसित नहीं";
    }
  } else if (isMostlyFine) {
    headlineEn = "MOSTLY FINE";
    headlineHi = "ज़्यादातर ठीक है";
  }

  const pName = extractionResult.front_of_pack?.product_name || extractionResult.front_of_pack?.brand_name || (isEn ? "Unknown Product" : "अज्ञात उत्पाद");

  // Dynamic Callout Quote
  let quoteEn = `Checked against 10 sourced rules — nothing flagged.`;
  let quoteHi = `10 स्रोतों वाले नियमों के विरुद्ध जाँचा गया — कुछ भी फ़्लैग नहीं किया गया।`;
  
  if (!isGradeA) {
    const exceededEn: string[] = [];
    const exceededHi: string[] = [];
    
    if (tierFlags.some(f => f.ruleId === 'G1')) { exceededEn.push('Sugar'); exceededHi.push('चीनी'); }
    if (tierFlags.some(f => f.ruleId === 'G2')) { exceededEn.push('Fat'); exceededHi.push('वसा'); }
    if (tierFlags.some(f => f.ruleId === 'G3')) { exceededEn.push('Salt'); exceededHi.push('नमक'); }
    if (tierFlags.some(f => f.ruleId === 'G4')) { exceededEn.push('Trans Fat'); exceededHi.push('ट्रांस फैट'); }
    if (tierFlags.some(f => f.type === 'claim_contradiction')) { exceededEn.push('Misleading Claims'); exceededHi.push('भ्रामक दावे'); }
    
    if (exceededEn.length > 0) {
      let joinedEn = '';
      let joinedHi = '';
      
      if (exceededEn.length === 1) {
        joinedEn = exceededEn[0];
        joinedHi = exceededHi[0];
      } else if (exceededEn.length === 2) {
        joinedEn = exceededEn.join(' and ');
        joinedHi = exceededHi.join(' और ');
      } else {
        const lastEn = exceededEn.pop();
        joinedEn = exceededEn.join(', ') + ' and ' + lastEn;
        const lastHi = exceededHi.pop();
        joinedHi = exceededHi.join(', ') + ' और ' + lastHi;
      }
      
      const isPluralEn = exceededEn.length > 0 || joinedEn.includes('and');
      
      quoteEn = `${joinedEn} ${isPluralEn ? 'outweigh' : 'outweighs'} everything else — that's why this is Not Recommended.`;
      quoteHi = `${joinedHi} बाकी सब पर भारी ${isPluralEn ? 'हैं' : 'है'} — इसलिए यह अनुशंसित नहीं है।`;
    } else {
      // Fallback if it's some other flag we didn't explicitly map above
      quoteEn = `Specific factors outweigh everything else — that's why this is Not Recommended.`;
      quoteHi = `विशिष्ट कारक बाकी सब पर भारी हैं — इसलिए यह अनुशंसित नहीं है।`;
    }
  }

  // Format Headline (Solid Colors for html2canvas compatibility)
  const renderHeadline = () => {
    const text = isEn ? headlineEn : headlineHi;
    if (isGradeA) {
      return <span style={{ color: '#16402A' }}>{text}</span>;
    }
    // If it's a fail or verification needed, make it entirely orange
    return <span style={{ color: '#D64E29' }}>{text}</span>;
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Real Logo from public folder (No wordmark) */}
            <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
          </div>
          
          {/* Smart Choice Badge for Grade A */}
          {isGradeA && (
             <div style={{
               position: 'relative',
               width: '160px',
               height: '200px',
               marginTop: '-60px', // Hang from top
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               justifyContent: 'center'
             }}>
               {/* SVG Ribbon Background to avoid html2canvas clipPath bugs */}
               <svg style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }} width="160" height="200" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M0 0H160V170L80 200L0 170V0Z" fill="#16402A"/>
               </svg>
               
               <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
                 <IconShield size={48} color="#F7F2E9" />
                 <span style={{ marginTop: '20px', color: '#F7F2E9', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '2px', lineHeight: '1.4' }}>SMART CHOICE<br/>UNLOCKED</span>
               </div>
             </div>
          )}
        </div>

        {/* Product Name (Large) */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px', marginBottom: '20px', maxWidth: '85%' }}>
          <h2 style={{ fontFamily: '"Playfair Display", "Noto Serif Devanagari", serif', fontSize: '90px', fontWeight: '700', margin: '0 0 10px 0', color: '#2A2622', lineHeight: '1.1' }}>
            {pName}
          </h2>
          <div style={{ height: '4px', width: '250px', backgroundColor: '#B08D57', opacity: 0.5 }}></div>
        </div>

        {/* Product Image & Name */}
        {/* Verdict & Image Row */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', marginBottom: '20px' }}>
          <h1 className={isEn ? 'headline-en' : 'headline-hi'} style={{ 
            fontSize: isGradeA ? '170px' : '150px', 
            fontWeight: '900', 
            margin: '0', 
            lineHeight: '0.9',
            textTransform: 'uppercase',
            letterSpacing: isEn ? '-2px' : '0',
            flex: 1
          }}>
            {renderHeadline()}
          </h1>

          {frontImage && (
            <div style={{
              width: '260px',
              height: '260px',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '6px solid #16402A',
              flexShrink: 0,
              marginLeft: '30px'
            }}>
              <img src={frontImage} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>

        {/* Dynamic Quote Callout */}
        <div style={{ 
          marginTop: 'auto', 
          marginBottom: '60px', 
          display: 'flex', 
          gap: '20px',
          alignItems: 'flex-start',
          padding: '0 40px'
        }}>
          <span style={{ fontSize: '120px', color: '#B08D57', opacity: 0.8, lineHeight: '0.6', fontFamily: 'serif' }}>"</span>
          <p style={{ 
            fontFamily: '"Kalam", cursive',
            fontSize: '44px', 
            fontWeight: '700', 
            color: '#3B332C', 
            margin: '0', 
            lineHeight: '1.4',
            flex: 1
          }}>
            {isEn ? quoteEn : quoteHi}
          </p>
          <span style={{ fontSize: '120px', color: '#B08D57', opacity: 0.8, lineHeight: '0.6', fontFamily: 'serif', marginTop: 'auto' }}>"</span>
        </div>

        {/* Footer Pill */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '3px solid #16402A',
          borderRadius: '100px',
          padding: '20px 40px',
          backgroundColor: 'transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <img src="/logo.png" alt="Logo" style={{ height: '50px', width: 'auto', display: 'block' }} />
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <span style={{ fontSize: '18px', fontStyle: 'italic', color: '#2A2622' }}>Scanned with</span>
               <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '2px', color: '#2A2622', textTransform: 'uppercase' }}>LABEL TRUTH</span>
             </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '20px', fontStyle: 'italic', color: '#2A2622', fontWeight: '500' }}>
              Scan. Know. Choose Better.
            </span>
            <span style={{ fontSize: '20px', color: '#D64E29', fontWeight: '700', textDecoration: 'underline' }}>
              food-label-detector-buildathon.vercel.app
            </span>
          </div>
        </div>

      </div>
    </div>
  );
});
