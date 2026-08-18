import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface CameraCaptureProps {
  step: 1 | 2 | 3;
  onCapture: () => void;
  onSkip?: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ step, onCapture, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { userLanguage, setFrontImage, setIngredientsImage, setThirdImage, resetApp, curvedImages, setCurvedImages, setIsCurvedCaptureDone } = useAppContext();
  const isEn = userLanguage === 'en';
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<'standard' | 'curved'>('standard');

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraError(null);
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        setCameraError(err.message || String(err));
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCaptureClick = () => {
    console.log('CameraCapture: handleCaptureClick fired, step:', step, 'videoRef.current:', !!videoRef.current);
    if (videoRef.current) {
      if (mode === 'curved' && curvedImages.length >= 6) {
        alert(isEn ? "Maximum 6 frames allowed for curved capture." : "वक्र कैप्चर के लिए अधिकतम 6 फ्रेम की अनुमति है।");
        return;
      }
      
      const MAX_WIDTH = step === 1 ? 1200 : 2200;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;
      const sourceWidth = width;
      const sourceHeight = height;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        
        console.log('SOURCE DIMENSIONS:', sourceWidth, 'x', sourceHeight);
        console.log('CANVAS OUTPUT DIMENSIONS:', canvas.width, 'x', canvas.height);
        
        const quality = step === 1 ? 0.85 : 0.92;
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // TEMP DEBUG — monitor payload size for Vercel 4.5MB limit
        console.log('--- CAMERA CAPTURE PAYLOAD SIZE --- step:', step, 'length:', dataUrl.length);
        
        if (mode === 'curved') {
          setCurvedImages([...curvedImages, dataUrl]);
        } else {
          if (step === 1) {
            setFrontImage(dataUrl);
          } else if (step === 2) {
            setIngredientsImage(dataUrl);
          } else {
            setThirdImage(dataUrl);
          }
          onCapture();
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          // Same dual-resolution logic for gallery uploads
          const MAX_WIDTH = step === 1 ? 1200 : 2200;
          let width = img.width;
          let height = img.height;
          const sourceWidth = width;
          const sourceHeight = height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            console.log('SOURCE DIMENSIONS:', sourceWidth, 'x', sourceHeight);
            console.log('CANVAS OUTPUT DIMENSIONS:', canvas.width, 'x', canvas.height);
            
            const quality = step === 1 ? 0.85 : 0.92;
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

            // TEMP DEBUG — monitor payload size for Vercel 4.5MB limit
            console.log('--- CAMERA CAPTURE PAYLOAD SIZE --- step:', step, 'length:', compressedDataUrl.length);
            if (mode === 'curved') {
              setCurvedImages([...curvedImages, compressedDataUrl]);
            } else {
              if (step === 1) {
                setFrontImage(compressedDataUrl);
              } else if (step === 2) {
                setIngredientsImage(compressedDataUrl);
              } else {
                setThirdImage(compressedDataUrl);
              }
              onCapture();
            }
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };


  const titleEn = mode === 'curved' ? 'SCAN A CURVED BOTTLE' : (step === 1 ? 'SCAN THE FRONT OF THE PACK' : (step === 2 ? 'NOW SCAN THE INGREDIENTS & NUTRITION PANEL.' : 'NOW SCAN THE REST OF THE PANEL.'));
  const titleHi = mode === 'curved' ? 'एक घुमावदार बोतल को स्कैन करें' : (step === 1 ? 'पैक के सामने का हिस्सा स्कैन करें' : (step === 2 ? 'अब सामग्री और पोषण पैनल को स्कैन करें।' : 'अब बाकी पैनल को स्कैन करें।'));
  
  const subtextEn = mode === 'curved' 
    ? 'Slowly rotate the product and tap to capture 2-6 times to cover the whole label.'
    : (step === 1 ? 'Make sure the claim or product name is visible.' : (step === 2 ? 'Fit the whole panel in frame if you can.' : 'Capture the rest of the panel if needed, or tap Done if you already got everything.'));
  const subtextHi = mode === 'curved'
    ? 'उत्पाद को धीरे-धीरे घुमाएं और पूरे लेबल को कवर करने के लिए 2-6 बार टैप करें।'
    : (step === 1 ? 'सुनिश्चित करें कि उत्पाद का नाम दिखाई दे रहा है।' : (step === 2 ? 'यदि आप कर सकते हैं तो पूरे पैनल को फ्रेम में फिट करें।' : 'यदि आवश्यकता हो तो बाकी का हिस्सा कैप्चर करें, या यदि आपको सब कुछ मिल गया है तो हो गया पर टैप करें।'));

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Full Screen Camera Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' 
        }} 
      />
      
      {/* Viewfinder Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {cameraError ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', borderRadius: '12px', pointerEvents: 'auto' }}>
            <h3>{isEn ? 'Camera Error' : 'कैमरा त्रुटि'}</h3>
            <p>{cameraError}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>{isEn ? 'Ensure you are using HTTPS and have granted camera permissions.' : 'सुनिश्चित करें कि आप HTTPS का उपयोग कर रहे हैं और कैमरा अनुमति दी है।'}</p>
          </div>
        ) : null}
      </div>

      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        pointerEvents: 'none' 
      }}>
        
        {/* Top Bar with Cancel */}
        <div style={{ 
          padding: '2rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          pointerEvents: 'auto',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
        }}>
          <button 
            onClick={resetApp}
            style={{ 
              background: 'rgba(0,0,0,0.6)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: 'white', 
              fontSize: '0.9rem', 
              fontWeight: 'bold', 
              letterSpacing: '1px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.6rem 1rem',
              borderRadius: '24px',
              backdropFilter: 'blur(4px)'
            }}
          >
            &larr; {isEn ? 'Cancel' : 'रद्द करें'}
          </button>

          {step === 1 && curvedImages.length === 0 && (
            <button
              onClick={() => setMode(mode === 'standard' ? 'curved' : 'standard')}
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: mode === 'curved' ? 'var(--color-pass)' : 'white',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                padding: '0.6rem 1rem',
                borderRadius: '24px',
                backdropFilter: 'blur(4px)'
              }}
            >
              {mode === 'curved' ? (isEn ? '✓ Curved Mode' : '✓ वक्र मोड') : (isEn ? 'Bottle/Curved Mode' : 'बोतल/वक्र मोड')}
            </button>
          )}
        </div>

        {/* Instructions & Capture Bottom Panel */}
        <div style={{ 
          padding: '4rem 1.5rem 3rem 1.5rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          color: 'white',
          pointerEvents: 'auto',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)'
        }}>
          {/* Progress Indicator */}
          {mode === 'standard' ? (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step >= 2 ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
              {step === 3 && (
                <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'white' }}></div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', color: 'white', fontWeight: 'bold' }}>
              {curvedImages.length} {isEn ? 'Captured' : 'कैप्चर किए गए'}
            </div>
          )}

          <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {isEn ? titleEn : titleHi}
          </h2>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '2rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {isEn ? subtextEn : subtextHi}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', width: '100%' }}>
            {/* Gallery Upload Button (Left) */}
            <div style={{ width: '60px', display: 'flex', justifyContent: 'center' }}>
              <label 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  opacity: 0.8,
                  transition: 'opacity 0.2s'
                }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.25rem' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{isEn ? 'Gallery' : 'गैलरी'}</span>
              </label>
            </div>

            {/* Live Capture Button (Center) */}
            <button 
              onClick={handleCaptureClick} 
              aria-label="Capture"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '4px solid transparent',
                outline: '4px solid white',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
              }}
            ></button>

            {/* Empty space to balance the layout (Right) */}
            <div style={{ width: '60px' }}></div>
          </div>
          
          {((step === 3 && onSkip) || (mode === 'curved' && curvedImages.length >= 2)) && (
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                onClick={() => {
                  if (mode === 'curved') {
                    setIsCurvedCaptureDone(true);
                  } else if (onSkip) {
                    onSkip();
                  }
                }}
                style={{
                  background: 'none',
                  border: '1px solid white',
                  color: 'white',
                  borderRadius: '24px',
                  padding: '0.6rem 2.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: 0.9,
                  transition: 'opacity 0.2s'
                }}
              >
                {isEn ? 'Done - Analyze Now' : 'हो गया - विश्लेषण करें'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
