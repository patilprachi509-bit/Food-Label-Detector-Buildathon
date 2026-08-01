import React from 'react';
import { useAppContext } from '../context/AppContext';

export const BatchQueueScreen: React.FC = () => {
  const { userLanguage, batchItems, setBatchItems, setIsCapturingBatchItem, setIsBatchProcessing, clearBatchMode } = useAppContext();
  const isEn = userLanguage === 'en';
  const MAX_ITEMS = 8;

  const handleRemove = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          onClick={clearBatchMode}
          style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 style={{ margin: '0 0 0 1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
          {isEn ? 'Batch Scan' : 'बैच स्कैन'}
        </h2>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
          {isEn 
            ? `Add up to ${MAX_ITEMS} products to scan them all at once.` 
            : `${MAX_ITEMS} उत्पादों तक जोड़ें और उन्हें एक साथ स्कैन करें।`}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {batchItems.map((item, idx) => (
            <div key={item.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-divider)' }}>
              {item.frontImage && (
                <img src={item.frontImage} alt={`Item ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0.5rem', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>#{idx + 1}</span>
              </div>
              <button 
                onClick={() => handleRemove(item.id)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,0,0,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}

          {batchItems.length < MAX_ITEMS && (
            <button
              onClick={() => setIsCapturingBatchItem(true)}
              style={{
                aspectRatio: '1',
                borderRadius: '12px',
                border: '2px dashed var(--color-divider)',
                background: 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text)',
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{isEn ? 'Add Item' : 'आइटम जोड़ें'}</span>
            </button>
          )}
        </div>

        {batchItems.length >= MAX_ITEMS && (
          <p style={{ color: 'var(--color-fail)', textAlign: 'center', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            {isEn ? `Limit reached (${MAX_ITEMS} items).` : `सीमा पार हो गई (${MAX_ITEMS} आइटम)।`}
          </p>
        )}
      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-divider)' }}>
        <button
          onClick={() => setIsBatchProcessing(true)}
          disabled={batchItems.length === 0}
          style={{
            width: '100%',
            backgroundColor: batchItems.length > 0 ? 'var(--color-pass)' : 'var(--color-divider)',
            color: batchItems.length > 0 ? 'white' : 'var(--color-text)',
            border: 'none',
            borderRadius: '16px',
            padding: '1.25rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: batchItems.length > 0 ? 'pointer' : 'default',
            opacity: batchItems.length > 0 ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          {isEn ? `PROCESS ALL (${batchItems.length})` : `सभी को प्रोसेस करें (${batchItems.length})`}
        </button>
      </div>
    </div>
  );
};
