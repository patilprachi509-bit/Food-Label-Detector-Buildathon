import React, { useState } from 'react';
import type { Flag } from '../utils/ruleEngine';
import { useAppContext } from '../context/AppContext';
import { IconSugarCube, IconSaltShaker, IconDroplet } from './Icons';
import { Citation } from './Citation';

interface FlagCardProps {
  flag: Flag;
}

export const FlagCard: React.FC<FlagCardProps> = ({ flag }) => {
  const { userLanguage, userFocus } = useAppContext();
  const isEn = userLanguage === 'en';

  const [isExpanded, setIsExpanded] = useState(false);

  const isNeedsVerification = flag.type === 'needs_verification';
  const isClaimContradiction = flag.type === 'claim_contradiction';
  const isGeneralHealth = flag.type === 'general_health';

  // Specific styles based on variant
  let bgImage = "url('/verification-bg.png')";
  if (flag.nutrientFocus === 'sugar') bgImage = "url('/sugar-bg.png')";
  else if (flag.nutrientFocus === 'salt') bgImage = "url('/salt-bg.png')";
  else if (flag.nutrientFocus === 'fat') bgImage = "url('/oil-bg.png')";

  const containerStyle: React.CSSProperties = {
    backgroundColor: isNeedsVerification ? 'rgba(71, 85, 105, 0.05)' : 'var(--color-bg)',
    backgroundImage: bgImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
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

  let healthAssociationEn = "";
  let healthAssociationHi = "";
  if (flag.nutrientFocus === 'sugar') {
    healthAssociationEn = "Associated with weight gain and increased risk of type 2 diabetes.";
    healthAssociationHi = "वजन बढ़ने और टाइप 2 मधुमेह के बढ़ते जोखिम से जुड़ा है।";
  } else if (flag.nutrientFocus === 'fat') {
    healthAssociationEn = "Associated with increased LDL cholesterol and cardiovascular disease risk.";
    healthAssociationHi = "बढ़े हुए LDL कोलेस्ट्रॉल और हृदय रोग के जोखिम से जुड़ा है।";
  } else if (flag.nutrientFocus === 'salt') {
    healthAssociationEn = "Associated with increased risk of high blood pressure.";
    healthAssociationHi = "उच्च रक्तचाप के बढ़ते जोखिम से जुड़ा है।";
  }

  return (
    <div style={containerStyle} onClick={() => setIsExpanded(!isExpanded)}>
      {/* Tier 1: Always Visible */}
      {flag.claim && (
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase' }}>{isEn ? 'THE CLAIM' : 'दावा'}</p>
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
        <div style={{ flex: 1 }}>
          <h3 className="headline-en" style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: flag.claim ? '1rem' : 0, margin: 0, wordBreak: 'break-word' }}>
            {isEn ? (flag.headline_en || flag.message_en) : (flag.headline_hi || flag.message_hi)}
          </h3>
          {(isEn ? flag.headline_en : flag.headline_hi) && (
            <p style={{ fontSize: '1rem', marginTop: '0.75rem', marginBottom: 0, opacity: 0.9, lineHeight: 1.4 }}>
              {isEn ? flag.message_en : flag.message_hi}
            </p>
          )}
          {isGeneralHealth && flag.relevantIngredients && flag.relevantIngredients.length > 0 && (
            <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.4rem', fontStyle: 'italic' }}>
              — {isEn ? 'from:' : 'से:'} {flag.relevantIngredients.map(ing => isEn ? ing.normalized_english : (ing.localized_display || ing.normalized_english)).join(', ')}
            </div>
          )}
        </div>
        <span style={{ opacity: 0.5, fontSize: '0.8rem', paddingLeft: '1rem', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginTop: flag.claim ? '1rem' : 0 }}>▼</span>
      </div>

      {/* Severity Pill / Badge */}
      <div style={badgeStyle}>
        {BadgeIcon && <BadgeIcon size={16} />}
        {isNeedsVerification ? (isEn ? 'NEEDS VERIFICATION' : 'सत्यापन की आवश्यकता है') : (isEn ? flag.message_en : flag.message_hi)}
      </div>

      {/* Tier 2: Collapsed by default */}
      {isExpanded && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-divider)', paddingTop: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
          
          {/* Two-Zone Gauge with Marker */}
          {flag.actualValue !== undefined && flag.thresholdValue !== undefined && (
            <div style={{ marginBottom: '1.5rem' }}>
              {(() => {
                const maxScale = Math.max(flag.thresholdValue * 2, flag.actualValue * 1.15);
                const actualPct = Math.min(100, (flag.actualValue / maxScale) * 100);
                const thresholdPct = Math.min(100, (flag.thresholdValue / maxScale) * 100);
                const limitLabelEn = flag.isMax ? 'Within Limit' : 'Below Minimum';
                const overLabelEn = flag.isMax ? 'Over Limit' : 'Meets Target';
                const limitLabelHi = flag.isMax ? 'सीमा के भीतर' : 'न्यूनतम से नीचे';
                const overLabelHi = flag.isMax ? 'सीमा से अधिक' : 'लक्ष्य पूरा करता है';
                
                return (
                  <div style={{ marginTop: '0.5rem', position: 'relative' }}>
                    {/* Marker pointing to actual */}
                    <div style={{ position: 'relative', height: '28px' }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: `${actualPct}%`, 
                        bottom: '0',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{flag.actualValue}{flag.unit}</span>
                        <span style={{ fontSize: '0.6rem', marginTop: '-2px' }}>▼</span>
                      </div>
                    </div>
                    {/* Two Zone Bar */}
                    <div style={{ 
                      height: '16px', 
                      borderRadius: '8px', 
                      position: 'relative', 
                      background: `linear-gradient(to right, ${flag.isMax ? 'var(--color-pass)' : 'var(--color-fail)'} ${thresholdPct}%, ${flag.isMax ? 'var(--color-fail)' : 'var(--color-pass)'} ${thresholdPct}%)`,
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{ position: 'absolute', left: `${thresholdPct}%`, top: 0, bottom: 0, width: '2px', backgroundColor: 'white', zIndex: 2 }}></div>
                    </div>
                    {/* Zone Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '0.4rem', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.8 }}>
                      <div style={{ width: `${thresholdPct}%`, textAlign: 'center', color: flag.isMax ? 'var(--color-pass)' : 'var(--color-fail)' }}>
                        {isEn ? limitLabelEn : limitLabelHi} (≤{flag.thresholdValue}{flag.unit})
                      </div>
                      <div style={{ width: `${100 - thresholdPct}%`, textAlign: 'center', color: flag.isMax ? 'var(--color-fail)' : 'var(--color-pass)' }}>
                        {isEn ? overLabelEn : overLabelHi}
                      </div>
                    </div>

                    {/* Detailed Sentence */}
                    <div style={{ marginTop: '1.5rem', fontSize: '0.95rem', lineHeight: 1.4, padding: '1rem', backgroundColor: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-divider)' }}>
                      {(() => {
                        let nEn = ''; let nHi = '';
                        if (flag.nutrientFocus === 'sugar') { nEn = 'sugar'; nHi = 'चीनी'; }
                        else if (flag.nutrientFocus === 'salt') { nEn = 'salt'; nHi = 'नमक'; }
                        else if (flag.nutrientFocus === 'fat') { nEn = 'fat'; nHi = 'वसा'; }
                        else if (flag.nutrientFocus === 'protein') { nEn = 'protein'; nHi = 'प्रोटीन'; }

                        const nameEn = nEn ? ` ${nEn}` : '';
                        const nameHi = nHi ? ` ${nHi}` : '';
                        const isAbove = flag.actualValue! > flag.thresholdValue!;
                        
                        const actualStrEn = flag.actualGrams !== undefined && flag.unit === '%' 
                          ? `${flag.actualValue}${flag.unit} (${flag.actualGrams}g)` 
                          : `${flag.actualValue}${flag.unit}`;
                          
                        const actualStrHi = flag.actualGrams !== undefined && flag.unit === '%' 
                          ? `${flag.actualValue}${flag.unit} (${flag.actualGrams}g)` 
                          : `${flag.actualValue}${flag.unit}`;

                        const thresholdStrEn = flag.thresholdGrams !== undefined && flag.unit === '%' 
                          ? `${flag.thresholdValue}${flag.unit} (${flag.thresholdGrams}g)` 
                          : `${flag.thresholdValue}${flag.unit}`;
                          
                        const thresholdStrHi = flag.thresholdGrams !== undefined && flag.unit === '%' 
                          ? `${flag.thresholdValue}${flag.unit} (${flag.thresholdGrams}g)` 
                          : `${flag.thresholdValue}${flag.unit}`;
                        
                        if (isEn) {
                          if (flag.isMax) {
                            return isAbove 
                              ? `This product contains ${actualStrEn}${nameEn}, which is above the recommended limit of ${thresholdStrEn}.`
                              : `This product contains ${actualStrEn}${nameEn}, which is within the recommended limit of ${thresholdStrEn}.`;
                          } else {
                             return isAbove
                              ? `This product contains ${actualStrEn}${nameEn}, which meets the recommended minimum of ${thresholdStrEn}.`
                              : `This product contains ${actualStrEn}${nameEn}, which is below the recommended minimum of ${thresholdStrEn}.`;
                          }
                        } else {
                          if (flag.isMax) {
                            return isAbove
                              ? `इस उत्पाद में ${actualStrHi}${nameHi} है, जो ${thresholdStrHi} की अनुशंसित सीमा से अधिक है।`
                              : `इस उत्पाद में ${actualStrHi}${nameHi} है, जो ${thresholdStrHi} की अनुशंसित सीमा के भीतर है।`;
                          } else {
                             return isAbove
                              ? `इस उत्पाद में ${actualStrHi}${nameHi} है, जो ${thresholdStrHi} की अनुशंसित न्यूनतम मात्रा को पूरा करता है।`
                              : `इस उत्पाद में ${actualStrHi}${nameHi} है, जो ${thresholdStrHi} की अनुशंसित न्यूनतम मात्रा से कम है।`;
                          }
                        }
                      })()}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Citation Marker */}
          <Citation 
            shortLabel={flag.source.includes('ICMR') ? 'ICMR-NIN' : flag.source.includes('FSSAI') ? 'FSSAI' : 'Source'}
            textEn={
              <>
                Source: {flag.source}
                {userFocus === flag.nutrientFocus && flag.evalDirection && (
                  <div style={{ marginTop: '0.4rem', color: 'var(--color-fail)' }}>
                    As per {flag.source}, this is {flag.evalDirection} the general threshold.
                  </div>
                )}
              </>
            }
            textHi={
              <>
                स्रोत: {flag.source === 'Adult reference, ICMR-NIN Dietary Guidelines 2024' ? 'वयस्क संदर्भ, ICMR-NIN आहार दिशानिर्देश 2024' : flag.source}
                {userFocus === flag.nutrientFocus && flag.evalDirection && (
                  <div style={{ marginTop: '0.4rem', color: 'var(--color-fail)' }}>
                    {flag.source === 'Adult reference, ICMR-NIN Dietary Guidelines 2024' ? 'ICMR-NIN' : flag.source} के अनुसार, यह सामान्य सीमा से {flag.evalDirection === 'above' ? 'ऊपर' : 'नीचे'} है।
                  </div>
                )}
              </>
            }
            isEn={isEn}
          />

          {/* Health Association Line */}
          {healthAssociationEn && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: 1.4, padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '4px solid var(--color-fail)' }}>
              <strong>{isEn ? 'Health Context:' : 'स्वास्थ्य संदर्भ:'}</strong> {isEn ? healthAssociationEn : healthAssociationHi}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
