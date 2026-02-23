import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLatestTemperature, getTemperatureHistory } from '../services/robotService';

const WaterDataContext = createContext();

export const useWaterData = () => {
  const context = useContext(WaterDataContext);
  if (!context) {
    throw new Error('useWaterData must be used within a WaterDataProvider');
  }
  return context;
};

export const WaterDataProvider = ({ children }) => {
  const [waterData, setWaterData] = useState({
    temperature: null,
    ph: 7.2,
    oxygen: 8.5,
    ammonia: 0.15,
    turbidity: 12,
    salinity: 0.5,
  });

  const [temperatureHistory, setTemperatureHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const pollRef = useRef(null);

  // Charger les données au démarrage + polling
  useEffect(() => {
    loadWaterData();
    fetchRealTemperature();

    // Polling toutes les 5 secondes pour la température réelle
    pollRef.current = setInterval(() => {
      fetchRealTemperature();
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Récupérer la température réelle depuis le backend
  const fetchRealTemperature = async () => {
    try {
      const data = await getLatestTemperature('esp32-001');
      if (data && data.temp_c !== undefined) {
        const realTemp = parseFloat(data.temp_c);
        console.log('🌡️ Température réelle reçue:', realTemp, '°C');
        
        setWaterData(prev => {
          const updated = { ...prev, temperature: realTemp };
          AsyncStorage.setItem('waterData', JSON.stringify(updated));
          return updated;
        });
        
        setLastFetch(new Date());
        setBackendConnected(true);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer la température réelle:', error.message);
      setBackendConnected(false);
      
      // Si pas de température réelle et pas de donnée en cache, utiliser une valeur par défaut
      setWaterData(prev => {
        if (prev.temperature === null) {
          return { ...prev, temperature: 0 };
        }
        return prev;
      });
    }
  };

  // Récupérer l'historique des températures
  const fetchTemperatureHistory = useCallback(async (limit = 50) => {
    try {
      const data = await getTemperatureHistory('esp32-001', limit);
      if (data && Array.isArray(data)) {
        setTemperatureHistory(data);
        console.log(`📊 Historique: ${data.length} mesures récupérées`);
        return data;
      }
      return [];
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer l\'historique:', error.message);
      return [];
    }
  }, []);

  const loadWaterData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('waterData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setWaterData(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les données et les sauvegarder
  const updateWaterData = async (newData) => {
    try {
      const updatedData = { ...waterData, ...newData };
      setWaterData(updatedData);
      await AsyncStorage.setItem('waterData', JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      return false;
    }
  };

  // Réinitialiser aux valeurs par défaut
  const resetWaterData = async () => {
    const defaultData = {
      temperature: 26.5,
      ph: 7.2,
      oxygen: 8.5,
      ammonia: 0.15,
      turbidity: 12,
      salinity: 0.5,
    };
    try {
      setWaterData(defaultData);
      await AsyncStorage.setItem('waterData', JSON.stringify(defaultData));
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      return false;
    }
  };

  // Rafraîchir manuellement (pull-to-refresh)
  const refreshData = async () => {
    await fetchRealTemperature();
    await fetchTemperatureHistory();
  };

  const value = {
    waterData,
    temperatureHistory,
    updateWaterData,
    resetWaterData,
    refreshData,
    fetchTemperatureHistory,
    loading,
    lastFetch,
    backendConnected,
  };

  return (
    <WaterDataContext.Provider value={value}>
      {children}
    </WaterDataContext.Provider>
  );
};
