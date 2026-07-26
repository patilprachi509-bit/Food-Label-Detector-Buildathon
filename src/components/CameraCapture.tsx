import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';

interface CameraCaptureProps {
  step: 1 | 2;
  onCapture: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ step, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { userLanguage, setFrontImage, setIngredientsImage } = useAppContext();
  const isEn = userLanguage === 'en';

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
      } catch (err) {
        console.error("Error accessing camera:", err);
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
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
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
    <div className="camera-container">
      {/* Progress Bar */}
      <div className="progress-bar">
        <div className={`progress-segment ${step >= 1 ? 'active' : ''}`}></div>
        <div className={`progress-segment ${step === 2 ? 'active' : ''}`}></div>
      </div>

      {/* Camera Feed */}
      <video ref={videoRef} autoPlay playsInline muted className="camera-feed" />
      <div className="camera-overlay">
        <div className="guide-frame"></div>
      </div>

      {/* Instructions */}
      <div className="instruction-container">
        <h2 className={`instruction-headline ${isEn ? 'headline-en' : 'headline-hi'}`}>
          {isEn ? titleEn : titleHi}
        </h2>
        <p className={`instruction-subtext ${isEn ? 'body-en' : 'body-hi'}`}>
          {isEn ? subtextEn : subtextHi}
        </p>
        
        <div className="capture-btn-container">
          <button className="capture-btn" onClick={handleCaptureClick} aria-label="Capture"></button>
        </div>
      </div>
    </div>
  );
};
