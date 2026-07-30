import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { TranslatableString } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import { playVerdictAudio } from '../utils/audioService';
import { Header } from './Header';
import { FlagCard } from './FlagCard';
import { CompareOverlay } from './CompareOverlay';
import { SavedScansScreen } from './SavedScansScreen';
import { AIInsightCard } from './AIInsightCard';
import { AnnotatedPhotoReveal, MatchedClaim } from './AnnotatedPhotoReveal';
import { VerdictSummaryVisual } from './VerdictSummaryVisual';
import { ConsolidatedRecommendation } from './ConsolidatedRecommendation';
import { IconShield, IconCandy, IconFlask, IconPalette, IconLeaf } from './Icons';
import type { SavedScan } from '../context/AppContext';

const IngredientPill: React.FC<{ rawName: string; plainName: string; isExpandable: boolean; isFaded: boolean; isEn: boolean }> = ({ rawName, plainName, isExpandable, isFaded, isEn }) => {
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
  
  if (lowerRaw.includes("red dye 3") || lowerRaw.includes("erythrosine") || lowerRaw.includes("ins 127") || lowerRaw.includes("e127") || lowerRaw.includes("e 127")) {
    restrictionEn = "This ingredient is banned in food in the US (since January 2025) and strictly restricted in the EU, though permitted in India. (verified 30 July 2026)";
    restrictionHi = "यह सामग्री अमेरिका में भोजन में प्रतिबंधित है (जनवरी 2025 से) और यूरोपीय संघ में सख्ती से प्रतिबंधित है, हालांकि भारत में इसकी अनुमति है। (सत्यापित 30 जुलाई 2026)";
  } else if (lowerRaw.includes("potassium iodate")) {
    restrictionEn = "This ingredient is banned in the EU, though permitted in India. (verified 30 July 2026)";
    restrictionHi = "यह सामग्री यूरोपीय संघ में प्रतिबंधित है, हालांकि भारत में इसकी अनुमति है। (सत्यापित 30 जुलाई 2026)";
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
        userSelect: isExpandable ? 'none' : 'auto'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {CategoryIcon && <CategoryIcon size={14} color="var(--color-text)" />}
            {plainName}
          </div>
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
        </div>
      )}
    </div>
  );
};

