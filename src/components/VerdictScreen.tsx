import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { TranslatableString, SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import { playVerdictAudio } from '../utils/audioService';
import { Header } from './Header';
import { CompareOverlay } from './CompareOverlay';
import { SavedScansScreen } from './SavedScansScreen';
import { XRayVisualizer } from './XRayVisualizer';
import { ConsolidatedRecommendation } from './ConsolidatedRecommendation';
import { ManufacturerReferenceCard } from './ManufacturerReferenceCard';

export const VerdictScreen: React.FC = () => {
  const { extractionResult, userFocus, userLanguage, saveScan, viewingSavedScanId, userGender, setUserGender, setHasChosenResultType, setIsAwarenessOpen } = useAppContext();
  const isEn = userLanguage === 'en';
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(!!viewingSavedScanId);
  const [isPickingCompare, setIsPickingCompare] = useState(false);
  const [compareAgainstScans, setCompareAgainstScans] = useState<SavedScan[] | null>(null);

  const flags = useMemo(() => {
    if (!extractionResult) return [];
    return evaluateRules(extractionResult, userFocus);
  }, [extractionResult, userFocus]);

  const overallState = useMemo(() => {
    const isMostlyFine = flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId);
    if (flags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) return 'NOT RECOMMENDED';
    if (isMostlyFine) return 'MOSTLY FINE';
    if (flags.some(f => f.type === 'needs_verification')) return 'VERIFICATION NEEDED';
    if (flags.length > 0) return 'MINOR ISSUES';
    return 'GOOD CHOICE';
  }, [flags]);



  // Aggregate relevant ingredients across all flags AND any ingredients that were translated (INS codes, scientific terms)
  const relevantIngredients = useMemo(() => {
    if (!extractionResult) return [];
    
    const allIngredients: TranslatableString[] = [];
    
    // 1. Add all ingredients explicitly flagged by ruleEngine
    flags.forEach(flag => {
      flag.relevantIngredients.forEach(ing => {
        if (!allIngredients.find(i => i.normalized_english === ing.normalized_english)) {
          allIngredients.push(ing);
        }
      });
    });

    extractionResult.ingredients.raw_list.forEach(ing => {
      if (ing.plain_name && ing.plain_name.trim().toLowerCase() !== ing.normalized_english.trim().toLowerCase()) {
        if (!allIngredients.find(i => i.normalized_english === ing.normalized_english)) {
          allIngredients.push(ing);
        }
      }
    });

    return allIngredients;
  }, [flags, extractionResult]);



  const handleAudioClick = async () => {
    if (!userLanguage) return;
    setIsAudioLoading(true);
    await playVerdictAudio(flags, relevantIngredients, userLanguage);
    setIsAudioLoading(false);
  };

  const handleCompareClick = () => {
    setIsPickingCompare(true);
  };

  const handleShareClick = async () => {
    const pName = extractionResult?.front_of_pack?.product_name || extractionResult?.front_of_pack?.brand_name || (isEn ? 'this product' : 'यह उत्पाद');
    
    let verdictStr = isEn ? "NO ISSUES FOUND" : "कोई समस्या नहीं मिली";
    const tierFlags = flags.filter(f => f.ruleId !== 'PROV_OIL' && f.ruleId !== 'PROV_150' && f.ruleId !== 'INFO1');
    if (tierFlags.length > 0) {
      const isMostlyFine = tierFlags.length === 1 && ['G1', 'G2', 'G3'].includes(tierFlags[0].ruleId);
      if (tierFlags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) {
        verdictStr = isEn ? "NOT RECOMMENDED" : "अनुशंसित नहीं";
      } else if (isMostlyFine) {
        const nutrientEn = tierFlags[0].ruleId === 'G1' ? 'SUGAR' : tierFlags[0].ruleId === 'G2' ? 'FAT/OIL' : 'SALT';
        const nutrientHi = tierFlags[0].ruleId === 'G1' ? 'चीनी' : tierFlags[0].ruleId === 'G2' ? 'वसा/तेल' : 'नमक';
        verdictStr = isEn ? `MOSTLY FINE — WATCH THE ${nutrientEn}` : `ज़्यादातर ठीक है, बस ${nutrientHi} पर ध्यान दें।`;
      } else if (tierFlags.some(f => f.type === 'needs_verification')) {
        verdictStr = isEn ? "VERIFICATION NEEDED" : "सत्यापन की आवश्यकता है";
      } else {
        verdictStr = isEn ? "MINOR ISSUES" : "मामूली समस्याएँ";
      }
    }

    const appUrl = "https://food-label-detector-buildathon.vercel.app";
    const textToShare = isEn 
      ? `I checked ${pName} with Food Label Detector — ${verdictStr}. Check your own products: ${appUrl}`
      : `मैंने Food Label Detector के साथ ${pName} की जाँच की — ${verdictStr}। अपने उत्पादों की जाँच करें: ${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: textToShare });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        alert(isEn ? "Copied to clipboard!" : "क्लिपबोर्ड पर कॉपी किया गया!");
      } catch (err) {
        console.error("Clipboard error", err);
      }
    }
  };

  if (compareAgainstScans && compareAgainstScans.length > 0 && extractionResult) {
    return (
      <CompareOverlay 
        currentScan={extractionResult} 
        savedScans={compareAgainstScans} 
        onClose={() => setCompareAgainstScans(null)} 
        isEn={isEn} 
      />
    );
  }

  if (isPickingCompare) {
    return (
      <SavedScansScreen 
        onSelectForCompare={(scans) => {
          setCompareAgainstScans(scans);
          setIsPickingCompare(false);
        }} 
        onCloseCompare={() => setIsPickingCompare(false)} 
      />
    );
  }

  // The old "NO ISSUES FOUND" screen block has been removed, as the new VerdictSummaryVisual handles it natively.

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <Header onAudioClick={handleAudioClick} isAudioLoading={isAudioLoading} onShareClick={handleShareClick} onCompareClick={handleCompareClick} />
      
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem', zIndex: 1, position: 'relative' }}>

        {/* Overarching Verdict */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', paddingTop: '0.5rem' }}>
          
          {/* Header Row: Product Name & Info Icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal', margin: 0, opacity: 0.8, lineHeight: 1.2, textAlign: 'left', flex: 1 }}>
              {(() => {
                const brand = extractionResult?.front_of_pack?.brand_name?.trim();
                const product = extractionResult?.front_of_pack?.product_name?.trim();
                if (brand && product) return `${brand} ${product}`;
                if (brand) return brand;
                if (product) return product;
                return isEn ? "Unknown Product" : "अज्ञात उत्पाद";
              })()}
            </h1>
            <button 
              onClick={() => setHasChosenResultType('ingredients')}
              style={{ 
                background: 'var(--color-bg)', 
                border: '1px solid var(--color-divider)', 
                borderRadius: '50%', 
                width: '36px', 
                height: '36px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                color: 'var(--color-text)', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                flexShrink: 0,
                marginTop: '-4px'
              }}
              title={isEn ? 'View full ingredient list' : 'पूरी सामग्री सूची देखें'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>


          {(() => {
            const tierFlags = flags.filter(f => f.ruleId !== 'PROV_OIL' && f.ruleId !== 'PROV_150' && f.ruleId !== 'INFO1');
            const isMostlyFine = tierFlags.length === 1 && ['G1', 'G2', 'G3'].includes(tierFlags[0].ruleId);
            if (tierFlags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) {
              const g1Fired = tierFlags.some(f => f.ruleId === 'G1');
              const g2Fired = tierFlags.some(f => f.ruleId === 'G2');
              const g3Fired = tierFlags.some(f => f.ruleId === 'G3');
              const g4Fired = tierFlags.some(f => f.ruleId === 'G4');
              const exceededEn: string[] = [];
              const exceededHi: string[] = [];
              
              if (g1Fired) { exceededEn.push('SUGAR'); exceededHi.push('चीनी'); }
              if (g2Fired) { exceededEn.push('FAT'); exceededHi.push('वसा'); }
              if (g3Fired) { exceededEn.push('SALT'); exceededHi.push('नमक'); }
              if (g4Fired) { exceededEn.push('TRANS FAT'); exceededHi.push('ट्रांस फैट'); }

              

              const headlinesEn: string[] = [];
              const headlinesHi: string[] = [];
              
              if (exceededEn.length > 0) {
                let joinedEn = '';
                let joinedHi = '';
                if (exceededEn.length === 1) {
                  joinedEn = exceededEn[0];
                  joinedHi = exceededHi[0];
                } else if (exceededEn.length === 2) {
                  joinedEn = exceededEn.join(' AND ');
                  joinedHi = exceededHi.join(' और ');
                } else {
                  const lastEn = exceededEn.pop();
                  joinedEn = exceededEn.join(', ') + ' AND ' + lastEn;
                  const lastHi = exceededHi.pop();
                  joinedHi = exceededHi.join(', ') + ' और ' + lastHi;
                }
                const isPluralEn = exceededEn.length > 0 || joinedEn.includes(' AND ');
                const isPluralHi = exceededHi.length > 0 || joinedHi.includes(' और ');
                
                headlinesEn.push(`${joinedEn} ${isPluralEn ? 'ARE' : 'IS'} TOO HIGH`);
                headlinesHi.push(`${joinedHi} बहुत अधिक ${isPluralHi ? 'हैं' : 'है'}`);
              }
              
              if (tierFlags.some(f => f.type === 'claim_contradiction')) {
                 headlinesEn.push('MISLEADING CLAIMS DETECTED');
                 headlinesHi.push('भ्रामक दावे पाए गए');
              }

              if (headlinesEn.length === 0) {
                 // Should not happen since we are in the 'NOT RECOMMENDED' block but just in case
                 headlinesEn.push('NOT RECOMMENDED');
                 headlinesHi.push('अनुशंसित नहीं');
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-fail)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                  </svg>
                  <h2 className="headline-en" style={{ fontSize: '1.5rem', color: 'var(--color-fail)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {isEn ? headlinesEn.join('\n•\n') : headlinesHi.join('\n•\n')}
                  </h2>
                </div>
              );
            } else if (isMostlyFine) {
              const nutrientEn = tierFlags[0].ruleId === 'G1' ? 'SUGAR' : tierFlags[0].ruleId === 'G2' ? 'FAT/OIL' : 'SALT';
              const nutrientHi = tierFlags[0].ruleId === 'G1' ? 'चीनी' : tierFlags[0].ruleId === 'G2' ? 'वसा/तेल' : 'नमक';
              return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-verify)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <h2 className="headline-en" style={{ fontSize: '1.5rem', color: 'var(--color-verify)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {isEn ? `MOSTLY FINE — WATCH THE ${nutrientEn}` : `ज़्यादातर ठीक है, बस ${nutrientHi} पर ध्यान दें।`}
                  </h2>
                </div>
              );
            } else if (tierFlags.some(f => f.type === 'needs_verification')) {
              return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-verify)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <h2 className="headline-en" style={{ fontSize: '1.5rem', color: 'var(--color-verify)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {isEn ? 'VERIFICATION NEEDED' : 'सत्यापन की आवश्यकता है'}
                  </h2>
                </div>
              );
            } else if (tierFlags.length > 0) {
              return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-verify)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <h2 className="headline-en" style={{ fontSize: '1.5rem', color: 'var(--color-pass)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {isEn ? 'MINOR ISSUES' : 'मामूली समस्याएँ'}
                  </h2>
                </div>
              );
            } else {
              return (
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-pass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h2 className="headline-en" style={{ fontSize: '1.5rem', color: 'var(--color-pass)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {isEn ? 'GOOD CHOICE' : 'अच्छा विकल्प'}
                  </h2>
                </div>
              );
            }
          })()}
        </div>

        {/* X-Ray Visualizer (Directly after heading) */}
        {extractionResult && (
          <XRayVisualizer data={extractionResult} />
        )}

        {/* Additional Insights / Subheadings */}
        {flags
          .filter(f => f.type !== 'needs_verification' && f.ruleId !== 'G1' && f.ruleId !== 'G2' && f.ruleId !== 'G3' && f.ruleId !== 'G4' && f.ruleId !== 'PROV_OIL' && f.ruleId !== 'PROV_150' && f.claim)
          .map((flag, idx) => (
            <p key={`insight-${idx}`} className={isEn ? "headline-en" : "headline-hi"} style={{ textAlign: 'center', fontSize: '1.1rem', color: flag.type === 'claim_contradiction' ? 'var(--color-fail)' : 'var(--color-text)', marginTop: '-0.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
              {flag.type === 'claim_contradiction' && (
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-fail)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                  {isEn ? 'MISLEADING CLAIM:' : 'भ्रामक दावा:'}
                </span>
              )}
              {flag.type === 'claim_contradiction' ? (
                <span style={{ textDecoration: 'line-through' }}>
                  {isEn ? flag.claim?.normalized_english : (flag.claim?.localized_display || flag.claim?.normalized_english)}
                </span>
              ) : (
                isEn ? flag.claim?.normalized_english : (flag.claim?.localized_display || flag.claim?.normalized_english)
              )}
            </p>
          ))
        }





        {flags.some(f => f.type === 'claim_contradiction' || f.type === 'general_health') && (
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.6, fontStyle: 'italic', marginTop: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.3, padding: '0 1rem' }}>
            {isEn 
              ? "We call it exactly as the rules say it is. A flagged product is not recommended — that verdict never changes. Where portion guidance appears, it's there to help you make the best of a real choice, not to soften the verdict."
              : "हम नियमों के अनुसार जो सही है वही बताते हैं। जिस उत्पाद को फ़्लैग किया गया है, वह अनुशंसित नहीं है — यह फैसला कभी नहीं बदलता। जहाँ मात्रा से जुड़ी सलाह दी जाती है, वह आपके असली विकल्प को बेहतर बनाने के लिए है, फैसले को नरम करने के लिए नहीं।"}
          </p>
        )}



        {extractionResult?.front_of_pack?.has_celebrity_endorsement && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-verify)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '4px',
              backgroundColor: 'var(--color-verify)'
            }} />
            <h4 style={{ 
              color: 'var(--color-verify)', 
              fontSize: '0.8rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              margin: '0 0 0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              {isEn ? 'Celebrity Endorsement' : 'सेलिब्रिटी विज्ञापन'}
            </h4>
            <p className={isEn ? 'body-en' : 'body-hi'} style={{ 
              margin: 0, 
              color: 'var(--color-text)', 
              fontSize: '0.9rem',
              lineHeight: 1.4,
              opacity: 0.9
            }}>
              {isEn 
                ? "Famous faces on packaging are almost always paid advertising — not proof the person actually uses this product." 
                : "पैकेजिंग पर प्रसिद्ध चेहरे लगभग हमेशा सशुल्क विज्ञापन होते हैं — इस बात का प्रमाण नहीं कि वह व्यक्ति वास्तव में इस उत्पाद का उपयोग करता है।"}
            </p>
          </div>
        )}

        {/* GENDER TOGGLE */}
        {flags.some(f => f.type === 'general_health') && (
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50px', padding: '4px' }}>
              {(['standard', 'male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setUserGender(g)}
                  style={{
                    backgroundColor: userGender === g ? 'var(--color-text)' : 'transparent',
                    color: userGender === g ? 'var(--color-bg)' : 'var(--color-text)',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    transition: 'all 0.2s'
                  }}
                >
                  {isEn 
                    ? g === 'standard' ? 'Standard' : g === 'male' ? 'Male' : 'Female'
                    : g === 'standard' ? 'मानक' : g === 'male' ? 'पुरुष' : 'महिला'
                  }
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONSOLIDATED RECOMMENDATION */}
        {extractionResult && (
          <ConsolidatedRecommendation 
            flags={flags} 
            extractionResult={extractionResult} 
            isEn={isEn} 
            userGender={userGender} 
          />
        )}

        {/* MANUFACTURER REFERENCE */}
        {extractionResult && (
          <ManufacturerReferenceCard 
            servingSizeG={extractionResult.nutrition.manufacturer_serving_size_g ?? null}
            servingsPerPack={extractionResult.nutrition.manufacturer_servings_per_pack ?? null}
            perServeRda={extractionResult.nutrition.manufacturer_per_serve_rda ?? null}
            advisories={extractionResult.manufacturer_advisories ?? null}
            isEn={isEn}
          />
        )}




        {/* AI Guardrails Link */}
        <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => alert(isEn ? 'AI models can make mistakes. Always verify claims and nutrition numbers against the physical packet.' : 'AI मॉडल गलतियाँ कर सकते हैं। हमेशा भौतिक पैकेट से दावों और पोषण संख्याओं को सत्यापित करें।')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              opacity: 0.6,
              textDecoration: 'underline',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {isEn ? 'AI Disclaimer & Guardrails' : 'AI अस्वीकरण और सुरक्षा उपाय'}
          </button>
        </div>

        {/* Awareness Link */}
        {(overallState === 'NOT RECOMMENDED' || overallState === 'MOSTLY FINE') && (
          <div style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setIsAwarenessOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text)',
                opacity: 0.6,
                textDecoration: 'underline',
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {isEn ? 'Did You Know?' : 'क्या आप जानते हैं?'}
            </button>
          </div>
        )}



        {/* Food Pharmer YouTube Embed */}
        {extractionResult?.front_of_pack?.video_id && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-divider)', paddingTop: '2rem', textAlign: 'center' }}>
            <h4 style={{ letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
              {isEn ? 'RELATED COVERAGE' : 'संबंधित कवरेज'}
            </h4>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--color-divider)', backgroundColor: '#000' }}>
              <iframe 
                src={`https://www.youtube.com/embed/${extractionResult.front_of_pack.video_id}`} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title="Food Pharmer Video"
              />
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', opacity: 0.7 }}>
              {isEn ? 'Video by Food Pharmer — not affiliated with this app.' : 'वीडियो फ़ूड फ़ार्मर द्वारा — इस ऐप से संबद्ध नहीं है।'}
            </p>
          </div>
        )}

        {/* Save Scan Button */}
        <div style={{ marginTop: '3rem', textAlign: 'center', paddingBottom: '2rem' }}>
          <button 
            onClick={() => {
              if (!hasSaved) {
                saveScan();
                setHasSaved(true);
              }
            }}
            disabled={hasSaved}
            style={{
              backgroundColor: hasSaved ? 'var(--color-pass)' : 'var(--color-text)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: '50px',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: hasSaved ? 'default' : 'pointer',
              opacity: hasSaved ? 0.8 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {hasSaved ? (isEn ? 'Saved!' : 'सहेजा गया!') : (isEn ? 'Save Scan' : 'स्कैन सहेजें')}
          </button>
        </div>

        {/* Feedback Link */}
        <div style={{ marginTop: '1rem', marginBottom: '3rem', textAlign: 'center' }}>
          <a 
            href="https://forms.gle/QzGgJSZbhV4Sc62A6" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-divider)',
              borderRadius: '50px',
              padding: '0.75rem 2rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}
          >
            {isEn ? 'Give Feedback' : 'प्रतिक्रिया दें'}
          </a>
        </div>
      </div>
    </div>
  );
};
