import React from 'react';

interface ManufacturerRda {
  [key: string]: number;
}

interface Props {
  servingSizeG: number | null;
  servingsPerPack: number | null;
  perServeRda: ManufacturerRda | null;
  isEn: boolean;
}

const RdaItem: React.FC<{ label: string, value: number }> = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.75rem', borderRadius: '8px', minWidth: '60px' }}>
    <span style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize', marginBottom: '0.25rem' }}>{label}</span>
    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text)' }}>{value}%</span>
  </div>
);

export const ManufacturerReferenceCard: React.FC<Props> = ({ servingSizeG, servingsPerPack, perServeRda, isEn }) => {
  if (servingSizeG === null && servingsPerPack === null && !perServeRda) {
    return null;
  }

  const entries = perServeRda ? Object.entries(perServeRda) : [];

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem', border: '1px dashed var(--color-divider)' }}>
      <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--color-text)', opacity: 0.8 }}>
        {isEn ? 'Manufacturer\'s Reference' : 'निर्माता का संदर्भ'}
      </h4>
      
      <p style={{ fontSize: '1rem', color: 'var(--color-text)', margin: '0 0 1rem 0', fontWeight: 500 }}>
        {isEn 
          ? `As printed on the pack: 1 serving = ${servingSizeG || '?'}g${servingsPerPack ? ` (${servingsPerPack} servings per pack)` : ''}.`
          : `पैक पर छपा हुआ: 1 सर्विंग = ${servingSizeG || '?'}g${servingsPerPack ? ` (पैक में ${servingsPerPack} सर्विंग)` : ''}।`
        }
      </p>

      {entries.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {entries.map(([key, val]) => (
            <RdaItem key={key} label={key.replace('_', ' ')} value={val} />
          ))}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic', margin: 0, lineHeight: 1.3 }}>
        {isEn 
          ? "This is the manufacturer's own stated serving size, which may differ from the health-based recommendations above."
          : "यह निर्माता द्वारा बताई गई सर्विंग मात्रा है, जो ऊपर दी गई स्वास्थ्य-आधारित सिफारिशों से अलग हो सकती है।"}
      </p>
    </div>
  );
};
