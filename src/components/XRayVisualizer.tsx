import React, { useMemo } from 'react';
import type { ExtractionResult } from '../context/AppContext';

interface Props {
  data: ExtractionResult;
}

export const XRayVisualizer: React.FC<Props> = ({ data }) => {
  const { nutrition } = data;

  // Track the core 5 components
  const components = useMemo(() => {
    return [
      {
        id: 'sugar',
        label: 'SUGAR',
        valueGrams: nutrition.total_sugar_g || 0,
        color: '#e04f33',
        texture: '/textures/texture_sugar_cubes_1785951377987.jpg',
        icon: () => <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
      },
      {
        id: 'fat',
        label: 'FAT',
        valueGrams: nutrition.total_fat_g || 0,
        color: '#e07a33',
        texture: '/textures/texture_oil_bubbles_1785951545142.jpg',
        icon: () => <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
      },
      {
        id: 'salt',
        label: 'SALT',
        valueGrams: Number(((nutrition.sodium_mg || 0) * 2.5 / 1000).toFixed(2)),
        color: '#e0a333',
        texture: '/textures/texture_salt_crystals_1785951586080.jpg',
        icon: () => <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="14" rx="2"></rect><path d="M8 8V6a4 4 0 0 1 8 0v2"></path><circle cx="12" cy="14" r="1"></circle><circle cx="12" cy="18" r="1"></circle><circle cx="9" cy="16" r="1"></circle><circle cx="15" cy="16" r="1"></circle></svg>
      },
      {
        id: 'protein',
        label: 'PROTEIN',
        valueGrams: nutrition.protein_g || 0,
        color: '#3b5f41',
        texture: '/textures/texture_protein_spheres_1785951646727.jpg',
        icon: () => <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="18" r="3"></circle><line x1="8.12" y1="8.12" x2="15.88" y2="15.88"></line><line x1="15.88" y1="8.12" x2="8.12" y2="15.88"></line></svg>
      },
      {
        id: 'fiber',
        label: 'FIBER',
        valueGrams: (nutrition as any).fiber_g || 0, 
        color: '#3b5f41',
        texture: '/textures/texture_fiber_pods_1785951626041.jpg',
        icon: () => <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><line x1="2" y1="22" x2="11" y2="13"></line></svg>
      }
    ].filter(c => c.valueGrams > 0);
  }, [nutrition]);

  const totalGrams = components.reduce((sum, c) => sum + c.valueGrams, 0);

  // If there's no data to visualize, don't render anything
  if (totalGrams === 0) return null;

  // Calculate percentages and Y coordinates for lines
  let currentYPercent = 0;
  const layersWithMath = components.map(c => {
    // minimum 10% height so the layer is visible
    let percent = (c.valueGrams / totalGrams) * 100;
    if (percent < 10) percent = 10;
    return { ...c, targetPercent: percent };
  });

  // Re-normalize to 100% after applying minimums
  const newTotal = layersWithMath.reduce((sum, c) => sum + c.targetPercent, 0);
  const layers = layersWithMath.map(c => {
    const finalPercent = (c.targetPercent / newTotal) * 100;
    const centerPercent = currentYPercent + (finalPercent / 2);
    currentYPercent += finalPercent;
    
    return {
      ...c,
      heightPercent: finalPercent,
      centerPercent
    };
  });

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', backgroundColor: '#fcf9f2', borderRadius: '0.5rem', position: 'relative', overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Container holding pouch + lines + cards */}
      <div style={{ display: 'flex', width: '280px', maxWidth: '100%', position: 'relative' }}>
        
        {/* Pouch Wrapper */}
        <div style={{ width: '130px', height: '220px', position: 'relative', flexShrink: 0, filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))', borderRadius: '4px', backgroundColor: '#e2dfd8', border: '1px solid rgba(0,0,0,0.1)' }}>
          
          {/* Top Seal */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '14px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)', zIndex: 30, borderBottom: '1px solid rgba(0,0,0,0.15)', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>

          {/* Bottom Seal */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '14px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.7), rgba(255,255,255,0.7) 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)', zIndex: 30, borderTop: '1px solid rgba(0,0,0,0.15)', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}></div>

          {/* Highlights & Overlays for Glossy Plastic Effect */}
          <div style={{ position: 'absolute', top: '14px', bottom: '14px', left: 0, right: 0, pointerEvents: 'none', zIndex: 20, boxShadow: 'inset 12px 0 20px rgba(255,255,255,0.8), inset -12px 0 20px rgba(0,0,0,0.2)', background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.05) 100%)' }}></div>

          {/* Layered Textures */}
          <div style={{ position: 'absolute', top: '14px', bottom: '14px', left: '2px', right: '2px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {layers.map((layer, idx) => (
              <div 
                key={layer.id}
                style={{
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundPosition: 'center',
                  height: `${layer.heightPercent}%`,
                  backgroundImage: `url('${layer.texture}')`,
                  backgroundSize: layer.id === 'salt' ? '30px auto' : '40px auto',
                  backgroundRepeat: 'repeat',
                  boxShadow: layer.id === 'fat' ? 'inset 0 5px 8px -5px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {/* Drop shadow between layers */}
                {idx > 0 && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)', zIndex: 10, pointerEvents: 'none' }}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connection Lines SVG */}
        <svg viewBox="0 0 24 220" preserveAspectRatio="none" style={{ width: '24px', height: '220px', flexShrink: 0, marginLeft: '0.25rem' }}>
          {layers.map(layer => (
            <g key={layer.id}>
              <line 
                x1="0" 
                y1={`${layer.centerPercent}%`} 
                x2="100%" 
                y2={`${layer.centerPercent}%`} 
                stroke={layer.color} 
                strokeWidth="1.5" 
              />
              <circle cx="2" cy={`${layer.centerPercent}%`} r="2" fill={layer.color} />
            </g>
          ))}
        </svg>

        {/* Data Panel */}
        <div style={{ height: '220px', position: 'relative', flexGrow: 1, marginLeft: '0.25rem' }}>
          {layers.map(layer => {
            const Icon = layer.icon;
            return (
              <div 
                key={layer.id}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'absolute', left: 0, width: '100%', backgroundColor: '#fcf9f2', top: `calc(${layer.centerPercent}% - 12px)` }}
              >
                <div 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: '#fcf9f2', color: layer.color }}
                >
                  <Icon />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.01em', lineHeight: 1, marginBottom: '2px', color: layer.color }}>
                    {layer.label}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1f2937', lineHeight: 1, marginBottom: '0' }}>
                    {layer.valueGrams}g
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
