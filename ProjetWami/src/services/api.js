import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration de l'API
const API_BASE_URL = 'https://your-api-url.com/api'; // Remplacez par votre URL d'API
const TIMEOUT = 10000;

// Créer une instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré, déconnecter l'utilisateur
      await AsyncStorage.removeItem('authToken');
      // Rediriger vers la page de connexion
    }
    return Promise.reject(error);
  }
);

// ============= WATER QUALITY API =============

/**
 * Récupérer les données de qualité de l'eau en temps réel
 */
export const getWaterQualityData = async () => {
  try {
    const response = await api.get('/water-quality/current');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de qualité:', error);
    throw error;
  }
};

/**
 * Récupérer l'historique des données de qualité de l'eau
 * @param {string} parameter - Le paramètre à récupérer (temperature, ph, oxygen, etc.)
 * @param {string} timeRange - La plage de temps (24h, 7d, 30d)
 */
export const getWaterQualityHistory = async (parameter, timeRange = '24h') => {
  try {
    const response = await api.get('/water-quality/history', {
      params: { parameter, timeRange },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

// ============= PREDICTIONS API =============

/**
 * Récupérer les prédictions pour un paramètre spécifique
 * @param {string} parameter - Le paramètre à prédire
 * @param {string} timeRange - La plage de temps de prédiction
 */
export const getPredictions = async (parameter, timeRange = '24h') => {
  try {
    const response = await api.get('/predictions', {
      params: { parameter, timeRange },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des prédictions:', error);
    throw error;
  }
};

/**
 * Récupérer les alertes prédictives
 */
export const getPredictiveAlerts = async () => {
  try {
    const response = await api.get('/predictions/alerts');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    throw error;
  }
};

// ============= RECOMMENDATIONS API =============

/**
 * Récupérer toutes les recommandations
 */
export const getRecommendations = async () => {
  try {
    const response = await api.get('/recommendations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    throw error;
  }
};

/**
 * Marquer une recommandation comme appliquée
 * @param {number} recommendationId - L'ID de la recommandation
 */
export const applyRecommendation = async (recommendationId) => {
  try {
    const response = await api.post(`/recommendations/${recommendationId}/apply`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'application de la recommandation:', error);
    throw error;
  }
};

// ============= CHATBOT API =============

/**
 * Envoyer un message au chatbot
 * @param {string} message - Le message de l'utilisateur
 * @param {Array} conversationHistory - L'historique de la conversation
 */
export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    const response = await api.post('/chatbot/message', {
      message,
      history: conversationHistory,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
};

/**
 * Transcrire un message vocal
 * @param {string} audioUri - L'URI du fichier audio
 */
export const transcribeAudio = async (audioUri) => {
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    });

    const response = await api.post('/chatbot/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la transcription:', error);
    throw error;
  }
};

// ============= ROBOT CONTROL API =============

/**
 * Récupérer le statut du robot
 */
export const getRobotStatus = async () => {
  try {
    const response = await api.get('/robot/status');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du statut du robot:', error);
    throw error;
  }
};

/**
 * Envoyer une commande au robot
 * @param {string} command - La commande à envoyer (forward, backward, left, right, up, down, stop)
 */
export const sendRobotCommand = async (command) => {
  try {
    const response = await api.post('/robot/command', { command });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la commande:', error);
    throw error;
  }
};

/**
 * Changer le mode du robot
 * @param {string} mode - Le mode à activer (surveillance, inspection, cleaning, feeding)
 */
export const setRobotMode = async (mode) => {
  try {
    const response = await api.post('/robot/mode', { mode });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du changement de mode:', error);
    throw error;
  }
};

/**
 * Activer/désactiver les fonctionnalités du robot
 * @param {Object} settings - Les paramètres à modifier (camera, lights, autoMode)
 */
export const updateRobotSettings = async (settings) => {
  try {
    const response = await api.patch('/robot/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    throw error;
  }
};

/**
 * Arrêt d'urgence du robot
 */
export const emergencyStopRobot = async () => {
  try {
    const response = await api.post('/robot/emergency-stop');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'arrêt d\'urgence:', error);
    throw error;
  }
};

// ============= AUTHENTICATION API =============

/**
 * Connexion de l'utilisateur
 * @param {string} email - L'email de l'utilisateur
 * @param {string} password - Le mot de passe
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

// ============= WEBSOCKET CONNECTION =============

/**
 * Établir une connexion WebSocket pour les données en temps réel
 * Note: Cette fonction nécessite une bibliothèque WebSocket comme 'socket.io-client'
 */
export const connectWebSocket = (onDataReceived) => {
  // Exemple avec socket.io-client
  // const socket = io(API_BASE_URL);
  // 
  // socket.on('water-quality-update', (data) => {
  //   onDataReceived('water-quality', data);
  // });
  //
  // socket.on('robot-status-update', (data) => {
  //   onDataReceived('robot-status', data);
  // });
  //
  // return socket;
  
  console.log('WebSocket connection would be established here');
  return null;
};

export default api;
