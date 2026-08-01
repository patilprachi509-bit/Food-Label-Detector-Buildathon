import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { BatchItem, SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';

export const BatchResultsScreen: React.FC = () => {
  const { userLanguage, batchItems, setBatchItems, setIsBatchFinished, setViewingBatchResultId, clearBatchMode, userFocus, saveMultipleScans, setExtractionResult } = useAppContext();
  const isEn = userLanguage === 'en';
  const [hasSavedAll, setHasSavedAll] = useState(false);

  // Group items
  const { errors, notRecommended, mostlyFine, gradeA } = useMemo(() => {
    const errors: BatchItem[] = [];
    const notRecommended: { item: BatchItem, flags: any[] }[] = [];
    const mostlyFine: { item: BatchItem, nutrientId: string }[] = [];
    const gradeA: BatchItem[] = [];

    batchItems.forEach(item => {
      if (item.status === 'error' || !item.result) {
        errors.push(item);
        return;
      }
      
      const flags = evaluateRules(item.result, userFocus);
      const isMostlyFine = flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId);
      
      if (flags.some(f => f.type === 'claim_contradiction' || (f.type === 'general_health' && !isMostlyFine))) {
        notRecommended.push({ item, flags });
      } else if (isMostlyFine) {
        mostlyFine.push({ item, nutrientId: flags[0].ruleId });
      } else {
        gradeA.push(item);
      }
    });

    return { errors, notRecommended, mostlyFine, gradeA };
  }, [batchItems, userFocus]);

  const handleRetry = (id: string) => {
    // Reset status to pending and re-enter processing screen
    setBatchItems(prev => prev.map(p => p.id === id ? { ...p, status: 'pending' } : p));
    setIsBatchFinished(false);
  };

  const handleSaveAll = () => {
    const newScans: SavedScan[] = [];
    const timestamp = Date.now();
    
    batchItems.forEach((item, idx) => {
      if (item.status === 'done' && item.result) {
        newScans.push({
          id: `${timestamp}-${idx}`,
          timestamp,
          productName: item.result.front_of_pack?.product_name || null,
          brandName: item.result.front_of_pack?.brand_name || null,
          extractionResult: item.result,
          userFocus
        });
      }
    });

    if (newScans.length > 0) {
      saveMultipleScans(newScans);
    }
    setHasSavedAll(true);
  };

  const renderItem = (item: BatchItem, badgeText: string, badgeBg: string, badgeColor: string) => {
    const brand = item.result?.front_of_pack?.brand_name?.trim();
    const prod = item.result?.front_of_pack?.product_name?.trim();
    let name = isEn ? "Unknown Product" : "अज्ञात उत्पाद";
    if (brand && prod) name = `${brand} ${prod}`;
    else if (brand) name = brand;
    else if (prod) name = prod;

    return (
      <div 
        key={item.id}
        onClick={() => {
          setViewingBatchResultId(item.id);
          if (item.result) {
            setExtractionResult(item.result);
          }
        }}
        style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px', marginBottom: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-divider)', marginRight: '1rem', flexShrink: 0 }}>
          {item.frontImage && <img src={item.frontImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', flex: 1 }}>{name}</h4>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: badgeColor, backgroundColor: badgeBg, padding: '2px 8px', borderRadius: '12px', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
              {badgeText}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button onClick={clearBatchMode} style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
          {isEn ? 'Batch Results' : 'बैच परिणाम'}
        </h2>
        <div style={{ width: '40px' }}></div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        
        {/* Errors */}
        {errors.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-fail)', marginBottom: '1rem' }}>
              {isEn ? 'COULD NOT READ' : 'पढ़ नहीं सका'}
            </h3>
            {errors.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '12px', marginBottom: '0.75rem', border: '1px solid rgba(255,0,0,0.2)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-divider)', marginRight: '1rem', flexShrink: 0 }}>
                  {item.frontImage && <img src={item.frontImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-fail)' }}>
                    {isEn ? "Couldn't read this one" : "इसे पढ़ नहीं सका"}
                  </p>
                  <button 
                    onClick={() => handleRetry(item.id)}
                    style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isEn ? 'Retry' : 'पुनः प्रयास करें'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Not Recommended */}
        {notRecommended.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '1rem' }}>
              {isEn ? 'NOT RECOMMENDED' : 'अनुशंसित नहीं'}
            </h3>
            {notRecommended.map(({ item, flags }) => 
              renderItem(item, isEn ? `${flags.length} issues` : `${flags.length} समस्याएँ`, 'rgba(255,0,0,0.1)', 'var(--color-fail)')
            )}
          </div>
        )}

        {/* Mostly Fine */}
        {mostlyFine.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '1rem' }}>
              {isEn ? 'MOSTLY FINE' : 'ज़्यादातर ठीक है'}
            </h3>
            {mostlyFine.map(({ item, nutrientId }) => {
              const nutEn = nutrientId === 'G1' ? 'SUGAR' : nutrientId === 'G2' ? 'FAT/OIL' : 'SALT';
              const nutHi = nutrientId === 'G1' ? 'चीनी' : nutrientId === 'G2' ? 'वसा/तेल' : 'नमक';
              return renderItem(item, isEn ? `WATCH THE ${nutEn}` : `${nutHi} पर ध्यान दें`, 'rgba(255,165,0,0.1)', 'var(--color-verify)');
            })}
          </div>
        )}

        {/* Grade A */}
        {gradeA.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '1rem' }}>
              {isEn ? 'GRADE A' : 'ग्रेड ए'}
            </h3>
            {gradeA.map(item => 
              renderItem(item, isEn ? '0 issues' : '0 समस्याएँ', 'rgba(0,128,0,0.1)', 'var(--color-pass)')
            )}
          </div>
        )}

      </div>

      <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-divider)' }}>
        <button
          onClick={() => {
            if (!hasSavedAll && (notRecommended.length + mostlyFine.length + gradeA.length) > 0) {
              handleSaveAll();
            }
          }}
          disabled={hasSavedAll || (notRecommended.length + mostlyFine.length + gradeA.length) === 0}
          style={{
            width: '100%',
            backgroundColor: hasSavedAll ? 'var(--color-pass)' : 'var(--color-text)',
            color: 'var(--color-bg)',
            border: 'none',
            borderRadius: '16px',
            padding: '1.25rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            letterSpacing: '1px',
            cursor: hasSavedAll ? 'default' : 'pointer',
            opacity: hasSavedAll || (notRecommended.length + mostlyFine.length + gradeA.length) === 0 ? 0.8 : 1,
            transition: 'all 0.2s'
          }}
        >
          {hasSavedAll ? (isEn ? 'Saved All!' : 'सभी सहेजे गए!') : (isEn ? 'Save All' : 'सभी सहेजें')}
        </button>
      </div>

    </div>
  );
};
