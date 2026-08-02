import React, { useEffect, useRef } from 'react';
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

export const BatchProcessingScreen: React.FC = () => {
  const { userLanguage, batchItems, setBatchItems, setIsBatchFinished, setViewingBatchResultId, setExtractionResult } = useAppContext();
  const isEn = userLanguage === 'en';
  const processingStartedRef = useRef(false);

  useEffect(() => {
    if (processingStartedRef.current) return;
    processingStartedRef.current = true;

    let isMounted = true;

    const processBatch = async () => {
      // Loop sequentially
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        if (item.status === 'done' || item.status === 'error') continue; // Recover interrupted 'processing' items

        // Mark as processing
        if (isMounted) {
          setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing' } : p));
        }

        try {
          if (!item.frontImage || !item.ingredientsImage) throw new Error("Missing image");
          
          const frontBase64 = item.frontImage.split(',')[1];
          const ingredientsBase64 = item.ingredientsImage.split(',')[1];
          const thirdBase64 = item.thirdImage ? item.thirdImage.split(',')[1] : null;
          const hashStr = await generateHash(frontBase64 + ingredientsBase64 + (thirdBase64 || ''));
          
          let data = null;
          try {
            const cacheStr = localStorage.getItem(CACHE_KEY);
            if (cacheStr) {
              const cache = JSON.parse(cacheStr);
              const found = cache.find((c: any) => c.hash === hashStr);
              if (found) data = found.data;
            }
          } catch (e) {
            console.error("Cache read error", e);
          }

          if (!data) {
            const fetchPromise = fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ frontBase64, ingredientsBase64, thirdBase64 })
            });

            const timeoutPromise = new Promise<Response>((_, reject) => {
              setTimeout(() => reject(new Error("Processing timeout")), 25000);
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`API error ${response.status}: ${errText}`);
            }
            
            data = await response.json();
            
            try {
              const cacheStr = localStorage.getItem(CACHE_KEY);
              let cache = cacheStr ? JSON.parse(cacheStr) : [];
              cache.push({ hash: hashStr, data, timestamp: Date.now() });
              if (cache.length > MAX_CACHE_SIZE) {
                cache.sort((a: any, b: any) => a.timestamp - b.timestamp);
                cache = cache.slice(cache.length - MAX_CACHE_SIZE);
              }
              localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            } catch (e) {
              console.error("Cache write error", e);
            }
          }


          if (data.extraction_confidence === 'low') {
            throw new Error("Low confidence extraction");
          }

          // Video search logic (fire and forget, we don't wait for it to finish the batch item)
          const brandName = data.front_of_pack?.brand_name;
          const productName = data.front_of_pack?.product_name;
          if (brandName || productName) {
            fetch('/api/video-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ brandName, productName })
            }).then(res => res.json()).then(videoData => {
              if (videoData.videoId) {
                setBatchItems(prev => prev.map(p => {
                  if (p.id === item.id && p.result) {
                    return {
                      ...p,
                      result: {
                        ...p.result,
                        front_of_pack: { ...p.result.front_of_pack, video_id: videoData.videoId }
                      }
                    };
                  }
                  return p;
                }));
              }
            }).catch(e => console.error("Video search error", e));
          }

          // Mark as done
          if (isMounted) {
            setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', result: data } : p));
          }

        } catch (err) {
          console.error(`Error processing batch item ${item.id}:`, err);
          // Mark as error and gracefully continue loop
          if (isMounted) {
            setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p));
          }
        }
      }

      // Loop finished
      if (isMounted) {
        setIsBatchFinished(true);
      }
    };

    processBatch();

    return () => {
      isMounted = false;
    };
  }, [setBatchItems, setIsBatchFinished]); // REMOVED batchItems from dependencies

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
      padding: '2rem'
    }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '2rem' }}>
        <h2 className="headline-en" style={{ fontSize: '1.5rem', fontWeight: 900 }}>
          {isEn ? 'PROCESSING BATCH' : 'बैच प्रोसेस हो रहा है'}
        </h2>
        <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>
          {isEn ? "Analyzing items one by one to avoid rate limits..." : "दर सीमा से बचने के लिए एक-एक करके आइटम का विश्लेषण किया जा रहा है..."}
        </p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {batchItems.map((item, idx) => {
          const isDone = item.status === 'done';
          return (
            <div 
              key={item.id} 
              onClick={() => {
                if (isDone) {
                  setViewingBatchResultId(item.id);
                  if (item.result) {
                    setExtractionResult(item.result);
                  }
                }
              }}
              style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: '12px', cursor: isDone ? 'pointer' : 'default', boxShadow: isDone ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-divider)', marginRight: '1rem', flexShrink: 0 }}>
                {item.frontImage && <img src={item.frontImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                  {isEn ? `Product ${idx + 1}` : `उत्पाद ${idx + 1}`}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.status === 'pending' && <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>{isEn ? 'Waiting...' : 'प्रतीक्षा में...'}</span>}
                  {item.status === 'processing' && (
                    <>
                      <div className="loader" style={{ width: '12px', height: '12px', borderWidth: '2px', margin: 0 }}></div>
                      <span style={{ color: 'var(--color-pass)', fontSize: '0.85rem', fontWeight: 'bold' }}>{isEn ? 'Processing' : 'प्रोसेसिंग'}</span>
                    </>
                  )}
                  {item.status === 'done' && <span style={{ color: 'var(--color-pass)', fontSize: '0.85rem', fontWeight: 'bold' }}>{isEn ? 'Done' : 'पूरा हुआ'}</span>}
                  {item.status === 'error' && <span style={{ color: 'var(--color-fail)', fontSize: '0.85rem', fontWeight: 'bold' }}>{isEn ? 'Failed' : 'विफल रहा'}</span>}
                </div>
              </div>
              {isDone && (
                <div style={{ marginLeft: '1rem', opacity: 0.5 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