export const VerdictScreen: React.FC = () => {
  const { extractionResult, userFocus, userLanguage, saveScan, viewingSavedScanId, frontImage, userGender, setUserGender } = useAppContext();
  const isEn = userLanguage === 'en';
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [hasSaved, setHasSaved] = useState(!!viewingSavedScanId);
  const [isPickingCompare, setIsPickingCompare] = useState(false);
  const [compareAgainstScan, setCompareAgainstScan] = useState<SavedScan | null>(null);

  const flags = useMemo(() => {
    if (!extractionResult) return [];
    return evaluateRules(extractionResult, userFocus);
  }, [extractionResult, userFocus]);

  const aiInsights = useMemo(() => {
    if (!extractionResult?.front_of_pack?.unverified_claim_notes) return [];
    const ruleClaimMatches = flags.map(f => f.claim?.normalized_english).filter(Boolean);
    return extractionResult.front_of_pack.unverified_claim_notes.filter(
      note => note.concern && !ruleClaimMatches.includes(note.claim)
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

  const matchedClaims = useMemo(() => {
    if (viewingSavedScanId || !frontImage || !extractionResult) return [];
    
    const claimFlags = flags.filter(f => f.type === 'claim_contradiction' && f.claim?.normalized_english);
    const matches: MatchedClaim[] = [];
    
    claimFlags.forEach(flag => {
      const apiClaim = extractionResult.front_of_pack.claims.find(
        c => c.normalized_english === flag.claim?.normalized_english
      );
      if (apiClaim && apiClaim.bounding_box) {
        matches.push({
          flag,
          claimText: apiClaim.normalized_english,
          box: apiClaim.bounding_box
        });
      }
    });
    
    return matches;
  }, [flags, extractionResult, frontImage, viewingSavedScanId]);

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
    if (flags.length > 0) {
      if (flags.some(f => f.type === 'claim_contradiction' || f.type === 'general_health')) {
        verdictStr = isEn ? "NOT RECOMMENDED" : "अनुशंसित नहीं";
      } else if (flags.some(f => f.type === 'needs_verification')) {
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

  if (compareAgainstScan && extractionResult) {
    return (
      <CompareOverlay 
        currentScan={extractionResult} 
        savedScan={compareAgainstScan} 
        onClose={() => setCompareAgainstScan(null)} 
        isEn={isEn} 
      />
    );
  }

  if (isPickingCompare) {
    return (
      <SavedScansScreen 
        onSelectForCompare={(scan) => {
          setCompareAgainstScan(scan);
          setIsPickingCompare(false);
        }} 
        onCloseCompare={() => setIsPickingCompare(false)} 
      />
    );
  }

  if (compareAgainstScan && extractionResult) {
    return (
      <CompareOverlay 
        currentScan={extractionResult} 
        savedScan={compareAgainstScan} 
        onClose={() => setCompareAgainstScan(null)} 
        isEn={isEn} 
      />
    );
  }

  if (isPickingCompare) {
    return (
      <SavedScansScreen 
        onSelectForCompare={(scan) => {
          setCompareAgainstScan(scan);
          setIsPickingCompare(false);
        }} 
        onCloseCompare={() => setIsPickingCompare(false)} 
      />
    );
  }

  // The old "NO ISSUES FOUND" screen block has been removed, as the new VerdictSummaryVisual handles it natively.

  return (
    <div className="bg-dense" style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)' }}>
      <Header onAudioClick={handleAudioClick} isAudioLoading={isAudioLoading} onShareClick={handleShareClick} onCompareClick={handleCompareClick} />
      
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem', zIndex: 1, position: 'relative' }}>
        
        {matchedClaims.length > 0 && frontImage && (
          <AnnotatedPhotoReveal 
            frontImage={frontImage} 
            matchedClaims={matchedClaims} 
            isEn={isEn} 
          />
        )}
        
        {/* Overarching Verdict */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', paddingTop: '1.5rem' }}>
          {flags.some(f => f.type === 'claim_contradiction' || f.type === 'general_health') ? (
            <>
              <h2 className="headline-en" style={{ fontSize: '2.5rem', color: 'var(--color-fail)', lineHeight: 1, fontWeight: 900, margin: 0, wordBreak: 'break-word' }}>
                {isEn ? 'NOT RECOMMENDED' : 'अनुशंसित नहीं'}
              </h2>
              <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.85rem', opacity: 0.8, fontStyle: 'italic', marginTop: '0.75rem', lineHeight: 1.4 }}>
                {isEn 
                  ? "We call it exactly as the rules say it is. A flagged product is not recommended — that verdict never changes. Where portion guidance appears, it's there to help you make the best of a real choice, not to soften the verdict."
                  : "हम नियमों के अनुसार जो सही है वही बताते हैं। जिस उत्पाद को फ़्लैग किया गया है, वह अनुशंसित नहीं है — यह फैसला कभी नहीं बदलता। जहाँ मात्रा से जुड़ी सलाह दी जाती है, वह आपके असली विकल्प को बेहतर बनाने के लिए है, फैसले को नरम करने के लिए नहीं।"}
              </p>
            </>
          ) : flags.some(f => f.type === 'needs_verification') ? (
            <h2 className="headline-en" style={{ fontSize: '2.2rem', color: 'var(--color-verify)', lineHeight: 1, fontWeight: 900, margin: 0, wordBreak: 'break-word' }}>
              {isEn ? 'VERIFICATION NEEDED' : 'सत्यापन की आवश्यकता है'}
            </h2>
          ) : flags.length > 0 ? (
            <h2 className="headline-en" style={{ fontSize: '2.5rem', color: 'var(--color-pass)', lineHeight: 1, fontWeight: 900, margin: 0, wordBreak: 'break-word' }}>
              {isEn ? 'MINOR ISSUES' : 'मामूली समस्याएँ'}
            </h2>
          ) : (
             <h2 className="headline-en" style={{ fontSize: '2.5rem', color: 'var(--color-pass)', lineHeight: 1, fontWeight: 900, margin: 0, wordBreak: 'break-word' }}>
              {isEn ? 'GOOD CHOICE' : 'अच्छा विकल्प'}
            </h2>
          )}
        </div>

        {/* Verdict Summary Visual */}
        {extractionResult && (
          <VerdictSummaryVisual 
            flags={flags}
            extractionResult={extractionResult}
            isEn={isEn}
            overallState={
              flags.some(f => f.type === 'claim_contradiction' || f.type === 'general_health') ? 'NOT RECOMMENDED' :
              flags.some(f => f.type === 'needs_verification') ? 'VERIFICATION NEEDED' :
              flags.length > 0 ? 'MINOR ISSUES' : 'GOOD CHOICE'
            }
          />
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

        {flags.map((flag, idx) => (
          <div key={`${flag.ruleId}-${idx}`} style={{ marginBottom: '1.5rem' }}>
            <FlagCard flag={flag} />
          </div>
        ))}

        {aiInsights.map((insight, idx) => (
          <AIInsightCard key={`insight-${idx}`} insight={insight} isEn={isEn} />
        ))}

        {(relevantIngredients.length > 0 || (extractionResult?.ingredients.raw_list.length ?? 0) > 0) && (
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-divider)', paddingTop: '2rem' }}>
            <h4 style={{ letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {showAllIngredients 
                ? (isEn ? 'ALL INGREDIENTS' : 'सभी सामग्री') 
                : (isEn ? 'RELEVANT INGREDIENTS' : 'प्रासंगिक सामग्री')}
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {(showAllIngredients ? (extractionResult?.ingredients.raw_list || []) : relevantIngredients).map((ing, idx) => {
                const rawName = isEn ? ing.normalized_english : (ing.localized_display || ing.normalized_english);
                const rawClean = ing.normalized_english?.trim().toLowerCase() || '';
                const plainClean = ing.plain_name?.trim().toLowerCase() || '';
                const isExpandable = Boolean(plainClean && plainClean !== rawClean);
                const isFaded = showAllIngredients && !relevantIngredients.find(r => r.normalized_english === ing.normalized_english);

                return (
                  <IngredientPill 
                    key={idx} 
                    rawName={rawName} 
                    plainName={ing.plain_name || ''} 
                    isExpandable={isExpandable} 
                    isFaded={!!isFaded} 
                    isEn={isEn}
                  />
                );
              })}
            </div>
            {(extractionResult?.ingredients.raw_list.length ?? 0) > relevantIngredients.length && (
              <button 
                onClick={(e) => { e.preventDefault(); setShowAllIngredients(!showAllIngredients); }} 
                style={{ background: 'none', border: 'none', color: 'var(--color-text)', textDecoration: 'underline', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
              >
                {showAllIngredients 
                  ? (isEn ? 'Show only relevant ingredients' : 'केवल प्रासंगिक सामग्री दिखाएं') 
                  : (isEn ? 'Show full ingredient list' : 'पूरी सामग्री सूची दिखाएं')}
              </button>
            )}
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
      </div>
    </div>
  );
};
