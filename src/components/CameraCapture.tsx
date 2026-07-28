import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface CameraCaptureProps {
  step: 1 | 2;
  onCapture: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ step, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { userLanguage, setFrontImage, setIngredientsImage, resetApp } = useAppContext();
  const isEn = userLanguage === 'en';
  const [cameraError, setCameraError] = useState<string | null>(null);

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
    if (videoRef.current) {
      const MAX_WIDTH = 800;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;

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
        // Compress jpeg to 0.6 quality to significantly save serverless payload size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        
        if (step === 1) {
          setFrontImage(dataUrl);
        } else {
          setIngredientsImage(dataUrl);
        }
        onCapture();
      }
    }
  };

  const titleEn = step === 1 ? 'SCAN THE FRONT OF THE PACK' : 'NOW SCAN THE INGREDIENTS & NUTRITION PANEL.';
  const titleHi = step === 1 ? 'पैक के सामने का हिस्सा स्कैन करें' : 'अब सामग्री और पोषण पैनल को स्कैन करें।';
  
  const subtextEn = step === 1 ? 'Make sure the claim or product name is visible.' : 'Fit the whole panel in frame if you can.';
  const subtextHi = step === 1 ? 'सुनिश्चित करें कि उत्पाद का नाम दिखाई दे रहा है।' : 'यदि आप कर सकते हैं तो पूरे पैनल को फ्रेम में फिट करें।';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      backgroundColor: 'var(--color-bg)',
      backgroundImage: `url('/background.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'var(--color-text)',
      position: 'relative'
    }}>
      {/* Top Bar with Cancel */}
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <button 
          onClick={resetApp}
          style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          &larr; {isEn ? 'Cancel' : 'रद्द करें'}
        </button>
      </div>

      {/* Camera Feed Container */}
      <div style={{ flex: 1, padding: '0 1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          borderRadius: '24px', 
          overflow: 'hidden',
          backgroundColor: '#000',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
        }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {cameraError ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '12px' }}>
                <h3>Camera Error</h3>
                <p>{cameraError}</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Ensure you are using HTTPS and have granted camera permissions.</p>
              </div>
            ) : (
              <div style={{
                width: '80%',
                height: '80%',
                border: '2px solid rgba(255,255,255,0.8)',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
              }}></div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Bottom Panel */}
      <div style={{ 
        padding: '2rem 1.5rem', 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        {/* Progress Indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? 'var(--color-text)' : 'rgba(0,0,0,0.1)' }}></div>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step === 2 ? 'var(--color-text)' : 'rgba(0,0,0,0.1)' }}></div>
        </div>

        <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 900 }}>
          {isEn ? titleEn : titleHi}
        </h2>
        <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '2rem' }}>
          {isEn ? subtextEn : subtextHi}
        </p>
        
        <button 
          onClick={handleCaptureClick} 
          aria-label="Capture"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-text)',
            border: '4px solid var(--color-bg)',
            outline: '2px solid var(--color-text)',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        ></button>
      </div>
    </div>
  );
};
