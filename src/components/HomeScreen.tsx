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

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/screen0.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '24px', height: 'auto' }} />
          <h1 className="headline-en" style={{ fontSize: '1.2rem', margin: 0, letterSpacing: '2px', fontWeight: 'bold' }}>LABEL TRUTH</h1>
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
        <div key={activeImageIndex} style={{ position: 'relative', width: '100%', maxWidth: '350px', height: '240px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {/* Base Chip Packet (Real Image) */}
          <img 
            src={images[activeImageIndex]} 
            alt="Product" 
            style={{
              position: 'absolute', left: '20px', top: '20px', width: '130px', height: '200px',
              objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            }}
          />

          {/* X-Ray Chip Packet */}
          <div className="anim-xray" style={{
            position: 'absolute', left: '20px', top: '20px', width: '130px', height: '200px',
            borderRadius: '8px', overflow: 'hidden', border: '1px solid #287a41',
            boxShadow: '0 0 20px rgba(40, 122, 65, 0.3)'
          }}>
            <img 
              src={images[activeImageIndex]} 
              alt="Product X-Ray" 
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: 'brightness(0.3) sepia(1) hue-rotate(70deg) saturate(5)',
              }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(#287a41 1px, transparent 1px), linear-gradient(90deg, #287a41 1px, transparent 1px)',
              backgroundSize: '10px 10px',
              opacity: 0.5
            }}></div>
            <div style={{
              position: 'absolute', top: '40px', left: '10px', right: '10px',
              display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
               <div style={{ width: '100%', height: '2px', backgroundColor: '#39ff14', marginBottom: '4px' }}></div>
               {[1,2,3,4,5,6].map(i => (
                 <div key={i} style={{ width: `${60 + Math.random() * 40}%`, height: '4px', backgroundColor: '#39ff14', opacity: 0.7, borderRadius: '2px' }}></div>
               ))}
            </div>
          </div>

          {/* Scanner Line */}
          <div className="anim-scanner" style={{
            position: 'absolute', left: '20px', top: '10px', width: '2px', height: '220px',
            backgroundColor: '#39ff14', boxShadow: '0 0 10px #39ff14, 0 0 20px #39ff14',
            zIndex: 10
          }}></div>

          {/* Staggered Pop-Up Cards */}
          <div style={{ position: 'absolute', left: '160px', top: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             
             {/* High Sugar */}
             <div className="anim-card delay-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#fbe9e7', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ffccbc' }}>
                <IconSugarCube size={16} color="#d95328" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#d95328', lineHeight: 1.1 }}>HIGH SUGAR</span>
                </div>
             </div>

             {/* High Fat */}
             <div className="anim-card delay-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#fff3e0', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ffe0b2' }}>
                <IconDroplet size={16} color="#ef6c00" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ef6c00', lineHeight: 1.1 }}>HIGH FAT</span>
                </div>
             </div>

             {/* High Salt */}
             <div className="anim-card delay-3" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#fbe9e7', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ffccbc' }}>
                <IconSaltShaker size={16} color="#d95328" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#d95328', lineHeight: 1.1 }}>HIGH SALT</span>
                </div>
             </div>

             {/* Verification Needed */}
             <div className="anim-card delay-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', backgroundColor: '#fff8e1', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #ffecb3' }}>
                <IconFlask size={16} color="#f57f17" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#f57f17', lineHeight: 1.1 }}>VERIFY NEEDED</span>
                </div>
             </div>

             {/* Verdict */}
             <div className="anim-card delay-verdict" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 10px', backgroundColor: '#fbe9e7', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #ffccbc', marginTop: '4px' }}>
                <span style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: '#555', marginBottom: '2px' }}>Our Verdict</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#d95328', lineHeight: 1.1 }}>NOT<br/>RECOMMENDED</span>
             </div>

          </div>
        </div>

        {/* Feature Highlights Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '320px', margin: '0 auto', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '16px' }}>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }}>
             <IconShield size={20} color="var(--color-pass)" />
             <span style={{ fontSize: '0.7rem', fontWeight: '600', marginTop: '6px', lineHeight: 1.2 }}>Trustworthy<br/>Insights</span>
           </div>
           <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', opacity: 0.2 }}></div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-pass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
             <span style={{ fontSize: '0.7rem', fontWeight: '600', marginTop: '6px', lineHeight: 1.2 }}>Real Numbers,<br/>No Tricks</span>
           </div>
           <div style={{ width: '1px', backgroundColor: 'var(--color-divider)', opacity: 0.2 }}></div>
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }}>
             <IconDroplet size={20} color="var(--color-pass)" />
             <span style={{ fontSize: '0.7rem', fontWeight: '600', marginTop: '6px', lineHeight: 1.2 }}>Better Choices<br/>Everyday</span>
           </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div style={{ padding: '1rem 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button 
          className="effect-gradient-glow"
          onClick={() => setIsScanning(true)}
          style={{ 
            width: '100%', 
            backgroundColor: 'var(--color-pass)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            marginBottom: '0.5rem'
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
          className="effect-gradient-glow"
          onClick={() => setIsBatchMode(true)}
          style={{ 
            width: '100%', 
            backgroundColor: 'transparent', 
            color: 'var(--color-text)', 
            border: '2px solid var(--color-pass)', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            marginBottom: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--color-pass)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
            </svg>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)', flexShrink: 0 }}></div>
            <span className="headline-en" style={{ fontSize: '1.1rem', letterSpacing: '0.5px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {isEn ? 'SCAN MULTIPLE' : 'कई उत्पाद स्कैन करें'}
            </span>
          </div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--color-pass)' }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        
        <span style={{ fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8, color: 'var(--color-pass)' }}>
          &#x2935; {isEn ? 'Tap to start scanning' : 'स्कैन करने के लिए टैप करें'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', opacity: 0.6 }}>
          <IconShield size={12} color="currentColor" />
          <span style={{ fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isEn ? 'Images are used only for label analysis' : 'छवियों का उपयोग केवल लेबल विश्लेषण के लिए किया जाता है'}
          </span>
        </div>
      </div>
    </div>
  );
};
