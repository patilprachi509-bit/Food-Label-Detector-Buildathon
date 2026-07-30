import React from 'react';
import { useAppContext } from '../context/AppContext';

export const HowItWorksScreen: React.FC = () => {
  const { userLanguage, setIsHowItWorksOpen } = useAppContext();
  const isEn = userLanguage === 'en';

  return (
    <div className="bg-dense" style={{ display: 'flex', flexDirection: 'column', height: '100vh', color: 'var(--color-text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          onClick={() => setIsHowItWorksOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: 'var(--color-text)' }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="headline-en" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>
          {isEn ? 'HOW IT WORKS' : 'यह कैसे काम करता है'}
        </h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem' }}>
        
        {/* Explanatory Line */}
        <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1.2rem', lineHeight: 1.5, marginBottom: '3rem', opacity: 0.9 }}>
          {isEn 
            ? "Point your camera at any packaged snack. We check what the pack claims against the real numbers — and tell you clearly if it's actually healthy."
            : "किसी भी पैकेज्ड स्नैक पर कैमरा तानें। हम पैक पर लिखे दावे की जांच असली आंकड़ों से करते हैं — और साफ़-साफ़ बताते हैं कि यह सच में सेहतमंद है या नहीं।"}
        </p>

        {/* 3-Step Strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <div>
              <h3 className={isEn ? 'headline-en' : 'headline-hi'} style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                {isEn ? 'Scan' : 'स्कैन करें'}
              </h3>
              <p className={isEn ? 'body-en' : 'body-hi'} style={{ margin: 0, opacity: 0.7, fontSize: '0.95rem' }}>
                {isEn ? 'Front and back of the pack' : 'पैक का आगे और पीछे का हिस्सा'}
              </p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 className={isEn ? 'headline-en' : 'headline-hi'} style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                {isEn ? 'We Check' : 'हम जांचते हैं'}
              </h3>
              <p className={isEn ? 'body-en' : 'body-hi'} style={{ margin: 0, opacity: 0.7, fontSize: '0.95rem' }}>
                {isEn ? 'Against FSSAI & ICMR-NIN rules' : 'FSSAI और ICMR-NIN के नियमों के अनुसार'}
              </p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
            </div>
            <div>
              <h3 className={isEn ? 'headline-en' : 'headline-hi'} style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                {isEn ? 'Clear Verdict' : 'स्पष्ट फैसला'}
              </h3>
              <p className={isEn ? 'body-en' : 'body-hi'} style={{ margin: 0, opacity: 0.7, fontSize: '0.95rem' }}>
                {isEn ? 'In your language, in seconds' : 'आपकी भाषा में, चंद सेकंडों में'}
              </p>
            </div>
          </div>
        </div>

        {/* Our Approach */}
        <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '2rem' }}>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '1.5rem' }}>
            {isEn 
              ? "If a product doesn't meet FSSAI or ICMR-NIN standards, we say so clearly, every time. That verdict doesn't get softened, negotiated, or explained away. But most packaged snacks sold in India fall into this category, and a genuinely healthy alternative isn't always within reach in the moment. So on flagged products, we also show exactly how much fits within a balanced day — the same reasoning behind an occasional treat, not a case for eating more of it."
              : "अगर कोई उत्पाद FSSAI या ICMR-NIN के मानकों पर खरा नहीं उतरता, तो हम इसे हर बार साफ़ तौर पर बताते हैं। यह फैसला न तो नरम किया जाता है, न ही बदला जाता है। लेकिन भारत में बिकने वाले ज़्यादातर पैकेज्ड स्नैक्स इसी श्रेणी में आते हैं, और हर बार सच में एक स्वस्थ विकल्प उपलब्ध नहीं होता। इसलिए फ़्लैग किए गए उत्पादों पर, हम यह भी दिखाते हैं कि संतुलित दिन में कितनी मात्रा उचित है — जैसे कभी-कभार का आनंद, ज़्यादा खाने का बहाना नहीं।"}
          </p>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1.1rem', lineHeight: 1.5, fontWeight: 'bold', color: 'var(--color-fail)' }}>
            {isEn 
              ? "Flagged means not recommended. Always."
              : "फ़्लैग का मतलब है अनुशंसित नहीं। हमेशा।"}
          </p>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, marginTop: '1.5rem' }}>
            {isEn
              ? "The portion guidance exists to help you make the most informed version of a real decision — not to endorse the product."
              : "मात्रा से जुड़ी सलाह आपको एक असली फैसले की सबसे सही जानकारी देने के लिए है — उत्पाद का समर्थन करने के लिए नहीं।"}
          </p>
        </div>

      </div>
    </div>
  );
};
