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
            <h3>Camera Error</h3>
            <p>{cameraError}</p>
            <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>Ensure you are using HTTPS and have granted camera permissions.</p>
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step >= 1 ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
            <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: step === 2 ? 'white' : 'rgba(255,255,255,0.3)' }}></div>
          </div>

          <h2 className={isEn ? 'headline-en' : 'headline-hi'} style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {isEn ? titleEn : titleHi}
          </h2>
          <p className={isEn ? 'body-en' : 'body-hi'} style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '2rem', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            {isEn ? subtextEn : subtextHi}
          </p>
          
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
        </div>

      </div>
    </div>
  );
};
