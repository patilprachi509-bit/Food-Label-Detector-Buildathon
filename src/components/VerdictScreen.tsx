import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { TranslatableString, SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import { playVerdictAudio } from '../utils/audioService';
import { Header } from './Header';
import { FlagCard } from './FlagCard';
import { CompareOverlay } from './CompareOverlay';
import { SavedScansScreen } from './SavedScansScreen';
import { AIInsightCard } from './AIInsightCard';

import { VerdictSummaryVisual } from './VerdictSummaryVisual';
import { ConsolidatedRecommendation } from './ConsolidatedRecommendation';
import { ManufacturerReferenceCard } from './ManufacturerReferenceCard';
import { AlsoOnThisLabel } from './AlsoOnThisLabel';
import { DynamicSeverityCallout } from './DynamicSeverityCallout';

export const VerdictScreen: React.FC = () => {
  const { extractionResult, userFocus, userLanguage, saveScan, viewingSavedScanId, userGender, setUserGender, setHasChosenResultType } = useAppContext();
  const isEn = userLanguage === 'en';
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(!!viewingSavedScanId);
  const [isPickingCompare, setIsPickingCompare] = useState(false);
  const [compareAgainstScans, setCompareAgainstScans] = useState<SavedScan[] | null>(null);

  const flags = useMemo(() => {
    if (!extractionResult) return [];
    return evaluateRules(extractionResult, userFocus);
  }, [extractionResult, userFocus]);

  const aiInsights = useMemo(() => {
    if (!extractionResult?.front_of_pack?.unverified_claim_notes) return [];
    const ruleClaimMatches = flags.map(f => f.claim?.normalized_english).filter(Boolean);
    return extractionResult.front_of_pack.unverified_claim_notes.filter(
      note => note.concern && !ruleClaimMatches.includes(note.claim.normalized_english)
    );
  }, [extractionResult, flags]);

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
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button 
            onClick={() => setHasChosenResultType('ingredients')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}
          >
            {isEn ? 'View full ingredient list' : 'पूरी सामग्री सूची देखें'}
          </button>
        </div>
        

        
        {/* Overarching Verdict */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', paddingTop: '1.5rem' }}>
          
          {/* Product Name Display */}
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'normal', marginBottom: '0.5rem', marginTop: 0, opacity: 0.8, lineHeight: 1.2 }}>
            {(() => {
              const brand = extractionResult?.front_of_pack?.brand_name?.trim();
              const product = extractionResult?.front_of_pack?.product_name?.trim();
              if (brand && product) return `${brand} ${product}`;
              if (brand) return brand;
              if (product) return product;
              return isEn ? "Unknown Product" : "अज्ञात उत्पाद";
            })()}
          </h1>

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
                <h2 className="headline-en" style={{ fontSize: '1.8rem', color: 'var(--color-fail)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
                  {isEn ? headlinesEn.join('\n•\n') : headlinesHi.join('\n•\n')}
                </h2>
              );
            } else if (isMostlyFine) {
              const nutrientEn = tierFlags[0].ruleId === 'G1' ? 'SUGAR' : tierFlags[0].ruleId === 'G2' ? 'FAT/OIL' : 'SALT';
              const nutrientHi = tierFlags[0].ruleId === 'G1' ? 'चीनी' : tierFlags[0].ruleId === 'G2' ? 'वसा/तेल' : 'नमक';
              return (
                <h2 className="headline-en" style={{ fontSize: '1.8rem', color: 'var(--color-verify)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
                  {isEn ? `MOSTLY FINE — WATCH THE ${nutrientEn}` : `ज़्यादातर ठीक है, बस ${nutrientHi} पर ध्यान दें।`}
                </h2>
              );
            } else if (tierFlags.some(f => f.type === 'needs_verification')) {
              return (
                <h2 className="headline-en" style={{ fontSize: '1.8rem', color: 'var(--color-verify)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
                  {isEn ? 'VERIFICATION NEEDED' : 'सत्यापन की आवश्यकता है'}
                </h2>
              );
            } else if (tierFlags.length > 0) {
              return (
                <h2 className="headline-en" style={{ fontSize: '1.8rem', color: 'var(--color-pass)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
                  {isEn ? 'MINOR ISSUES' : 'मामूली समस्याएँ'}
                </h2>
              );
            } else {
              return (
                <h2 className="headline-en" style={{ fontSize: '1.8rem', color: 'var(--color-pass)', lineHeight: 1.1, fontWeight: 900, margin: 0, wordBreak: 'normal', whiteSpace: 'pre-wrap' }}>
                  {isEn ? 'GOOD CHOICE' : 'अच्छा विकल्प'}
                </h2>
              );
            }
          })()}
        </div>

        {/* Verdict Summary Visual */}
        {extractionResult && (
          <>
            <VerdictSummaryVisual 
              flags={flags}
              extractionResult={extractionResult}
              isEn={isEn}
              overallState={(() => {
                const isMostlyFine = flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId);
                if (flags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) return 'NOT RECOMMENDED';
                if (isMostlyFine) return 'MOSTLY FINE';
                if (flags.some(f => f.type === 'needs_verification')) return 'VERIFICATION NEEDED';
                if (flags.length > 0) return 'MINOR ISSUES';
                return 'GOOD CHOICE';
              })()}
            />
            <DynamicSeverityCallout
              flags={flags}
              extractionResult={extractionResult}
              isEn={isEn}
              overallState={(() => {
                const isMostlyFine = flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId);
                if (flags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) return 'NOT RECOMMENDED';
                if (isMostlyFine) return 'MOSTLY FINE';
                if (flags.some(f => f.type === 'needs_verification')) return 'VERIFICATION NEEDED';
                if (flags.length > 0) return 'MINOR ISSUES';
                return 'GOOD CHOICE';
              })()}
            />
          </>
        )}

        {/* Manufacturer Advisories */}
        {extractionResult?.manufacturer_advisories && extractionResult.manufacturer_advisories.length > 0 && (
          <div style={{
            backgroundColor: 'rgba(255, 193, 7, 0.12)',
            border: '2px dashed #FFB300',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ 
              color: '#B78103', 
              fontSize: '0.8rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              margin: '0 0 0.75rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {isEn ? 'As printed on the pack:' : 'पैक पर छपा हुआ:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {extractionResult.manufacturer_advisories.map((adv: any, idx: number) => (
                <p key={idx} style={{ 
                  margin: 0, 
                  color: '#78350F', 
                  fontSize: '1.15rem',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  fontWeight: 800
                }}>
                  "{isEn ? adv.normalized_english : (adv.localized_display || adv.normalized_english)}"
                </p>
              ))}
            </div>
          </div>
        )}

        {flags.some(f => f.type === 'claim_contradiction' || f.type === 'general_health') && (
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.6, fontStyle: 'italic', marginTop: '0.75rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.3, padding: '0 1rem' }}>
            {isEn 
              ? "We call it exactly as the rules say it is. A flagged product is not recommended — that verdict never changes. Where portion guidance appears, it's there to help you make the best of a real choice, not to soften the verdict."
              : "हम नियमों के अनुसार जो सही है वही बताते हैं। जिस उत्पाद को फ़्लैग किया गया है, वह अनुशंसित नहीं है — यह फैसला कभी नहीं बदलता। जहाँ मात्रा से जुड़ी सलाह दी जाती है, वह आपके असली विकल्प को बेहतर बनाने के लिए है, फैसले को नरम करने के लिए नहीं।"}
          </p>
        )}

        {aiInsights.map((insight, idx) => (
          <AIInsightCard key={`insight-${idx}`} insight={insight} isEn={isEn} />
        ))}

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
            isEn={isEn}
          />
        )}

        {flags.map((flag, idx) => (
          <div key={`${flag.ruleId}-${idx}`} style={{ marginBottom: '1.5rem' }}>
            <FlagCard flag={flag} />
          </div>
        ))}

        {extractionResult && <AlsoOnThisLabel extractionResult={extractionResult} isEn={isEn} />}



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
