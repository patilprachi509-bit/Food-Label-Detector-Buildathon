import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

async function generateHash(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const CACHE_KEY = 'extraction_cache_v2';
const MAX_CACHE_SIZE = 100;

interface CacheEntry {
  hash: string;
  data: any;
  timestamp: number;
}

import { LowConfidenceScreen } from './PlaceholderScreens';

export const ProcessingScreen: React.FC = () => {
  const { 
    userLanguage, frontImage, ingredientsImage, thirdImage, 
    setExtractionResult, setPendingExtractionResult, resetApp
  } = useAppContext();
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fetchPromiseRef = React.useRef<Promise<any> | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Rotate loading text
    const interval = setInterval(() => {
      if (isMounted) setLoadingStep(prev => prev + 1);
    }, 2500);

    const processImages = async () => {
      if (!frontImage || !ingredientsImage) return;

      if (!fetchPromiseRef.current) {
        // Strip data:image/jpeg;base64, prefix
        const frontBase64 = frontImage.split(',')[1];
        const ingredientsBase64 = ingredientsImage.split(',')[1];
        const thirdBase64 = thirdImage ? thirdImage.split(',')[1] : null;
        
        fetchPromiseRef.current = (async () => {
          const hashStr = await generateHash(frontBase64 + ingredientsBase64 + (thirdBase64 || ''));
          
          try {
            const cacheStr = localStorage.getItem(CACHE_KEY);
            if (cacheStr) {
              const cache: CacheEntry[] = JSON.parse(cacheStr);
              const found = cache.find(c => c.hash === hashStr);
              if (found) return found.data;
            }
          } catch (e) {
            console.error("Cache read error", e);
          }

          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              frontBase64,
              ingredientsBase64,
              thirdBase64
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API error ${response.status}: ${errText}`);
          }
          
          const data = await response.json();
          

          try {
            const cacheStr = localStorage.getItem(CACHE_KEY);
            let cache: CacheEntry[] = cacheStr ? JSON.parse(cacheStr) : [];
            cache.push({ hash: hashStr, data, timestamp: Date.now() });
            
            // FIFO eviction
            if (cache.length > MAX_CACHE_SIZE) {
              cache.sort((a, b) => a.timestamp - b.timestamp);
              cache = cache.slice(cache.length - MAX_CACHE_SIZE);
            }
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
          } catch (e) {
            console.error("Cache write error", e);
          }

          return data;
        })();
      }

      try {
        const data = await fetchPromiseRef.current;
        if (isMounted) {
          setExtractionResult(data);
        }

        // Fire a non-blocking request for video search
        const brandName = data.front_of_pack?.brand_name;
        const productName = data.front_of_pack?.product_name;

        if (brandName || productName) {
          fetch('/api/video-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandName, productName })
          })
          .then(res => res.json())
          .then(videoData => {
            if (isMounted && videoData.videoId) {
              setPendingExtractionResult((prev: any) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  front_of_pack: {
                    ...prev.front_of_pack,
                    video_id: videoData.videoId
                  }
                };
              });
            }
          })
          .catch(e => console.error("Video search background error:", e));
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Extraction Error:", err);
          setError(err.message || 'Failed to read label');
          // Clear active images from session so a browser refresh on the error screen routes back to Home
          setFrontImage(null);
          setIngredientsImage(null);
          setThirdImage(null);
        }
      }
    };

    processImages();

    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [frontImage, ingredientsImage, setExtractionResult]);

  const isEn = userLanguage === 'en';

  const enMessages = [
    'READING THE LABEL',
    'DECODING INGREDIENTS',
    'CALCULATING NUTRITION',
    'CHECKING GUIDELINES',
    'ALMOST DONE'
  ];

  const hiMessages = [
    'लेबल पढ़ रहा है',
    'सामग्री डिकोड कर रहा है',
    'पोषण की गणना कर रहा है',
    'दिशानिर्देशों की जाँच कर रहा है',
    'लगभग हो गया'
  ];

  const messages = isEn ? enMessages : hiMessages;
  const currentMessage = messages[loadingStep % messages.length];

  if (error) {
    if (error.includes('429') || error.includes('Quota') || error.includes('RESOURCE_EXHAUSTED')) {
      const displayError = isEn 
        ? "Our servers are a bit overwhelmed right now (API rate limit exceeded). Please wait about 30 seconds and tap Restart!"
        : "हमारे सर्वर अभी थोड़े व्यस्त हैं (API दर सीमा पार हो गई)। कृपया लगभग 30 सेकंड प्रतीक्षा करें और रीस्टार्ट पर टैप करें!";
      
      return (
        <div className="screen-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <h2 className="text-fail" style={{ marginBottom: '1rem', fontSize: '2rem' }}>
            {isEn ? 'Error' : 'त्रुटि'}
          </h2>
          <p style={{ wordBreak: 'break-word', opacity: 0.8, lineHeight: 1.5, maxWidth: '400px' }}>
            {displayError}
          </p>
          <button className="btn-primary" onClick={resetApp} style={{ marginTop: '2rem', width: '100%' }}>
            {isEn ? 'Restart' : 'रीस्टार्ट'}
          </button>
        </div>
      );
    }
    
    // For 500 errors (like Cloud Vision failing, or unparseable text), show the expected Low Confidence screen instead of a stack trace.
    return <LowConfidenceScreen />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/background.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="loader"></div>
      <h2 className={`processing-text ${isEn ? 'headline-en' : 'headline-hi'}`} style={{ minHeight: '3rem', textAlign: 'center', transition: 'opacity 0.3s ease-in-out', fontWeight: 900 }}>
        {currentMessage}
      </h2>
      <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem', textAlign: 'center' }}>
        {isEn ? "Gemini is analyzing the fine print..." : "Gemini सूक्ष्म प्रिंट का विश्लेषण कर रहा है..."}
      </p>
    </div>
  );
};
