import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

export const APIKeyPrompt: React.FC = () => {
  const { setApiKey } = useAppContext();
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
    }
  };

  return (
    <div className="screen-container">
      <div className="botanical-bg"></div>
      <h2 className="headline-en lang-title" style={{ color: 'var(--color-terracotta)' }}>API Key Required</h2>
      <p style={{ marginBottom: '2rem', zIndex: 1 }}>
        Please enter your Gemini API Key for local testing.<br/>
        <small style={{ color: 'var(--color-terracotta)', fontWeight: 'bold' }}>
          Do not share this key publicly. This is for local testing only.
        </small>
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '300px', zIndex: 1 }}>
        <input 
          type="password" 
          value={inputKey} 
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="AIzaSy..."
          style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--color-charcoal)' }}
        />
        <button type="submit" className="btn-primary">Continue</button>
      </form>
    </div>
  );
};
