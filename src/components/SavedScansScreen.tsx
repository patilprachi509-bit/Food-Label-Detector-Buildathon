import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { SavedScan } from '../context/AppContext';
import { evaluateRules } from '../utils/ruleEngine';
import type { Flag } from '../utils/ruleEngine';

interface SavedScansScreenProps {
  onSelectForCompare?: (scan: SavedScan) => void;
  onCloseCompare?: () => void;
}

export const SavedScansScreen: React.FC<SavedScansScreenProps> = ({ onSelectForCompare, onCloseCompare }) => {
  const { 
    savedScans, 
    deleteScan, 
    clearScans, 
    setExtractionResult, 
    setUserFocus,
    setViewingSavedScanId,
    setIsHistoryOpen,
    userLanguage
  } = useAppContext();

  const isEn = userLanguage === 'en';
  const isCompareMode = !!onSelectForCompare;
  const [viewMode, setViewMode] = useState<'recent' | 'health'>('recent');

  const handleOpenScan = (scan: SavedScan) => {
    if (onSelectForCompare) {
      onSelectForCompare(scan);
    } else {
      setExtractionResult(scan.extractionResult);
      setUserFocus(scan.userFocus);
      setViewingSavedScanId(scan.id);
      setIsHistoryOpen(false);
    }
  };

  const handleBack = () => {
    if (onCloseCompare) {
      onCloseCompare();
    } else {
      setIsHistoryOpen(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm(isEn ? "Are you sure you want to clear all saved scans?" : "क्या आप वाकई सभी सहेजे गए स्कैन साफ़ करना चाहते हैं?")) {
      clearScans();
    }
  };

  // Week in Review calculation
  const weeklyStats = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentScans = savedScans.filter(scan => scan.timestamp >= oneWeekAgo);

    if (recentScans.length === 0) return null;

    let flaggedCount = 0;
    let gradeACount = 0;
    const categoryCounts: Record<string, number> = { sugar: 0, salt: 0, fat: 0, transFat: 0 };

    recentScans.forEach(scan => {
      const flags = evaluateRules(scan.extractionResult, scan.userFocus);
      if (flags.length === 0) {
        gradeACount++;
      } else {
        flaggedCount++;
        flags.forEach(f => {
          if (f.nutrientFocus === 'sugar') categoryCounts.sugar++;
          else if (f.nutrientFocus === 'salt') categoryCounts.salt++;
          else if (f.nutrientFocus === 'fat' && f.ruleId === 'G4') categoryCounts.transFat++;
          else if (f.nutrientFocus === 'fat') categoryCounts.fat++;
        });
      }
    });

    let topCat = '';
    let topCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > topCount) {
        topCount = count;
        topCat = cat;
      }
    });

    return {
      total: recentScans.length,
      flagged: flaggedCount,
      gradeA: gradeACount,
      topCategory: topCount > 0 ? topCat : null
    };
  }, [savedScans]);

  const getGroup = (flags: Flag[]) => {
    if (flags.length === 0) return 'grade_a';
    const isMostlyFine = flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId);
    if (isMostlyFine) return 'mostly_fine';
    return 'not_recommended';
  };

  const groupedScans = useMemo(() => {
    const groups = {
      not_recommended: [] as {scan: SavedScan, flags: Flag[]}[],
      mostly_fine: [] as {scan: SavedScan, flags: Flag[]}[],
      grade_a: [] as {scan: SavedScan, flags: Flag[]}[]
    };
    savedScans.forEach(scan => {
      const flags = evaluateRules(scan.extractionResult, scan.userFocus);
      const group = getGroup(flags);
      groups[group].push({scan, flags});
    });
    // Sort each group by timestamp desc
    const sortByTime = (a: {scan: SavedScan}, b: {scan: SavedScan}) => b.scan.timestamp - a.scan.timestamp;
    groups.not_recommended.sort(sortByTime);
    groups.mostly_fine.sort(sortByTime);
    groups.grade_a.sort(sortByTime);
    return groups;
  }, [savedScans]);

  const renderScanItem = (scan: SavedScan, flags: Flag[], showNutrientBadge = false) => {
    const date = new Date(scan.timestamp);
    const formattedDate = date.toLocaleDateString(isEn ? 'en-US' : 'hi-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString(isEn ? 'en-US' : 'hi-IN', { hour: '2-digit', minute: '2-digit' });

    let badgeText = '';
    let badgeColor = 'var(--color-text)';
    let badgeBg = 'transparent';

    if (flags.length === 0) {
      badgeText = isEn ? '0 issues' : '0 समस्याएँ';
      badgeColor = 'var(--color-pass)';
      badgeBg = 'rgba(76, 175, 80, 0.1)';
    } else if (flags.length === 1 && ['G1', 'G2', 'G3'].includes(flags[0].ruleId)) {
      const nutrientEn = flags[0].ruleId === 'G1' ? 'SUGAR' : flags[0].ruleId === 'G2' ? 'FAT/OIL' : 'SALT';
      const nutrientHi = flags[0].ruleId === 'G1' ? 'चीनी' : flags[0].ruleId === 'G2' ? 'वसा/तेल' : 'नमक';
      badgeText = showNutrientBadge 
        ? (isEn ? `WATCH THE ${nutrientEn}` : `बस ${nutrientHi} पर ध्यान दें`)
        : (isEn ? '1 issue' : '1 समस्या');
      badgeColor = 'var(--color-verify)';
      badgeBg = 'rgba(255, 152, 0, 0.1)';
    } else {
      badgeText = isEn ? `${flags.length} issue${flags.length > 1 ? 's' : ''}` : `${flags.length} समस्या${flags.length > 1 ? 'एँ' : ''}`;
      badgeColor = 'var(--color-fail)';
      badgeBg = 'rgba(244, 67, 54, 0.1)';
    }

    return (
      <div key={scan.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'transparent', border: '1px solid var(--color-divider)', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem' }}>
        <div 
          style={{ flex: 1, padding: '1rem', cursor: 'pointer' }}
          onClick={() => handleOpenScan(scan)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', flex: 1 }}>
              {(() => {
                const brand = scan.brandName?.trim();
                const prod = scan.productName?.trim();
                if (brand && prod) return `${brand} ${prod}`;
                if (brand) return brand;
                if (prod) return prod;
                return isEn ? "Unknown Product" : "अज्ञात उत्पाद";
              })()}
            </h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: badgeColor, backgroundColor: badgeBg, padding: '2px 8px', borderRadius: '12px', marginLeft: '0.5rem', whiteSpace: 'nowrap' }}>
              {badgeText}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>
            {formattedDate} • {formattedTime}
          </p>
        </div>
        {!isCompareMode && (
          <button 
            onClick={(e) => { e.stopPropagation(); deleteScan(scan.id); }}
            style={{ padding: '1rem', background: 'none', border: 'none', borderLeft: '1px solid var(--color-divider)', cursor: 'pointer', color: 'var(--color-fail)', fontSize: '1.2rem', height: '100%' }}
          >
            &times;
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--color-text)', backgroundImage: `url('/background.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: 'var(--color-text)' }} 
          onClick={handleBack}
        >
          &larr;
        </button>
        <div style={{ textAlign: 'center' }}>
          <h3 className="headline-en" style={{ letterSpacing: '2px', fontSize: '1rem', margin: 0 }}>
            {isCompareMode ? (isEn ? 'SELECT TO COMPARE' : 'तुलना करने के लिए चुनें') : (isEn ? 'SAVED SCANS' : 'सहेजे गए स्कैन')}
          </h3>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-text)', margin: '4px auto 0' }}></div>
        </div>
        <div style={{ width: '40px' }}></div> {/* Spacer */}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', position: 'relative', zIndex: 1 }}>
        {!isCompareMode && weeklyStats && (
          <div style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', opacity: 0.8 }}>
              {isEn ? 'WEEK IN REVIEW' : 'सप्ताह की समीक्षा'}
            </h4>
            <p style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {isEn ? `You saved ${weeklyStats.total} products this week.` : `आपने इस सप्ताह ${weeklyStats.total} उत्पाद सहेजे हैं।`}
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', marginBottom: weeklyStats.topCategory ? '1rem' : 0 }}>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-fail)', display: 'block' }}>{weeklyStats.flagged}</span>
                <span style={{ opacity: 0.8 }}>{isEn ? 'Flagged' : 'फ़्लैग किए गए'}</span>
              </div>
              <div>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-pass)', display: 'block' }}>{weeklyStats.gradeA}</span>
                <span style={{ opacity: 0.8 }}>{isEn ? 'Grade A' : 'ग्रेड ए'}</span>
              </div>
            </div>
            {weeklyStats.topCategory && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                <span style={{ opacity: 0.8 }}>{isEn ? 'Most common flag: ' : 'सबसे आम फ़्लैग: '}</span>
                <strong>
                  {weeklyStats.topCategory === 'sugar' ? (isEn ? 'Sugar' : 'चीनी') :
                   weeklyStats.topCategory === 'salt' ? (isEn ? 'Salt' : 'नमक') :
                   weeklyStats.topCategory === 'transFat' ? (isEn ? 'Trans Fat' : 'ट्रांस फैट') :
                   (isEn ? 'Fat/Oil' : 'वसा/तेल')}
                </strong>
              </div>
            )}
          </div>
        )}

        {savedScans.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('recent')}
                style={{
                  backgroundColor: viewMode === 'recent' ? 'var(--color-text)' : 'transparent',
                  color: viewMode === 'recent' ? 'var(--color-bg)' : 'var(--color-text)',
                  border: 'none', borderRadius: '50px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {isEn ? 'Recent' : 'हाल के'}
              </button>
              <button
                onClick={() => setViewMode('health')}
                style={{
                  backgroundColor: viewMode === 'health' ? 'var(--color-text)' : 'transparent',
                  color: viewMode === 'health' ? 'var(--color-bg)' : 'var(--color-text)',
                  border: 'none', borderRadius: '50px', padding: '0.5rem 1.5rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {isEn ? 'By Health' : 'सेहत के अनुसार'}
              </button>
            </div>
          </div>
        )}

        {savedScans.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.6 }}>
            {isCompareMode ? (
              <p>{isEn ? "Save a product first to compare against it later." : "बाद में तुलना करने के लिए पहले एक उत्पाद सहेजें।"}</p>
            ) : (
              <p>{isEn ? "No saved scans yet." : "अभी तक कोई स्कैन सहेजा नहीं गया है।"}</p>
            )}
          </div>
        ) : (
          <>
            {!isCompareMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                  onClick={handleClearAll}
                  style={{ background: 'none', border: 'none', color: 'var(--color-fail)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {isEn ? "Clear All" : "सभी साफ़ करें"}
                </button>
              </div>
            )}
            
            {viewMode === 'recent' ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {savedScans.map(scan => renderScanItem(scan, evaluateRules(scan.extractionResult, scan.userFocus)))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {groupedScans.not_recommended.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--color-fail)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.25rem' }}>
                      {isEn ? 'NOT RECOMMENDED' : 'अनुशंसित नहीं'}
                    </h4>
                    {groupedScans.not_recommended.map(item => renderScanItem(item.scan, item.flags))}
                  </div>
                )}
                {groupedScans.mostly_fine.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--color-verify)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.25rem' }}>
                      {isEn ? 'MOSTLY FINE' : 'ज़्यादातर ठीक है'}
                    </h4>
                    {groupedScans.mostly_fine.map(item => renderScanItem(item.scan, item.flags, true))}
                  </div>
                )}
                {groupedScans.grade_a.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--color-pass)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.25rem' }}>
                      {isEn ? 'GRADE A' : 'ग्रेड ए'}
                    </h4>
                    {groupedScans.grade_a.map(item => renderScanItem(item.scan, item.flags))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
