import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWaterData } from './WaterDataContext';

const AssistantContext = createContext();

export const useAssistant = () => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};

export const AssistantProvider = ({ children }) => {
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const { waterData } = useWaterData();

  // Générer le message de bienvenue avec l'état de l'eau
  const generateWelcomeMessage = () => {
    const { temperature, ph, oxygen, ammonia, turbidity, salinity } = waterData;
    
    // Analyser l'état global
    let globalStatus = 'bon';
    let statusEmoji = '✅';
    let issues = [];
    
    // Vérifier chaque paramètre
    if (temperature < 24 || temperature > 30) {
      issues.push('température');
      globalStatus = 'attention';
    }
    if (ph < 6.5 || ph > 8.5) {
      issues.push('pH');
      globalStatus = 'attention';
    }
    if (oxygen < 5) {
      issues.push('oxygène');
      globalStatus = 'critique';
    }
    if (ammonia > 0.5) {
      issues.push('ammoniaque');
      globalStatus = 'attention';
    }
    if (turbidity > 20) {
      issues.push('turbidité');
      globalStatus = 'attention';
    }
    
    if (globalStatus === 'critique') {
      statusEmoji = '🔴';
    } else if (globalStatus === 'attention') {
      statusEmoji = '⚠️';
    }

    // Construire le message
    let message = `Bonjour ! 👋 Je suis Wami, votre assistant intelligent pour la pisciculture.\n\n`;
    
    message += `📊 État global de l'eau : ${statusEmoji}\n\n`;
    
    if (globalStatus === 'bon') {
      message += `Excellente nouvelle ! Tous vos paramètres d'eau sont dans les normes optimales 🐟💧\n\n`;
      message += `🌡️ Température : ${temperature}°C - Parfait comme un bain tiède\n`;
      message += `⚗️ pH : ${ph} - Équilibre idéal\n`;
      message += `💨 Oxygène : ${oxygen} mg/L - Vos poissons respirent bien\n`;
      message += `🧪 Ammoniaque : ${ammonia} mg/L - Niveau sûr\n`;
      message += `💧 Turbidité : ${turbidity} NTU - Eau claire\n`;
      message += `🧂 Salinité : ${salinity}‰ - Bon niveau\n\n`;
      message += `💡 Recommandations :\n`;
      message += `- Continuez votre routine actuelle\n`;
      message += `- Surveillez régulièrement les paramètres\n`;
      message += `- Maintenez une alimentation équilibrée\n`;
    } else if (globalStatus === 'attention') {
      message += `Attention ! Certains paramètres nécessitent votre vigilance ⚠️\n\n`;
      message += `Paramètres à surveiller : ${issues.join(', ')}\n\n`;
      message += `📋 Détails :\n`;
      message += `🌡️ Température : ${temperature}°C ${temperature < 24 || temperature > 30 ? '⚠️' : '✓'}\n`;
      message += `⚗️ pH : ${ph} ${ph < 6.5 || ph > 8.5 ? '⚠️' : '✓'}\n`;
      message += `💨 Oxygène : ${oxygen} mg/L ${oxygen < 5 ? '⚠️' : '✓'}\n`;
      message += `🧪 Ammoniaque : ${ammonia} mg/L ${ammonia > 0.5 ? '⚠️' : '✓'}\n`;
      message += `💧 Turbidité : ${turbidity} NTU ${turbidity > 20 ? '⚠️' : '✓'}\n`;
      message += `🧂 Salinité : ${salinity}‰ ✓\n\n`;
      message += `💡 Recommandations urgentes :\n`;
      
      if (temperature < 24) {
        message += `- Augmentez légèrement la température de l'eau\n`;
      } else if (temperature > 30) {
        message += `- Refroidissez l'eau, elle est trop chaude pour les poissons\n`;
      }
      
      if (ph < 6.5) {
        message += `- Ajoutez du bicarbonate pour augmenter le pH\n`;
      } else if (ph > 8.5) {
        message += `- Ajoutez de l'acide pour réduire le pH\n`;
      }
      
      if (ammonia > 0.5) {
        message += `- Changez 20-30% de l'eau immédiatement\n`;
        message += `- Réduisez la quantité de nourriture\n`;
      }
      
      if (turbidity > 20) {
        message += `- Nettoyez les filtres\n`;
        message += `- Vérifiez la surpopulation\n`;
      }
    } else {
      message += `🔴 ALERTE ! Situation critique détectée !\n\n`;
      message += `Le niveau d'oxygène est dangereusement bas (${oxygen} mg/L)\n\n`;
      message += `⚡ Actions immédiates :\n`;
      message += `- Augmentez l'aération d'urgence\n`;
      message += `- Vérifiez les pompes à air\n`;
      message += `- Réduisez la densité de poissons si nécessaire\n`;
      message += `- Changez 30% de l'eau\n`;
    }
    
    message += `\n💬 Je suis là pour vous aider ! N'hésitez pas à me poser des questions.`;
    
    return message;
  };

  // Vérifier si on doit afficher le message de bienvenue
  const checkWelcomeStatus = async (userId) => {
    try {
      const key = `@welcome_shown_${userId}`;
      const shown = await AsyncStorage.getItem(key);
      
      if (!shown) {
        // Générer et afficher le message de bienvenue
        const message = generateWelcomeMessage();
        setWelcomeMessage(message);
        setShouldShowWelcome(true);
        
        // Marquer comme affiché
        await AsyncStorage.setItem(key, 'true');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du message de bienvenue:', error);
    }
  };

  // Réinitialiser le message de bienvenue (pour les tests ou nouvelle session)
  const resetWelcome = async (userId) => {
    try {
      const key = `@welcome_shown_${userId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du message de bienvenue:', error);
    }
  };

  // Marquer le message comme lu
  const dismissWelcome = () => {
    setShouldShowWelcome(false);
  };

  const value = {
    shouldShowWelcome,
    welcomeMessage,
    checkWelcomeStatus,
    resetWelcome,
    dismissWelcome,
    generateWelcomeMessage,
  };

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
};
