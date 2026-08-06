import React from 'react';
import { useAppContext } from '../context/AppContext';
import { DemoPreviewCard } from './DemoPreviewCard';
import { IconShield, IconDroplet, IconFlask, IconSugarCube, IconSaltShaker } from './Icons';

export const HomeScreen: React.FC = () => {
  const { userLanguage, setUserLanguage, setIsHistoryOpen, setIsAwarenessOpen, isDemoDismissed, savedScans, setIsScanning, setIsBatchMode } = useAppContext();
  const isEn = userLanguage === 'en';

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const images = [
    '/chip_packet.jpg',
    '/soda_can.jpg',
    '/cereal_box.jpg',
    '/chocolate_bar.jpg',
    '/yogurt_cup.jpg',
    '/ketchup_bottle.jpg'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 10000); // 10s per item to let animation finish and rest
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    setUserLanguage(isEn ? 'hi' : 'en');
  };

  const scanningIngredients = [
    ['Potato', 'Edible Vegetable Oil', 'Palmolein Oil', 'Iodised Salt', 'Sugar', 'Flavour Enhancer'],
    ['Carbonated Water', 'Sugar', 'Caramel Color', 'Phosphoric Acid', 'Caffeine', 'Natural Flavours'],
    ['Whole Grain Wheat', 'Sugar', 'Corn Syrup', 'Honey', 'Salt', 'Vitamins & Minerals'],
    ['Milk Chocolate', 'Sugar', 'Cocoa Butter', 'Milk Powder', 'Soy Lecithin', 'Vanilla Extract'],
    ['Pasteurized Milk', 'Sugar', 'Fruit Puree', 'Modified Starch', 'Pectin', 'Active Cultures'],
    ['Tomato Concentrate', 'Distilled Vinegar', 'High Fructose Corn Syrup', 'Corn Syrup', 'Salt', 'Spices']
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      overflowY: 'auto',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Background Image */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url('/homepage-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(2px)',
        opacity: 0.8,
        zIndex: 0
      }}></div>

      {/* Main Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '150px', height: 'auto' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleLanguage}
            style={{ background: 'none', border: '1px solid var(--color-divider)', borderRadius: '50px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isEn ? 'HI' : 'EN'}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          
          <button 
            onClick={() => setIsAwarenessOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}
            aria-label="Awareness"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
          
          <button 
            onClick={() => setIsHistoryOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}
            aria-label="History"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
            </svg>
          </button>
        </div>
      </div>

      {!isDemoDismissed && savedScans.length === 0 && <DemoPreviewCard />}

      {/* Hero Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '1rem 2rem', textAlign: 'center' }}>
        
        <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '2.8rem', lineHeight: 1, marginBottom: '0.5rem', color: 'var(--color-pass)' }}>
          {isEn ? "See the truth." : "सच्चाई देखें।"}
        </h2>
        
        <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1rem', opacity: 0.8, maxWidth: '280px', margin: '0 auto 2rem auto', lineHeight: 1.4 }}>
          {isEn ? "Scan any pack. We reveal what's really inside." : "किसी भी पैकेट को स्कैन करें। हम अंदर की सच्चाई सामने लाते हैं।"}
        </p>

        {/* Animation Container (Keyed by activeImageIndex to force restart of CSS animations) */}
        <div key={activeImageIndex} style={{ width: '100%', maxWidth: '360px', margin: '0 auto 1.5rem auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          
          {/* Left Side: Product Image & X-Ray */}
          <div style={{ position: 'relative', width: '160px', height: '260px', flexShrink: 0 }}>
            {/* Base Chip Packet (Real Image) */}
            <img 
              src={images[activeImageIndex]} 
              alt="Product" 
              style={{
                position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
                objectFit: 'cover', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              }}
            />

            {/* X-Ray Chip Packet */}
            <div className="anim-xray" style={{
              position: 'absolute', left: 0, top: 0, width: '100%', height: '100%',
              borderRadius: '12px', overflow: 'hidden', border: '1px solid #ADFF2F',
              boxShadow: '0 0 25px rgba(173, 255, 47, 0.4)'
            }}>
              <img 
                src={images[activeImageIndex]} 
                alt="Product X-Ray" 
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'brightness(0.25) sepia(1) hue-rotate(80deg) saturate(6)',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(173,255,47,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(173,255,47,0.8) 1px, transparent 1px)',
                backgroundSize: '15px 15px',
                opacity: 0.3
              }}></div>
              <div style={{
                position: 'absolute', top: '30px', left: '15px', right: '15px',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                 <span style={{ color: '#ADFF2F', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' }}>INGREDIENTS</span>
                 <div style={{ width: '100%', height: '1px', backgroundColor: '#ADFF2F', marginBottom: '6px' }}></div>
                 {scanningIngredients[activeImageIndex].map(i => (
                   <span key={i} style={{ color: '#ADFF2F', fontSize: '0.55rem', opacity: 0.9 }}>{i}</span>
                 ))}
              </div>
            </div>

            {/* Scanner Line */}
            <div className="anim-scanner" style={{
              position: 'absolute', left: 0, top: '-10px', width: '3px', height: '280px',
              backgroundColor: '#ADFF2F', boxShadow: '0 0 15px #ADFF2F, 0 0 30px #ADFF2F',
              zIndex: 10
            }}></div>
          </div>

          {/* Right Side: Staggered Pop-Up Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '170px', flexShrink: 0 }}>
             
             {/* High Sugar */}
             <div className="anim-card delay-1">
               <div className="anim-drift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '8px 10px', backgroundImage: 'linear-gradient(45deg, #fbe9e7, #ffccbc)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(217, 83, 40, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconSugarCube size={18} color="#d95328" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#d95328', lineHeight: 1.1 }}>HIGH SUGAR</span>
                      <span style={{ fontSize: '0.5rem', color: '#774332', lineHeight: 1, marginTop: '2px' }}>12.6g / serve</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#d95328', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
               </div>
             </div>

             {/* High Fat */}
             <div className="anim-card delay-2">
               <div className="anim-drift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '8px 10px', backgroundImage: 'linear-gradient(45deg, #fff3e0, #ffe0b2)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(239, 108, 0, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconDroplet size={18} color="#ef6c00" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#ef6c00', lineHeight: 1.1 }}>HIGH FAT</span>
                      <span style={{ fontSize: '0.5rem', color: '#824814', lineHeight: 1, marginTop: '2px' }}>8.7g / serve</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#ef6c00', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
               </div>
             </div>

             {/* High Salt */}
             <div className="anim-card delay-3">
               <div className="anim-drift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '8px 10px', backgroundImage: 'linear-gradient(45deg, #fbe9e7, #ffccbc)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(217, 83, 40, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconSaltShaker size={18} color="#d95328" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#d95328', lineHeight: 1.1 }}>HIGH SALT</span>
                      <span style={{ fontSize: '0.5rem', color: '#774332', lineHeight: 1, marginTop: '2px' }}>450mg / serve</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#d95328', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>
               </div>
             </div>

             {/* Verification Needed */}
             <div className="anim-card delay-4">
               <div className="anim-drift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '8px 10px', backgroundImage: 'linear-gradient(45deg, #fff8e1, #ffecb3)', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', border: '1px solid rgba(245, 127, 23, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconFlask size={18} color="#f57f17" />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: '900', color: '#f57f17', lineHeight: 1.1 }}>SOME<br/>ADDITIVES</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f57f17', borderRadius: '50%', padding: '2px', color: 'white', display: 'flex' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
               </div>
             </div>

             {/* Verdict */}
             <div className="anim-card delay-verdict" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#fbe9e7', borderRadius: '8px', boxShadow: '0 6px 15px rgba(217, 83, 40, 0.15)', border: '1px solid #ffccbc', marginTop: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#555', marginBottom: '2px' }}>Our Verdict</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#d95328', lineHeight: 1.1 }}>NOT<br/>RECOMMENDED</span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d95328" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
             </div>

          </div>
        </div>


      </div>

      {/* CTA Footer */}
      <div style={{ padding: '1rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        
        <span style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8, color: '#1E3A28', marginBottom: '4px' }}>
          {isEn ? 'Tap to start scanning' : 'स्कैन करने के लिए टैप करें'} &#x2935;
        </span>

        <button 
          className="anim-drift"
          onClick={() => setIsScanning(true)}
          style={{ 
            width: '100%', 
            backgroundImage: 'linear-gradient(45deg, #385A42, #d95328, #597a5f, #385A42)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: '0.5rem',
            boxShadow: '0 6px 15px rgba(56, 90, 66, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', flexShrink: 0 }}></div>
            <span className="headline-en" style={{ fontSize: '1.1rem', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {isEn ? 'SCAN SOMETHING' : 'उत्पाद स्कैन करें'}
            </span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <button 
          className="anim-drift"
          onClick={() => setIsBatchMode(true)}
          style={{ 
            width: '100%', 
            backgroundImage: 'linear-gradient(45deg, #385A42, #d95328, #597a5f, #385A42)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: '0.5rem',
            boxShadow: '0 6px 15px rgba(56, 90, 66, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', flexShrink: 0 }}></div>
            <span className="headline-en" style={{ fontSize: '1.1rem', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {isEn ? 'SCAN MULTIPLE' : 'कई उत्पाद स्कैन करें'}
            </span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>


        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', opacity: 0.6 }}>
          <IconShield size={12} color="currentColor" />
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {isEn ? 'Images are used only for label analysis' : 'छवियों का उपयोग केवल लेबल विश्लेषण के लिए किया जाता है'}
          </span>
        </div>
      </div>
      </div>
    </div>
  );
};
