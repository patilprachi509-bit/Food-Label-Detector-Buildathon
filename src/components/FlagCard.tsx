import React, { useState } from 'react';
import type { Flag } from '../utils/ruleEngine';
import { useAppContext } from '../context/AppContext';
import { IconHeart, IconScale, IconSpoon, IconSugarCube, IconSaltShaker, IconDroplet } from './Icons';

interface FlagCardProps {
  flag: Flag;
}

const RadialProgress: React.FC<{ percentage: number; color?: string }> = ({ percentage, color = "var(--color-fail)" }) => {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const cappedPercentage = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (cappedPercentage / 100) * circumference;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" stroke="rgba(0,0,0,0.1)" strokeWidth="4" fill="none" />
      <circle 
        cx="24" cy="24" r="20" 
        stroke={color} strokeWidth="4" fill="none" 
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
        strokeLinecap="round" transform="rotate(-90 24 24)"
      />
    </svg>
  );
};

export const FlagCard: React.FC<FlagCardProps> = ({ flag }) => {
  const { userLanguage, userFocus, extractionResult } = useAppContext();
  const isEn = userLanguage === 'en';

  const [isExpanded, setIsExpanded] = useState(false);
  const [isWhatThisMeansExpanded, setIsWhatThisMeansExpanded] = useState(false);
  
  // Per-element visual/text toggle states
  const [showTextSpoons, setShowTextSpoons] = useState(false);
  const [showTextRadial, setShowTextRadial] = useState(false);
  const [showTextHealth, setShowTextHealth] = useState(false);

  const isNeedsVerification = flag.type === 'needs_verification';
  const isClaimContradiction = flag.type === 'claim_contradiction';

  // Specific styles based on variant
  const containerStyle: React.CSSProperties = {
    backgroundColor: isNeedsVerification ? 'rgba(71, 85, 105, 0.05)' : 'var(--color-bg)',
    border: isNeedsVerification ? '1px solid var(--color-verify)' : '1px solid var(--color-divider)',
    borderRadius: '24px',
    padding: '2rem',
    marginBottom: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: isNeedsVerification ? 'var(--color-verify)' : 'var(--color-fail)',
    color: 'var(--color-bg)',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '1rem',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  let BadgeIcon = null;
  if (flag.nutrientFocus === 'sugar') BadgeIcon = IconSugarCube;
  else if (flag.nutrientFocus === 'salt') BadgeIcon = IconSaltShaker;
  else if (flag.nutrientFocus === 'fat') BadgeIcon = IconDroplet;

  // Compute what this means logic early
  const isGeneralHealth = flag.type === 'general_health';
  const nutrition = extractionResult?.nutrition;
  
  let dailyLimit = 0;
  let nutrientPer100g = 0;
  let limitStrEn = "";
  let limitStrHi = "";
  let healthEn = "";
  let healthHi = "";
  let householdMeasureEn = "";
  let householdMeasureHi = "";
  let computedEn = "";
  let computedHi = "";
  let highProportionEn = "";
  let highProportionHi = "";
  let proportionStrEn = "";
  let proportionStrHi = "";
  let hasWhatThisMeans = false;
  let spoonCount = 0;
  
  let healthShortEn = "";
  let healthShortHi = "";
  let HealthIcon = null;
  let packPercentage = 0;

  if (isGeneralHealth && nutrition) {
    if (flag.ruleId === 'G1') {
      dailyLimit = 25;
      nutrientPer100g = nutrition.sugar_g;
      limitStrEn = "25-30g/day limit (ICMR-NIN Dietary Guidelines for Indians, 2024)";
      limitStrHi = "25-30 ग्राम/दिन सीमा (ICMR-NIN आहार संबंधी दिशानिर्देश, 2024)";
      householdMeasureEn = "(About 6-7 teaspoons)";
      householdMeasureHi = "(लगभग 6-7 चम्मच)";
      healthEn = "Association with weight gain and type 2 diabetes risk with regular excess intake.";
      healthHi = "नियमित अतिरिक्त सेवन के साथ वजन बढ़ने और टाइप 2 मधुमेह के जोखिम से संबंध।";
      spoonCount = 6;
      healthShortEn = "Weight & Diabetes Risk";
      healthShortHi = "वजन और मधुमेह का खतरा";
      HealthIcon = IconScale;
    } else if (flag.ruleId === 'G2') {
      dailyLimit = 25;
      nutrientPer100g = nutrition.total_fat_g;
      limitStrEn = "25-30g/day limit (ICMR-NIN Dietary Guidelines for Indians, 2024)";
      limitStrHi = "25-30 ग्राम/दिन सीमा (ICMR-NIN आहार संबंधी दिशानिर्देश, 2024)";
      householdMeasureEn = "(About 2 tablespoons)";
      householdMeasureHi = "(लगभग 2 बड़े चम्मच)";
      healthEn = "Association with increased LDL cholesterol and cardiovascular disease risk.";
      healthHi = "बढ़े हुए एलडीएल कोलेस्ट्रॉल और हृदय रोग के जोखिम से संबंध।";
      spoonCount = 2;
      healthShortEn = "Heart & Cholesterol Risk";
      healthShortHi = "हृदय और कोलेस्ट्रॉल का खतरा";
      HealthIcon = IconHeart;
    } else if (flag.ruleId === 'G3') {
      dailyLimit = 5;
      nutrientPer100g = Number(((nutrition.sodium_mg * 2.5) / 1000).toFixed(2));
      limitStrEn = "Under 5g/day limit (ICMR-NIN Dietary Guidelines for Indians, 2024)";
      limitStrHi = "5 ग्राम/दिन सीमा से कम (ICMR-NIN आहार संबंधी दिशानिर्देश, 2024)";
      householdMeasureEn = "(About 1 teaspoon)";
      householdMeasureHi = "(लगभग 1 चम्मच)";
      healthEn = "Association with high blood pressure risk.";
      healthHi = "उच्च रक्तचाप के जोखिम से संबंध।";
      spoonCount = 1;
      healthShortEn = "Blood Pressure Risk";
      healthShortHi = "रक्तचाप का खतरा";
      HealthIcon = IconHeart;
    } else if (flag.ruleId === 'G4') {
      dailyLimit = 2.2;
      nutrientPer100g = nutrition.trans_fat_g || 0;
      limitStrEn = "Under 1% of daily energy intake (~2.2g) (WHO)";
      limitStrHi = "दैनिक ऊर्जा सेवन के 1% से कम (~2.2 ग्राम) (WHO)";
      healthEn = "Association with increased LDL cholesterol and cardiovascular disease risk.";
      healthHi = "बढ़े हुए एलडीएल कोलेस्ट्रॉल और हृदय रोग के जोखिम से संबंध।";
      spoonCount = 0;
      healthShortEn = "Heart & Cholesterol Risk";
      healthShortHi = "हृदय और कोलेस्ट्रॉल का खतरा";
      HealthIcon = IconHeart;
    }

    if (dailyLimit > 0 && nutrientPer100g > 0) {
      hasWhatThisMeans = true;
      const computedGrams = Math.round((dailyLimit / nutrientPer100g) * 100);
      const netWeight = extractionResult?.front_of_pack?.net_weight_g;
      
      computedEn = `About ${computedGrams}g of this product would use your entire daily limit.`;
      computedHi = `इस उत्पाद का लगभग ${computedGrams}g आपकी संपूर्ण दैनिक सीमा का उपयोग करेगा।`;

      if (netWeight && netWeight > 0) {
        const proportion = computedGrams / netWeight;
        packPercentage = Math.round(100 / proportion);
        
        if (packPercentage >= 50) {
          highProportionEn = `This product alone uses up ${packPercentage}% of your daily limit — better as an occasional choice than a daily habit.`;
          highProportionHi = `यह उत्पाद अकेले आपकी दैनिक सीमा का ${packPercentage}% उपयोग करता है — दैनिक आदत के बजाय कभी-कभार विकल्प के रूप में बेहतर।`;
        }

        if (proportion > 0.8 && proportion < 1.2) {
          proportionStrEn = " — roughly the whole pack — ";
          proportionStrHi = " — लगभग पूरा पैक — ";
        } else if (proportion > 0.4 && proportion < 0.6) {
          proportionStrEn = " — roughly half the pack — ";
          proportionStrHi = " — लगभग आधा पैक — ";
        } else if (proportion > 0.2 && proportion < 0.35) {
          proportionStrEn = " — roughly a quarter of the pack — ";
          proportionStrHi = " — लगभग एक चौथाई पैक — ";
        } else if (proportion >= 1.2 && proportion < 2.5) {
          proportionStrEn = " — roughly two packs — ";
          proportionStrHi = " — लगभग दो पैक — ";
        } else {
          proportionStrEn = ` — roughly ${(proportion * 100).toFixed(0)}% of the pack — `;
          proportionStrHi = ` — पैक का लगभग ${(proportion * 100).toFixed(0)}% — `;
        }
        
        computedEn = `About ${computedGrams}g of this product${proportionStrEn}would use your entire daily limit.`;
        computedHi = `इस उत्पाद का लगभग ${computedGrams}g${proportionStrHi}आपकी संपूर्ण दैनिक सीमा का उपयोग करेगा।`;
      }
    }
  }

  return (
    <div style={containerStyle} onClick={() => setIsExpanded(!isExpanded)}>
      {/* Tier 1: Always Visible */}
      {flag.claim && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase' }}>THE CLAIM</p>
          <h2 className="headline-en" style={{ 
            fontSize: '3rem', 
            lineHeight: 1, 
            position: 'relative',
            display: 'inline-block',
            wordBreak: 'break-word'
          }}>
            {isEn ? flag.claim.normalized_english : flag.claim.localized_display}
            {isClaimContradiction && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '-5%',
                width: '110%',
                height: '4px',
                backgroundColor: 'var(--color-fail)',
                transform: 'translateY(-50%)'
              }}></div>
            )}
          </h2>
        </div>
      )}

      {/* Flag Message / Headline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 className="headline-en" style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: flag.claim ? '1rem' : 0, margin: 0, wordBreak: 'break-word' }}>
          {isEn ? (flag.headline_en || flag.message_en) : (flag.headline_hi || flag.message_hi)}
        </h3>
        <span style={{ opacity: 0.5, fontSize: '0.8rem', paddingLeft: '1rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </div>

      {/* Badge with SVG Icon */}
      <div style={badgeStyle}>
        {BadgeIcon && <BadgeIcon size={16} />}
        {isNeedsVerification ? (isEn ? 'NEEDS VERIFICATION' : 'सत्यापन की आवश्यकता है') : (isEn ? flag.message_en : flag.message_hi)}
      </div>

      {/* Threshold Gauge */}
      {flag.actualValue !== undefined && flag.thresholdValue !== undefined && (
        <div style={{ marginTop: '1.5rem', marginBottom: isExpanded ? '1.5rem' : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', opacity: 0.7, textTransform: 'uppercase' }}>
            <span>0{flag.unit}</span>
            <span>{flag.isMax ? 'Limit' : 'Minimum'}: {flag.thresholdValue}{flag.unit}</span>
          </div>
          {(() => {
            const maxScale = Math.max(flag.thresholdValue * 2.5, flag.actualValue * 1.25);
            const actualPct = Math.min(100, (flag.actualValue / maxScale) * 100);
            const thresholdPct = Math.min(100, (flag.thresholdValue / maxScale) * 100);
            return (
              <div style={{ height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', position: 'relative' }}>
                {/* Threshold Line */}
                <div style={{ position: 'absolute', left: `${thresholdPct}%`, top: '-4px', bottom: '-4px', width: '2px', backgroundColor: 'var(--color-divider)', zIndex: 2 }}></div>
                {/* Actual Bar */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${actualPct}%`, backgroundColor: 'var(--color-fail)', borderRadius: '4px' }}></div>
              </div>
            );
          })()}
          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 'bold' }}>
            {isEn ? 'Actual' : 'वास्तविक'}: {flag.actualValue}{flag.unit}
          </div>
        </div>
      )}

      {/* Tier 2: Collapsed by default */}
      {isExpanded && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-divider)', paddingTop: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
          {/* Plain Language Sentence */}
          {flag.actualValue !== undefined && flag.thresholdValue !== undefined && flag.evalDirection && (
            <p style={{ fontSize: '1rem', lineHeight: 1.4, margin: 0 }}>
              {isEn 
                ? `This product contains ${flag.actualValue}${flag.unit}, which is ${flag.evalDirection} the recommended limit of ${flag.thresholdValue}${flag.unit}.`
                : `इस उत्पाद में ${flag.actualValue}${flag.unit} है, जो ${flag.thresholdValue}${flag.unit} की अनुशंसित सीमा से ${flag.evalDirection === 'above' ? 'अधिक' : 'कम'} है।`
              }
            </p>
          )}

          {/* Citation Footnote */}
          <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.75rem' }}>
            {isEn ? `Source: ${flag.source}` : `स्रोत: ${flag.source}`}
          </p>
          
          {/* Personalization Note */}
          {userFocus === flag.nutrientFocus && flag.evalDirection && (
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--color-fail)' }}>
              {isEn ? `As per ${flag.source}, this is ${flag.evalDirection} the general threshold.` : `${flag.source} के अनुसार, यह सामान्य सीमा से ${flag.evalDirection === 'above' ? 'ऊपर' : 'नीचे'} है।`}
            </p>
          )}

          {/* What This Means Block (G1-G4 only) */}
          {hasWhatThisMeans && (
            <div 
              style={{ marginTop: '1.5rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '4px solid var(--color-divider)', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsWhatThisMeansExpanded(!isWhatThisMeansExpanded);
              }}
            >
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    {isEn ? 'WHAT THIS MEANS' : 'इसका क्या मतलब है'}
                  </h4>
                  {packPercentage > 0 ? (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTextRadial(!showTextRadial);
                      }}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}
                    >
                      {showTextRadial ? (
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
                          {isEn ? (highProportionEn || computedEn) : (highProportionHi || computedHi)}
                        </p>
                      ) : (
                        <>
                          <RadialProgress percentage={packPercentage} color="var(--color-fail)" />
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
                            {packPercentage}% {isEn ? 'of daily limit' : 'दैनिक सीमा का'}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-fail)' }}>
                      {isEn ? computedEn : computedHi}
                    </p>
                  )}
                </div>
                <span style={{ opacity: 0.5, fontSize: '0.7rem', transform: isWhatThisMeansExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </div>

              {/* Tier 3: Full Breakdown */}
              {isWhatThisMeansExpanded && (
                <div style={{ padding: '0 1rem 1rem 1rem', fontSize: '0.9rem', lineHeight: 1.5, borderTop: '1px solid var(--color-divider)', paddingTop: '1rem' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p style={{ margin: 0 }}>
                      <strong>{isEn ? 'Daily Limit:' : 'दैनिक सीमा:'}</strong> {isEn ? limitStrEn : limitStrHi}
                    </p>
                    {householdMeasureEn && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowTextSpoons(!showTextSpoons);
                        }}
                        style={{ cursor: 'pointer', marginTop: '0.4rem' }}
                      >
                        {showTextSpoons || spoonCount === 0 ? (
                          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                            {isEn ? householdMeasureEn : householdMeasureHi}
                          </p>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.25rem', opacity: 0.8, color: 'var(--color-text)' }}>
                            {Array.from({ length: spoonCount }).map((_, i) => <IconSpoon key={i} size={16} />)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTextHealth(!showTextHealth);
                    }}
                    style={{ cursor: 'pointer', marginTop: '1rem' }}
                  >
                    {showTextHealth || !HealthIcon ? (
                      <p style={{ margin: 0 }}>
                        <strong>{isEn ? 'Health Note:' : 'स्वास्थ्य नोट:'}</strong> {isEn ? healthEn : healthHi}
                      </p>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <HealthIcon size={20} />
                        <span>{isEn ? healthShortEn : healthShortHi}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
