import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GamificationContext = createContext();

const STORAGE_KEY = '@wami_gamification';

export function GamificationProvider({ children }) {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [pendingRecommendations, setPendingRecommendations] = useState([]);

  // Charger les données sauvegardées
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setPoints(data.points || 0);
        setHistory(data.history || []);
        setPendingRecommendations(data.pendingRecommendations || []);
      }
    } catch (error) {
      console.error('Erreur chargement gamification:', error);
    }
  };

  const saveData = async (newPoints, newHistory, newPending) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        points: newPoints,
        history: newHistory,
        pendingRecommendations: newPending,
      }));
    } catch (error) {
      console.error('Erreur sauvegarde gamification:', error);
    }
  };

  // Enregistrer une recommandation comme "en attente d'application"
  const trackRecommendation = (recommendation) => {
    const entry = {
      id: Date.now().toString(),
      title: recommendation.title || recommendation.category,
      category: recommendation.category,
      createdAt: new Date().toISOString(),
      applied: false,
    };
    const updated = [...pendingRecommendations, entry];
    setPendingRecommendations(updated);
    saveData(points, history, updated);
    return entry.id;
  };

  // Marquer une recommandation comme appliquée et gagner des points
  const applyRecommendation = (recommendationId) => {
    const rec = pendingRecommendations.find(r => r.id === recommendationId);
    if (!rec || rec.applied) return false;

    const pointsEarned = 10;
    const newPoints = points + pointsEarned;
    const newHistory = [...history, {
      id: Date.now().toString(),
      action: `Recommandation appliquée : ${rec.title}`,
      points: pointsEarned,
      date: new Date().toISOString(),
    }];
    const newPending = pendingRecommendations.map(r =>
      r.id === recommendationId ? { ...r, applied: true } : r
    );

    setPoints(newPoints);
    setHistory(newHistory);
    setPendingRecommendations(newPending);
    saveData(newPoints, newHistory, newPending);
    return true;
  };

  // Obtenir le niveau basé sur les points
  const getLevel = () => {
    if (points >= 500) return { name: 'Expert', icon: 'trophy', color: '#f59e0b', next: null };
    if (points >= 200) return { name: 'Confirmé', icon: 'medal', color: '#3b82f6', next: 500 };
    if (points >= 50) return { name: 'Apprenti', icon: 'ribbon', color: '#10b981', next: 200 };
    return { name: 'Débutant', icon: 'leaf', color: '#64748b', next: 50 };
  };

  return (
    <GamificationContext.Provider value={{
      points,
      history,
      pendingRecommendations,
      trackRecommendation,
      applyRecommendation,
      getLevel,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
