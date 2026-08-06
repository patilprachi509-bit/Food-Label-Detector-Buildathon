import { forwardRef } from 'react';
import type { ExtractionResult } from '../context/AppContext';
import type { Flag } from '../utils/ruleEngine';
import { IconShield } from './Icons';

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
    if (tierFlags.length === 1) {
      if (tierFlags[0].ruleId === 'G1') {
        quoteEn = `Sugar levels outweigh everything else — that's why this is Not Recommended.`;
        quoteHi = `चीनी का स्तर बाकी सब पर भारी है — इसलिए यह अनुशंसित नहीं है।`;
      } else if (tierFlags[0].ruleId === 'G2') {
        quoteEn = `Fat/Oil content outweighs everything else — that's why this is Not Recommended.`;
        quoteHi = `वसा/तेल की मात्रा बाकी सब पर भारी है — इसलिए यह अनुशंसित नहीं है।`;
      } else if (tierFlags[0].ruleId === 'G3') {
        quoteEn = `Salt levels outweigh everything else — that's why this is Not Recommended.`;
        quoteHi = `नमक का स्तर बाकी सब पर भारी है — इसलिए यह अनुशंसित नहीं है।`;
      } else {
        quoteEn = `Specific ingredients outweigh everything else — that's why this is Not Recommended.`;
        quoteHi = `विशिष्ट सामग्रियां बाकी सब पर भारी हैं — इसलिए यह अनुशंसित नहीं है।`;
      }
    } else {
      quoteEn = `Multiple factors like sugar, salt or additives outweigh everything else — that's why this is Not Recommended.`;
      quoteHi = `चीनी, नमक या एडिटिव्स जैसे कई कारक बाकी सब पर भारी हैं — इसलिए यह अनुशंसित नहीं है।`;
    }
  }

  // Format Headline (Split words for two-tone color)
  const renderHeadline = () => {
    const text = isEn ? headlineEn : headlineHi;
    if (isGradeA) {
      return <span style={{ color: '#16402A' }}>{text}</span>;
    }
    const words = text.split(' ');
    if (words.length > 1) {
      const firstWord = words.shift();
      const restWords = words.join(' ');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <span style={{ color: '#16402A', lineHeight: '0.9', fontSize: '180px' }}>{firstWord}</span>
          <span style={{ color: '#D64E29', lineHeight: '0.9', fontSize: '140px' }}>{restWords}</span>
        </div>
      );
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Real Logo from public folder */}
            <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto', display: 'block' }} />
            {/* Wordmark */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
              <span className="headline-en" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>LABEL</span>
              <span className="headline-en" style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>TRUTH</span>
            </div>
          </div>
          
          {/* Smart Choice Badge for Grade A */}
          {isGradeA && (
             <div style={{
               backgroundColor: '#16402A',
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

        {/* Product Name - using handwritten font (Kalam) */}
        <div style={{ marginTop: '20px', marginBottom: '10px' }}>
          <h2 style={{ fontFamily: '"Kalam", cursive', fontSize: '56px', fontWeight: '700', margin: '0 0 10px 0', color: '#16402A', maxWidth: '80%', lineHeight: '1.2' }}>
            {pName}
          </h2>
          <div style={{ height: '3px', width: '200px', backgroundColor: '#B08D57', opacity: 0.5 }}></div>
        </div>

        {/* Massive Verdict Headline */}
        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          <h1 className={isEn ? 'headline-en' : 'headline-hi'} style={{ 
            fontSize: isGradeA ? '180px' : '160px', 
            fontWeight: '900', 
            margin: '0', 
            lineHeight: '0.9',
            textTransform: 'uppercase',
            letterSpacing: isEn ? '-2px' : '0'
          }}>
            {renderHeadline()}
          </h1>
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
          <span style={{ fontSize: '120px', color: '#16402A', opacity: 0.8, lineHeight: '0.6', fontFamily: 'serif' }}>"</span>
          <p style={{ 
            fontFamily: '"Kalam", cursive',
            fontSize: '44px', 
            fontWeight: '700', 
            color: '#16402A', 
            margin: '0', 
            lineHeight: '1.4',
            flex: 1
          }}>
            {isEn ? quoteEn : quoteHi}
          </p>
          <span style={{ fontSize: '120px', color: '#16402A', opacity: 0.8, lineHeight: '0.6', fontFamily: 'serif', marginTop: 'auto' }}>"</span>
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
               <span style={{ fontSize: '18px', fontStyle: 'italic', color: '#16402A' }}>Scanned with</span>
               <span style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '2px', color: '#16402A', textTransform: 'uppercase' }}>LABEL TRUTH</span>
             </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '20px', fontStyle: 'italic', color: '#16402A', fontWeight: '500' }}>
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
