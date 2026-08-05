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
        icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
      },
      {
        id: 'fat',
        label: 'FAT',
        valueGrams: nutrition.total_fat_g || 0,
        color: '#e07a33',
        texture: '/textures/texture_oil_bubbles_1785951545142.jpg',
        icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
      },
      {
        id: 'salt',
        label: 'SALT',
        valueGrams: Number(((nutrition.sodium_mg || 0) * 2.5 / 1000).toFixed(2)),
        color: '#e0a333',
        texture: '/textures/texture_salt_crystals_1785951586080.jpg',
        icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="14" rx="2"></rect><path d="M8 8V6a4 4 0 0 1 8 0v2"></path><circle cx="12" cy="14" r="1"></circle><circle cx="12" cy="18" r="1"></circle><circle cx="9" cy="16" r="1"></circle><circle cx="15" cy="16" r="1"></circle></svg>
      },
      {
        id: 'protein',
        label: 'PROTEIN',
        valueGrams: nutrition.protein_g || 0,
        color: '#3b5f41',
        texture: '/textures/texture_protein_spheres_1785951646727.jpg',
        icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><circle cx="18" cy="18" r="3"></circle><line x1="8.12" y1="8.12" x2="15.88" y2="15.88"></line><line x1="15.88" y1="8.12" x2="8.12" y2="15.88"></line></svg>
      },
      {
        id: 'fiber',
        label: 'FIBER',
        valueGrams: (nutrition as any).fiber_g || 0, 
        color: '#3b5f41',
        texture: '/textures/texture_fiber_pods_1785951626041.jpg',
        icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><line x1="2" y1="22" x2="11" y2="13"></line></svg>
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
    <div className="w-full flex items-center justify-center p-4 bg-[#fcf9f2] rounded-xl relative overflow-hidden mb-8">
      {/* Container holding pouch + lines + cards */}
      <div className="flex w-[500px] max-w-full relative">
        
        {/* Pouch Wrapper */}
        <div className="w-[240px] h-[420px] relative shrink-0 drop-shadow-[0_15px_25px_rgba(0,0,0,0.1)]">
          {/* SVG Clip Path Definition */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="bag-shape" clipPathUnits="objectBoundingBox">
                <path d="M 0,0 L 1,0 Q 0.88,0.5 1,1 L 0,1 Q 0.12,0.5 0,0 Z" />
              </clipPath>
            </defs>
          </svg>

          {/* Highlights & Seals */}
          <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_15px_0_30px_rgba(255,255,255,0.7),inset_-15px_0_30px_rgba(0,0,0,0.1)]" style={{ clipPath: 'url(#bag-shape)' }}></div>
          <div className="absolute top-0 left-0 right-0 h-[18px] bg-white/80 border-b-2 border-black/5 z-21" style={{ clipPath: 'url(#bag-shape)', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-[18px] bg-white/80 border-t-2 border-black/5 z-21" style={{ clipPath: 'url(#bag-shape)', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)' }}></div>
          
          {/* Inner Pouch with Layers */}
          <div className="w-full h-full bg-white/40 relative overflow-hidden flex flex-col justify-start" style={{ clipPath: 'url(#bag-shape)' }}>
            {layers.map((layer, idx) => (
              <div 
                key={layer.id}
                className="w-full relative flex items-center justify-center bg-center"
                style={{
                  height: `${layer.heightPercent}%`,
                  backgroundImage: `url('${layer.texture}')`,
                  backgroundSize: layer.id === 'salt' ? '60px auto' : '80px auto',
                  backgroundRepeat: 'repeat',
                  boxShadow: layer.id === 'fat' ? 'inset 0 10px 15px -10px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {/* Drop shadow between layers */}
                {idx > 0 && (
                  <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-black/30 to-transparent z-10 pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Connection Lines SVG */}
        <svg className="w-[40px] h-[420px] shrink-0 ml-2" viewBox="0 0 40 420" preserveAspectRatio="none">
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
              <circle cx="2" cy={`${layer.centerPercent}%`} r="3" fill={layer.color} />
            </g>
          ))}
        </svg>

        {/* Data Panel */}
        <div className="h-[420px] relative grow ml-2">
          {layers.map(layer => {
            const Icon = layer.icon;
            return (
              <div 
                key={layer.id}
                className="flex items-center gap-3 absolute left-0 w-full bg-[#fcf9f2]"
                style={{ top: `calc(${layer.centerPercent}% - 20px)` }}
              >
                <div 
                  className="w-[36px] h-[36px] rounded-full border border-current flex items-center justify-center shrink-0 bg-[#fcf9f2] [&>svg]:w-[18px] [&>svg]:h-[18px]"
                  style={{ color: layer.color }}
                >
                  <Icon />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[0.85rem] tracking-wide leading-none mb-[2px]" style={{ color: layer.color }}>
                    {layer.label}
                  </span>
                  <span className="font-bold text-[1.1rem] text-gray-800 leading-none mb-[2px]">
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
