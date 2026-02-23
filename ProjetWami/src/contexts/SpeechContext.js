import React, { createContext, useContext, useState } from 'react';

// Créer le contexte
const SpeechContext = createContext();

// Provider pour gérer l'état global de la synthèse vocale
export function SpeechProvider({ children }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startSpeaking = () => {
    setIsSpeaking(true);
    console.log('🔊 Synthèse vocale démarrée');
  };

  const stopSpeaking = () => {
    setIsSpeaking(false);
    console.log('🔇 Synthèse vocale arrêtée');
  };

  const value = {
    isSpeaking,
    startSpeaking,
    stopSpeaking,
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useSpeech() {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
}
