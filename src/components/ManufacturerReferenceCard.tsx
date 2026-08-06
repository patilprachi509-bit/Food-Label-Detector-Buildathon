import React from 'react';

interface ManufacturerRda {
  [key: string]: number;
}

interface Props {
  servingSizeG: number | null;
  servingsPerPack: number | null;
  perServeRda: ManufacturerRda | null;
  advisories: any[] | null;
  isEn: boolean;
}

const RdaItem: React.FC<{ label: string, value: number }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', minWidth: '60px' }}>
    <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize', marginBottom: '0.25rem' }}>{label}</span>
    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{value}%</span>
  </div>
);

export const ManufacturerReferenceCard: React.FC<Props> = ({ servingSizeG, servingsPerPack, perServeRda, advisories, isEn }) => {
  if (servingSizeG === null && servingsPerPack === null && !perServeRda && (!advisories || advisories.length === 0)) {
    return null;
  }

  const entries = perServeRda 
    ? Object.entries(perServeRda).filter(([_, val]) => val !== null && val !== undefined)
    : [];

  const getLabel = (key: string, isEn: boolean) => {
    if (isEn) return key.replace('_', ' ');
    const hindiMap: Record<string, string> = {
      'added_sugar': 'अतिरिक्त चीनी',
      'energy': 'ऊर्जा',
      'fat': 'वसा',
      'sodium': 'सोडियम',
      'sugar': 'चीनी'
    };
    return hindiMap[key] || key.replace('_', ' ');
  };

  return (
    <div 
      className="effect-elevated"
      style={{ 
        borderRadius: '24px', 
        padding: '1.5rem', 
        marginBottom: '2rem', 
        border: '1px solid var(--color-divider)' 
      }}
    >
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-text)', opacity: 0.8 }}>
        {isEn ? 'Manufacturer\'s Reference' : 'निर्माता का संदर्भ'}
      </h4>
      
      { (servingSizeG !== null || servingsPerPack !== null) && (
        <p style={{ fontSize: '1rem', color: 'var(--color-text)', margin: '0 0 1rem 0', fontWeight: 500 }}>
          {isEn 
            ? `As printed on the pack: 1 serving = ${servingSizeG || '?'}g${servingsPerPack ? ` (${servingsPerPack} servings per pack)` : ''}.`
            : `पैक पर छपा हुआ: 1 सर्विंग = ${servingSizeG || '?'}g${servingsPerPack ? ` (पैक में ${servingsPerPack} सर्विंग)` : ''}।`
          }
        </p>
      )}

      {advisories && advisories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {advisories.map((adv: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B78103" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <p style={{ 
                margin: 0, 
                color: '#78350F', 
                fontSize: '1.05rem',
                fontStyle: 'italic',
                lineHeight: 1.4,
                fontWeight: 800
              }}>
                "{isEn ? adv.normalized_english : (adv.localized_display || adv.normalized_english)}"
              </p>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {entries.map(([key, val]) => (
            <RdaItem key={key} label={getLabel(key, isEn)} value={val} />
          ))}
        </div>
      )}

      <details style={{ opacity: 0.7, marginTop: '1rem', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '0.75rem' }}>
        <summary style={{ fontSize: '0.8rem', cursor: 'pointer', outline: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          {isEn ? 'Disclaimer' : 'अस्वीकरण'}
        </summary>
        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: '0.5rem 0 0 0', lineHeight: 1.3 }}>
          {isEn 
            ? "This is the manufacturer's own stated serving size, which may differ from the health-based recommendations above."
            : "यह निर्माता द्वारा बताई गई सर्विंग मात्रा है, जो ऊपर दी गई स्वास्थ्य-आधारित सिफारिशों से अलग हो सकती है।"}
        </p>
      </details>
    </div>
  );
};
