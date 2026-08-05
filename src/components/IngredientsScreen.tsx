import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { COMMON_INGREDIENTS_HINDI } from '../utils/hindiDictionary';

const ICONS: Record<string, string> = {
  tomato: '🍅',
  sugar: '🧊',
  onion: '🧅',
  salt: '🧂',
  garlic: '🧄',
  chemical: '🧪',
  shield: '🛡️',
  spices: '🌶️',
  leaf: '🌿',
  grain: '🌾',
  default: '🥣'
};

const COLORS = ['#e63923', '#f38b2a', '#a26992', '#f4b584', '#719e44', '#8b9c64'];

export const IngredientsScreen: React.FC = () => {
  const { userLanguage, extractionResult, setHasChosenResultType, resetApp } = useAppContext();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const isEn = userLanguage === 'en';

  if (!extractionResult) return null;

  const rawList = extractionResult.ingredients.raw_list;
  
  // Sort by percentage descending if available
  const sortedList = [...rawList].sort((a, b) => {
    const pA = a.percentage || 0;
    const pB = b.percentage || 0;
    return pB - pA;
  });

  const hasAnyPercentages = sortedList.some(ing => (ing.percentage || 0) > 0);
  
  const mainIngredients = sortedList.filter((ing, idx) => {
    if (hasAnyPercentages) return (ing.percentage || 0) >= 5;
    return idx < 3;
  });
  
  const otherIngredients = sortedList.filter(ing => !mainIngredients.includes(ing));

  const chartSlices = mainIngredients.filter(ing => (ing.percentage || 0) > 0);
  const chartTotalPct = chartSlices.reduce((sum, ing) => sum + (ing.percentage || 0), 0);

  let currentDashOffset = 0;
  const circumference = 2 * Math.PI * 40;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const renderIngredientCard = (ing: any, isMain: boolean, absoluteIdx: number) => {
    const rawName = isEn ? ing.normalized_english : (ing.localized_display || COMMON_INGREDIENTS_HINDI[ing.normalized_english.toLowerCase()] || ing.normalized_english);
    const iconStr = ICONS[ing.icon || 'default'] || ICONS['default'];
    const pct = ing.percentage;
    const isExpanded = expandedIndex === absoluteIdx;
    
    const reasons = ing.reasons_added || [];
    const hasReasons = reasons.length > 0;

    const rankColor = isMain ? 'bg-[#f38b2a]' : 'bg-[#8b9c64]';
    const barColor = COLORS[absoluteIdx % COLORS.length];

    return (
      <div 
        key={absoluteIdx}
        onClick={() => { if (hasReasons) toggleExpand(absoluteIdx); }}
        className="bg-[#fdfbf7] border border-[#f0eee5] rounded-xl p-4 mb-3 transition-shadow hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold text-white shrink-0 ${rankColor}`}>
            {absoluteIdx + 1}
          </div>
          <div className="text-2xl shrink-0">{iconStr}</div>
          
          <div className="grow flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-[0.9rem] text-[#2c3329]">{rawName}</span>
              {pct && <span className="font-bold text-[0.8rem] text-[#2c3329]">{pct}%</span>}
            </div>
            {pct && (
              <div className="w-full h-[6px] bg-[#eeebe0] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: barColor }}></div>
              </div>
            )}
          </div>
          
          {hasReasons && (
            <div className={`text-[#aaa] font-bold ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ›
            </div>
          )}
        </div>

        {isExpanded && hasReasons && (
          <div className="mt-4 pt-4 border-t border-dashed border-[#e0ded5] text-[0.85rem]">
            <h4 className="m-0 mb-2 text-[#444]">{isEn ? 'Why is it added?' : 'इसे क्यों मिलाया गया है?'}</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-2">
              {reasons.map((r: any, i: number) => {
                const text = isEn ? r.normalized_english : (r.localized_display || r.normalized_english);
                return (
                  <li key={i} className="flex items-center gap-2 text-[#555] font-medium">
                    <span className="text-[#719e44] font-extrabold">✓</span> {text}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#2c3329', backgroundColor: '#f8f6f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid #f0eee5' }}>
        <button 
          onClick={resetApp}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: '#2c3329' }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="headline-en" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px', flex: 1 }}>
          {isEn ? 'INGREDIENT LIST' : 'सामग्री सूची'}
        </h2>
        <button 
          onClick={() => setHasChosenResultType('full')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2c3329', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' }}
        >
          {isEn ? 'View Verdict' : 'निर्णय देखें'}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        
        {mainIngredients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-[0.85rem] font-extrabold m-0 uppercase tracking-wide">
                {isEn ? 'Main Ingredients' : 'मुख्य सामग्री'}
              </h2>
              <span className="text-[0.7rem] text-[#888] font-medium">
                {isEn ? '(Makes up most of this product)' : '(उत्पाद का अधिकांश हिस्सा बनाता है)'}
              </span>
            </div>
            {mainIngredients.map((ing, idx) => renderIngredientCard(ing, true, idx))}
          </div>
        )}

        {otherIngredients.length > 0 && (
          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-3 mt-6">
              <h2 className="text-[0.85rem] font-extrabold m-0 uppercase tracking-wide">
                {isEn ? 'Other Ingredients' : 'अन्य सामग्री'}
              </h2>
            </div>
            {otherIngredients.map((ing, idx) => renderIngredientCard(ing, false, mainIngredients.length + idx))}
          </div>
        )}

        <div className="bg-[#fdfbf7] rounded-xl p-4 flex items-center gap-4 mt-5">
          <div className="text-2xl shrink-0">🌿</div>
          <div className="text-[0.8rem] font-medium text-[#444]">
            <strong className="block text-[0.85rem] mb-0.5 text-[#2c3329]">
              {isEn ? 'Tap any ingredient to know more' : 'अधिक जानने के लिए किसी भी सामग्री पर टैप करें'}
            </strong>
            {isEn ? 'Learn what it is and why it\'s used.' : 'जानें कि यह क्या है और इसका उपयोग क्यों किया जाता है।'}
          </div>
        </div>

        {chartSlices.length > 0 && (
          <div className="flex flex-col items-center mt-10 pt-8 border-t border-[#f0eee5] mb-8">
            <div className="relative w-[140px] h-[140px]">
              <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f0eee5" strokeWidth="12" />
                
                {chartSlices.map((ing, idx) => {
                  const strokeDasharray = `${((ing.percentage || 0) / 100) * circumference} ${circumference}`;
                  const offset = currentDashOffset;
                  currentDashOffset -= ((ing.percentage || 0) / 100) * circumference;
                  
                  return (
                    <circle 
                      key={idx}
                      cx="50" cy="50" r="40" 
                      fill="transparent" 
                      stroke={COLORS[idx % COLORS.length]} 
                      strokeWidth="12" 
                      strokeDasharray={strokeDasharray} 
                      strokeDashoffset={offset} 
                    />
                  );
                })}
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-extrabold text-[#2c3329]">
                {Math.round(chartTotalPct)}%
              </div>
            </div>
            <div className="mt-3 text-[0.85rem] font-semibold text-center text-[#555] leading-tight">
              {isEn ? 'Top Ingredients' : 'शीर्ष सामग्री'} <br/> {isEn ? 'By Weight' : 'वजन के अनुसार'}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
