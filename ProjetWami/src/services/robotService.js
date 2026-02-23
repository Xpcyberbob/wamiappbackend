import axios from 'axios';

// URL du backend Express qui communique avec l'ESP32 via Supabase
const ROBOT_BACKEND_URL = process.env.EXPO_PUBLIC_ROBOT_BACKEND_URL || 'https://wamiappbackend.onrender.com';

const robotApi = axios.create({
  baseURL: ROBOT_BACKEND_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Récupérer l'état réel du servo (is_active, updated_at)
 */
export const getServoStatus = async () => {
  try {
    const response = await robotApi.get('/servo/status');
    return response.data;
  } catch (error) {
    console.error('Erreur getServoStatus:', error.message);
    throw error;
  }
};

/**
 * Activer le servo (le robot commence à bouger)
 */
export const startServo = async () => {
  try {
    const response = await robotApi.post('/servo/start');
    return response.data;
  } catch (error) {
    console.error('Erreur startServo:', error.message);
    throw error;
  }
};

/**
 * Désactiver le servo (le robot s'arrête)
 */
export const stopServo = async () => {
  try {
    const response = await robotApi.post('/servo/stop');
    return response.data;
  } catch (error) {
    console.error('Erreur stopServo:', error.message);
    throw error;
  }
};

/**
 * Arrêt d'urgence = stopServo
 */
export const emergencyStop = async () => {
  return stopServo();
};

/**
 * Envoyer un relevé de température
 */
export const sendTemperature = async (deviceId, tempC) => {
  try {
    const response = await robotApi.post('/temperature', { deviceId, tempC });
    return response.data;
  } catch (error) {
    console.error('Erreur sendTemperature:', error.message);
    throw error;
  }
};

/**
 * Récupérer la dernière température d'un device
 * @param {string} deviceId - ID du device (défaut: esp32-001)
 */
export const getLatestTemperature = async (deviceId = 'esp32-001') => {
  try {
    const response = await robotApi.get('/temperature/latest', {
      params: { deviceId },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur getLatestTemperature:', error.message);
    throw error;
  }
};

/**
 * Récupérer l'historique des températures
 * @param {string} deviceId - ID du device (défaut: esp32-001)
 * @param {number} limit - Nombre de mesures (défaut: 50)
 */
export const getTemperatureHistory = async (deviceId = 'esp32-001', limit = 50) => {
  try {
    const response = await robotApi.get('/temperature/history', {
      params: { deviceId, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur getTemperatureHistory:', error.message);
    throw error;
  }
};

/**
 * Vérifier si le backend est joignable
 */
export const pingBackend = async () => {
  try {
    const response = await robotApi.get('/');
    return { online: true, message: response.data };
  } catch (error) {
    return { online: false, message: error.message };
  }
};

export default {
  getServoStatus,
  startServo,
  stopServo,
  emergencyStop,
  sendTemperature,
  getLatestTemperature,
  getTemperatureHistory,
  pingBackend,
};
