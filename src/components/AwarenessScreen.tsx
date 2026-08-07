import React from 'react';
import { useAppContext } from '../context/AppContext';
import { RichText } from './RichText';

export const AwarenessScreen: React.FC = () => {
  const { userLanguage, setIsAwarenessOpen } = useAppContext();
  const isEn = userLanguage === 'en';

  const facts: Array<{
    titleEn: string;
    titleHi: string;
    bodyEn: string;
    bodyHi: string;
    source: string;
  }> = [
    {
      titleEn: "50-metre school HFSS ban",
      titleHi: "50 मीटर स्कूल HFSS बैन",
      bodyEn: "Under FSSAI's Safe Food and Balanced Diets for Children in School Regulations, 2020 (in force since July 2021), no one may sell, market, or advertise food high in saturated fat, trans fat, added sugar, or sodium within 50 metres of a school gate. Schools must also display a warning board about this at the entrance gate.",
      bodyHi: "FSSAI के 2020 स्कूल नियमों (जुलाई 2021 से लागू) के तहत, स्कूल के गेट के 50 मीटर के दायरे में कोई भी हाई-फैट, ट्रांस फैट, अतिरिक्त चीनी या सोडियम वाला खाना नहीं बेच सकता, न ही उसका प्रचार कर सकता है। स्कूलों को भी मेन गेट पर इसके बारे में एक चेतावनी बोर्ड लगाना होगा।",
      source: "FSSAI Gazette Notification, September 2020"
    },
    {
      titleEn: "Trans fat limit",
      titleHi: "ट्रांस फैट की सीमा",
      bodyEn: "Since January 2022, food sold in India legally cannot contain more than 2% trans fat. This is one of the few HFSS-related rules that's actually binding law, not just a proposal.",
      bodyHi: "जनवरी 2022 से, भारत में बिकने वाले किसी भी खाने में कानूनी रूप से 2% से अधिक ट्रांस फैट नहीं हो सकता है। यह उन कुछ नियमों में से एक है जो सच में एक पक्का कानून है, सिर्फ एक प्रस्ताव नहीं।",
      source: "FSSAI Prohibition and Restriction on Sales, 2nd Amendment Regulations, 2021"
    },
    {
      titleEn: "Veg/non-veg symbols",
      titleHi: "शाकाहारी/मांसाहारी निशान",
      bodyEn: "Every packaged food must carry a green (vegetarian) or brown (non-vegetarian) symbol by law. In 2021, the non-veg symbol changed from a circle to a triangle specifically to help colourblind shoppers tell them apart by shape, not just colour.",
      bodyHi: "कानून के अनुसार हर पैकेटबंद खाने पर हरा (शाकाहारी) या भूरा (मांसाहारी) निशान होना ज़रूरी है। 2021 में, कलरब्लाइंड (रंग न पहचान पाने वाले) लोगों की मदद करने के लिए मांसाहारी निशान को गोल से बदलकर त्रिकोण (triangle) कर दिया गया था, ताकि वे सिर्फ रंग नहीं, आकार से भी फर्क समझ सकें।",
      source: "FSSAI Labelling and Display Regulations, 2020"
    },
    {
      titleEn: "Allergen disclosure",
      titleHi: "एलर्जी की जानकारी",
      bodyEn: "Indian food labels must clearly declare major allergens like gluten-containing cereals — this is a legal requirement, not optional.",
      bodyHi: "भारतीय फूड लेबल्स पर मुख्य एलर्जी वाली चीज़ों (जैसे ग्लूटेन वाले अनाज) की जानकारी साफ-साफ देना कानूनी रूप से ज़रूरी है, यह कोई अपनी मर्ज़ी की बात नहीं है।",
      source: "FSSAI Labelling and Display Regulations, 2020"
    },
    {
      titleEn: "Claim regulation",
      titleHi: "दावों पर नियम",
      bodyEn: "Making a health or nutrition claim that isn't backed by evidence is illegal in India, not just misleading — this is the same rule our app checks every scan against.",
      bodyHi: "बिना सबूत के कोई हेल्थ या न्यूट्रिशन का दावा करना भारत में न सिर्फ गुमराह करने वाला है, बल्कि गैरकानूनी भी है — हमारा ऐप हर स्कैन में इसी नियम की जांच करता है।",
      source: "FSSAI Advertising & Claims Regulations, 2018"
    },
    {
      titleEn: "Pending thresholds",
      titleHi: "प्रस्तावित सीमाएं",
      bodyEn: "FSSAI still hasn't finalized binding limits for sugar, fat, and salt in packaged food, years after India's own nutrition body proposed them — this app uses those proposed limits since no binding ones exist yet.",
      bodyHi: "भारत की अपनी न्यूट्रिशन संस्था द्वारा प्रस्ताव देने के सालों बाद भी, FSSAI ने पैकेटबंद खाने में चीनी, फैट और नमक की पक्की सीमा तय नहीं की है — क्योंकि अभी तक कोई पक्का कानून नहीं है, यह ऐप उन्हीं प्रस्तावित सीमाओं का इस्तेमाल करता है।",
      source: "Publicly reported, FSSAI statements to the Supreme Court"
    },
    {
      titleEn: "Enforcement gap",
      titleHi: "जांच की कमी",
      bodyEn: "Even banned substances sometimes still appear in the market, because enforcement doesn't reach every food seller consistently. Reading the real label yourself is still the most reliable check.",
      bodyHi: "प्रतिबंधित (बैन) चीज़ें भी कभी-कभी बाज़ार में बिकती मिल जाती हैं, क्योंकि नियमों की जांच हर जगह सख्ती से नहीं हो पाती। इसलिए, खुद लेबल पढ़ना ही सबसे सही तरीका है।",
      source: "General regulatory reporting, no specific brand named"
    },
    {
      titleEn: "CBSE Sugar Board mandate",
      titleHi: "CBSE का शुगर बोर्ड नियम",
      bodyEn: "CBSE has made 'Sugar Boards' — visual charts showing real sugar content in popular drinks — mandatory in schools.",
      bodyHi: "CBSE ने स्कूलों में 'शुगर बोर्ड' लगाना ज़रूरी कर दिया है — ये ऐसे चार्ट होते हैं जो मशहूर ड्रिंक्स में मौजूद असली चीनी की मात्रा दिखाते हैं।",
      source: "CBSE circular, reported via national news coverage"
    },
    {
      titleEn: "Proposed energy drink restriction",
      titleHi: "एनर्जी ड्रिंक्स पर प्रस्तावित रोक",
      bodyEn: "Maharashtra's FDA has announced plans to restrict high-caffeine energy drinks within 500 metres of schools — this is a proposed rule, not yet formally notified.",
      bodyHi: "महाराष्ट्र के FDA ने स्कूलों के 500 मीटर के दायरे में हाई-कैफीन वाली एनर्जी ड्रिंक्स पर रोक लगाने की योजना बनाई है — यह अभी एक प्रस्ताव है, इसे पूरी तरह से लागू नहीं किया गया है।",
      source: "PTI/state legislature statement, July 2024"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', color: 'var(--color-text)', backgroundImage: `url('/screen3.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <button 
          onClick={() => setIsAwarenessOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: 'var(--color-text)' }}
          aria-label="Back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h2 className="headline-en" style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isEn ? 'AWARENESS' : 'जागरूकता'}
        </h2>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
          {facts.map((fact, idx) => (
            <div key={idx} style={{
              backgroundColor: '#FEF9F0', // cream card background
              border: '1px solid #D4AF37', // thin gold border
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <h3 className={isEn ? 'headline-en' : 'headline-hi'} style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#B78103' }}>
                {isEn ? fact.titleEn : fact.titleHi}
              </h3>
              <p className={isEn ? 'body-en' : 'body-hi'} style={{ margin: '0 0 1rem 0', fontSize: '1rem', lineHeight: 1.5, opacity: 0.9 }}>
                <RichText text={isEn ? fact.bodyEn : fact.bodyHi} isEn={isEn} />
              </p>
              <div style={{
                fontSize: '0.8rem',
                opacity: 0.7,
                borderTop: '1px solid rgba(0,0,0,0.1)',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem'
              }}>
                <svg style={{ flexShrink: 0, marginTop: '2px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                <span><RichText text={fact.source} isEn={isEn} /></span>
              </div>
            </div>
          ))}

          {/* Verification Date */}
          <div style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.6, fontSize: '0.85rem' }}>
            {isEn ? 'Facts last verified: 5 August 2026' : 'तथ्यों की अंतिम जांच: 5 अगस्त 2026'}
          </div>

        </div>
      </div>
    </div>
  );
};
