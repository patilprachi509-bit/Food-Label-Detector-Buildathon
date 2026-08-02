import React from 'react';
import type { Flag } from '../utils/ruleEngine';
import type { ExtractionResult } from '../context/AppContext';
import { 
  IconThumbsDown, 
  IconCheck, 
  IconWarning, 
  IconSugarCube, 
  IconDroplet, 
  IconSaltShaker, 
  IconTransFatDroplet 
} from './Icons';

interface Props {
  flags: Flag[];
  extractionResult: ExtractionResult;
  isEn: boolean;
  overallState: 'NOT RECOMMENDED' | 'MOSTLY FINE' | 'VERIFICATION NEEDED' | 'MINOR ISSUES' | 'GOOD CHOICE';
}

export const VerdictSummaryVisual: React.FC<Props> = ({ flags, extractionResult, isEn, overallState }) => {
  const g1Fired = flags.some(f => f.ruleId === 'G1'); // Sugar
  const g2Fired = flags.some(f => f.ruleId === 'G2'); // Fat
  const g3Fired = flags.some(f => f.ruleId === 'G3'); // Salt
  const g4Fired = flags.some(f => f.ruleId === 'G4'); // Trans Fat

  const transFatNull = extractionResult.nutrition.trans_fat_g === null;

  // Face Icon based on overallState
  let FaceIcon = IconCheck;
  let faceColor = 'var(--color-pass)';
  
  if (overallState === 'NOT RECOMMENDED') {
    FaceIcon = IconThumbsDown;
    faceColor = 'var(--color-fail)';
  } else if (overallState === 'MOSTLY FINE' || overallState === 'VERIFICATION NEEDED' || overallState === 'MINOR ISSUES') {
    FaceIcon = IconWarning;
    faceColor = 'var(--color-verify)';
  }

  // Determine exceeded nutrients for dynamic sentence
  const exceeded: string[] = [];
  if (g1Fired) exceeded.push(isEn ? 'Sugar' : 'चीनी');
  if (g2Fired) exceeded.push(isEn ? 'Fat' : 'वसा');
  if (g3Fired) exceeded.push(isEn ? 'Salt' : 'नमक');
  if (g4Fired) exceeded.push(isEn ? 'Trans Fat' : 'ट्रांस फैट');

  let dynamicSentence = '';
  const sentences: string[] = [];
  if (exceeded.length > 0) {
    let joined = '';
    if (exceeded.length === 1) {
      joined = exceeded[0];
    } else if (exceeded.length === 2) {
      joined = exceeded.join(isEn ? ' and ' : ' और ');
    } else {
      const last = exceeded.pop();
      joined = exceeded.join(', ') + (isEn ? ' and ' : ' और ') + last;
    }
    
    // Adjust verb based on plurality
    const isPlural = exceeded.length > 0 || joined.includes(' and ') || joined.includes(' और ');
    
    if (isEn) {
      sentences.push(`${joined} ${isPlural ? 'are' : 'is'} too high.`);
    } else {
      sentences.push(`${joined} बहुत अधिक ${isPlural ? 'हैं' : 'है'}।`);
    }
  } else {
    // No G1-G4 exceeded
    if (transFatNull) {
      sentences.push(isEn 
        ? 'Sugar, Fat, and Salt are within limits (trans fat data not available).' 
        : 'चीनी, वसा और नमक सीमा के भीतर हैं (ट्रांस फैट डेटा उपलब्ध नहीं है)।');
    } else {
      sentences.push(isEn 
        ? 'All key nutrients are within recommended limits.' 
        : 'सभी प्रमुख पोषक तत्व अनुशंसित सीमा के भीतर हैं।');
    }
  }

  const claimContradiction = flags.some(f => f.type === 'claim_contradiction');
  if (claimContradiction) {
    sentences.push(isEn ? 'Misleading claims detected.' : 'भ्रामक दावे पाए गए।');
  }

  dynamicSentence = sentences.join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
      
      {/* Face Icon */}
      <div style={{ marginBottom: '1.25rem', color: faceColor }}>
        <FaceIcon size={80} />
      </div>

      {/* 4 Circles Row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
        
        {/* Sugar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            backgroundColor: g1Fired ? 'var(--color-fail)' : 'var(--color-pass)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'
          }}>
            <IconSugarCube size={28} />
          </div>
          <span className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'bold' }}>
            {isEn ? 'Sugar' : 'चीनी'}
          </span>
        </div>

        {/* Fat */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            backgroundColor: g2Fired ? 'var(--color-fail)' : 'var(--color-pass)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'
          }}>
            <IconDroplet size={28} />
          </div>
          <span className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'bold' }}>
            {isEn ? 'Fat' : 'वसा'}
          </span>
        </div>

        {/* Salt */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            backgroundColor: g3Fired ? 'var(--color-fail)' : 'var(--color-pass)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'
          }}>
            <IconSaltShaker size={28} />
          </div>
          <span className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'bold' }}>
            {isEn ? 'Salt' : 'नमक'}
          </span>
        </div>

        {/* Trans Fat */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '56px', height: '56px', borderRadius: '50%', 
            backgroundColor: transFatNull ? '#9E9E9E' : (g4Fired ? 'var(--color-fail)' : 'var(--color-pass)'),
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white',
            opacity: transFatNull ? 0.7 : 1
          }}>
            <IconTransFatDroplet size={28} />
          </div>
          <span className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 'bold' }}>
            {isEn ? 'Trans Fat' : 'ट्रांस फैट'}
          </span>
        </div>

      </div>

      {/* Dynamic Sentence */}
      {overallState !== 'NOT RECOMMENDED' && (
        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', textAlign: 'center', opacity: 0.9, padding: '0 1rem', lineHeight: 1.4 }}>
          {dynamicSentence}
        </div>
      )}

    </div>
  );
};
