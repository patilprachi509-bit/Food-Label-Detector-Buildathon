import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

async function generateHash(str: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const CACHE_KEY = 'extraction_cache';
const MAX_CACHE_SIZE = 100;

interface CacheEntry {
  hash: string;
  data: any;
  timestamp: number;
}

export const ProcessingScreen: React.FC = () => {
  const { userLanguage, frontImage, ingredientsImage, setExtractionResult } = useAppContext();
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
        
        fetchPromiseRef.current = (async () => {
          const hashStr = await generateHash(frontBase64 + ingredientsBase64);
          
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
              userLanguage
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
              setExtractionResult(prev => {
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
          console.error("Gemini Extraction Error:", err);
          setError(err.message || 'Failed to read label');
        }
      }
    };

    processImages();

    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [frontImage, ingredientsImage, setExtractionResult, userLanguage]);

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
    return (
      <div className="screen-container">
        <h2 className="text-fail" style={{ marginBottom: '1rem' }}>Error</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '2rem' }}>Restart</button>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="loader"></div>
      <h2 className={`processing-text ${isEn ? 'headline-en' : 'headline-hi'}`} style={{ minHeight: '3rem', textAlign: 'center', transition: 'opacity 0.3s ease-in-out' }}>
        {currentMessage}
      </h2>
      <p style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.9rem', textAlign: 'center' }}>
        {isEn ? "Gemini is analyzing the fine print..." : "Gemini सूक्ष्म प्रिंट का विश्लेषण कर रहा है..."}
      </p>
    </div>
  );
};
