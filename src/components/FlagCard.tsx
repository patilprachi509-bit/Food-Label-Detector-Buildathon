import React from 'react';
import { Flag } from '../utils/ruleEngine';
import { useAppContext } from '../context/AppContext';

interface FlagCardProps {
  flag: Flag;
}

export const FlagCard: React.FC<FlagCardProps> = ({ flag }) => {
  const { userLanguage, userFocus } = useAppContext();
  const isEn = userLanguage === 'en';

  const isNeedsVerification = flag.type === 'needs_verification';
  const isClaimContradiction = flag.type === 'claim_contradiction';

  // Specific styles based on variant
  const containerStyle: React.CSSProperties = {
    backgroundColor: isNeedsVerification ? '#E2E8F0' : 'var(--color-cream)', // Slate for needs verification
    border: isNeedsVerification ? 'none' : '1px solid var(--color-charcoal)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    position: 'relative',
    overflow: 'hidden'
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: isNeedsVerification ? '#475569' : 'var(--color-terracotta)', // Slate badge for needs verification
    color: 'var(--color-cream)',
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '1rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return (
    <div style={containerStyle}>
      {flag.claim && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase' }}>THE CLAIM</p>
          <h2 className="headline-en" style={{ 
            fontSize: '3rem', 
            lineHeight: 1, 
            position: 'relative',
            display: 'inline-block'
          }}>
            {isEn ? flag.claim.normalized_english : flag.claim.localized_display}
            {isClaimContradiction && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '-5%',
                width: '110%',
                height: '4px',
                backgroundColor: 'var(--color-terracotta)',
                transform: 'translateY(-50%)'
              }}></div>
            )}
          </h2>
        </div>
      )}

      {/* Flag Message */}
      <h3 className="headline-en" style={{ fontSize: '2rem', lineHeight: 1.1, marginTop: flag.claim ? '1rem' : 0 }}>
        {isEn ? flag.message_en : flag.message_hi}
      </h3>

      {/* Badge */}
      <div style={badgeStyle}>
        {isNeedsVerification ? (isEn ? 'NEEDS VERIFICATION' : 'सत्यापन की आवश्यकता है') : (isEn ? flag.message_en : flag.message_hi)}
      </div>

      {/* Citation */}
      <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1rem' }}>
        {isEn ? `Source: ${flag.source}` : `स्रोत: ${flag.source}`}
      </p>
      
      {/* Personalization Note */}
      {userFocus === flag.nutrientFocus && (
        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--color-terracotta)' }}>
          {isEn ? `As per ${flag.source}, this is above/below the general threshold.` : `${flag.source} के अनुसार, यह सामान्य सीमा से ऊपर/नीचे है।`}
        </p>
      )}
    </div>
  );
};
